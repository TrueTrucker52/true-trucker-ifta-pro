import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, CheckCircle2, MinusCircle, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

type PreviewRecipient = {
  user_id: string;
  email: string;
  trial_end_date: string;
  subscription_tier: string | null;
  days_left: number;
  would_send: boolean;
  reason: string;
};

type PreviewResult = {
  window: { start_date: string; end_date: string; today: string };
  lead_days: number[];
  counts: { matched: number; would_send: number; skipped: number };
  recipients: PreviewRecipient[];
};

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const CSV_HEADERS = ['Email', 'Trial ends', 'Days left', 'Would send', 'Reason', 'Tier', 'User ID'];

// Guard against spreadsheet formula injection and quote embedded delimiters
const csvCell = (value: unknown) => {
  const raw = value === null || value === undefined ? '' : String(value);
  const safe = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return `"${safe.replace(/"/g, '""')}"`;
};

const buildCsv = (result: PreviewResult) => {
  const rows = result.recipients.map((r) => [
    r.email,
    r.trial_end_date,
    r.days_left,
    r.would_send ? 'Yes' : 'No',
    r.reason,
    r.subscription_tier ?? '',
    r.user_id,
  ]);
  return [CSV_HEADERS, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
};

const ReminderPreviewPanel = ({ enabled }: { enabled: boolean }) => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(iso(new Date()));
  const [endDate, setEndDate] = useState(iso(addDays(new Date(), 6)));
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreviewResult | null>(null);

  const runPreview = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('preview-reminder-recipients', {
        body: { start_date: startDate, end_date: endDate },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as PreviewResult);
    } catch (err) {
      toast({
        title: 'Preview failed',
        description: err instanceof Error ? err.message : 'Could not load recipients.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!enabled) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" /> Preview Reminder Recipients
        </CardTitle>
        <CardDescription>
          Dry run — see which trial users would get a reminder in a date window. Nothing is sent.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label htmlFor="preview-start" className="text-xs">Trial ends from</Label>
            <Input
              id="preview-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-[170px]"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="preview-end" className="text-xs">Trial ends through</Label>
            <Input
              id="preview-end"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-[170px]"
            />
          </div>
          <Button onClick={runPreview} disabled={loading}>
            {loading ? 'Checking…' : 'Preview recipients'}
          </Button>
        </div>

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        )}

        {!loading && result && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <Badge variant="secondary">{result.counts.matched} in window</Badge>
              <Badge className="bg-emerald-600 hover:bg-emerald-600">
                {result.counts.would_send} would receive an email
              </Badge>
              <Badge variant="outline">{result.counts.skipped} skipped</Badge>
              <Badge variant="outline">Sends at {result.lead_days.join(', ')} days out</Badge>
            </div>

            {result.recipients.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground border rounded-md p-3">
                <AlertCircle className="h-4 w-4" />
                No trial users have a trial ending in this window.
              </div>
            ) : (
              <div className="overflow-x-auto border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="p-2 font-medium">Recipient</th>
                      <th className="p-2 font-medium">Trial ends</th>
                      <th className="p-2 font-medium">Days left</th>
                      <th className="p-2 font-medium">Would send</th>
                      <th className="p-2 font-medium">Why</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.recipients.map((r) => (
                      <tr key={r.user_id} className="border-t">
                        <td className="p-2 break-all">{r.email}</td>
                        <td className="p-2 whitespace-nowrap">{r.trial_end_date}</td>
                        <td className="p-2">{r.days_left}</td>
                        <td className="p-2">
                          {r.would_send ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <MinusCircle className="h-4 w-4" /> No
                            </span>
                          )}
                        </td>
                        <td className="p-2 text-muted-foreground">{r.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Evaluated against today ({result.window.today}) — "days left" drives the send decision.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReminderPreviewPanel;
