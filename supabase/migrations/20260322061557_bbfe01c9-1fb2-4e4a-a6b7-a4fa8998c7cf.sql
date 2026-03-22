-- Prevent geofence event impersonation and allow safe event visibility
DROP POLICY IF EXISTS "Fleet members can insert geofence events" ON public.geofence_events;
DROP POLICY IF EXISTS "Fleet owners can view fleet geofence events" ON public.geofence_events;
DROP POLICY IF EXISTS "drivers_own_geofence_events" ON public.geofence_events;
DROP POLICY IF EXISTS "drivers_update_own_events" ON public.geofence_events;
DROP POLICY IF EXISTS "fleet_owners_read_events" ON public.geofence_events;

CREATE POLICY "drivers_own_geofence_events"
ON public.geofence_events
FOR INSERT
TO authenticated
WITH CHECK (
  driver_id = auth.uid()
  AND fleet_id = get_user_fleet_id()
);

CREATE POLICY "drivers_update_own_events"
ON public.geofence_events
FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

CREATE POLICY "fleet_owners_read_events"
ON public.geofence_events
FOR SELECT
TO authenticated
USING (
  driver_id = auth.uid()
  OR (
    is_fleet_owner()
    AND fleet_id = get_user_fleet_id()
  )
);