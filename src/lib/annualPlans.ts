import { supabase } from '@/integrations/supabase/client';

export type AnnualPlanKey = 'solo' | 'small_fleet' | 'fleet_pro' | 'enterprise';

export interface AnnualPlan {
  key: AnnualPlanKey;
  annualPrice: number;
  monthlyPrice: number;
  savings: number;
  /** Klarna/Affirm pay-in-4 installment amount, or null when over the pay-in-4 cap */
  installment: number | null;
}

export const ANNUAL_PLANS: Record<AnnualPlanKey, AnnualPlan> = {
  solo: { key: 'solo', annualPrice: 390, monthlyPrice: 39, savings: 78, installment: 97.5 },
  small_fleet: { key: 'small_fleet', annualPrice: 790, monthlyPrice: 79, savings: 158, installment: 197.5 },
  fleet_pro: { key: 'fleet_pro', annualPrice: 1290, monthlyPrice: 129, savings: 258, installment: 322.5 },
  enterprise: { key: 'enterprise', annualPrice: 1990, monthlyPrice: 199, savings: 398, installment: null },
};

export const ANNUAL_LABEL = '2 months free';

export const formatMoney = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });

/** Copy for the BNPL line shown under each annual price. */
export const financingCopy = (plan: AnnualPlan) =>
  plan.installment === null
    ? 'monthly financing available with Affirm'
    : `or 4 interest-free payments of $${formatMoney(plan.installment)} with Klarna or Affirm`;

/**
 * Calls the create-annual-checkout edge function and redirects to Stripe.
 * Throws on failure so callers can surface a toast.
 */
export const startAnnualCheckout = async (tier: AnnualPlanKey, accessToken: string) => {
  const { data, error } = await supabase.functions.invoke('create-annual-checkout', {
    body: { tier },
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (error) throw error;
  if (!data?.url) throw new Error('No checkout URL received');

  window.location.href = data.url as string;
};
