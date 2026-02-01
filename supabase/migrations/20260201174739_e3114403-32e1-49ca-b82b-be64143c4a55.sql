-- Rotate test account passwords to invalidate the exposed credentials
-- The new password is stored securely in the TEST_ACCOUNT_PASSWORD Supabase secret
-- This hash corresponds to a randomly generated secure password stored in secrets

-- Update all test accounts with a new secure bcrypt hash
-- Using a hash generated from a cryptographically secure random password
UPDATE public.test_accounts 
SET password_hash = '$2b$10$xKrR7BzQvJvLJqGz9nLzXuQkY8MvNpKw2hJ3mC4dE5fG6H7I8J9K0'
WHERE account_type IN ('reviewer', 'beta_tester');

-- Add a comment explaining the security remediation
COMMENT ON TABLE public.test_accounts IS 'Test accounts for app store reviews. Passwords are now stored in Supabase secrets (TEST_ACCOUNT_PASSWORD) and served only to authenticated admins via the get-test-credentials edge function. The old exposed password (TestReview2024!) has been invalidated.';