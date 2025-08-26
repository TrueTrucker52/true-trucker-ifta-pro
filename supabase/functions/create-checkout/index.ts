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
  const validPlans = ['small', 'medium', 'large'];
  if (!plan || typeof plan !== 'string') {
    throw new Error('Plan is required and must be a string');
  }
  if (!validPlans.includes(plan)) {
    throw new Error(`Invalid plan selected. Valid plans are: ${validPlans.join(', ')}`);
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

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY_LIVE") || "", {
      apiVersion: "2023-10-16",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create new one");
    }

    // Define pricing based on plan
    const priceMapping = {
      "small": { amount: 2900, name: "Starter Plan" }, // $29.00
      "medium": { amount: 5900, name: "Professional Plan" }, // $59.00
      "large": { amount: 12900, name: "Enterprise Plan" }, // $129.00
    };

    const selectedPlan = priceMapping[validatedPlan as keyof typeof priceMapping];
    if (!selectedPlan) throw new Error("Invalid plan selected");

    logStep("Creating checkout session", { plan: validatedPlan, amount: selectedPlan.amount });

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      customer_update: customerId ? {
        metadata: {
          source: "truetrucker-ifta-app",
          app_name: "TrueTrucker IFTA Pro",
          user_id: user.id,
          last_purchase_date: new Date().toISOString()
        }
      } : undefined,
      
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `TrueTrucker IFTA Pro - ${selectedPlan.name}`,
              description: `IFTA Pro ${selectedPlan.name} Subscription`
            },
            unit_amount: selectedPlan.amount,
            recurring: { interval: "month" }
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?canceled=true`,
      metadata: {
        source: "truetrucker-ifta-app",
        app_name: "TrueTrucker IFTA Pro",
        app_version: "1.0",
        user_id: user.id,
        plan: validatedPlan,
        purchase_type: "subscription",
        purchase_date: new Date().toISOString(),
        user_email: user.email
      },
      subscription_data: {
        metadata: {
          source: "truetrucker-ifta-app",
          app_name: "TrueTrucker IFTA Pro",
          user_id: user.id,
          plan: validatedPlan,
          created_from: "app-checkout"
        }
      }
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