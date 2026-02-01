import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

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

const getWelcomeEmail = (userEmail: string) => {
  const subject = "🎉 Welcome to TrueTrucker IFTA Pro - Your 7-day trial starts now!";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 40px 20px; text-align: center; }
          .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
          .subtitle { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .welcome-box { background: linear-gradient(135deg, #ecfdf5, #f0fdf4); border: 1px solid #22c55e; padding: 25px; border-radius: 12px; text-align: center; margin: 20px 0; }
          .cta-button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 10px; }
          .secondary-button { display: inline-block; background: transparent; color: #2563eb; border: 2px solid #2563eb; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 15px 10px; }
          .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 25px 0; }
          .feature-card { background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
          .feature-icon { font-size: 24px; margin-bottom: 10px; }
          .footer { background: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; }
          @media (max-width: 600px) {
            .features-grid { grid-template-columns: 1fr; }
            .content { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚛 TrueTrucker IFTA Pro</div>
            <div class="subtitle">Professional IFTA compliance made simple</div>
          </div>
          
          <div class="content">
            <div class="welcome-box">
              <h2 style="margin-top: 0; color: #059669;">🎉 Welcome to TrueTrucker!</h2>
              <p style="font-size: 18px; margin-bottom: 0; color: #065f46;">
                Your 7-day free trial is now active. Start tracking miles and scanning receipts today!
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6; text-align: center;">
              You now have <strong>full access</strong> to all TrueTrucker IFTA Pro features:
            </p>

            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">📍</div>
                <h4 style="margin: 10px 0; color: #1f2937;">Mileage Tracking</h4>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Automatic tracking across all IFTA states</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">📄</div>
                <h4 style="margin: 10px 0; color: #1f2937;">Receipt Scanning</h4>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">AI-powered data extraction</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🧮</div>
                <h4 style="margin: 10px 0; color: #1f2937;">IFTA Calculations</h4>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Automated quarterly reports</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🚚</div>
                <h4 style="margin: 10px 0; color: #1f2937;">Fleet Management</h4>
                <p style="margin: 0; font-size: 14px; color: #6b7280;">Manage multiple vehicles</p>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #1f2937; margin-bottom: 20px;">🚀 Ready to get started?</h3>
              <a href="https://truetrucker.com/dashboard" class="cta-button">
                📊 Open Dashboard
              </a>
              <a href="https://truetrucker.com/learn" class="secondary-button">
                📚 View Tutorial
              </a>
            </div>

            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h4 style="margin-top: 0; color: #92400e;">💡 Pro Tip</h4>
              <p style="margin-bottom: 0; color: #92400e;">
                Start by adding your vehicles and scanning a few receipts. The more data you add during your trial, the more accurate your IFTA calculations will be!
              </p>
            </div>

            <div style="text-align: center; background: #f1f5f9; padding: 20px; border-radius: 8px;">
              <p style="margin: 0; color: #475569;">
                <strong>Need help?</strong> We're here for you! Reply to this email or contact 
                <a href="mailto:support@truetrucker.com" style="color: #2563eb;">support@truetrucker.com</a>
              </p>
            </div>
          </div>

          <div class="footer">
            <p><strong>TrueTrucker IFTA Pro</strong> - Your trial expires in 7 days</p>
            <p>Making IFTA compliance simple for professional truckers since 2024</p>
            <p style="font-size: 12px; opacity: 0.7;">You're receiving this because you signed up for TrueTrucker IFTA Pro.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('Auth error:', claimsError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const userEmail = claimsData.claims.email as string;
    console.log('Authenticated user for welcome email:', userId);

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const { email } = await req.json();
    
    // Security: Only allow sending welcome email to the authenticated user's own email
    // or if no email is provided, use the authenticated user's email
    const targetEmail = email || userEmail;
    
    if (email && email !== userEmail) {
      console.warn(`User ${userId} attempted to send welcome email to different address: ${email}`);
      return new Response(JSON.stringify({ error: "Can only send welcome email to your own address" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    if (!targetEmail) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { subject, html } = getWelcomeEmail(targetEmail);
    
    const emailResult = await resend.emails.send({
      from: "TrueTrucker IFTA Pro <welcome@truetrucker.com>",
      to: [targetEmail],
      subject,
      html,
    });

    console.log("Welcome email sent successfully:", { 
      email: targetEmail, 
      userId,
      messageId: emailResult.data?.id 
    });

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Welcome email sent successfully",
      messageId: emailResult.data?.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending welcome email:", error);
    const corsHeaders = getCorsHeaders(req);
    
    return new Response(JSON.stringify({ 
      error: "Failed to send welcome email",
      message: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
