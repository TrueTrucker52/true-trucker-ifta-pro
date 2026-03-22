import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ELD_PRICE_IDS = new Set([
  'price_1TDJy9LwWfF7E7ohwEuCZc6F',
  'price_1TDJyJLwWfF7E7oh35wSnNAS',
]);

const logStep = (step: string, details?: Record<string, unknown>) => {
  const suffix = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SYNC-ELD-CHECKOUT] ${step}${suffix}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } },
  );

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !userData.user?.id || !userData.user.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { sessionId } = await req.json();
    if (!sessionId || typeof sessionId !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing sessionId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY_LIVE') || Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    const user = userData.user;
    const sessionUserId = session.metadata?.user_id;
    const sessionEmail = session.customer_details?.email || session.customer_email;
    const belongsToUser = sessionUserId === user.id || sessionEmail === user.email;

    if (!belongsToUser) {
      logStep('Session ownership check failed', { sessionId, userId: user.id, sessionUserId, sessionEmail });
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    if (!subscriptionId) {
      return new Response(JSON.stringify({ synced: false, reason: 'missing_subscription' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const subscription = typeof session.subscription === 'string'
      ? await stripe.subscriptions.retrieve(subscriptionId)
      : session.subscription;

    const price = subscription.items.data[0]?.price;
    const priceId = price?.id;
    const addonKey = session.metadata?.addon_key || subscription.metadata?.addon_key;
    const isEldCheckout = addonKey === 'eld_compliance' || (priceId ? ELD_PRICE_IDS.has(priceId) : false);

    if (!isEldCheckout || !priceId) {
      return new Response(JSON.stringify({ synced: false, reason: 'not_eld_checkout' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const billingInterval = price.recurring?.interval === 'year' ? 'year' : 'month';
    const expiresAt = subscription.current_period_end
      ? new Date(subscription.current_period_end * 1000).toISOString()
      : null;
    const activatedAt = subscription.status === 'active' || subscription.status === 'trialing'
      ? new Date().toISOString()
      : null;

    const { error: upsertError } = await supabaseClient
      .from('user_addons')
      .upsert({
        user_id: user.id,
        addon_key: 'eld_compliance',
        status: subscription.status,
        billing_interval: billingInterval,
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        activated_at: activatedAt,
        expires_at: expiresAt,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,addon_key' });

    if (upsertError) {
      logStep('Failed to upsert user_addons row', { message: upsertError.message, userId: user.id, subscriptionId: subscription.id });
      throw upsertError;
    }

    logStep('ELD add-on synced', { userId: user.id, subscriptionId: subscription.id, status: subscription.status, billingInterval });

    return new Response(JSON.stringify({
      synced: true,
      addon_key: 'eld_compliance',
      status: subscription.status,
      billing_interval: billingInterval,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logStep('Unhandled error', { message });

    return new Response(JSON.stringify({ error: 'Failed to sync ELD checkout' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});