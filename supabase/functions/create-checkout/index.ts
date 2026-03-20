import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const allowedOrigins = [
  'https://true-trucker-ifta-pro.lovable.app',
  'https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app',
  'https://tlvngzfoxpjdltbpmzaz.supabase.co',
  'https://true-trucker-ifta-pro.com',
  'https://www.true-trucker-ifta-pro.com',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// New pricing: solo, small_fleet, fleet_pro, enterprise (monthly & annual)
const priceMapping: Record<string, { amount: number; name: string; interval: 'month' | 'year' }> = {
  // Monthly
  solo:             { amount: 3900,   name: 'Solo',         interval: 'month' },
  small_fleet:      { amount: 7900,   name: 'Small Fleet',  interval: 'month' },
  fleet_pro:        { amount: 12900,  name: 'Fleet Pro',    interval: 'month' },
  enterprise:       { amount: 19900,  name: 'Enterprise',   interval: 'month' },
  // Annual (20% off)
  solo_annual:      { amount: 37440,  name: 'Solo (Annual)',        interval: 'year' },
  small_fleet_annual: { amount: 75840, name: 'Small Fleet (Annual)', interval: 'year' },
  fleet_pro_annual: { amount: 123840, name: 'Fleet Pro (Annual)',   interval: 'year' },
  enterprise_annual:{ amount: 191040, name: 'Enterprise (Annual)',  interval: 'year' },
  // Legacy plans — kept for existing subscribers creating new checkouts
  small:            { amount: 2900,   name: 'Starter Plan (Legacy)', interval: 'month' },
  medium:           { amount: 5900,   name: 'Professional Plan (Legacy)', interval: 'month' },
  large:            { amount: 12900,  name: 'Enterprise Plan (Legacy)', interval: 'month' },
};

const validateInput = (plan: string) => {
  logStep("Validating plan input", { received: plan, type: typeof plan });
  if (!plan || typeof plan !== 'string') {
    throw new Error(`Plan is required and must be a string. Received: ${plan} (type: ${typeof plan})`);
  }
  const trimmed = plan.trim().toLowerCase();
  if (trimmed.length > 50) throw new Error('Plan name too long');
  if (!priceMapping[trimmed]) {
    throw new Error(`Invalid plan: "${trimmed}". Valid plans: ${Object.keys(priceMapping).join(', ')}`);
  }
  return trimmed;
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan, coupon } = await req.json();
    const validatedPlan = validateInput(plan);
    logStep("Plan validated", { plan: validatedPlan });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY_LIVE") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    const selectedPlan = priceMapping[validatedPlan];

    const rawOrigin = req.headers.get("origin") || '';
    const safeOrigin = allowedOrigins.includes(rawOrigin) ? rawOrigin : 'https://true-trucker-ifta-pro.com';

    // Derive the base plan id (strip _annual suffix) for metadata
    const basePlan = validatedPlan.replace('_annual', '');

    // Validate coupon if provided — must be one of our known Stripe coupon IDs
    const validCoupons: Record<string, string> = {
      'TRIAL10': 'cllDKxUq',
      'COMEBACK20': 'hWkvax24',
      'EARLYBIRD15': 'A61H8B1V',
      'WINBACK25': 'wjtQTTy0',
    };
    let stripeCouponId: string | undefined;
    if (coupon && typeof coupon === 'string') {
      const upperCoupon = coupon.toUpperCase();
      if (validCoupons[upperCoupon]) {
        stripeCouponId = validCoupons[upperCoupon];
        logStep("Applying coupon", { code: upperCoupon, stripeId: stripeCouponId });
      } else {
        logStep("Invalid coupon ignored", { coupon });
      }
    }

    logStep("Creating checkout session", { plan: validatedPlan, amount: selectedPlan.amount, interval: selectedPlan.interval, coupon: stripeCouponId });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `TrueTrucker IFTA Pro - ${selectedPlan.name}`,
              description: `IFTA Pro ${selectedPlan.name} Subscription`,
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: selectedPlan.interval },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      ...(stripeCouponId ? { discounts: [{ coupon: stripeCouponId }] } : {}),
      subscription_data: {
        ...(!stripeCouponId ? { trial_period_days: 7 } : {}),
        metadata: {
          source: "truetrucker-ifta-app",
          app_name: "TrueTrucker IFTA Pro",
          user_id: user.id,
          plan: basePlan,
          billing_interval: selectedPlan.interval,
          created_from: "app-checkout",
          coupon_applied: stripeCouponId || 'none',
        },
      },
      success_url: `${safeOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeOrigin}/?canceled=true`,
      metadata: {
        source: "truetrucker-ifta-app",
        app_name: "TrueTrucker IFTA Pro",
        app_version: "2.0",
        user_id: user.id,
        plan: basePlan,
        billing_interval: selectedPlan.interval,
        purchase_type: "subscription",
        purchase_date: new Date().toISOString(),
        user_email: user.email,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
