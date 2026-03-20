
-- Geofence zones created by fleet owners
CREATE TABLE public.geofences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE NOT NULL,
  created_by uuid NOT NULL,
  name text NOT NULL,
  zone_type text NOT NULL DEFAULT 'customer',
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 500,
  color text DEFAULT '#f97316',
  notify_on_enter boolean DEFAULT true,
  notify_on_exit boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.geofences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fleet owners can manage own fleet geofences"
  ON public.geofences FOR ALL TO authenticated
  USING (is_fleet_owner() AND fleet_id = get_user_fleet_id())
  WITH CHECK (is_fleet_owner() AND fleet_id = get_user_fleet_id());

CREATE POLICY "Admins can manage all geofences"
  ON public.geofences FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Geofence event log
CREATE TABLE public.geofence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  geofence_id uuid REFERENCES public.geofences(id) ON DELETE CASCADE NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid NOT NULL,
  truck_id uuid REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL, -- 'enter' or 'exit'
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.geofence_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fleet owners can view fleet geofence events"
  ON public.geofence_events FOR SELECT TO authenticated
  USING (is_fleet_owner() AND fleet_id = get_user_fleet_id());

CREATE POLICY "System can insert geofence events"
  ON public.geofence_events FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage all geofence events"
  ON public.geofence_events FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX idx_geofences_fleet ON public.geofences(fleet_id);
CREATE INDEX idx_geofence_events_fleet ON public.geofence_events(fleet_id, recorded_at DESC);
