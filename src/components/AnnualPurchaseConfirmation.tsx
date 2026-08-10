import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import {
  ANNUAL_PLANS,
  ANNUAL_PLAN_NAMES,
  ANNUAL_LABEL,
  formatMoney,
  type AnnualPlanKey,
} from '@/lib/annualPlans';

interface AnnualPurchaseConfirmationProps {
  planKey: AnnualPlanKey;
  userId: string;
  /** Called once access is confirmed so global subscription state refreshes. */
  onAccessGranted?: () => void;
}

type AccessState = 'checking' | 'granted' | 'pending';

const POLL_ATTEMPTS = 8;
const POLL_INTERVAL_MS = 1500;

const AnnualPurchaseConfirmation = ({
  planKey,
  userId,
  onAccessGranted,
}: AnnualPurchaseConfirmationProps) => {
  const navigate = useNavigate();
  const plan = ANNUAL_PLANS[planKey];
  const planName = ANNUAL_PLAN_NAMES[planKey];

  const [accessState, setAccessState] = useState<AccessState>('checking');
  const [accessUntil, setAccessUntil] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt++) {
        const { data } = await supabase
          .from('subscribers')
          .select('subscribed, billing_period, plan_key, subscription_end')
          .eq('user_id', userId)
          .maybeSingle();

        if (cancelled) return;

        const granted =
          data?.billing_period === 'annual' &&
          !!data?.subscription_end &&
          new Date(data.subscription_end) > new Date();

        if (granted) {
          setAccessUntil(data!.subscription_end as string);
          setAccessState('granted');
          onAccessGranted?.();
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
        if (cancelled) return;
      }

      setAccessState('pending');
    };

    poll();
    return () => {
      cancelled = true;
    };
  }, [userId, onAccessGranted]);

  const renewalDate = accessUntil
    ? new Date(accessUntil).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          {accessState === 'checking' ? (
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          ) : accessState === 'granted' ? (
            <CheckCircle className="h-16 w-16 text-primary" />
          ) : (
            <Clock className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {accessState === 'checking'
            ? 'Confirming your purchase...'
            : accessState === 'granted'
              ? `${planName} Annual is active`
              : 'Payment received — finalizing'}
        </CardTitle>
        <CardDescription>
          {accessState === 'checking'
            ? 'We’re confirming your annual payment and unlocking your account.'
            : accessState === 'granted'
              ? 'Your annual plan is paid in full and your access has been granted.'
              : 'Klarna and Affirm payments can take a few minutes to settle. Your access unlocks automatically as soon as they confirm.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Plan purchased</span>
            <span className="font-semibold">{planName} — Annual</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-semibold">${formatMoney(plan.annualPrice)} / year</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">You saved</span>
            <Badge variant="secondary">
              ${formatMoney(plan.savings)} · {ANNUAL_LABEL}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Access status</span>
            <span className="font-semibold">
              {accessState === 'granted'
                ? 'Granted'
                : accessState === 'pending'
                  ? 'Pending payment settlement'
                  : 'Checking…'}
            </span>
          </div>
          {renewalDate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Covered through</span>
              <span className="font-semibold">{renewalDate}</span>
            </div>
          )}
        </div>

        {accessState !== 'checking' && (
          <>
            <Button className="w-full" size="lg" onClick={() => navigate('/account?flow=setup')}>
              Complete Company Setup
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {accessState === 'pending' && (
          <p className="text-xs text-muted-foreground text-center">
            Nothing else is needed from you. Refresh this page in a few minutes to see your access
            confirmed.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnualPurchaseConfirmation;
