import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { getTrialReminderEmail } from "../_shared/trialReminderEmail.ts";

// Note: This function is called by cron jobs, so we keep permissive CORS for internal calls
// but still validate origin when available
const allowedOrigins = [
  'https://true-trucker-ifta-pro.lovable.app',
  'https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app',
  'https://tlvngzfoxpjdltbpmzaz.supabase.co',
  'https://true-trucker-ifta-pro.com',
  'https://www.true-trucker-ifta-pro.com',
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

const SAFE_ERROR_MESSAGE = 'An error occurred. Please try again or contact support.';

// Email template lives in _shared so the admin preview renders the exact same content


serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate shared secret to ensure only authorized cron jobs can trigger this
  const authHeader = req.headers.get("Authorization");
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    logStep("Unauthorized request rejected");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  const runId = crypto.randomUUID();
  const JOB_NAME = "send-trial-reminders";

  const logEmail = async (row: Record<string, unknown>) => {
    const { error } = await supabaseClient.from("email_send_log").insert({
      job_name: JOB_NAME,
      run_id: runId,
      ...row,
    });
    if (error) logStep("Email log insert failed", { error: error.message });
  };

  try {
    logStep("Starting trial reminder process", { runId });

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

    // Find users whose trials expire in 1, 3, or 5 days
    const { data: usersToRemind, error } = await supabaseClient
      .from("profiles")
      .select("user_id, email, trial_end_date, subscription_status")
      .eq("subscription_status", "trial")
      .or(`trial_end_date.eq.${tomorrow.toISOString().split('T')[0]},trial_end_date.eq.${threeDaysFromNow.toISOString().split('T')[0]},trial_end_date.eq.${fiveDaysFromNow.toISOString().split('T')[0]}`);

    if (error) {
      throw new Error(`Failed to fetch trial users: ${error.message}`);
    }

    logStep("Found users to remind", { count: usersToRemind?.length || 0 });

    if (!usersToRemind || usersToRemind.length === 0) {
      await logEmail({
        recipient_email: "n/a",
        status: "run_summary",
        metadata: { matched: 0, sent: 0, failed: 0 },
      });
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
    let emailsFailed = 0;
    const results = [];

    for (const user of usersToRemind) {
      const trialEndDate = new Date(user.trial_end_date);
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft > 0 && daysLeft <= 5) {
        const { subject, html } = getTrialReminderEmail(daysLeft, user.email);
        
        try {
          const emailResult = await resend.emails.send({
            from: "TrueTrucker IFTA Pro <noreply@true-trucker-ifta-pro.com>",
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
          await logEmail({
            recipient_email: user.email,
            user_id: user.user_id ?? null,
            subject,
            status: "sent",
            provider_message_id: emailResult.data?.id ?? null,
            metadata: { days_left: daysLeft },
          });
        } catch (emailError) {
          const message = emailError instanceof Error ? emailError.message : String(emailError);
          emailsFailed++;
          logStep("Failed to send reminder", { email: user.email, error: message });
          results.push({
            email: user.email,
            daysLeft,
            sent: false,
            error: 'Failed to send reminder'
          });
          await logEmail({
            recipient_email: user.email,
            user_id: user.user_id ?? null,
            subject,
            status: "failed",
            error_message: message.slice(0, 500),
            metadata: { days_left: daysLeft },
          });
        }
      }
    }

    logStep("Trial reminders process completed", { totalSent: emailsSent });

    await logEmail({
      recipient_email: "n/a",
      status: "run_summary",
      metadata: { matched: usersToRemind.length, sent: emailsSent, failed: emailsFailed },
    });

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
    logStep("ERROR in trial reminders", {
      message: error instanceof Error ? error.message : String(error),
    });
    
    return new Response(JSON.stringify({ 
      error: SAFE_ERROR_MESSAGE,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
