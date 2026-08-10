import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, Layers, Save, Loader2, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import Tesseract from 'tesseract.js';
import { receiptSchema, sanitizeInput, sanitizeOcrText } from '@/lib/validation';
import { validateFileUpload } from '@/lib/securityMonitoring';

const MAX_FILES = 15;
const LOW_CONFIDENCE_THRESHOLD = 0.7;

interface BulkFields {
  date: string;
  time: string;
  vendor: string;
  location: string;
  stateCode: string;
  gallons: string;
  pricePerGallon: string;
  totalAmount: string;
}

type RowStatus = 'queued' | 'scanning' | 'ready' | 'saving' | 'saved' | 'error';
type RowPhase = 'waiting' | 'ocr' | 'enhancing' | 'done';

interface BulkRow {
  id: string;
  fileName: string;
  imageData: string;
  ocrText: string;
  fields: BulkFields;
  confidence: Partial<Record<keyof BulkFields, number>>;
  status: RowStatus;
  error?: string;
  /** Non-blocking notice, e.g. AI enhancement unavailable */
  warning?: string;
  /** 0-100 progress for the current row */
  progress: number;
  phase: RowPhase;
}

const PHASE_LABEL: Record<RowPhase, string> = {
  waiting: 'Waiting in queue',
  ocr: 'Reading text (OCR)',
  enhancing: 'Enhancing with AI',
  done: 'Finished',
};

const emptyFields = (): BulkFields => ({
  date: '',
  time: '',
  vendor: '',
  location: '',
  stateCode: '',
  gallons: '',
  pricePerGallon: '',
  totalAmount: '',
});

const stripPotentialPII = (text: string): string =>
  text
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
    .replace(/(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '')
    .replace(/\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, '')
    .replace(/(?:member|customer|name|cardholder)[:\s]+[A-Z][a-z]+\s+[A-Z][a-z]+/gi, '');

const readFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const basicExtract = (text: string): Partial<BulkFields> => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const out: Partial<BulkFields> = {};
  const patterns: Array<[keyof BulkFields, RegExp]> = [
    ['date', /(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4})/],
    ['time', /(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)/i],
    ['gallons', /(\d+\.?\d*)\s*(?:gal|gallon|gallons)/i],
    ['pricePerGallon', /\$?(\d+\.\d{2,3})\/gal/i],
    ['totalAmount', /(?:total|amount).*?\$?(\d+\.\d{2})/i],
  ];
  lines.forEach((line) => {
    patterns.forEach(([key, re]) => {
      const m = line.match(re);
      if (m && !out[key]) out[key] = m[1];
    });
  });
  return out;
};

export const BulkReceiptUpload = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { saveWithOfflineSupport } = useOfflineSync();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [rows, setRows] = useState<BulkRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queueTotal, setQueueTotal] = useState(0);
  const [queueDone, setQueueDone] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [currentRowProgress, setCurrentRowProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const overallProgress =
    queueTotal === 0 ? 0 : Math.min(100, Math.round(((queueDone + currentRowProgress / 100) / queueTotal) * 100));

  const updateRow = (id: string, patch: Partial<BulkRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const scanRow = async (row: BulkRow) => {
    setCurrentFile(row.fileName);
    setCurrentRowProgress(0);
    updateRow(row.id, { status: 'scanning', phase: 'ocr', progress: 0, error: undefined, warning: undefined });

    let ocrText = '';
    try {
      const { data: { text } } = await Tesseract.recognize(row.imageData, 'eng', {
        logger: (m: { status?: string; progress?: number }) => {
          if (m.status === 'recognizing text' && typeof m.progress === 'number') {
            // OCR occupies the first 80% of a row's progress
            const pct = Math.round(m.progress * 80);
            setCurrentRowProgress(pct);
            updateRow(row.id, { progress: pct, phase: 'ocr' });
          }
        },
      });
      ocrText = sanitizeOcrText(text);
    } catch (e) {
      console.error('OCR failed for bulk row:', e);
      updateRow(row.id, {
        status: 'error',
        phase: 'done',
        progress: 100,
        error: `Couldn't read text from ${row.fileName}. Try a sharper, well-lit photo, then retry.`,
      });
      setCurrentRowProgress(100);
      return;
    }

    if (!ocrText.trim()) {
      updateRow(row.id, {
        status: 'error',
        phase: 'done',
        progress: 100,
        error: 'No text found on this image. Retake the photo so the whole receipt is in frame, then retry.',
      });
      setCurrentRowProgress(100);
      return;
    }

    const basic = basicExtract(ocrText);
    let fields: BulkFields = { ...emptyFields(), ...basic };
    let confidence: Partial<Record<keyof BulkFields, number>> = {};
    let warning: string | undefined;

    setCurrentRowProgress(85);
    updateRow(row.id, { phase: 'enhancing', progress: 85 });

    try {
      const { data, error } = await supabase.functions.invoke('enhance-receipt-data', {
        body: { ocrText: stripPotentialPII(ocrText), extractedData: basic },
      });
      if (error) throw error;
      if (data?.enhancedData) {
        const { confidence: conf, ...enhanced } = data.enhancedData;
        fields = { ...fields, ...enhanced };
        if (conf) confidence = conf;
      }
    } catch (e) {
      console.error('AI enhancement failed for bulk row, using basic extraction:', e);
      warning = 'AI enhancement unavailable — basic text extraction used. Double-check every field.';
    }

    setCurrentRowProgress(100);
    updateRow(row.id, { ocrText, fields, confidence, status: 'ready', phase: 'done', progress: 100, warning });
  };

  const processQueue = async (queue: BulkRow[]) => {
    setIsProcessing(true);
    setQueueTotal(queue.length);
    setQueueDone(0);
    for (let i = 0; i < queue.length; i++) {
      await scanRow(queue[i]);
      setQueueDone(i + 1);
      setCurrentRowProgress(0);
    }
    setIsProcessing(false);
    setCurrentFile('');
    setCurrentRowProgress(0);
  };

  const retryRow = async (row: BulkRow) => {
    if (isProcessing || isSaving) return;
    await processQueue([{ ...row, status: 'queued', phase: 'waiting', progress: 0 }]);
  };

  const retryAllFailed = async () => {
    const failed = rows.filter((r) => r.status === 'error');
    if (failed.length === 0) return;
    await processQueue(failed.map((r) => ({ ...r, status: 'queued', phase: 'waiting', progress: 0 })));
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.length === 0) return;

    if (rows.length + files.length > MAX_FILES) {
      toast({
        title: 'Too many receipts',
        description: `You can review up to ${MAX_FILES} receipts at a time.`,
        variant: 'destructive',
      });
      return;
    }

    const newRows: BulkRow[] = [];
    for (const file of files) {
      const validation = validateFileUpload(file);
      if (!validation.valid) {
        toast({ title: `Skipped ${file.name}`, description: validation.error, variant: 'destructive' });
        continue;
      }
      newRows.push({
        id: crypto.randomUUID(),
        fileName: file.name,
        imageData: await readFile(file),
        ocrText: '',
        fields: emptyFields(),
        confidence: {},
        status: 'queued',
        phase: 'waiting',
        progress: 0,
      });
    }

    if (newRows.length === 0) return;
    setRows((prev) => [...prev, ...newRows]);

    await processQueue(newRows);

    toast({
      title: 'Receipts scanned',
      description: `${newRows.length} receipt${newRows.length > 1 ? 's' : ''} processed. Check highlighted fields before saving.`,
    });
  };

  const saveRow = async (row: BulkRow): Promise<boolean> => {
    if (!user) return false;
    const f = row.fields;
    const validation = receiptSchema.safeParse({
      receiptDate: f.date || new Date().toISOString().split('T')[0],
      vendor: f.vendor,
      location: f.location,
      totalAmount: f.totalAmount ? parseFloat(f.totalAmount) : undefined,
      gallons: f.gallons ? parseFloat(f.gallons) : undefined,
      pricePerGallon: f.pricePerGallon ? parseFloat(f.pricePerGallon) : undefined,
      stateCode: f.stateCode || undefined,
      rawOcrText: row.ocrText,
    });

    if (!validation.success) {
      updateRow(row.id, { status: 'error', error: validation.error.errors[0].message });
      return false;
    }

    updateRow(row.id, { status: 'saving' });

    const receiptDbData = {
      user_id: user.id,
      receipt_date: f.date || new Date().toISOString().split('T')[0],
      receipt_time: f.time || null,
      location: f.location ? sanitizeInput(f.location) : null,
      vendor: f.vendor ? sanitizeInput(f.vendor) : null,
      gallons: f.gallons ? parseFloat(f.gallons) : null,
      price_per_gallon: f.pricePerGallon ? parseFloat(f.pricePerGallon) : null,
      total_amount: f.totalAmount ? parseFloat(f.totalAmount) : null,
      state_code: f.stateCode ? f.stateCode.toUpperCase().substring(0, 2) : null,
      raw_ocr_text: sanitizeOcrText(row.ocrText),
    };

    const result = await saveWithOfflineSupport('receipt', receiptDbData, async () => {
      let imageUrl = '';
      const response = await fetch(row.imageData);
      const blob = await response.blob();
      const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, blob);
      if (uploadError) throw uploadError;
      imageUrl = fileName;

      const { error } = await supabase
        .from('receipts')
        .insert({ ...receiptDbData, receipt_image_url: imageUrl });
      if (error) throw error;
      return { success: true };
    });

    if (result.success) {
      updateRow(row.id, { status: 'saved', error: undefined });
      return true;
    }
    updateRow(row.id, { status: 'error', error: 'Could not save this receipt' });
    return false;
  };

  const saveAll = async () => {
    if (!user) {
      toast({ title: 'Authentication Required', description: 'Please log in to save receipts.', variant: 'destructive' });
      return;
    }
    const pending = rows.filter((r) => r.status === 'ready' || r.status === 'error');
    if (pending.length === 0) return;

    setIsSaving(true);
    let saved = 0;
    for (const row of pending) {
      const ok = await saveRow(row);
      if (ok) saved++;
    }
    setIsSaving(false);

    toast({
      title: saved === pending.length ? 'Receipts Saved' : 'Some receipts need attention',
      description: `${saved} of ${pending.length} receipt${pending.length > 1 ? 's' : ''} saved.`,
      variant: saved === pending.length ? undefined : 'destructive',
    });
  };

  const lowConf = (row: BulkRow, field: keyof BulkFields) => {
    const score = row.confidence[field];
    return typeof score === 'number' && score < LOW_CONFIDENCE_THRESHOLD;
  };

  const fieldClass = (row: BulkRow, field: keyof BulkFields) =>
    lowConf(row, field)
      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600'
      : '';

  const setField = (row: BulkRow, field: keyof BulkFields, value: string) =>
    updateRow(row.id, { fields: { ...row.fields, [field]: value } });

  const readyCount = rows.filter((r) => r.status === 'ready').length;
  const savedCount = rows.filter((r) => r.status === 'saved').length;

  const failedCount = rows.filter((r) => r.status === 'error').length;

  const statusBadge = (row: BulkRow) => {
    switch (row.status) {
      case 'queued':
        return <Badge variant="secondary">Queued</Badge>;
      case 'scanning':
        return (
          <Badge variant="secondary">
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            {PHASE_LABEL[row.phase]} {row.progress}%
          </Badge>
        );
      case 'ready':
        return <Badge variant="outline">Needs review</Badge>;
      case 'saving':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Saving</Badge>;
      case 'saved':
        return <Badge className="bg-green-600 hover:bg-green-600"><CheckCircle2 className="h-3 w-3 mr-1" />Saved</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Bulk Receipt Upload
          </CardTitle>
          <CardDescription>
            Upload up to {MAX_FILES} fuel receipts at once, review the extracted details, then save them all together.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => fileInputRef.current?.click()} disabled={isProcessing || isSaving}>
              <Upload className="h-4 w-4 mr-2" />
              Select Receipts
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className="hidden"
            />
            {rows.length > 0 && (
              <>
                <Button onClick={saveAll} disabled={isProcessing || isSaving || readyCount + rows.filter(r => r.status === 'error').length === 0}>
                  {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save All ({readyCount + rows.filter((r) => r.status === 'error').length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRows([])}
                  disabled={isProcessing || isSaving}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                {failedCount > 0 && (
                  <Button variant="outline" onClick={retryAllFailed} disabled={isProcessing || isSaving}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Failed ({failedCount})
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  {rows.length} uploaded · {savedCount} saved{failedCount > 0 ? ` · ${failedCount} failed` : ''}
                </span>
              </>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2" aria-live="polite">
              <Progress value={overallProgress} />
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Processing {Math.min(queueDone + 1, queueTotal)} of {queueTotal}
                  {currentFile ? ` — ${currentFile}` : ''}
                </span>
                <span>{overallProgress}%</span>
              </div>
            </div>
          )}

          {rows.length === 0 && !isProcessing && (
            <p className="text-sm text-muted-foreground">
              Tip: select multiple photos in one go. Fields the scanner isn't confident about are highlighted for you to verify.
            </p>
          )}
        </CardContent>
      </Card>

      {rows.map((row) => (
        <Card key={row.id}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <img
                src={row.imageData}
                alt={`Receipt preview ${row.fileName}`}
                className="w-full md:w-40 h-40 object-cover rounded-lg border border-border"
              />
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{row.fileName}</p>
                  {statusBadge(row)}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Input
                    type="date"
                    value={row.fields.date}
                    onChange={(e) => setField(row, 'date', e.target.value)}
                    className={fieldClass(row, 'date')}
                    aria-label="Receipt date"
                  />
                  <Input
                    placeholder="Vendor"
                    value={row.fields.vendor}
                    onChange={(e) => setField(row, 'vendor', e.target.value)}
                    className={fieldClass(row, 'vendor')}
                    aria-label="Vendor"
                  />
                  <Input
                    placeholder="Location"
                    value={row.fields.location}
                    onChange={(e) => setField(row, 'location', e.target.value)}
                    className={fieldClass(row, 'location')}
                    aria-label="Location"
                  />
                  <Input
                    placeholder="State"
                    maxLength={2}
                    value={row.fields.stateCode}
                    onChange={(e) => setField(row, 'stateCode', e.target.value.toUpperCase())}
                    className={fieldClass(row, 'stateCode')}
                    aria-label="State code"
                  />
                  <Input
                    placeholder="Gallons"
                    value={row.fields.gallons}
                    onChange={(e) => setField(row, 'gallons', e.target.value)}
                    className={fieldClass(row, 'gallons')}
                    aria-label="Gallons"
                  />
                  <Input
                    placeholder="$/gal"
                    value={row.fields.pricePerGallon}
                    onChange={(e) => setField(row, 'pricePerGallon', e.target.value)}
                    className={fieldClass(row, 'pricePerGallon')}
                    aria-label="Price per gallon"
                  />
                  <Input
                    placeholder="Total"
                    value={row.fields.totalAmount}
                    onChange={(e) => setField(row, 'totalAmount', e.target.value)}
                    className={fieldClass(row, 'totalAmount')}
                    aria-label="Total amount"
                  />
                  <Input
                    placeholder="Time"
                    value={row.fields.time}
                    onChange={(e) => setField(row, 'time', e.target.value)}
                    className={fieldClass(row, 'time')}
                    aria-label="Receipt time"
                  />
                </div>
                <div className="flex gap-2">
                  {row.status !== 'saved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveRow(row)}
                      disabled={isSaving || row.status === 'scanning' || row.status === 'saving'}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save this one
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setRows((prev) => prev.filter((r) => r.id !== row.id))}
                    disabled={isSaving}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
