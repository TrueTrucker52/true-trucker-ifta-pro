import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DutyStatus, formatMinutes } from '@/hooks/useHOSEngine';
import { Truck, Clock, MapPin } from 'lucide-react';

interface Props {
  currentStatus: DutyStatus;
  statusStart: string | null;
  location?: string;
}

const statusConfig: Record<DutyStatus, { label: string; color: string; icon: string }> = {
  driving: { label: 'DRIVING', color: 'text-red-500', icon: '🚛' },
  on_duty: { label: 'ON DUTY', color: 'text-green-500', icon: '⚙️' },
  sleeper: { label: 'SLEEPER BERTH', color: 'text-purple-500', icon: '🛏️' },
  off_duty: { label: 'OFF DUTY', color: 'text-blue-500', icon: '⭕' },
  personal_conveyance: { label: 'PERSONAL CONVEYANCE', color: 'text-cyan-500', icon: '🚗' },
  yard_move: { label: 'YARD MOVE', color: 'text-amber-500', icon: '🔄' },
};

const ELDStatusCard: React.FC<Props> = ({ currentStatus, statusStart, location }) => {
  const [elapsed, setElapsed] = useState('0h 00m');
  const config = statusConfig[currentStatus];

  useEffect(() => {
    if (!statusStart) return;
    const update = () => {
      const diff = Math.floor((Date.now() - new Date(statusStart).getTime()) / 60000);
      setElapsed(formatMinutes(Math.max(0, diff)));
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [statusStart]);

  const startTime = statusStart ? new Date(statusStart).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '--:--';

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium text-muted-foreground">CURRENT STATUS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{config.icon}</span>
          <span className={`text-2xl font-bold ${config.color}`}>{config.label}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Since: {startTime} ({elapsed})</span>
        </div>
        {location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ELDStatusCard;
