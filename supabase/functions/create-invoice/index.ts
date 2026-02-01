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
  console.log(`[CREATE-INVOICE] ${step}${detailsStr}`);
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
    logStep("Stripe key verified");

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
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestData = await req.json();
    const { customer_email, customer_name, amount, description, due_date } = requestData;
    
    // Input validation and sanitization
    if (!customer_email || !amount) {
      throw new Error("customer_email and amount are required");
    }
    
    if (typeof customer_email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      throw new Error("Invalid email format");
    }
    
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000000) {
      throw new Error("Invalid amount");
    }
    
    if (customer_name && (typeof customer_name !== 'string' || customer_name.length > 100)) {
      throw new Error("Invalid customer name");
    }
    
    if (description && (typeof description !== 'string' || description.length > 500)) {
      throw new Error("Invalid description");
    }

    logStep("Request data validated", { customer_email, amount: amount, description: description?.substring(0, 50) });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check if customer exists, create if not
    let customers = await stripe.customers.list({ email: customer_email, limit: 1 });
    let customerId;
    
    if (customers.data.length === 0) {
      logStep("Creating new customer");
      const customer = await stripe.customers.create({
        email: customer_email,
        name: customer_name,
      });
      customerId = customer.id;
      logStep("Customer created", { customerId });
    } else {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }

    // Create invoice in Stripe
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: 'send_invoice',
      days_until_due: due_date ? Math.ceil((new Date(due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 30,
      description: description || 'Invoice from your IFTA service',
    });

    logStep("Stripe invoice created", { invoiceId: invoice.id });

    // Add line item to invoice
    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: amount, // Amount in cents
      currency: 'usd',
      description: description || 'Service charge',
    });

    // Finalize and send the invoice
    const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
    await stripe.invoices.sendInvoice(invoice.id);
    
    logStep("Invoice finalized and sent", { invoiceId: finalizedInvoice.id, status: finalizedInvoice.status });

    // Save invoice to database
    const { data: invoiceData, error: dbError } = await supabaseClient
      .from("invoices")
      .insert({
        user_id: user.id,
        customer_email,
        customer_name,
        stripe_invoice_id: finalizedInvoice.id,
        amount,
        currency: 'usd',
        description,
        status: finalizedInvoice.status,
        due_date: due_date || null,
      })
      .select()
      .single();

    if (dbError) {
      logStep("Database error", { error: dbError });
      throw new Error(`Database error: ${dbError.message}`);
    }

    logStep("Invoice saved to database", { invoiceId: invoiceData.id });

    return new Response(JSON.stringify({
      success: true,
      invoice: {
        id: invoiceData.id,
        stripe_invoice_id: finalizedInvoice.id,
        hosted_invoice_url: finalizedInvoice.hosted_invoice_url,
        invoice_pdf: finalizedInvoice.invoice_pdf,
        status: finalizedInvoice.status,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    logStep("ERROR in create-invoice", { error: error instanceof Error ? error.name : 'UnknownError' });
    
    // Don't expose internal error details in production
    const publicError = errorMessage.includes('Authentication') || 
                       errorMessage.includes('required') || 
                       errorMessage.includes('Invalid') 
                       ? errorMessage 
                       : 'Invoice creation failed. Please try again.';
    
    return new Response(JSON.stringify({ error: publicError }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});