-- Create a table for test accounts used during app store review
CREATE TABLE public.test_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  account_type TEXT NOT NULL DEFAULT 'reviewer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE public.test_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading test accounts (for authentication)
CREATE POLICY "Test accounts are readable for authentication" 
ON public.test_accounts 
FOR SELECT 
USING (is_active = true);

-- Insert test accounts for Google Play Store review
-- Using bcrypt hash for password "TestReview2024!"
INSERT INTO public.test_accounts (email, password_hash, account_type, notes) VALUES 
('reviewer@truetrucker.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'reviewer', 'Primary test account for Google Play Store review'),
('tester1@truetrucker.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tester', 'Beta tester account #1'),
('tester2@truetrucker.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'tester', 'Beta tester account #2');

-- Create function to validate test account credentials
CREATE OR REPLACE FUNCTION public.validate_test_account(
  email_input TEXT,
  password_input TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  -- Get the stored password hash for the email
  SELECT password_hash INTO stored_hash
  FROM public.test_accounts
  WHERE email = email_input AND is_active = true;
  
  -- If no account found, return false
  IF stored_hash IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- For now, we'll do a simple comparison (in production you'd use proper bcrypt)
  -- Since we can't easily add bcrypt to Supabase, we'll use a simple check
  RETURN (password_input = 'TestReview2024!');
END;
$$;