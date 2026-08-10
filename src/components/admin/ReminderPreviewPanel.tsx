import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, CheckCircle2, MinusCircle, AlertCircle, Download, Mail } from 'lucide-react';
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

type PreviewTemplate = {
  lead_days: number;
  subject: string;
  html: string;
  recipient_count: number;
  recipients: string[];
};

type PreviewResult = {
  window: { start_date: string; end_date: string; today: string };
  lead_days: number[];
  counts: { matched: number; would_send: number; skipped: number };
  recipients: PreviewRecipient[];
  templates?: PreviewTemplate[];
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

  const downloadCsv = () => {
    if (!result || result.recipients.length === 0) return;
    const blob = new Blob([`\uFEFF${buildCsv(result)}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reminder-recipients-${result.window.start_date}-to-${result.window.end_date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({
      title: 'CSV exported',
      description: `${result.recipients.length} recipient${result.recipients.length === 1 ? '' : 's'} downloaded.`,
    });
  };
  const sendTest = async (leadDays: number) => {
    setSendingTest(leadDays);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-reminder-email', {
        body: { lead_days: leadDays, start_date: startDate, end_date: endDate },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: 'Test email sent',
        description: `The ${leadDays}-day reminder was sent to ${data.sent_to}.`,
      });
    } catch (err) {
      toast({
        title: 'Test email failed',
        description: err instanceof Error ? err.message : 'Could not send the test email.',
        variant: 'destructive',
      });
    } finally {
      setSendingTest(null);
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
          <Button
            variant="outline"
            onClick={downloadCsv}
            disabled={loading || !result || result.recipients.length === 0}
          >
            <Download className="h-4 w-4 mr-2" /> Export CSV
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

            {result.templates && result.templates.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mail className="h-4 w-4 text-primary" /> Email preview by reminder tier
                </div>
                <Tabs defaultValue={String(result.templates[0].lead_days)}>
                  <TabsList>
                    {result.templates.map((t) => (
                      <TabsTrigger key={t.lead_days} value={String(t.lead_days)}>
                        {t.lead_days} day{t.lead_days === 1 ? '' : 's'} ({t.recipient_count})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {result.templates.map((t) => (
                    <TabsContent key={t.lead_days} value={String(t.lead_days)} className="space-y-2">
                      <div className="border rounded-md p-3 space-y-1">
                        <p className="text-xs text-muted-foreground">Subject</p>
                        <p className="text-sm font-medium break-words">{t.subject}</p>
                        <p className="text-xs text-muted-foreground pt-1">
                          {t.recipient_count === 0
                            ? 'No recipients in this window for this tier.'
                            : `Goes to: ${t.recipients.join(', ')}`}
                        </p>
                      </div>
                      <div className="border rounded-md overflow-hidden bg-background">
                        <iframe
                          title={`Reminder email body — ${t.lead_days} day`}
                          srcDoc={t.html}
                          sandbox=""
                          className="w-full h-[420px] border-0"
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
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
