import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EldLogEntry, DutyStatus, formatMinutes } from '@/hooks/useHOSEngine';

interface Props {
  logs: EldLogEntry[];
  date: string;
}

const statusRow: { status: DutyStatus; label: string; color: string }[] = [
  { status: 'off_duty', label: 'OFF', color: '#3b82f6' },
  { status: 'sleeper', label: 'SB', color: '#a855f7' },
  { status: 'driving', label: 'D', color: '#ef4444' },
  { status: 'on_duty', label: 'ON', color: '#22c55e' },
];

const LogGridView: React.FC<Props> = ({ logs, date }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getSegmentsForStatus = (status: DutyStatus) => {
    return logs
      .filter(l => l.duty_status === status || (status === 'on_duty' && ['yard_move', 'personal_conveyance'].includes(l.duty_status)))
      .map(l => {
        const start = new Date(l.status_start);
        const end = l.status_end ? new Date(l.status_end) : new Date();
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        return { startHour, endHour: Math.min(24, endHour), duration: l.duration_minutes, location: l.location_start };
      });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">
          24-HOUR LOG — {new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Hour labels */}
        <div className="flex text-[10px] text-muted-foreground mb-1 ml-10">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center">
              {h === 0 ? '12A' : h === 12 ? '12P' : h < 12 ? `${h}` : `${h - 12}`}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="space-y-1">
          {statusRow.map(row => {
            const segments = getSegmentsForStatus(row.status);
            return (
              <div key={row.status} className="flex items-center gap-2">
                <span className="w-8 text-xs font-bold text-right" style={{ color: row.color }}>
                  {row.label}
                </span>
                <div className="relative flex-1 h-6 bg-muted/30 rounded-sm border border-border/50">
                  {/* Grid lines */}
                  {hours.map(h => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-border/20"
                      style={{ left: `${(h / 24) * 100}%` }}
                    />
                  ))}
                  {/* Status segments */}
                  {segments.map((seg, i) => (
                    <div
                      key={i}
                      className="absolute top-1 bottom-1 rounded-sm cursor-pointer hover:opacity-80 transition-opacity"
                      style={{
                        left: `${(seg.startHour / 24) * 100}%`,
                        width: `${((seg.endHour - seg.startHour) / 24) * 100}%`,
                        backgroundColor: row.color,
                        minWidth: '2px',
                      }}
                      title={`${row.label} — ${formatMinutes(seg.duration)}${seg.location ? `\n${seg.location}` : ''}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 justify-center">
          {statusRow.map(row => (
            <div key={row.status} className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: row.color }} />
              <span className="text-xs text-muted-foreground">{row.label === 'SB' ? 'Sleeper' : row.label === 'D' ? 'Driving' : row.label === 'ON' ? 'On Duty' : 'Off Duty'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LogGridView;
