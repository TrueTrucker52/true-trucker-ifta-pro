// supabase/functions/stripe-webhook-annual/index.ts
//
// Handles one-time annual IFTA Pro payments created by create-annual-checkout.
// Grants 365 days of access on checkout.session.completed (and async payment
// success for BNPL methods like Klarna/Affirm that settle later).
//
// Secrets: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
//          SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// NOTE: no JWT — Stripe calls this. Authenticity comes from the signature.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[STRIPE-WEBHOOK-ANNUAL] ${step}${detailsStr}`);
};

// Maps the checkout plan key onto the app's subscription_tier vocabulary.
const TIER_MAP: Record<string, string> = {
  solo: "small",
  small_fleet: "medium",
  fleet_pro: "large",
  enterprise: "large",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2024-06-20" });
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

  let event: Stripe.Event;
  try {
    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("Missing signature");
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
  } catch (e) {
    console.error(
      "[STRIPE-WEBHOOK-ANNUAL] Signature verification failed:",
      e instanceof Error ? e.message : String(e),
    );
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  try {
    logStep("Event received", { type: event.type, id: event.id });

    const relevant = [
      "checkout.session.completed",
      "checkout.session.async_payment_succeeded",
    ];
    if (!relevant.includes(event.type)) {
      return new Response(JSON.stringify({ received: true, ignored: event.type }), { status: 200 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    // Only handle the one-time annual sessions this function owns.
    if (session.mode !== "payment" || session.metadata?.billing_period !== "annual") {
      logStep("Skipping non-annual session", { sessionId: session.id, mode: session.mode });
      return new Response(JSON.stringify({ received: true, skipped: true }), { status: 200 });
    }

    if (session.payment_status !== "paid") {
      logStep("Payment not settled yet", { sessionId: session.id, status: session.payment_status });
      return new Response(JSON.stringify({ received: true, pending: true }), { status: 200 });
    }

    const userId = session.metadata?.supabase_user_id ?? null;
    const planKey = (session.metadata?.ifta_tier ?? "").toLowerCase();
    const tier = TIER_MAP[planKey];
    const grantsDays = Number(session.metadata?.grants_days ?? "365");
    const days = Number.isFinite(grantsDays) && grantsDays > 0 && grantsDays <= 1100 ? grantsDays : 365;

    if (!userId || !tier) {
      logStep("Missing or invalid metadata", { sessionId: session.id, planKey });
      // 200 so Stripe stops retrying a session we can never resolve.
      return new Response(JSON.stringify({ received: true, unresolved: true }), { status: 200 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      (await supabase.auth.admin.getUserById(userId)).data.user?.email ??
      null;

    if (!email) {
      logStep("Could not resolve email", { userId });
      return new Response(JSON.stringify({ received: true, unresolved: true }), { status: 200 });
    }

    const purchasedAt = new Date((session.created ?? Math.floor(Date.now() / 1000)) * 1000);
    const subscriptionEnd = new Date(purchasedAt.getTime() + days * 24 * 60 * 60 * 1000);

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    let paymentMethodType: string | null = null;
    if (paymentIntentId) {
      try {
        const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
        paymentMethodType = pi.payment_method_types?.[0] ?? null;
      } catch {
        paymentMethodType = null;
      }
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

    // service_role bypasses the protect_subscription_fields_* triggers.
    const { error: subErr } = await supabase
      .from("subscribers")
      .upsert(
        {
          user_id: userId,
          email,
          subscribed: true,
          subscription_tier: tier,
          subscription_end: subscriptionEnd.toISOString(),
          billing_period: "annual",
          plan_key: planKey,
          stripe_customer_id: customerId,
          stripe_payment_intent_id: paymentIntentId,
          payment_method_type: paymentMethodType,
          purchased_at: purchasedAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" },
      );

    if (subErr) {
      console.error("[STRIPE-WEBHOOK-ANNUAL] Failed to update subscribers:", subErr.message);
      return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
    }

    const { error: profileErr } = await supabase
      .from("profiles")
      .update({
        subscription_status: "active",
        subscription_tier: tier,
        subscription_end: subscriptionEnd.toISOString(),
        stripe_customer_id: customerId,
      })
      .eq("user_id", userId);

    if (profileErr) {
      console.error("[STRIPE-WEBHOOK-ANNUAL] Failed to update profile:", profileErr.message);
    }

    logStep("Annual access granted", {
      userId,
      planKey,
      tier,
      days,
      subscriptionEnd: subscriptionEnd.toISOString(),
    });

    return new Response(JSON.stringify({ received: true, granted: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(
      "[STRIPE-WEBHOOK-ANNUAL] Unhandled error:",
      e instanceof Error ? e.message : String(e),
    );
    return new Response(JSON.stringify({ error: "Processing failed" }), { status: 500 });
  }
});
