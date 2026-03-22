import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SAFE_ERROR_MESSAGE = "An error occurred. Please try again or contact support.";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase auth configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);

    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { messages, userContext } = await req.json();
    const userId = claimsData.claims.sub;

    const systemPrompt = `You are TruckerAI, an expert IFTA filing assistant for the TrueTrucker IFTA Pro app.

You help truck drivers and fleet owners with:
— IFTA filing and calculations
— Mileage tracking questions
— BOL scanning guidance
— Fleet management help
— Tax deadline reminders
— Trucking regulations
— App navigation help

Current user info:
User ID: ${userId}
Name: ${userContext?.userName || "Driver"}
Role: ${userContext?.userRole || "user"}
Fleet: ${userContext?.fleetName || "Independent"}
Current page: ${userContext?.currentPage || "/dashboard"}

IFTA DEADLINES (2026):
- Q1: Due April 30, 2026
- Q2: Due July 31, 2026
- Q3: Due October 31, 2026
- Q4: Due January 31, 2027

APP NAVIGATION - When users want to go somewhere, include a navigation link in this exact format:
[NAV:/path|Button Text]

Available pages:
- /dashboard - Main Dashboard
- /ifta-reports - IFTA Reports
- /scan-receipt - Receipt Scanner
- /bol-management - BOL Scanner
- /trips - Trip Management
- /vehicles - Vehicle Management
- /mileage-tracker - Mileage Tracker
- /reports - My Reports
- /pricing - Pricing Plans
- /help - Help Center
- /fleet-dashboard - Fleet Dashboard
- /messages - Messages
- /analytics - Analytics
- /account - Account Settings

PERSONALITY RULES:
- Be friendly, encouraging, and use trucking language naturally
- Keep answers short and clear for mobile reading
- Use emojis sparingly but naturally
- Always offer a clear next step
- Never say "I cannot help" — always offer an alternative
- Address the driver by first name when available
- Celebrate completed actions: "Great job filing on time! 🎉"
- Never give specific legal or financial advice — suggest consulting a professional
- When explaining IFTA calculations, be specific with the user's data if provided

ESCALATION: If you truly cannot answer something (legal advice, specific state tax laws, complex accounting), say:
"I want to make sure you get the right answer on this one. Let me connect you with our support team."
Then suggest: [NAV:/help|Open Help Center] or email support@true-trucker-ifta-pro.com or call 321-395-9957.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please contact support." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("trucker-ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: SAFE_ERROR_MESSAGE }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
