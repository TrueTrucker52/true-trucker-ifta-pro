import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const validateInput = (plan: string) => {
  const validPlans = ['owner-operator', 'small', 'intermediate', 'medium', 'large', 'enterprise'];
  if (!plan || typeof plan !== 'string') {
    throw new Error('Plan is required and must be a string');
  }
  if (!validPlans.includes(plan)) {
    throw new Error('Invalid plan selected');
  }
  if (plan.length > 50) {
    throw new Error('Plan name too long');
  }
  return plan.trim().toLowerCase();
};

serve(async (req) => {
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
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    logStep("User authenticated", { userId: user.id, email: user.email });

    const { plan } = await req.json();
    const validatedPlan = validateInput(plan);
    logStep("Plan validated", { plan: validatedPlan });

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Define pricing based on plan
    const priceMapping = {
      "owner-operator": { amount: 1999, name: "Owner-Operator Plan" }, // $19.99
      "small": { amount: 2999, name: "Small Fleet Plan" }, // $29.99
      "intermediate": { amount: 3999, name: "Intermediate Fleet Plan" }, // $39.99
      "medium": { amount: 3999, name: "Medium Fleet Plan" }, // $39.99 (alias for intermediate)
      "large": { amount: 5999, name: "Large Fleet Plan" }, // $59.99
      "enterprise": { amount: 9999, name: "Enterprise Plan" }, // $99.99
    };

    const selectedPlan = priceMapping[validatedPlan as keyof typeof priceMapping];
    if (!selectedPlan) throw new Error("Invalid plan selected");

    logStep("Creating checkout session", { plan: validatedPlan, amount: selectedPlan.amount });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: selectedPlan.name,
              description: `IFTA Pro ${selectedPlan.name} Subscription`
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: "month" },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      metadata: {
        user_id: user.id,
        plan: validatedPlan,
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