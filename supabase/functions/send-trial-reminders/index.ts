import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[TRIAL-REMINDERS] ${step}${detailsStr}`);
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const apiKey = Deno.env.get("SENDGRID_API_KEY");
  
  if (!apiKey) {
    logStep("SendGrid API key not configured, skipping email");
    return { success: false, message: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: "noreply@truetrucker.com", name: "TrueTrucker IFTA Pro" },
        subject,
        content: [{ type: "text/html", value: html }],
      }),
    });

    return { success: response.ok, status: response.status };
  } catch (error) {
    logStep("Email send error", { error: error.message });
    return { success: false, error: error.message };
  }
};

const getTrialReminderEmail = (daysLeft: number, userEmail: string) => {
  const subject = daysLeft === 1 
    ? "Last day of your TrueTrucker IFTA Pro trial!" 
    : `Only ${daysLeft} days left in your TrueTrucker trial`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${subject}</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">TrueTrucker IFTA Pro</h1>
          <h2 style="color: #f59e0b; margin-top: 0;">${daysLeft === 1 ? 'Last Day!' : `${daysLeft} Days Left`}</h2>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
            Hi there! 👋
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 15px;">
            ${daysLeft === 1 
              ? "Today is the last day of your 7-day free trial with TrueTrucker IFTA Pro!" 
              : `You have ${daysLeft} days remaining in your free trial with TrueTrucker IFTA Pro.`
            }
          </p>
          <p style="font-size: 16px; line-height: 1.5; margin-bottom: 0;">
            During your trial, you've had full access to:
          </p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <ul style="font-size: 14px; line-height: 1.6; padding-left: 20px;">
            <li>✅ Unlimited mileage tracking across all IFTA states</li>
            <li>✅ AI-powered receipt scanning and data extraction</li>
            <li>✅ Automated IFTA quarterly calculations</li>
            <li>✅ Professional quarterly reports</li>
            <li>✅ Multi-vehicle fleet management</li>
            <li>✅ Route planning and optimization</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: #ecfdf5; border-radius: 8px;">
          <h3 style="color: #059669; margin-bottom: 15px;">Don't lose your data!</h3>
          <p style="margin-bottom: 20px; color: #374151;">
            Subscribe now to keep all your trip logs, receipts, and IFTA calculations.
          </p>
          <a href="https://truetrucker.com/#pricing" 
             style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; font-weight: bold;">
            Choose Your Plan →
          </a>
        </div>
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
          <p>TrueTrucker IFTA Pro - Professional IFTA compliance made simple</p>
          <p>Questions? Reply to this email or contact support@truetrucker.com</p>
        </div>
      </body>
    </html>
  `;

  return { subject, html };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

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
        const emailResult = await sendEmail(user.email, subject, html);
        
        results.push({
          email: user.email,
          daysLeft,
          sent: emailResult.success,
          error: emailResult.error
        });

        if (emailResult.success) {
          emailsSent++;
          logStep("Reminder sent", { email: user.email, daysLeft });
        } else {
          logStep("Failed to send reminder", { email: user.email, error: emailResult.error });
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