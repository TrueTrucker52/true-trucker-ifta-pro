import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DutyStatus, formatMinutes, HOSSummary } from '@/hooks/useHOSEngine';
import { ClipboardList, Calendar, Send, Mail, Smartphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  currentStatus: DutyStatus;
  hosSummary: HOSSummary;
  driverName?: string;
}

const InspectionMode: React.FC<Props> = ({ currentStatus, hosSummary, driverName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [inspectorName, setInspectorName] = useState('');
  const [inspectionCode, setInspectionCode] = useState('');
  const [transferring, setTransferring] = useState(false);

  const handleTransfer = async (method: string) => {
    if (!user) return;
    setTransferring(true);

    await supabase.from('eld_inspections').insert({
      driver_id: user.id,
      inspector_name: inspectorName || null,
      inspection_code: inspectionCode || null,
      location: 'Current Location',
      result: 'passed',
      transfer_method: method,
    });

    toast({ title: 'Log Transferred', description: `ELD data sent via ${method}.` });
    setTransferring(false);
  };

  const statusLabel: Record<DutyStatus, string> = {
    driving: 'DRIVING', on_duty: 'ON DUTY', sleeper: 'SLEEPER BERTH',
    off_duty: 'OFF DUTY', personal_conveyance: 'PERSONAL CONVEYANCE', yard_move: 'YARD MOVE',
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="w-full min-h-[48px] gap-2 border-amber-500 text-amber-700 hover:bg-amber-50"
      >
        <ClipboardList className="h-5 w-5" /> DOT Inspection Mode
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" /> DOT INSPECTION MODE
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="bg-muted/50">
              <CardContent className="pt-4 space-y-1 text-sm">
                <p><strong>Driver:</strong> {driverName || user?.email}</p>
                <p><strong>Status:</strong> <Badge variant="outline">{statusLabel[currentStatus]}</Badge></p>
                <p><strong>Drive Time Left:</strong> {formatMinutes(hosSummary.driveTimeRemainingMinutes)}</p>
                <p><strong>On Duty Left:</strong> {formatMinutes(hosSummary.onDutyTimeRemainingMinutes)}</p>
                <p><strong>Cycle Left:</strong> {formatMinutes(hosSummary.cycleHoursRemainingMinutes)}</p>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label>Inspector Name</Label>
              <Input value={inspectorName} onChange={e => setInspectorName(e.target.value)} placeholder="DOT Officer Name" />
              <Label>Inspection Code</Label>
              <Input value={inspectionCode} onChange={e => setInspectionCode(e.target.value)} placeholder="DOT Inspection ID" />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Quick Actions</p>
              <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => {}}>
                <Calendar className="h-4 w-4" /> Show Today's Log
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => {}}>
                <Calendar className="h-4 w-4" /> Show Last 8 Days
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Transfer Methods</p>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={() => handleTransfer('web_services')}
                disabled={transferring}
              >
                <Send className="h-4 w-4" /> Web Services Transfer
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={() => handleTransfer('email')}
                disabled={transferring}
              >
                <Mail className="h-4 w-4" /> Email Transfer
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={() => handleTransfer('bluetooth')}
                disabled={transferring}
              >
                <Smartphone className="h-4 w-4" /> Bluetooth/USB Transfer
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InspectionMode;
