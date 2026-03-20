import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTrialConversion } from '@/hooks/useTrialConversion';
import { useSubscription } from '@/hooks/useSubscription';
import { Lock, Clock, Check, ArrowRight } from 'lucide-react';

interface Props {
  feature: string;
  featureIcon?: string;
  children: React.ReactNode;
}

const featureMessages: Record<string, { title: string; desc: string; plan: string; planName: string; price: number }> = {
  eld: {
    title: 'ELD Compliance',
    desc: 'ELD compliance is included in your trial and in all paid plans. Upgrade today to keep this feature!',
    plan: 'solo', planName: 'Solo', price: 39,
  },
  gps: {
    title: 'Live GPS Tracking',
    desc: 'Live GPS tracking is included in Small Fleet plan and above.',
    plan: 'small_fleet', planName: 'Small Fleet', price: 79,
  },
  ifta_report: {
    title: 'IFTA Reports',
    desc: 'To download and submit IFTA reports you need an active subscription.',
    plan: 'solo', planName: 'Solo', price: 39,
  },
  bol_scanner: {
    title: 'BOL Scanner',
    desc: 'Unlimited BOL scanning is available in all paid plans.',
    plan: 'solo', planName: 'Solo', price: 39,
  },
  voice_commands: {
    title: 'Voice Commands',
    desc: 'Hey Trucker voice commands are included in all paid plans.',
    plan: 'solo', planName: 'Solo', price: 39,
  },
};

const FeatureUpgradePrompt: React.FC<Props> = ({ feature, featureIcon, children }) => {
  const { tracking, trackFeatureUsage } = useTrialConversion();
  const { trial_active, subscribed, createCheckout } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(false);

  // Track usage every time this renders with a trial user
  React.useEffect(() => {
    if (trial_active && !subscribed) {
      trackFeatureUsage(feature);
    }
  }, [feature, trial_active, subscribed, trackFeatureUsage]);

  // If subscribed, just render children
  if (subscribed) return <>{children}</>;

  const msg = featureMessages[feature] || featureMessages['eld'];

  // For expired trials, show the prompt immediately
  if (tracking.isExpired && !subscribed) {
    return (
      <div className="relative">
        <div className="opacity-30 pointer-events-none">{children}</div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center p-6 max-w-sm space-y-3">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
            <h3 className="font-bold">{msg.title} — Locked</h3>
            <p className="text-sm text-muted-foreground">{msg.desc}</p>
            <Button onClick={() => createCheckout(msg.plan)} className="gap-2">
              Upgrade to {msg.planName} — ${msg.price}/mo <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}

      {/* Show inline nudge for trial users after some usage */}
      {trial_active && !subscribed && (tracking.featuresUsed[feature] || 0) >= 2 && (
        <div className="mt-3 p-3 rounded-lg border bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm">{msg.desc}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Your trial ends in {tracking.daysRemaining} days</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => createCheckout(msg.plan)} className="gap-1">
                  Upgrade to Keep {msg.title} <ArrowRight className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setShowPrompt(false)}>
                  Remind Me Tomorrow
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FeatureUpgradePrompt;
