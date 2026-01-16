-- Add 'reviewer' to the app_role enum for Google Play Store testers
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reviewer';