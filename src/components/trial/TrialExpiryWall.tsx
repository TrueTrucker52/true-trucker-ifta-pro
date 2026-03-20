import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTrialConversion } from '@/hooks/useTrialConversion';
import { useSubscription } from '@/hooks/useSubscription';
import { Clock, Shield, Gift, MessageSquare, Check } from 'lucide-react';

const TrialExpiryWall: React.FC = () => {
  const navigate = useNavigate();
  const { tracking } = useTrialConversion();
  const { subscription_status, subscribed, createCheckout } = useSubscription();

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

          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
            <Gift className="h-5 w-5 text-primary shrink-0" />
            <div>
              <p className="font-semibold text-primary">Special comeback offer: 20% off first month!</p>
              <p className="text-xs text-muted-foreground">Valid for 48 hours only</p>
            </div>
          </div>

          <div className="space-y-2">
            {plans.slice(0, 2).map(plan => (
              <Button
                key={plan.id}
                className="w-full justify-between min-h-[52px]"
                variant={plan.id === 'solo' ? 'default' : 'outline'}
                onClick={() => createCheckout(plan.id, 'COMEBACK20')}
              >
                <div className="text-left">
                  <span className="font-bold">{plan.name}</span>
                  <span className="text-xs ml-2 opacity-80">{plan.desc}</span>
                </div>
                <div className="text-right">
                  <span className="line-through text-xs opacity-60 mr-1">${plan.price}</span>
                  <span className="font-bold">${plan.discountPrice}</span>
                </div>
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/pricing')}>
              View All Plans
            </Button>
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/help')}>
              <MessageSquare className="h-4 w-4 mr-1" /> Talk to Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TrialExpiryWall;
