import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's token
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin using the is_admin function
    const { data: isAdminData, error: adminError } = await supabase.rpc("is_admin");
    
    if (adminError || !isAdminData) {
      console.log("Admin check failed:", adminError?.message || "Not an admin");
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch test accounts from database (only for admins)
    const { data: testAccounts, error: fetchError } = await supabase
      .from("test_accounts")
      .select("email, account_type, notes, is_active, expires_at")
      .eq("is_active", true);

    if (fetchError) {
      console.error("Error fetching test accounts:", fetchError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch test accounts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get passwords from secure storage (environment variable or database)
    // For security, we retrieve from the test_accounts table but never expose password_hash
    // Instead, we use a secure approach: the password is stored in an env secret
    const testPassword = Deno.env.get("TEST_ACCOUNT_PASSWORD") || "Contact admin for password";

    // Format response - passwords only visible to authenticated admins
    const accounts = testAccounts?.map((account) => ({
      email: account.email,
      password: testPassword,
      type: account.account_type === "reviewer" ? "Primary Reviewer" : "Beta Tester",
      description: account.notes || `${account.account_type} account`,
      isActive: account.is_active,
      expiresAt: account.expires_at
    })) || [];

    console.log(`Admin ${user.email} accessed test credentials - ${accounts.length} accounts returned`);

    return new Response(
      JSON.stringify({ accounts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in get-test-credentials:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
