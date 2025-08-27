-- Add company setup completion tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN company_setup_completed BOOLEAN DEFAULT false,
ADD COLUMN company_name TEXT,
ADD COLUMN company_address TEXT,
ADD COLUMN dot_number TEXT,
ADD COLUMN feid_number TEXT;