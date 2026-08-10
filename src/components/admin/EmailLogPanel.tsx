import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, RefreshCw, CheckCircle2, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type EmailLogRow = {
  id: string;
  job_name: string;
  run_id: string;
  recipient_email: string;
  user_id: string | null;
  subject: string | null;
  status: string;
  error_message: string | null;
  provider_message_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

interface RunGroup {
  runId: string;
  jobName: string;
  startedAt: string;
  summary?: EmailLogRow;
  recipients: EmailLogRow[];
  sent: number;
  failed: number;
}

const jobLabels: Record<string, string> = {
  'send-trial-reminders': 'Trial reminders',
  'send-ifta-deadline-reminders': 'IFTA deadline reminders',
};

const EmailLogPanel = ({ enabled }: { enabled: boolean }) => {
  const [jobFilter, setJobFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: rows = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-email-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_send_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as EmailLogRow[];
    },
    enabled,
  });

  const runs = useMemo<RunGroup[]>(() => {
    const map = new Map<string, RunGroup>();
    for (const row of rows) {
      if (jobFilter !== 'all' && row.job_name !== jobFilter) continue;
      let group = map.get(row.run_id);
      if (!group) {
        group = {
          runId: row.run_id,
          jobName: row.job_name,
          startedAt: row.created_at,
          recipients: [],
          sent: 0,
          failed: 0,
        };
        map.set(row.run_id, group);
      }
      if (row.status === 'run_summary') {
        group.summary = row;
      } else {
        group.recipients.push(row);
        if (row.status === 'sent') group.sent++;
        else group.failed++;
      }
      if (row.created_at < group.startedAt) group.startedAt = row.created_at;
    }
    return Array.from(map.values()).sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
  }, [rows, jobFilter]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> Email Reminder Log
            </CardTitle>
            <CardDescription>Every reminder run, its recipients, and delivery results</CardDescription>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <Label className="text-xs">Job</Label>
              <Select value={jobFilter} onValueChange={setJobFilter}>
                <SelectTrigger className="h-9 w-[210px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All jobs</SelectItem>
                  <SelectItem value="send-trial-reminders">Trial reminders</SelectItem>
                  <SelectItem value="send-ifta-deadline-reminders">IFTA deadline reminders</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={cn('h-4 w-4 mr-1', isFetching && 'animate-spin')} /> Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : runs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No reminder runs logged yet. Entries appear here after the next scheduled run.
          </p>
        ) : (
          <div className="space-y-2">
            {runs.map(run => {
              const isOpen = expanded === run.runId;
              const meta = (run.summary?.metadata ?? {}) as Record<string, unknown>;
              return (
                <div key={run.runId} className="rounded-lg border">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : run.runId)}
                    className="w-full flex flex-wrap items-center gap-3 p-3 text-left hover:bg-muted/40 transition-colors"
                  >
                    {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <span className="font-medium text-foreground text-sm">
                      {jobLabels[run.jobName] ?? run.jobName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(run.startedAt), 'MMM d, yyyy p')}
                    </span>
                    <div className="ml-auto flex items-center gap-2">
                      <Badge className="text-xs bg-accent/15 text-accent">{run.sent} sent</Badge>
                      {run.failed > 0 && <Badge className="text-xs bg-destructive/15 text-destructive">{run.failed} failed</Badge>}
                      {typeof meta.lead_days === 'number' && (
                        <Badge variant="outline" className="text-xs">{String(meta.lead_days)}-day notice</Badge>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t p-3 space-y-3">
                      {run.summary?.metadata && Object.keys(meta).length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {Object.entries(meta).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${String(v)}`).join(' · ')}
                        </p>
                      )}
                      {run.recipients.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No recipients matched this run.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b text-muted-foreground">
                                <th className="text-left p-2 font-medium">Recipient</th>
                                <th className="text-left p-2 font-medium">Subject</th>
                                <th className="text-left p-2 font-medium">Result</th>
                                <th className="text-left p-2 font-medium">Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {run.recipients.map(r => (
                                <tr key={r.id} className="border-b last:border-0">
                                  <td className="p-2 text-foreground">{r.recipient_email}</td>
                                  <td className="p-2 text-muted-foreground text-xs max-w-[280px] truncate">{r.subject || '—'}</td>
                                  <td className="p-2">
                                    {r.status === 'sent' ? (
                                      <span className="inline-flex items-center gap-1 text-xs text-accent">
                                        <CheckCircle2 className="h-3.5 w-3.5" /> Sent
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-xs text-destructive" title={r.error_message ?? undefined}>
                                        <XCircle className="h-3.5 w-3.5" /> {r.error_message ? `Failed — ${r.error_message}` : 'Failed'}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-2 text-xs text-muted-foreground">{format(new Date(r.created_at), 'p')}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailLogPanel;
