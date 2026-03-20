import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EldLogEntry, formatMinutes } from '@/hooks/useHOSEngine';
import { Calendar, CheckCircle, FileText, Edit } from 'lucide-react';

interface Props {
  weekLogs: EldLogEntry[];
  onCertify: (date: string) => void;
}

const LogHistoryCard: React.FC<Props> = ({ weekLogs, onCertify }) => {
  // Group logs by date
  const logsByDate = weekLogs.reduce<Record<string, EldLogEntry[]>>((acc, log) => {
    if (!acc[log.log_date]) acc[log.log_date] = [];
    acc[log.log_date].push(log);
    return acc;
  }, {});

  const dates = Object.keys(logsByDate).sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" /> Log History — Last 8 Days
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {dates.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No logs recorded yet.</p>
        )}
        {dates.map(date => {
          const logs = logsByDate[date];
          const driveMin = logs.filter(l => l.duty_status === 'driving').reduce((s, l) => s + l.duration_minutes, 0);
          const onDutyMin = logs.filter(l => ['driving', 'on_duty'].includes(l.duty_status)).reduce((s, l) => s + l.duration_minutes, 0);
          const certified = logs.some(l => l.is_certified);
          const isToday = date === today;
          const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

          return (
            <div key={date} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{dateLabel}</span>
                  {isToday && <Badge variant="secondary" className="text-xs">Today</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">
                  Drive: {formatMinutes(driveMin)} | On Duty: {formatMinutes(onDutyMin)}
                </p>
                {certified ? (
                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs gap-1">
                    <CheckCircle className="h-3 w-3" /> Certified
                  </Badge>
                ) : isToday ? (
                  <Badge variant="outline" className="text-blue-600 border-blue-300 text-xs">In Progress</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Not Certified</Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <FileText className="h-4 w-4" />
                </Button>
                {!certified && !isToday && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onCertify(date)}>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default LogHistoryCard;
