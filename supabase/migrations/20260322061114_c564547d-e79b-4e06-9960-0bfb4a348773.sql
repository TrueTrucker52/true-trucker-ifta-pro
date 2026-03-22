-- Remove stored password hashes from demo accounts and harden role assignment policies
ALTER TABLE public.test_accounts
DROP COLUMN IF EXISTS password_hash;

ALTER TABLE public.user_roles FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Only admins may insert roles" ON public.user_roles;
CREATE POLICY "Only admins may insert roles"
ON public.user_roles
AS RESTRICTIVE
FOR INSERT
TO authenticated
WITH CHECK (is_admin());