
-- truck_locations: real-time GPS positions for fleet trucks
CREATE TABLE public.truck_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL,
  truck_id uuid REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  speed double precision DEFAULT 0,
  heading double precision DEFAULT 0,
  state_code text,
  address text,
  is_moving boolean DEFAULT false,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  battery_level integer,
  signal_strength text DEFAULT 'good',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.truck_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own location"
  ON public.truck_locations FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can view own location"
  ON public.truck_locations FOR SELECT TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Fleet owners can view fleet locations"
  ON public.truck_locations FOR SELECT TO authenticated
  USING (
    is_fleet_owner() AND fleet_id = get_user_fleet_id()
  );

CREATE POLICY "Admins can manage all locations"
  ON public.truck_locations FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX idx_truck_locations_fleet ON public.truck_locations(fleet_id, recorded_at DESC);
CREATE INDEX idx_truck_locations_driver ON public.truck_locations(driver_id, recorded_at DESC);

-- trip_routes: completed trip route data
CREATE TABLE public.trip_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  driver_id uuid NOT NULL,
  truck_id uuid REFERENCES public.trucks(id) ON DELETE CASCADE NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE,
  route_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  states_visited jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_miles numeric DEFAULT 0,
  start_location text,
  end_location text,
  start_time timestamptz,
  end_time timestamptz,
  avg_speed numeric DEFAULT 0,
  max_speed numeric DEFAULT 0,
  idle_time integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trip_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can insert own routes"
  ON public.trip_routes FOR INSERT TO authenticated
  WITH CHECK (driver_id = auth.uid());

CREATE POLICY "Drivers can view own routes"
  ON public.trip_routes FOR SELECT TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Drivers can update own routes"
  ON public.trip_routes FOR UPDATE TO authenticated
  USING (driver_id = auth.uid());

CREATE POLICY "Fleet owners can view fleet routes"
  ON public.trip_routes FOR SELECT TO authenticated
  USING (
    is_fleet_owner() AND fleet_id = get_user_fleet_id()
  );

CREATE POLICY "Admins can manage all routes"
  ON public.trip_routes FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- Add truck_locations to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.truck_locations;
