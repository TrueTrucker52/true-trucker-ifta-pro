import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";

// Note: This function is called by cron jobs, so we keep permissive CORS for internal calls
// but still validate origin when available
const allowedOrigins = [
  'https://true-trucker-ifta-pro.lovable.app',
  'https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app',
  'https://tlvngzfoxpjdltbpmzaz.supabase.co',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  // For cron jobs with no origin, allow the request
  if (!origin) {
    return {
      'Access-Control-Allow-Origin': allowedOrigins[0],
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    };
  }
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-REMINDERS] ${step}${detailsStr}`);
};

const getTrialReminderEmail = (daysLeft: number, userEmail: string) => {
  const subject = daysLeft === 1 
    ? "⚠️ Last day of your TrueTrucker IFTA Pro trial!" 
    : `⏰ Only ${daysLeft} days left in your TrueTrucker trial`;

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
          .alert-box { background: ${daysLeft === 1 ? '#fef2f2' : '#fff7ed'}; border-left: 4px solid ${daysLeft === 1 ? '#dc2626' : '#f59e0b'}; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .cta-button { display: inline-block; background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
          .cta-button:hover { background: #1d4ed8; }
          .features { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { display: flex; align-items: center; margin: 10px 0; }
          .checkmark { color: #059669; margin-right: 12px; font-weight: bold; }
          .footer { background: #f8fafc; padding: 30px; text-align: center; font-size: 14px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🚛 TrueTrucker IFTA Pro</div>
            <div class="subtitle">Professional IFTA compliance made simple</div>
          </div>
          
          <div class="content">
            <div class="alert-box">
              <h2 style="margin-top: 0; color: ${daysLeft === 1 ? '#dc2626' : '#f59e0b'};">
                ${daysLeft === 1 ? '🚨 Final Notice' : '⏰ Trial Ending Soon'}
              </h2>
              <p style="font-size: 18px; margin-bottom: 0;">
                ${daysLeft === 1 
                  ? "Your free trial expires today! Don't lose access to your IFTA data and calculations." 
                  : `You have ${daysLeft} days remaining in your TrueTrucker IFTA Pro trial.`
                }
              </p>
            </div>

            <p style="font-size: 16px; line-height: 1.6;">
              Hi there! 👋 During your trial, you've had full access to our complete IFTA solution:
            </p>

            <div class="features">
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>Unlimited mileage tracking across all IFTA states</span>
              </div>
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>AI-powered receipt scanning and data extraction</span>
              </div>
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>Automated IFTA quarterly calculations</span>
              </div>
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>Professional quarterly reports ready for filing</span>
              </div>
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>Multi-vehicle fleet management</span>
              </div>
              <div class="feature-item">
                <span class="checkmark">✅</span>
                <span>Route planning and fuel optimization</span>
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <h3 style="color: #059669; margin-bottom: 15px;">🔒 Don't lose your valuable data!</h3>
              <p style="margin-bottom: 25px; font-size: 16px;">
                Subscribe now to keep all your trip logs, receipts, and IFTA calculations safe and accessible.
              </p>
              <a href="https://truetrucker.com/#pricing" class="cta-button">
                💎 Choose Your Plan & Continue →
              </a>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; text-align: center;">
              <p style="margin: 0; color: #059669; font-weight: 600;">
                🎯 Join thousands of truckers who trust TrueTrucker for IFTA compliance
              </p>
            </div>
          </div>

          <div class="footer">
            <p><strong>TrueTrucker IFTA Pro</strong> - Professional IFTA compliance made simple</p>
            <p>Questions? Reply to this email or contact <a href="mailto:support@truetrucker.com">support@truetrucker.com</a></p>
            <p style="font-size: 12px; opacity: 0.7;">This email was sent because you started a free trial with TrueTrucker IFTA Pro.</p>
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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    logStep("Starting trial reminder process");

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Find users whose trials expire in 1, 3, or 5 days
    const { data: usersToRemind, error } = await supabaseClient
      .from("profiles")
      .select("email, trial_end_date, subscription_status")
      .eq("subscription_status", "trial")
      .or(`trial_end_date.eq.${tomorrow.toISOString().split('T')[0]},trial_end_date.eq.${threeDaysFromNow.toISOString().split('T')[0]},trial_end_date.eq.${fiveDaysFromNow.toISOString().split('T')[0]}`);

    if (error) {
      throw new Error(`Failed to fetch trial users: ${error.message}`);
    }

    logStep("Found users to remind", { count: usersToRemind?.length || 0 });

    if (!usersToRemind || usersToRemind.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "No trial reminders to send",
        sent: 0 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let emailsSent = 0;
    const results = [];

    for (const user of usersToRemind) {
      const trialEndDate = new Date(user.trial_end_date);
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 5) {
        const { subject, html } = getTrialReminderEmail(daysLeft, user.email);
        
        try {
          const emailResult = await resend.emails.send({
            from: "TrueTrucker IFTA Pro <noreply@truetrucker.com>",
            to: [user.email],
            subject,
            html,
          });
          
          results.push({
            email: user.email,
            daysLeft,
            sent: true,
            messageId: emailResult.data?.id || 'unknown'
          });

          emailsSent++;
          logStep("Reminder sent successfully", { email: user.email, daysLeft, messageId: emailResult.data?.id });
        } catch (emailError) {
          logStep("Failed to send reminder", { email: user.email, error: emailError.message });
          results.push({
            email: user.email,
            daysLeft,
            sent: false,
            error: emailError.message
          });
        }
      }
    }

    logStep("Trial reminders process completed", { totalSent: emailsSent });

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Sent ${emailsSent} trial reminder emails`,
      sent: emailsSent,
      results 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in trial reminders", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      error: "Failed to process trial reminders",
      message: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
