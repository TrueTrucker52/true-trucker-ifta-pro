
-- Create ELD logs table
CREATE TABLE public.eld_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  truck_id uuid REFERENCES public.trucks(id),
  fleet_id uuid REFERENCES public.fleets(id),
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  duty_status text NOT NULL DEFAULT 'off_duty' CHECK (duty_status IN ('off_duty', 'sleeper', 'driving', 'on_duty', 'personal_conveyance', 'yard_move')),
  status_start timestamptz NOT NULL DEFAULT now(),
  status_end timestamptz,
  duration_minutes integer DEFAULT 0,
  location_start text,
  location_end text,
  odometer_start numeric,
  odometer_end numeric,
  notes text,
  is_certified boolean DEFAULT false,
  certified_at timestamptz,
  edited boolean DEFAULT false,
  edit_reason text,
  original_data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eld_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own ELD logs" ON public.eld_logs FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Drivers can view own ELD logs" ON public.eld_logs FOR SELECT TO authenticated USING (driver_id = auth.uid());
CREATE POLICY "Drivers can update own ELD logs" ON public.eld_logs FOR UPDATE TO authenticated USING (driver_id = auth.uid());
CREATE POLICY "Fleet owners can view fleet ELD logs" ON public.eld_logs FOR SELECT TO authenticated USING (is_fleet_owner() AND fleet_id = get_user_fleet_id());
CREATE POLICY "Admins can manage all ELD logs" ON public.eld_logs FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create HOS violations table
CREATE TABLE public.hos_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  truck_id uuid REFERENCES public.trucks(id),
  fleet_id uuid REFERENCES public.fleets(id),
  violation_type text NOT NULL,
  violation_detail text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('warning', 'minor', 'major', 'critical')),
  was_resolved boolean DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hos_violations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view own violations" ON public.hos_violations FOR SELECT TO authenticated USING (driver_id = auth.uid());
CREATE POLICY "System can insert violations" ON public.hos_violations FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Fleet owners can view fleet violations" ON public.hos_violations FOR SELECT TO authenticated USING (is_fleet_owner() AND fleet_id = get_user_fleet_id());
CREATE POLICY "Admins can manage all violations" ON public.hos_violations FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create ELD inspections table
CREATE TABLE public.eld_inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  truck_id uuid REFERENCES public.trucks(id),
  fleet_id uuid REFERENCES public.fleets(id),
  inspector_name text,
  inspection_code text,
  location text,
  result text DEFAULT 'passed' CHECK (result IN ('passed', 'failed', 'warning')),
  violations_found jsonb DEFAULT '[]'::jsonb,
  transfer_method text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.eld_inspections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own inspections" ON public.eld_inspections FOR INSERT TO authenticated WITH CHECK (driver_id = auth.uid());
CREATE POLICY "Drivers can view own inspections" ON public.eld_inspections FOR SELECT TO authenticated USING (driver_id = auth.uid());
CREATE POLICY "Fleet owners can view fleet inspections" ON public.eld_inspections FOR SELECT TO authenticated USING (is_fleet_owner() AND fleet_id = get_user_fleet_id());
CREATE POLICY "Admins can manage all inspections" ON public.eld_inspections FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.eld_logs;
