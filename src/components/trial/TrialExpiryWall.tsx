import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrialConversion } from '@/hooks/useTrialConversion';
import { useSubscription } from '@/hooks/useSubscription';
import { Clock, Shield, Gift, MessageSquare, Check } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ANNUAL_PLANS, ANNUAL_LABEL, AnnualPlanKey, financingCopy, formatMoney, startAnnualCheckout } from '@/lib/annualPlans';

const TrialExpiryWall: React.FC = () => {
  const navigate = useNavigate();
  const { tracking } = useTrialConversion();
  const { subscription_status, subscribed, createCheckout } = useSubscription();
  const { session } = useAuth();
  const { toast } = useToast();
  const [annual, setAnnual] = React.useState(false);

  const handleSelect = async (planId: string) => {
    if (annual) {
      try {
        if (!session?.access_token) throw new Error('Not signed in');
        await startAnnualCheckout(planId as AnnualPlanKey, session.access_token);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to create checkout session. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }
    // Monthly keeps the comeback discount; annual pricing is the offer itself.
    createCheckout(planId, 'COMEBACK20');
  };

  // Only show when trial is expired and not subscribed
  if (subscribed || subscription_status !== 'trial_expired') return null;

  const plans = [
    { id: 'solo', name: 'SOLO', price: 39, discountPrice: 31, desc: '1 truck — All features' },
    { id: 'small_fleet', name: 'SMALL FLEET', price: 79, discountPrice: 63, desc: '2-5 trucks — Fleet management' },
    { id: 'fleet_pro', name: 'FLEET PRO', price: 129, discountPrice: 103, desc: '6-10 trucks — Advanced tools' },
    { id: 'enterprise', name: 'ENTERPRISE', price: 199, discountPrice: 159, desc: '11-25 trucks — Dedicated support' },
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-2">
        <CardContent className="pt-8 pb-6 space-y-5">
          <div className="text-center space-y-2">
            <div className="text-4xl">⏰</div>
            <h2 className="text-2xl font-bold">Your Free Trial Has Ended</h2>
            <p className="text-sm text-muted-foreground">
              Thank you for trying TrueTrucker IFTA Pro! Your 7-day trial period has ended.
            </p>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200 text-sm">
            <Shield className="h-5 w-5 text-green-600 shrink-0" />
            <span className="text-green-700">Your data is safe and waiting — upgrade now to regain full access instantly.</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center bg-muted rounded-full p-1">
              <button
                type="button"
                aria-pressed={!annual}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${!annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setAnnual(false)}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={annual}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${annual ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                onClick={() => setAnnual(true)}
              >
                Annual
              </button>
            </div>
            {annual && (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/30">{ANNUAL_LABEL}</Badge>
            )}
          </div>


          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <Gift className="h-5 w-5 text-primary shrink-0" />
            {annual ? (
              <div>
                <p className="font-semibold text-primary">Go annual and get {ANNUAL_LABEL}</p>
                <p className="text-xs text-muted-foreground">Split it with Klarna or Affirm at checkout</p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-primary">Special comeback offer: 20% off first month!</p>
                <p className="text-xs text-muted-foreground">Valid for 48 hours only</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {plans.slice(0, 2).map(plan => {
              const annualPlan = ANNUAL_PLANS[plan.id as AnnualPlanKey];
              return (
                <div key={plan.id} className="space-y-1">
                  <Button
                    className="w-full justify-between min-h-[52px]"
                    variant={plan.id === 'solo' ? 'default' : 'outline'}
                    onClick={() => handleSelect(plan.id)}
                  >
                    <div className="text-left">
                      <span className="font-bold">{plan.name}</span>
                      <span className="text-xs ml-2 opacity-80">{plan.desc}</span>
                    </div>
                    <div className="text-right">
                      {annual ? (
                        <>
                          <span className="line-through text-xs opacity-60 mr-1">${formatMoney(plan.price * 12)}</span>
                          <span className="font-bold">${formatMoney(annualPlan.annualPrice)}/yr</span>
                        </>
                      ) : (
                        <>
                          <span className="line-through text-xs opacity-60 mr-1">${plan.price}</span>
                          <span className="font-bold">${plan.discountPrice}</span>
                        </>
                      )}
                    </div>
                  </Button>
                  {annual && (
                    <p className="text-xs text-center text-muted-foreground">
                      Saves ${formatMoney(annualPlan.savings)} vs monthly · {financingCopy(annualPlan)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/pricing')}>
              View All Plans
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <a href="mailto:support@truetruckingtv.com">
                <MessageSquare className="h-4 w-4 mr-1" /> Talk to Support
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialExpiryWall;
