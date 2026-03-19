
-- Defense-in-depth: Restrict UPDATE column grants on profiles table
-- Revoke broad UPDATE, then grant only on non-subscription columns
REVOKE UPDATE ON public.profiles FROM anon, authenticated;

GRANT UPDATE (
  company_name,
  company_address,
  dot_number,
  feid_number,
  phone,
  email,
  company_setup_completed,
  updated_at
) ON public.profiles TO anon, authenticated;

-- Defense-in-depth: Restrict UPDATE column grants on subscribers table
-- Revoke broad UPDATE, then grant only on safe columns
REVOKE UPDATE ON public.subscribers FROM anon, authenticated;

GRANT UPDATE (
  email,
  updated_at
) ON public.subscribers TO anon, authenticated;
