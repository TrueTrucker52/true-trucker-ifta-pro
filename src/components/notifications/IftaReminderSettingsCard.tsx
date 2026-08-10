import React, { useMemo } from 'react';
import { CalendarClock, Mail, AlertTriangle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getNextIftaDeadline, quarterName } from '@/lib/iftaDeadlines';
import {
  IFTA_REMINDER_LEAD_DAYS,
  useIftaReminderSettings,
} from '@/hooks/useIftaReminderSettings';

const leadLabel = (day: number) => (day === 1 ? '1 day before' : `${day} days before`);

const IftaReminderSettingsCard = () => {
  const { settings, isLoading, isSaving, setEnabled, toggleLeadDay } = useIftaReminderSettings();
  const deadline = useMemo(() => getNextIftaDeadline(), []);

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold leading-tight">IFTA Deadline Reminders</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Get an email before every quarterly filing deadline so it never sneaks up on you.
            </p>
          </div>
        </div>
        <Switch
          checked={settings.email_enabled}
          onCheckedChange={setEnabled}
          disabled={isLoading || isSaving}
          aria-label="Enable IFTA deadline reminder emails"
        />
      </div>

      <div
        className={cn(
          'rounded-lg border-l-4 px-3 py-2.5 text-sm',
          deadline.isUrgent
            ? 'border-destructive bg-destructive/10 text-destructive'
            : 'border-primary bg-primary/5 text-foreground',
        )}
      >
        <div className="flex items-center gap-2 font-medium">
          {deadline.isUrgent && <AlertTriangle className="h-4 w-4 shrink-0" />}
          Next deadline: {quarterName(deadline.quarter)} {deadline.quarterYear} — {deadline.dueDateLabel}
        </div>
        <div className={cn('mt-0.5 text-xs', deadline.isUrgent ? '' : 'text-muted-foreground')}>
          {deadline.daysRemaining === 0
            ? 'Due today'
            : `${deadline.daysRemaining} day${deadline.daysRemaining === 1 ? '' : 's'} left`}
        </div>
      </div>

      <div className={cn('space-y-2', !settings.email_enabled && 'opacity-50 pointer-events-none')}>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
          Send reminders
        </Label>
        {IFTA_REMINDER_LEAD_DAYS.map((day) => (
          <div
            key={day}
            className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5"
          >
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{leadLabel(day)}</span>
              {day <= 14 && (
                <Badge variant="outline" className="border-destructive/40 text-destructive text-[10px]">
                  URGENT STYLING
                </Badge>
              )}
            </div>
            <Switch
              checked={settings.lead_days.includes(day)}
              onCheckedChange={() => toggleLeadDay(day)}
              disabled={isLoading || isSaving}
              aria-label={`Reminder ${leadLabel(day)}`}
            />
          </div>
        ))}
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
        {isSaving ? 'Saving…' : 'Reminders are sent to the email on your account.'}
      </p>
    </Card>
  );
};

export default IftaReminderSettingsCard;
