-- Revoke all API access to test_accounts for anon and authenticated roles
REVOKE ALL ON public.test_accounts FROM anon, authenticated;