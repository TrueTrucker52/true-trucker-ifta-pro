-- Explicitly deny authenticated reads on sensitive demo credentials table
DROP POLICY IF EXISTS "Authenticated users cannot view test accounts" ON public.test_accounts;

CREATE POLICY "Authenticated users cannot view test accounts"
ON public.test_accounts
FOR SELECT
TO authenticated
USING (false);