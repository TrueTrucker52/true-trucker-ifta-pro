
-- Add new roles to the existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'fleet_owner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'driver';
