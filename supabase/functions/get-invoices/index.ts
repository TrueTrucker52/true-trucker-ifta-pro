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
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GET-INVOICES] ${step}${detailsStr}`);
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    // Use service role key for database operations
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
    logStep("User authenticated", { userId: user.id });

    // Get invoices from database
    const { data: invoices, error: dbError } = await supabaseClient
      .from("invoices")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }

    logStep("Retrieved invoices from database", { count: invoices?.length || 0 });

    // Update invoice statuses from Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const updatedInvoices = [];

    for (const invoice of invoices || []) {
      if (invoice.stripe_invoice_id) {
        try {
          const stripeInvoice = await stripe.invoices.retrieve(invoice.stripe_invoice_id);
          
          // Update status if it has changed
          if (stripeInvoice.status !== invoice.status) {
            const { data: updatedInvoice } = await supabaseClient
              .from("invoices")
              .update({ status: stripeInvoice.status })
              .eq("id", invoice.id)
              .select()
              .single();
            
            updatedInvoices.push({
              ...updatedInvoice,
              hosted_invoice_url: stripeInvoice.hosted_invoice_url,
              invoice_pdf: stripeInvoice.invoice_pdf,
            });
          } else {
            updatedInvoices.push({
              ...invoice,
              hosted_invoice_url: stripeInvoice.hosted_invoice_url,
              invoice_pdf: stripeInvoice.invoice_pdf,
            });
          }
        } catch (stripeError) {
          logStep("Error retrieving Stripe invoice", { 
            invoiceId: invoice.stripe_invoice_id, 
            error: stripeError.message 
          });
          updatedInvoices.push(invoice);
        }
      } else {
        updatedInvoices.push(invoice);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      invoices: updatedInvoices,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in get-invoices", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Failed to retrieve invoices" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});