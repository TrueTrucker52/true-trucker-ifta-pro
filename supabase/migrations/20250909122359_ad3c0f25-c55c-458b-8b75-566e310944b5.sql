-- Remove the overly permissive RLS policy that allows public read access
DROP POLICY IF EXISTS "Test accounts are readable for authentication" ON public.test_accounts;

-- Create a much more restrictive policy that only allows system functions to access test accounts
-- This ensures no direct user access while maintaining authentication functionality
CREATE POLICY "Test accounts accessible only by system functions" 
ON public.test_accounts 
FOR SELECT 
USING (false); -- Deny all direct access - only security definer functions can access

-- The existing validate_test_account function already uses SECURITY DEFINER
-- so it can still access the table for authentication purposes

-- Optional: Add policy for admin access if needed in the future
-- (Currently commented out since TestCredentials component uses hardcoded values)
-- CREATE POLICY "Admins can view test accounts" 
-- ON public.test_accounts 
-- FOR SELECT 
-- USING (
--   auth.uid() IN (
--     SELECT user_id FROM public.profiles 
--     WHERE email = 'admin@truetrucker.com' -- or however you identify admins
--   )
-- );

-- Log this security fix
SELECT public.log_auth_event(
  'security_policy_updated',
  NULL,
  NULL,
  NULL,
  '{"table": "test_accounts", "action": "restricted_public_access", "timestamp": "' || now() || '"}'::jsonb
);