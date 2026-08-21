-- 1. search_path on remaining function
CREATE OR REPLACE FUNCTION public.update_loads_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Revoke EXECUTE on internal / trigger SECURITY DEFINER functions from API roles
REVOKE ALL ON FUNCTION public.generate_referral_code() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.mask_admin_notes() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.notify_ghl_new_signup() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.protect_subscription_fields_profiles() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.protect_subscription_fields_subscribers() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.protect_trial_offer_fields() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.rr_handle_new_user() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.rr_notify_ghl_sync() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.rr_run_ghl_daily_sync() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_loads_updated_at() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.should_rate_limit(text, integer, integer) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.get_demo_user_id() FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.has_active_plan(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.grant_reviewer_role(text) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.validate_ifta_reminder_lead_days() FROM anon, authenticated, public;

-- Authenticated-only RPCs (revoke anon where sign-in is required)
REVOKE ALL ON FUNCTION public.get_my_referrals() FROM anon, public;
REVOKE ALL ON FUNCTION public.get_driver_fleet_summary(uuid) FROM anon, public;
REVOKE ALL ON FUNCTION public.get_user_fleet_id() FROM anon, public;
REVOKE ALL ON FUNCTION public.get_user_role() FROM anon, public;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon, public;
REVOKE ALL ON FUNCTION public.is_fleet_owner() FROM anon, public;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.lookup_fleet_by_invite_code(text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.get_my_referrals() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_driver_fleet_summary(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_fleet_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_fleet_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_fleet_by_invite_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.grant_reviewer_role(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_plan(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_demo_user_id() TO authenticated;

-- log_auth_event is called pre-auth from the login screen: keep anon + authenticated
GRANT EXECUTE ON FUNCTION public.log_auth_event(text, text, text, text, jsonb) TO anon, authenticated;

-- 3. Remove anon SELECT (GraphQL/REST discoverability) from every table with no anon-readable policy
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r','v','m','f')
      AND c.relname NOT IN ('help_articles','help_categories')
  LOOP
    EXECUTE format('REVOKE SELECT ON public.%I FROM anon', r.relname);
  END LOOP;
END $$;

-- 4. Tables owned by edge functions only: remove API-role access entirely
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.email_send_log FROM anon, authenticated;
GRANT ALL ON public.email_send_log TO service_role;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.ifta_reminder_log FROM anon, authenticated;
GRANT ALL ON public.ifta_reminder_log TO service_role;
REVOKE ALL ON public.test_accounts FROM anon, authenticated;
GRANT ALL ON public.test_accounts TO service_role;

-- 5. courier_requests: contact details must not be readable by every signed-in user
DROP POLICY IF EXISTS "Allow authenticated reads" ON public.courier_requests;
CREATE POLICY "Admins can view courier requests"
ON public.courier_requests
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 6. rate-cons storage: remove permissive anon/public policies (ownership policies remain)
DROP POLICY IF EXISTS "rate_cons_anon_insert" ON storage.objects;
DROP POLICY IF EXISTS "rate_cons_anon_update" ON storage.objects;
DROP POLICY IF EXISTS "rate_cons_public_read" ON storage.objects;