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
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // First check the user's profile for trial/subscription status
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      throw new Error(`Profile fetch error: ${profileError.message}`);
    }

    const now = new Date();
    let userStatus = {
      subscribed: false,
      subscription_tier: 'free',
      subscription_end: null,
      trial_active: false,
      trial_days_remaining: 0,
      trial_end_date: null,
      subscription_status: 'trial'
    };

    if (profile) {
      logStep("Profile found", { 
        subscription_status: profile.subscription_status,
        subscription_tier: profile.subscription_tier,
        trial_end_date: profile.trial_end_date 
      });

      // Check trial status
      if (profile.trial_end_date) {
        const trialEndDate = new Date(profile.trial_end_date);
        const trialDaysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const trialActive = trialDaysRemaining > 0;

        userStatus.trial_active = trialActive;
        userStatus.trial_days_remaining = trialDaysRemaining;
        userStatus.trial_end_date = profile.trial_end_date;
        userStatus.subscription_status = profile.subscription_status;

        logStep("Trial status calculated", { 
          trialActive, 
          trialDaysRemaining, 
          trialEndDate: trialEndDate.toISOString() 
        });

        // If trial has expired, update status to expired
        if (!trialActive && profile.subscription_status === 'trial') {
          await supabaseClient
            .from("profiles")
            .update({ 
              subscription_status: 'trial_expired',
              updated_at: now.toISOString()
            })
            .eq("user_id", user.id);
          
          userStatus.subscription_status = 'trial_expired';
          logStep("Updated expired trial status");
        }
      }

      // Check for active paid subscription via Stripe
      const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || Deno.env.get("STRIPE_SECRET_KEY_LIVE");
      logStep("Checking Stripe key availability", { 
        hasTestKey: !!Deno.env.get("STRIPE_SECRET_KEY"),
        hasLiveKey: !!Deno.env.get("STRIPE_SECRET_KEY_LIVE"),
        usingKey: stripeKey ? `${stripeKey.substring(0, 7)}...` : 'none'
      });
      
      if (stripeKey) {
        try {
          const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
          
          // First, find or verify the Stripe customer
          let customerId = profile.stripe_customer_id;
          logStep("Starting customer lookup", { 
            existingCustomerId: customerId,
            userEmail: user.email 
          });
          
          if (!customerId) {
            // Look for customer by email
            logStep("Searching for customer by email in Stripe");
            const customers = await stripe.customers.list({ 
              email: user.email, 
              limit: 1 
            });
            logStep("Stripe customer search result", { 
              foundCustomers: customers.data.length,
              customers: customers.data.map(c => ({ id: c.id, email: c.email }))
            });
            
            if (customers.data.length > 0) {
              customerId = customers.data[0].id;
              // Update profile with the found customer ID
              await supabaseClient
                .from("profiles")
                .update({ 
                  stripe_customer_id: customerId,
                  updated_at: now.toISOString()
                })
                .eq("user_id", user.id);
              logStep("Found and saved Stripe customer ID", { customerId });
            } else {
              logStep("No Stripe customer found for email", { email: user.email });
            }
          }
          
          // Check for active subscriptions
          if (customerId) {
            logStep("Checking for active subscriptions", { customerId });
            const subscriptions = await stripe.subscriptions.list({
              customer: customerId,
              status: "active",
              limit: 10, // Increase limit to see more subscriptions
            });
            
            logStep("Stripe subscription search result", { 
              activeSubscriptions: subscriptions.data.length,
              subscriptions: subscriptions.data.map(s => ({
                id: s.id,
                status: s.status,
                current_period_end: s.current_period_end,
                price_id: s.items.data[0]?.price.id
              }))
            });

            if (subscriptions.data.length > 0) {
              const subscription = subscriptions.data[0];
              const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
              
              // Determine subscription tier from price
              const priceId = subscription.items.data[0].price.id;
              const price = await stripe.prices.retrieve(priceId);
              const amount = price.unit_amount || 0;
              let subscriptionTier = 'small';
              
              if (amount >= 12900) {
                subscriptionTier = 'large';
              } else if (amount >= 5900) {
                subscriptionTier = 'medium';
              } else if (amount >= 2900) {
                subscriptionTier = 'small';
              }

              userStatus.subscribed = true;
              userStatus.subscription_tier = subscriptionTier;
              userStatus.subscription_end = subscriptionEnd;
              userStatus.subscription_status = 'active';

              // Update profile with active subscription
              await supabaseClient
                .from("profiles")
                .update({ 
                  subscription_status: 'active',
                  subscription_tier: subscriptionTier,
                  subscription_end: subscriptionEnd,
                  updated_at: now.toISOString()
                })
                .eq("user_id", user.id);

               logStep("Updated active subscription status", { subscriptionTier, subscriptionEnd });
            } else {
              logStep("No active subscriptions found for customer", { customerId });
            }
          } else {
            logStep("No customer ID available - skipping subscription check");
          }
        } catch (stripeError) {
            logStep("Stripe check failed", { error: stripeError.message, stack: stripeError.stack });
            
            // If Stripe check failed due to invalid customer ID, clean up the profile
            if (stripeError.message.includes("No such customer")) {
              await supabaseClient
                .from("profiles")
                .update({ 
                  stripe_customer_id: null,
                  subscription_status: userStatus.trial_active ? 'trial' : 'trial_expired',
                  subscription_tier: 'free',
                  subscription_end: null,
                  updated_at: now.toISOString()
                })
                .eq("user_id", user.id);
              
              userStatus.subscription_tier = 'free';
              userStatus.subscription_status = userStatus.trial_active ? 'trial' : 'trial_expired';
              logStep("Cleaned up invalid Stripe customer ID");
            }
          }
        } else {
          logStep("No Stripe secret key available");
        }

      // Set subscription tier from profile if not overridden by Stripe
      if (!userStatus.subscribed) {
        // If user is not subscribed, they should have 'free' tier unless they have an active trial
        userStatus.subscription_tier = userStatus.trial_active ? (profile.subscription_tier || 'free') : 'free';
      }
    } else {
      // No profile found - this shouldn't happen with our trigger, but handle gracefully
      logStep("No profile found - creating default profile");
      await supabaseClient.from("profiles").insert({
        user_id: user.id,
        email: user.email,
        subscription_status: 'trial',
        subscription_tier: 'free',
        trial_start_date: now.toISOString(),
        trial_end_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      });

      userStatus.trial_active = true;
      userStatus.trial_days_remaining = 7;
      userStatus.trial_end_date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    // Update subscribers table for backward compatibility
    await supabaseClient.from("subscribers").upsert({
      email: user.email,
      user_id: user.id,
      stripe_customer_id: profile?.stripe_customer_id || null,
      subscribed: userStatus.subscribed,
      subscription_tier: userStatus.subscription_tier,
      subscription_end: userStatus.subscription_end,
      updated_at: now.toISOString(),
    }, { onConflict: 'email' });

    logStep("Final user status", userStatus);
    return new Response(JSON.stringify(userStatus), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      error: "Failed to check subscription status",
      subscribed: false,
      subscription_tier: 'free',
      trial_active: false,
      trial_days_remaining: 0,
      subscription_status: 'error'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
