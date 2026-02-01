import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  'https://true-trucker-ifta-pro.lovable.app',
  'https://id-preview--ea23f26e-83f6-4710-a8b5-45fb030d3016.lovable.app',
  'https://tlvngzfoxpjdltbpmzaz.supabase.co',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
};

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token to get user ID
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's JWT to verify identity
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      console.error('User auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`Processing account deletion for user: ${userId}`);

    // Create admin client with service role for deletions
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Delete user data from all tables in order (respecting foreign keys)
    const tables = [
      'trip_miles',
      'bills_of_lading', 
      'trips',
      'receipts',
      'trip_logs',
      'trucks',
      'vehicles',
      'invoices',
      'subscribers',
      'user_roles',
      'profiles',
    ];

    const deletionResults: { table: string; success: boolean; error?: string }[] = [];

    for (const table of tables) {
      const { error } = await supabaseAdmin
        .from(table)
        .delete()
        .eq('user_id', userId);
      
      deletionResults.push({
        table,
        success: !error,
        error: error?.message,
      });

      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
      } else {
        console.log(`Deleted user data from ${table}`);
      }
    }

    // Delete storage files (receipts bucket)
    try {
      const { data: files } = await supabaseAdmin.storage
        .from('receipts')
        .list(userId);
      
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${userId}/${f.name}`);
        await supabaseAdmin.storage.from('receipts').remove(filePaths);
        console.log(`Deleted ${files.length} receipt files`);
      }
    } catch (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue even if storage deletion fails
    }

    // Delete the user from auth.users using Admin API
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('Error deleting auth user:', deleteUserError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to delete authentication account',
          details: deleteUserError.message,
          dataDeleted: deletionResults
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully deleted user ${userId} from auth.users`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Account and all associated data permanently deleted',
        deletionResults
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Account deletion error:', error);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
