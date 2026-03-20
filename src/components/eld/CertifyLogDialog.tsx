import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HOSSummary, formatMinutes } from '@/hooks/useHOSEngine';
import { CheckCircle, Shield } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  summary: HOSSummary;
  onCertify: () => Promise<boolean>;
}

const CertifyLogDialog: React.FC<Props> = ({ open, onOpenChange, date, summary, onCertify }) => {
  const [certifying, setCertifying] = useState(false);

  const handleCertify = async () => {
    setCertifying(true);
    await onCertify();
    setCertifying(false);
    onOpenChange(false);
  };

  const dateLabel = new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Certify Today's Log
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Please review your log for <strong>{dateLabel}</strong>:
          </p>

          <div className="space-y-2 p-3 rounded-lg bg-muted/50">
            <div className="flex justify-between text-sm">
              <span>Drive Time:</span>
              <span className="font-medium">{formatMinutes(summary.driveTimeUsedMinutes)} ✅</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>On Duty:</span>
              <span className="font-medium">{formatMinutes(summary.onDutyTimeUsedMinutes)} ✅</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cycle Hours:</span>
              <span className="font-medium">{formatMinutes(summary.cycleHoursUsedMinutes)} ✅</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground italic">
            By certifying you confirm: "I certify these entries are true and correct to the best of my knowledge and belief."
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Edit Log</Button>
          <Button onClick={handleCertify} disabled={certifying} className="gap-2">
            <CheckCircle className="h-4 w-4" />
            {certifying ? 'Certifying...' : 'Certify This Log'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CertifyLogDialog;
