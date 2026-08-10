import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
// Lead times the trial reminder job actually sends on
const TRIAL_LEAD_DAYS = [1, 3, 5];

const logStep = (step: string, details?: unknown) => {
  console.log(`[PREVIEW-RECIPIENTS] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

const isIsoDate = (v: unknown): v is string =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

const dayDiff = (fromIso: string, toIso: string) =>
  Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / 86400000);

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
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: userData, error: userError } = await admin.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user) return json({ error: "Unauthorized" }, 401);

    const { data: roles, error: roleError } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError) throw new Error(`role lookup failed: ${roleError.message}`);
    if (!roles) return json({ error: "Forbidden" }, 403);

    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const todayIso = new Date().toISOString().slice(0, 10);
    const startDate = isIsoDate(body.start_date) ? body.start_date : todayIso;
    const defaultEnd = new Date(Date.parse(`${startDate}T00:00:00Z`) + 6 * 86400000)
      .toISOString()
      .slice(0, 10);
    const endDate = isIsoDate(body.end_date) ? body.end_date : defaultEnd;

    if (dayDiff(startDate, endDate) < 0) {
      return json({ error: "end_date must be on or after start_date" }, 400);
    }
    if (dayDiff(startDate, endDate) > 92) {
      return json({ error: "Date window cannot exceed 92 days" }, 400);
    }

    logStep("Preview requested", { startDate, endDate, by: user.id });

    const { data: profiles, error: profileError } = await admin
      .from("profiles")
      .select("user_id, email, trial_end_date, subscription_status, subscription_tier")
      .eq("subscription_status", "trial")
      .gte("trial_end_date", `${startDate}T00:00:00Z`)
      .lte("trial_end_date", `${endDate}T23:59:59Z`)
      .order("trial_end_date", { ascending: true });

    if (profileError) throw new Error(`profiles query failed: ${profileError.message}`);

    const recipients = (profiles ?? []).map((p) => {
      const trialEndIso = String(p.trial_end_date).slice(0, 10);
      const daysLeft = dayDiff(todayIso, trialEndIso);
      const matchesLeadDay = TRIAL_LEAD_DAYS.includes(daysLeft);
      return {
        user_id: p.user_id,
        email: p.email,
        trial_end_date: trialEndIso,
        subscription_tier: p.subscription_tier,
        days_left: daysLeft,
        // The job only emails at 1/3/5 days out, and never for past dates
        would_send: matchesLeadDay && daysLeft > 0,
        reason: daysLeft <= 0
          ? "Trial already ended"
          : matchesLeadDay
            ? `Matches the ${daysLeft}-day reminder`
            : `No reminder at ${daysLeft} days out (sends at 5, 3, 1)`,
      };
    });

    const wouldSend = recipients.filter((r) => r.would_send);

    return json({
      success: true,
      preview: true,
      window: { start_date: startDate, end_date: endDate, today: todayIso },
      lead_days: TRIAL_LEAD_DAYS,
      counts: {
        matched: recipients.length,
        would_send: wouldSend.length,
        skipped: recipients.length - wouldSend.length,
      },
      recipients,
    });
  } catch (error) {
    logStep("ERROR", { message: error instanceof Error ? error.message : String(error) });
    return json({ error: SAFE_ERROR_MESSAGE }, 500);
  }
});
