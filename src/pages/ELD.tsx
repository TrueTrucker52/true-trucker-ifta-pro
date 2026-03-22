import React, { useState } from 'react';
import { useHOSEngine, formatMinutes } from '@/hooks/useHOSEngine';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import BottomNavigation from '@/components/BottomNavigation';
import ELDStatusCard from '@/components/eld/ELDStatusCard';
import HOSSummaryCard from '@/components/eld/HOSSummaryCard';
import DutyStatusButtons from '@/components/eld/DutyStatusButtons';
import LogGridView from '@/components/eld/LogGridView';
import ViolationAlerts from '@/components/eld/ViolationAlerts';
import InspectionMode from '@/components/eld/InspectionMode';
import LogHistoryCard from '@/components/eld/LogHistoryCard';
import CertifyLogDialog from '@/components/eld/CertifyLogDialog';
import { ArrowLeft, ClipboardList, CheckCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useSubscription } from '@/hooks/useSubscription';
import ELDUpgradeCard from '@/components/eld/ELDUpgradeCard';

const ELD: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { eld_active, loading: subscriptionLoading } = useSubscription();
  const {
    currentStatus, currentStatusStart, todayLogs, weekLogs,
    hosSummary, activeViolations, loading,
    changeDutyStatus, certifyLog,
  } = useHOSEngine();

  const [certifyOpen, setCertifyOpen] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const todayCertified = todayLogs.some(l => l.is_certified);

  if (loading || subscriptionLoading) return <LoadingSpinner />;

  if (!eld_active) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="sticky top-0 z-40 px-4 py-3 border-b bg-background border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-lg font-bold">
                <ClipboardList className="w-5 h-5 text-primary" />
                ELD — Electronic Log
              </h1>
              <p className="text-xs text-muted-foreground">Upgrade required to unlock ELD compliance.</p>
            </div>
          </div>
        </div>

        <div className="max-w-2xl px-4 py-6 mx-auto">
          <ELDUpgradeCard />
        </div>

        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                ELD — Electronic Log
              </h1>
              <p className="text-xs text-muted-foreground">
                {user?.email} — {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs gap-1 border-green-300 text-green-600">
            <Shield className="h-3 w-3" /> FMCSA Compliant
          </Badge>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Violation alerts at top */}
        <ViolationAlerts violations={activeViolations} />

        {/* Current status */}
        <ELDStatusCard currentStatus={currentStatus} statusStart={currentStatusStart} />

        {/* HOS Summary */}
        <HOSSummaryCard summary={hosSummary} />

        {/* Duty Status Buttons */}
        <DutyStatusButtons
          currentStatus={currentStatus}
          onStatusChange={async (status, location, notes) => {
            return changeDutyStatus(status, location, undefined, notes);
          }}
        />

        {/* 24-Hour Log Grid */}
        <LogGridView logs={todayLogs} date={today} />

        {/* Action buttons */}
        <div className="space-y-2">
          <InspectionMode
            currentStatus={currentStatus}
            hosSummary={hosSummary}
            driverName={user?.email || undefined}
          />

          {!todayCertified && (
            <Button
              onClick={() => setCertifyOpen(true)}
              className="w-full min-h-[48px] gap-2"
              variant="default"
            >
              <CheckCircle className="h-5 w-5" /> Certify Today's Log
            </Button>
          )}
          {todayCertified && (
            <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              <CheckCircle className="h-4 w-4" /> Today's log is certified
            </div>
          )}
        </div>

        {/* Log History */}
        <LogHistoryCard
          weekLogs={weekLogs}
          onCertify={(date) => certifyLog(date)}
        />
      </div>

      {/* Certify Dialog */}
      <CertifyLogDialog
        open={certifyOpen}
        onOpenChange={setCertifyOpen}
        date={today}
        summary={hosSummary}
        onCertify={() => certifyLog(today)}
      />

      <BottomNavigation />
    </div>
  );
};

export default ELD;
