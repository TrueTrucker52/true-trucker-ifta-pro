import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Star, AlertTriangle, Zap, X, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrialConversion } from '@/hooks/useTrialConversion';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';
import TrialSpecialOffer from './TrialSpecialOffer';

const TrialConversionBanner: React.FC = () => {
  const navigate = useNavigate();
  const { tracking, activeOffer, createOffer, acceptOffer, markOfferShown } = useTrialConversion();
  const { subscribed, createCheckout, trial_active, subscription_status } = useSubscription();
  const [dismissed, setDismissed] = useState(false);
  const [showOffer, setShowOffer] = useState(false);

  // Don't show if subscribed, converted, or dismissed
  if (subscribed || tracking.converted || dismissed) return null;
  // Don't show if not a trial user
  if (!trial_active && subscription_status !== 'trial_expired') return null;

  const { urgencyLevel, daysRemaining, isExpired } = tracking;

  const config = {
    green: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-700',
      icon: <Star className="h-5 w-5" />,
      emoji: '🚛',
      title: `Free Trial — ${daysRemaining} days left`,
      subtitle: 'You have full access to all TrueTrucker features!',
      btnVariant: 'secondary' as const,
      btnText: 'Upgrade Now →',
    },
    yellow: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-700',
      icon: <Clock className="h-5 w-5" />,
      emoji: '⏳',
      title: `Trial ending in ${daysRemaining} days`,
      subtitle: 'Keep access to ELD, GPS, Voice Commands and everything!',
      btnVariant: 'default' as const,
      btnText: 'Upgrade Now — From $39/mo →',
    },
    orange: {
      bg: 'bg-orange-500/10 border-orange-500/30',
      text: 'text-orange-700',
      icon: <AlertTriangle className="h-5 w-5" />,
      emoji: '⚠️',
      title: `Only ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left in trial!`,
      subtitle: 'Upgrade today to keep your data and never lose access.',
      btnVariant: 'default' as const,
      btnText: 'Upgrade Now — Special Offer →',
    },
    red: {
      bg: 'bg-red-500/10 border-red-500/30 animate-pulse',
      text: 'text-red-700',
      icon: <Zap className="h-5 w-5" />,
      emoji: '🚨',
      title: 'Your trial ends TODAY!',
      subtitle: 'Upgrade now to keep everything. Last chance for trial pricing!',
      btnVariant: 'destructive' as const,
      btnText: 'Upgrade Before Midnight →',
    },
    expired: {
      bg: 'bg-red-500/15 border-red-500/40',
      text: 'text-red-800',
      icon: <AlertTriangle className="h-5 w-5" />,
      emoji: '⏰',
      title: 'Your Free Trial Has Ended',
      subtitle: 'Your data is safe — upgrade now to regain full access instantly.',
      btnVariant: 'destructive' as const,
      btnText: 'Reactivate Now →',
    },
  };

  const c = config[urgencyLevel];

  const handleUpgrade = () => {
    if (urgencyLevel === 'orange' || urgencyLevel === 'red') {
      // Show special offer for urgent users
      if (!activeOffer) {
        createOffer('urgency', 10, 'TRIAL10', urgencyLevel === 'red' ? 12 : 24);
      }
      setShowOffer(true);
    } else {
      navigate('/pricing');
    }
  };

  const handleDirectUpgrade = (plan: string) => {
    const coupon = (urgencyLevel === 'orange' || urgencyLevel === 'red') ? 'TRIAL10' : undefined;
    createCheckout(plan, coupon);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className={`border-b ${c.bg} relative`}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <div>
                  <p className={`font-bold ${c.text}`}>{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {urgencyLevel !== 'expired' && (
                  <Button variant="ghost" size="sm" onClick={() => navigate('/pricing')}>
                    View Plans
                  </Button>
                )}
                <Button variant={c.btnVariant} size="sm" onClick={handleUpgrade} className="font-semibold gap-1">
                  {(urgencyLevel === 'orange' || urgencyLevel === 'red') && <Gift className="h-4 w-4" />}
                  {c.btnText}
                </Button>
                {urgencyLevel === 'green' && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDismissed(true)}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {showOffer && (
        <TrialSpecialOffer
          open={showOffer}
          onClose={() => setShowOffer(false)}
          offer={activeOffer}
          daysRemaining={daysRemaining}
          onAccept={async (plan) => {
            if (activeOffer) await acceptOffer(activeOffer.id);
            await createCheckout(plan, 'TRIAL10');
          }}
        />
      )}
    </>
  );
};

export default TrialConversionBanner;
