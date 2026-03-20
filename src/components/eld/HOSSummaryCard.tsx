import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { HOSSummary, formatMinutes } from '@/hooks/useHOSEngine';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  summary: HOSSummary;
}

const HOSSummaryCard: React.FC<Props> = ({ summary }) => {
  const rows = [
    {
      label: 'Drive Time Used',
      used: summary.driveTimeUsedMinutes,
      remaining: summary.driveTimeRemainingMinutes,
      total: 660,
    },
    {
      label: 'On Duty Used',
      used: summary.onDutyTimeUsedMinutes,
      remaining: summary.onDutyTimeRemainingMinutes,
      total: 840,
    },
    {
      label: 'Break Required In',
      used: 480 - summary.breakRequiredInMinutes,
      remaining: summary.breakRequiredInMinutes,
      total: 480,
      isBreak: true,
    },
    {
      label: 'Cycle Hours Used',
      used: summary.cycleHoursUsedMinutes,
      remaining: summary.cycleHoursRemainingMinutes,
      total: 4200,
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">TODAY'S HOS SUMMARY</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const pct = Math.min(100, (row.used / row.total) * 100);
          const danger = pct > 90;
          const warning = pct > 75;

          return (
            <div key={row.label} className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium">{row.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className={danger ? 'text-destructive font-bold' : ''}>
                    {row.isBreak ? formatMinutes(row.remaining) : `${formatMinutes(row.used)} / ${formatMinutes(row.remaining)} left`}
                  </span>
                  {danger ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <Progress
                value={pct}
                className={`h-2 ${danger ? '[&>div]:bg-destructive' : warning ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'}`}
              />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default HOSSummaryCard;
