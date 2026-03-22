import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, ClipboardList, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { ELD_CHECKOUT_PLANS, ELD_COUPON, ELD_FEATURES } from '@/lib/eldUpgrade';

interface ELDUpgradeCardProps {
  compact?: boolean;
  inspectionMode?: boolean;
}

export const ELDUpgradeCard = ({ compact = false, inspectionMode = false }: ELDUpgradeCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createCheckout } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null);

  const handleCheckout = async (billing: 'monthly' | 'annual') => {
    if (!user) {
      navigate('/auth?mode=signup');
      return;
    }

    setLoadingPlan(billing);
    try {
      await createCheckout(ELD_CHECKOUT_PLANS[billing], ELD_COUPON.code);
    } finally {
      setLoadingPlan(null);
    }
  };

  if (compact) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-foreground">⚖️ Stay DOT Compliant</h3>
            <p className="text-sm text-muted-foreground">Add ELD compliance to your account — $10/truck/month.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleCheckout('monthly')} disabled={loadingPlan === 'monthly'}>
              {loadingPlan === 'monthly' ? 'Opening…' : 'Upgrade to ELD'}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="/pricing#eld-addon">Learn More</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30 bg-card">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ClipboardList className="w-5 h-5 text-primary" />
              {inspectionMode ? '🚨 DOT Inspection Mode' : '⚖️ ELD Compliance'}
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {inspectionMode
                ? 'You need ELD compliance activated to use DOT Inspection Mode.'
                : 'Upgrade to unlock full FMCSA-compliant ELD logging.'}
            </p>
          </div>
          <Badge variant="secondary">30% off first 3 months</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {inspectionMode ? (
          <div className="space-y-2 text-sm">
            <p className="font-medium text-foreground">Without ELD you risk:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>❌ $16,000 fine for no ELD device</li>
              <li>❌ Vehicle placed out of service</li>
              <li>❌ Failed inspection on record</li>
            </ul>
          </div>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {ELD_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="rounded-lg border bg-muted/50 p-4 text-sm">
          <p className="font-medium text-foreground">🎁 Launch Special</p>
          <p className="text-muted-foreground">Use code <span className="font-semibold text-foreground">{ELD_COUPON.code}</span> for 30% off your first 3 months.</p>
          <p className="mt-2 text-foreground">Monthly: <strong>$10/truck/month</strong></p>
          <p className="text-foreground">Annual: <strong>$96/truck/year</strong> <span className="text-muted-foreground">($8/mo)</span></p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" onClick={() => handleCheckout('monthly')} disabled={loadingPlan === 'monthly'}>
            {loadingPlan === 'monthly' ? 'Opening checkout…' : '🚀 Upgrade Monthly'}
          </Button>
          <Button size="lg" variant="outline" onClick={() => handleCheckout('annual')} disabled={loadingPlan === 'annual'}>
            {loadingPlan === 'annual' ? 'Opening checkout…' : '💰 Upgrade Annual — Save 20%'}
          </Button>
          {inspectionMode ? (
            <Button asChild variant="ghost">
              <a href="tel:3213959957"><Phone className="w-4 h-4 mr-2" />Call Support Instead</a>
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <a href="/pricing#eld-addon">Learn More About ELD</a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ELDUpgradeCard;