// supabase/functions/create-annual-checkout/index.ts
//
// Creates a one-time Checkout Session for an annual IFTA Pro plan with
// Klarna and Affirm offered alongside card (BNPL requires mode: "payment").
//
// Secrets: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
//          STRIPE_PRICE_ANNUAL_{SOLO,SMALL_FLEET,FLEET_PRO,ENTERPRISE}

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

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-ANNUAL-CHECKOUT] ${step}${detailsStr}`);
};

const ANNUAL_PRICES: Record<string, string> = {
  solo: Deno.env.get("STRIPE_PRICE_ANNUAL_SOLO") ?? "",
  small_fleet: Deno.env.get("STRIPE_PRICE_ANNUAL_SMALL_FLEET") ?? "",
  fleet_pro: Deno.env.get("STRIPE_PRICE_ANNUAL_FLEET_PRO") ?? "",
  enterprise: Deno.env.get("STRIPE_PRICE_ANNUAL_ENTERPRISE") ?? "",
};

const jsonResponse = (body: unknown, status: number, corsHeaders: Record<string, string>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Validate input
    let tier: unknown;
    try {
      const body = await req.json();
      tier = body?.tier;
    } catch {
      return jsonResponse({ error: "Invalid request body" }, 400, corsHeaders);
    }

    if (typeof tier !== "string" || !Object.prototype.hasOwnProperty.call(ANNUAL_PRICES, tier.trim().toLowerCase())) {
      return jsonResponse({ error: "Invalid tier" }, 400, corsHeaders);
    }
    const tierKey = tier.trim().toLowerCase();
    const price = ANNUAL_PRICES[tierKey];
    if (!price) {
      logStep("Missing price id secret for tier", { tier: tierKey });
      return jsonResponse({ error: "Plan is not available right now" }, 400, corsHeaders);
    }

    // Identify the caller from their JWT
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") ?? "";
    if (!token) return jsonResponse({ error: "Not signed in" }, 401, corsHeaders);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user?.email) {
      logStep("Authentication failed");
      return jsonResponse({ error: "Not signed in" }, 401, corsHeaders);
    }
    const user = userData.user;
    logStep("User authenticated", { userId: user.id });

    // Only redirect back to whitelisted origins
    const rawOrigin = req.headers.get("origin") || '';
    const safeOrigin = allowedOrigins.includes(rawOrigin) ? rawOrigin : allowedOrigins[0];

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    // Reuse the Stripe customer if we already have one
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = existing.data[0]?.id;

    const session = await stripe.checkout.sessions.create({
      mode: "payment", // NOT "subscription" — this is what enables BNPL
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [{ price, quantity: 1 }],

      // Listing these explicitly guarantees they render. Omit the array
      // and Stripe picks dynamically, which can silently drop Klarna.
      payment_method_types: ["card", "klarna", "affirm"],

      allow_promotion_codes: true,
      success_url: `${safeOrigin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${safeOrigin}/pricing`,

      // The webhook reads these to grant access.
      metadata: {
        supabase_user_id: user.id,
        ifta_tier: tierKey,
        billing_period: "annual",
        grants_days: "365",
      },
      payment_intent_data: {
        metadata: { supabase_user_id: user.id, ifta_tier: tierKey },
      },
    });

    logStep("Checkout session created", { sessionId: session.id, tier: tierKey });
    return jsonResponse({ url: session.url }, 200, corsHeaders);
  } catch (e) {
    // Never leak raw exception details to the client
    console.error('[CREATE-ANNUAL-CHECKOUT] Unhandled error:', e instanceof Error ? e.message : String(e));
    return jsonResponse({ error: "Unable to create checkout session" }, 500, corsHeaders);
  }
});
