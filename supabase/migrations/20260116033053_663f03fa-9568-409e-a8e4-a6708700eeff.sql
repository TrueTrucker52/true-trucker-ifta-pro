-- Fix: Remove dangerous reviewer access to profiles table with sensitive business data
-- This policy allowed reviewers to see ALL customer data (company names, DOT numbers, FEID numbers, emails, etc.)

DROP POLICY IF EXISTS "Reviewers can view profiles for app review" ON public.profiles;