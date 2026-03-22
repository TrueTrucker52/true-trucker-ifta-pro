import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Stripe coupon mappings
const REFERRAL_COUPONS: Record<string, string> = {
  'REFER1FREE': '3b1rJ0gc',
  'NEWDRIVER': '0CYnz1HP',
  'REFER3FREE': '0VoNYl1G',
  'FLEETREFERRAL': 'a6QkmDqC',
};

const MILESTONES = [
  { target: 1, couponCode: 'REFER1FREE', type: 'free_month', value: 1 },
  { target: 3, couponCode: 'REFER3FREE', type: 'free_month', value: 3 },
  { target: 5, couponCode: null, type: 'upgrade', value: 3 },
  { target: 10, couponCode: null, type: 'free_year', value: 12 },
];

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isFutureDate = (value?: string | null) => {
  if (!value) return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed > new Date();
};

const hasActivePaidSubscription = async (supabaseAdmin: any, userId: string) => {
  const [{ data: subscriber }, { data: profile }] = await Promise.all([
    supabaseAdmin
      .from('subscribers')
      .select('subscribed, subscription_end')
      .eq('user_id', userId)
      .maybeSingle(),
    supabaseAdmin
      .from('profiles')
      .select('subscription_status, subscription_end')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const subscriberActive = Boolean(subscriber?.subscribed) && isFutureDate(subscriber?.subscription_end as string | null | undefined);
  const profileActive = profile?.subscription_status === 'active' && isFutureDate(profile?.subscription_end as string | null | undefined);

  return subscriberActive || profileActive;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const { action, referral_code, referral_id } = await req.json();

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY_LIVE') || '', {
      apiVersion: '2023-10-16',
    });

    // Action: check_and_reward — called when a referred user converts to paid
    if (action === 'check_and_reward') {
      if (!referral_id) {
        return jsonResponse({ error: 'referral_id required' }, 400);
      }

      // Get the referral
      const { data: referral } = await supabaseAdmin
        .from('referrals')
        .select('id, referrer_id, referred_id, reward_applied, status')
        .eq('id', referral_id)
        .maybeSingle();

      if (!referral) {
        return jsonResponse({ error: 'Referral not found' }, 404);
      }

      const callerId = userData.user.id;
      const isReferralParty = callerId === referral.referrer_id || callerId === referral.referred_id;
      if (!isReferralParty) {
        return jsonResponse({ error: 'Forbidden' }, 403);
      }

      if (!referral.referred_id) {
        return jsonResponse({ error: 'Referral is not linked to a signed-up user yet' }, 409);
      }

      if (referral.reward_applied) {
        return jsonResponse({ message: 'Already rewarded' });
      }

      const referredUserIsPaid = await hasActivePaidSubscription(supabaseAdmin, referral.referred_id);
      if (!referredUserIsPaid) {
        return jsonResponse({
          error: 'Referral rewards are only granted after the referred user has an active paid subscription',
        }, 403);
      }

      // Mark referral as converted and rewarded
      await supabaseAdmin.from('referrals').update({
        status: 'rewarded',
        converted_at: new Date().toISOString(),
        reward_applied: true,
        reward_applied_at: new Date().toISOString(),
      }).eq('id', referral_id);

      // Count total converted referrals for this referrer
      const { count } = await supabaseAdmin
        .from('referrals')
        .select('*', { count: 'exact', head: true })
        .eq('referrer_id', referral.referrer_id)
        .in('status', ['converted', 'rewarded']);

      const convertedCount = (count || 0);

      // Check milestones
      const milestone = MILESTONES.find(m => m.target === convertedCount);

      // Apply NEWDRIVER coupon to referred user
      if (referral.referred_id) {
        const { data: refProfile } = await supabaseAdmin
          .from('profiles')
          .select('stripe_customer_id')
          .eq('user_id', referral.referred_id)
          .single();

        if (refProfile?.stripe_customer_id) {
          try {
            await stripe.customers.update(refProfile.stripe_customer_id, {
              coupon: REFERRAL_COUPONS['NEWDRIVER'],
            });
          } catch (e) {
            console.error('Failed to apply NEWDRIVER coupon:', e);
          }
        }

        // Record reward for referred user
        await supabaseAdmin.from('referral_rewards').insert({
          user_id: referral.referred_id,
          reward_type: 'free_month',
          reward_value: 1,
          reward_status: 'applied',
          referral_id: referral_id,
          stripe_coupon_id: REFERRAL_COUPONS['NEWDRIVER'],
        });
      }

      // Apply referrer reward
      if (milestone && milestone.couponCode) {
        const { data: referrerProfile } = await supabaseAdmin
          .from('profiles')
          .select('stripe_customer_id')
          .eq('user_id', referral.referrer_id)
          .single();

        if (referrerProfile?.stripe_customer_id) {
          try {
            await stripe.customers.update(referrerProfile.stripe_customer_id, {
              coupon: REFERRAL_COUPONS[milestone.couponCode],
            });
          } catch (e) {
            console.error('Failed to apply referrer coupon:', e);
          }
        }

        await supabaseAdmin.from('referral_rewards').insert({
          user_id: referral.referrer_id,
          reward_type: milestone.type,
          reward_value: milestone.value,
          reward_status: 'applied',
          referral_id: referral_id,
          stripe_coupon_id: milestone.couponCode ? REFERRAL_COUPONS[milestone.couponCode] : null,
        });
      } else {
        // Standard 1 free month for referrer (per referral)
        const { data: referrerProfile } = await supabaseAdmin
          .from('profiles')
          .select('stripe_customer_id')
          .eq('user_id', referral.referrer_id)
          .single();

        if (referrerProfile?.stripe_customer_id && !milestone) {
          try {
            await stripe.customers.update(referrerProfile.stripe_customer_id, {
              coupon: REFERRAL_COUPONS['REFER1FREE'],
            });
          } catch (e) {
            console.error('Failed to apply REFER1FREE coupon:', e);
          }
        }

        await supabaseAdmin.from('referral_rewards').insert({
          user_id: referral.referrer_id,
          reward_type: 'free_month',
          reward_value: 1,
          reward_status: 'applied',
          referral_id: referral_id,
          stripe_coupon_id: REFERRAL_COUPONS['REFER1FREE'],
        });
      }

      return jsonResponse({
        success: true,
        convertedCount,
        milestoneReached: milestone?.target || null,
      });
    }

    // Action: register_signup — when a new user signs up with a referral code
    if (action === 'register_signup') {
      if (!referral_code) throw new Error('referral_code required');

      // Find the referrer by code
      const { data: referrerProfile } = await supabaseAdmin
        .from('profiles')
        .select('user_id, referral_code')
        .eq('referral_code', referral_code)
        .single();

      if (!referrerProfile) {
        return jsonResponse({ error: 'Invalid referral code' }, 400);
      }

      // Don't allow self-referral
      if (referrerProfile.user_id === userData.user.id) {
        return jsonResponse({ error: 'Cannot refer yourself' }, 400);
      }

      // Check if already referred
      const { data: existing } = await supabaseAdmin
        .from('referrals')
        .select('id')
        .eq('referred_id', userData.user.id)
        .maybeSingle();

      if (existing) {
        return jsonResponse({ message: 'Already referred' });
      }

      // Create or update referral record
      const { data: pendingRef } = await supabaseAdmin
        .from('referrals')
        .select('id')
        .eq('referrer_id', referrerProfile.user_id)
        .eq('referred_email', userData.user.email)
        .eq('status', 'pending')
        .maybeSingle();

      if (pendingRef) {
        await supabaseAdmin.from('referrals').update({
          referred_id: userData.user.id,
          status: 'signed_up',
          signed_up_at: new Date().toISOString(),
        }).eq('id', pendingRef.id);
      } else {
        await supabaseAdmin.from('referrals').insert({
          referrer_id: referrerProfile.user_id,
          referred_id: userData.user.id,
          referral_code: referral_code,
          referred_email: userData.user.email,
          status: 'signed_up',
          signed_up_at: new Date().toISOString(),
        });
      }

      return jsonResponse({ success: true, referrer: referrerProfile.user_id });
    }

    return jsonResponse({ error: 'Invalid action' }, 400);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('process-referral error:', msg);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
