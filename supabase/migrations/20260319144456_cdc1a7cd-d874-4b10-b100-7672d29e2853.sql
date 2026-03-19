
-- Create fleets table
CREATE TABLE public.fleets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  company_name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.fleets ENABLE ROW LEVEL SECURITY;

-- Create fleet_members table
CREATE TABLE public.fleet_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid NOT NULL REFERENCES public.fleets(id) ON DELETE CASCADE,
  driver_id uuid NOT NULL,
  truck_number text,
  joined_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'active',
  UNIQUE(fleet_id, driver_id)
);

ALTER TABLE public.fleet_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for fleets
CREATE POLICY "Admins can manage all fleets" ON public.fleets
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Fleet owners can view own fleet" ON public.fleets
  FOR SELECT TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Fleet owners can create fleet" ON public.fleets
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Fleet owners can update own fleet" ON public.fleets
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());

CREATE POLICY "Drivers can view their fleet" ON public.fleets
  FOR SELECT TO authenticated
  USING (id IN (SELECT fleet_id FROM public.fleet_members WHERE driver_id = auth.uid() AND status = 'active'));

-- RLS policies for fleet_members
CREATE POLICY "Admins can manage all fleet members" ON public.fleet_members
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE POLICY "Fleet owners can manage their fleet members" ON public.fleet_members
  FOR ALL TO authenticated
  USING (fleet_id IN (SELECT id FROM public.fleets WHERE owner_id = auth.uid()))
  WITH CHECK (fleet_id IN (SELECT id FROM public.fleets WHERE owner_id = auth.uid()));

CREATE POLICY "Drivers can view own membership" ON public.fleet_members
  FOR SELECT TO authenticated USING (driver_id = auth.uid());

-- Helper: check if user is a fleet owner
CREATE OR REPLACE FUNCTION public.is_fleet_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'fleet_owner') $$;

-- Helper: get the fleet_id for the current user
CREATE OR REPLACE FUNCTION public.get_user_fleet_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT COALESCE(
  (SELECT id FROM public.fleets WHERE owner_id = auth.uid() LIMIT 1),
  (SELECT fleet_id FROM public.fleet_members WHERE driver_id = auth.uid() AND status = 'active' LIMIT 1)
) $$;

-- Helper: get the user's highest-priority role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role::text FROM public.user_roles WHERE user_id = auth.uid()
ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'fleet_owner' THEN 2 WHEN 'driver' THEN 3 ELSE 4 END
LIMIT 1 $$;
