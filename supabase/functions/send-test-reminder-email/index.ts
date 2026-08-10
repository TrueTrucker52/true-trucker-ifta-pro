import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@4.0.0";
import { getTrialReminderEmail, TRIAL_REMINDER_LEAD_DAYS } from "../_shared/trialReminderEmail.ts";

const allowedOrigins = [
  "https://true-trucker-ifta-pro.lovable.app",
  "https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app",
  "https://tlvngzfoxpjdltbpmzaz.supabase.co",
  "https://true-trucker-ifta-pro.com",
  "https://www.true-trucker-ifta-pro.com",
  "http://localhost:8080",
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

const logStep = (step: string, details?: unknown) => {
  console.log(`[SEND-TEST-REMINDER] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const isIsoDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status,
    });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user?.email) return json({ error: "Unauthorized" }, 401);

    const { data: roleRow, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error(`role lookup failed: ${roleError.message}`);
    if (!roleRow) return json({ error: "Forbidden" }, 403);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const leadDays = Number(body.lead_days);
    if (!TRIAL_REMINDER_LEAD_DAYS.includes(leadDays)) {
      return json({ error: `lead_days must be one of ${TRIAL_REMINDER_LEAD_DAYS.join(", ")}` }, 400);
    }

    const startDate = isIsoDate(body.start_date) ? body.start_date : null;
    const endDate = isIsoDate(body.end_date) ? body.end_date : null;
    if (!startDate || !endDate) {
      return json({ error: "start_date and end_date must be YYYY-MM-DD" }, 400);
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) throw new Error("RESEND_API_KEY is not configured");
    const resend = new Resend(resendKey);

    const { subject, html } = getTrialReminderEmail(leadDays, user.email);
    // Test sends go ONLY to the requesting admin's own account email
    const testSubject = `[TEST] ${subject}`;
    const testHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fff7ed;border:1px solid #f59e0b;padding:12px 16px;margin:0 0 12px;border-radius:8px;color:#7c2d12;">
        <strong>Test email</strong> — ${leadDays}-day trial reminder template.
        Preview window ${startDate} to ${endDate}. No trial users were emailed.
      </div>
      ${html}
    `;

    const runId = crypto.randomUUID();
    const { data: sendData, error: sendError } = await resend.emails.send({
      from: "TrueTrucker IFTA Pro <noreply@true-trucker-ifta-pro.com>",
      to: [user.email],
      subject: testSubject,
      html: testHtml,
    });

    if (sendError) {
      logStep("Resend error", sendError);
      await admin.from("email_send_log").insert({
        job_name: "trial_reminder_test",
        run_id: runId,
        recipient_email: user.email,
        status: "failed",
        error_message: String((sendError as { message?: string }).message ?? sendError),
        metadata: { lead_days: leadDays, start_date: startDate, end_date: endDate, test: true },
      });
      return json({ error: "Test email could not be sent." }, 502);
    }

    await admin.from("email_send_log").insert({
      job_name: "trial_reminder_test",
      run_id: runId,
      recipient_email: user.email,
      status: "sent",
      metadata: {
        lead_days: leadDays,
        start_date: startDate,
        end_date: endDate,
        test: true,
        resend_id: sendData?.id ?? null,
      },
    });

    logStep("Test email sent", { leadDays, runId });
    return json({ success: true, sent_to: user.email, lead_days: leadDays, subject: testSubject });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return json({ error: SAFE_ERROR_MESSAGE }, 500);
  }
});
