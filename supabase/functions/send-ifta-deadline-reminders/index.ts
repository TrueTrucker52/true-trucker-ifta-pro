import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { daysBetween, getNextDeadline, quarterName } from "./deadlines.ts";

const allowedOrigins = [
  "https://true-trucker-ifta-pro.lovable.app",
  "https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app",
  "https://tlvngzfoxpjdltbpmzaz.supabase.co",
  "https://true-trucker-ifta-pro.com",
  "https://www.true-trucker-ifta-pro.com",
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
};

const SAFE_ERROR_MESSAGE = "An error occurred. Please try again or contact support.";
const APP_URL = "https://true-trucker-ifta-pro.com";
const ALLOWED_LEAD_DAYS = [30, 14, 7, 1];

const logStep = (step: string, details?: unknown) => {
  console.log(`[IFTA-DEADLINE-REMINDERS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const buildEmail = (opts: {
  leadDays: number;
  quarter: number;
  quarterYear: number;
  dueDateLabel: string;
}) => {
  const { leadDays, quarter, quarterYear, dueDateLabel } = opts;
  const urgent = leadDays <= 14;
  const accent = leadDays === 1 ? "#dc2626" : leadDays <= 14 ? "#f97316" : "#2563eb";
  const countdown = leadDays === 1 ? "tomorrow" : `in ${leadDays} days`;

  const subject = leadDays === 1
    ? `🚨 Last call: ${quarterName(quarter)} ${quarterYear} IFTA is due tomorrow`
    : urgent
      ? `⚠️ ${leadDays} days left to file ${quarterName(quarter)} ${quarterYear} IFTA`
      : `📅 ${quarterName(quarter)} ${quarterYear} IFTA is due ${dueDateLabel}`;

  const html = `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${subject}</title></head>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;">
      <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);color:#ffffff;padding:32px 20px;text-align:center;">
        <div style="font-size:26px;font-weight:700;">🚛 TrueTrucker IFTA Pro</div>
        <div style="font-size:15px;opacity:.9;margin-top:6px;">Your IFTA deadline reminder</div>
      </div>
      <div style="padding:32px 28px;">
        <div style="background:${urgent ? "#fff7ed" : "#eff6ff"};border-left:4px solid ${accent};padding:18px 20px;border-radius:0 8px 8px 0;">
          <h2 style="margin:0 0 8px;color:${accent};font-size:20px;">
            ${leadDays === 1 ? "🚨 Due tomorrow" : urgent ? `⚠️ ${leadDays} days left` : `📅 ${leadDays} days out`}
          </h2>
          <p style="margin:0;font-size:17px;color:#0f172a;">
            <strong>${quarterName(quarter)} ${quarterYear}</strong> IFTA filing is due <strong>${dueDateLabel}</strong> (${countdown}).
          </p>
        </div>
        <p style="font-size:16px;line-height:1.6;color:#334155;">
          Log in to review your mileage by state, fuel receipts, and the tax owed for the quarter — your
          report is generated automatically and ready to file.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${APP_URL}/ifta-reports" style="display:inline-block;background:#f97316;color:#ffffff;padding:15px 30px;text-decoration:none;border-radius:8px;font-weight:600;">
            Review my IFTA report →
          </a>
        </div>
        ${urgent
          ? `<p style="font-size:14px;color:#b91c1c;text-align:center;margin:0;">Late filings carry penalties and interest in every jurisdiction you ran.</p>`
          : ""}
      </div>
      <div style="background:#f8fafc;padding:24px;text-align:center;font-size:13px;color:#64748b;">
        You're getting this because IFTA deadline reminders are turned on.
        <br />
        <a href="${APP_URL}/notifications" style="color:#f97316;">Manage reminder settings</a>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = Deno.env.get("CRON_SECRET");
  if (!cronSecret || req.headers.get("Authorization") !== `Bearer ${cronSecret}`) {
    logStep("Unauthorized request rejected");
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 401,
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const runId = crypto.randomUUID();
  const JOB_NAME = "send-ifta-deadline-reminders";

  const logEmail = async (row: Record<string, unknown>) => {
    const { error } = await supabase.from("email_send_log").insert({
      job_name: JOB_NAME,
      run_id: runId,
      ...row,
    });
    if (error) logStep("Email log insert failed", { error: error.message });
  };

  try {
    const todayIso = new Date().toISOString().slice(0, 10);
    const deadline = getNextDeadline(todayIso);
    const daysUntil = daysBetween(todayIso, deadline.dueDate);

    logStep("Next deadline resolved", { todayIso, ...deadline, daysUntil, runId });

    if (!ALLOWED_LEAD_DAYS.includes(daysUntil)) {
      return new Response(
        JSON.stringify({ success: true, message: "No reminder milestone today", sent: 0, daysUntil }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Users who opted in to this specific lead time
    const { data: settings, error: settingsError } = await supabase
      .from("ifta_reminder_settings")
      .select("user_id, lead_days")
      .eq("email_enabled", true)
      .contains("lead_days", [daysUntil]);

    if (settingsError) throw new Error(`settings query failed: ${settingsError.message}`);

    const userIds = (settings ?? []).map((s) => s.user_id as string);
    if (userIds.length === 0) {
      await logEmail({
        recipient_email: "n/a",
        status: "run_summary",
        metadata: { lead_days: daysUntil, deadline: deadline.dueDate, matched: 0, sent: 0, failed: 0 },
      });
      return new Response(
        JSON.stringify({ success: true, message: "No subscribers for this milestone", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    // Skip anyone already emailed for this deadline + lead time
    const { data: alreadySent, error: logError } = await supabase
      .from("ifta_reminder_log")
      .select("user_id")
      .eq("deadline_date", deadline.dueDate)
      .eq("lead_days", daysUntil)
      .in("user_id", userIds);

    if (logError) throw new Error(`log query failed: ${logError.message}`);
    const sentSet = new Set((alreadySent ?? []).map((r) => r.user_id as string));

    const pendingIds = userIds.filter((id) => !sentSet.has(id));
    if (pendingIds.length === 0) {
      await logEmail({
        recipient_email: "n/a",
        status: "run_summary",
        metadata: {
          lead_days: daysUntil,
          deadline: deadline.dueDate,
          matched: userIds.length,
          sent: 0,
          failed: 0,
          note: "all reminders already sent",
        },
      });
      return new Response(
        JSON.stringify({ success: true, message: "All reminders already sent", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
      );
    }

    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, email")
      .in("user_id", pendingIds);

    if (profileError) throw new Error(`profiles query failed: ${profileError.message}`);

    const { subject, html } = buildEmail({
      leadDays: daysUntil,
      quarter: deadline.quarter,
      quarterYear: deadline.quarterYear,
      dueDateLabel: deadline.dueDateLabel,
    });

    let sent = 0;
    let failed = 0;

    for (const profile of profiles ?? []) {
      if (!profile.email) continue;
      try {
        const emailResult = await resend.emails.send({
          from: "TrueTrucker IFTA Pro <noreply@true-trucker-ifta-pro.com>",
          to: [profile.email as string],
          subject,
          html,
        });

        const { error: insertError } = await supabase.from("ifta_reminder_log").insert({
          user_id: profile.user_id,
          deadline_date: deadline.dueDate,
          lead_days: daysUntil,
          quarter: deadline.quarter,
          quarter_year: deadline.quarterYear,
        });
        if (insertError) logStep("Log insert failed", { error: insertError.message });

        sent++;
        await logEmail({
          recipient_email: profile.email,
          user_id: profile.user_id,
          subject,
          status: "sent",
          provider_message_id: emailResult.data?.id ?? null,
          metadata: { lead_days: daysUntil, deadline: deadline.dueDate },
        });
      } catch (emailError) {
        failed++;
        const message = emailError instanceof Error ? emailError.message : String(emailError);
        logStep("Send failed", { error: message });
        await logEmail({
          recipient_email: profile.email,
          user_id: profile.user_id,
          subject,
          status: "failed",
          error_message: message.slice(0, 500),
          metadata: { lead_days: daysUntil, deadline: deadline.dueDate },
        });
      }
    }

    logStep("Run complete", { sent, failed, leadDays: daysUntil });

    await logEmail({
      recipient_email: "n/a",
      status: "run_summary",
      metadata: {
        lead_days: daysUntil,
        deadline: deadline.dueDate,
        matched: pendingIds.length,
        sent,
        failed,
      },
    });

    return new Response(
      JSON.stringify({ success: true, sent, failed, leadDays: daysUntil, deadline: deadline.dueDate }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return new Response(JSON.stringify({ error: SAFE_ERROR_MESSAGE }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
