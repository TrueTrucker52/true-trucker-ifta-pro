-- Remove insecure test-account bypass function (use real Supabase Auth instead)
DROP FUNCTION IF EXISTS public.validate_test_account(email_input text, password_input text);

-- Note: we intentionally keep public.test_accounts table for internal reference / admin tooling.
-- If you want to fully remove it later, we can drop the table in a follow-up migration.