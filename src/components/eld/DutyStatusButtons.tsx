import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { DutyStatus } from '@/hooks/useHOSEngine';
import { Truck, Settings, BedDouble, Circle, Car, RotateCw } from 'lucide-react';

interface Props {
  currentStatus: DutyStatus;
  onStatusChange: (status: DutyStatus, location?: string, notes?: string) => Promise<{ success: boolean }>;
}

const buttons: { status: DutyStatus; label: string; icon: React.ReactNode; color: string }[] = [
  { status: 'driving', label: 'Driving', icon: <Truck className="h-5 w-5" />, color: 'bg-red-500 hover:bg-red-600 text-white' },
  { status: 'on_duty', label: 'On Duty', icon: <Settings className="h-5 w-5" />, color: 'bg-green-500 hover:bg-green-600 text-white' },
  { status: 'sleeper', label: 'Sleeper', icon: <BedDouble className="h-5 w-5" />, color: 'bg-purple-500 hover:bg-purple-600 text-white' },
  { status: 'off_duty', label: 'Off Duty', icon: <Circle className="h-5 w-5" />, color: 'bg-blue-500 hover:bg-blue-600 text-white' },
];

const extraButtons: { status: DutyStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'personal_conveyance', label: 'Personal Use', icon: <Car className="h-4 w-4" /> },
  { status: 'yard_move', label: 'Yard Move', icon: <RotateCw className="h-4 w-4" /> },
];

const DutyStatusButtons: React.FC<Props> = ({ currentStatus, onStatusChange }) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<DutyStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClick = (status: DutyStatus) => {
    if (status === currentStatus) return;
    setPendingStatus(status);
    setNotes('');
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!pendingStatus) return;
    setSubmitting(true);
    await onStatusChange(pendingStatus, undefined, notes || undefined);
    setSubmitting(false);
    setConfirmOpen(false);
  };

  const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-muted-foreground">DUTY STATUS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {buttons.map((b) => (
              <Button
                key={b.status}
                className={`min-h-[56px] text-base font-semibold gap-2 ${b.status === currentStatus ? `${b.color} ring-2 ring-offset-2 ring-primary` : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                onClick={() => handleClick(b.status)}
                disabled={b.status === currentStatus}
              >
                {b.icon} {b.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            {extraButtons.map((b) => (
              <Button
                key={b.status}
                variant="outline"
                size="sm"
                className={`flex-1 gap-1 ${b.status === currentStatus ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleClick(b.status)}
                disabled={b.status === currentStatus}
              >
                {b.icon} {b.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm">
              Status changed to <strong className="uppercase">{pendingStatus?.replace('_', ' ')}</strong>
            </p>
            <p className="text-sm text-muted-foreground">Time: {time}</p>
            <Textarea
              placeholder="Optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px]"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirm} disabled={submitting}>
              {submitting ? 'Saving...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DutyStatusButtons;
