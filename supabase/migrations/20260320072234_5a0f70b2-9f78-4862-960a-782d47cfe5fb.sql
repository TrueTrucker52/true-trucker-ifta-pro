
DROP POLICY "System can insert geofence events" ON public.geofence_events;

CREATE POLICY "Fleet members can insert geofence events"
  ON public.geofence_events FOR INSERT TO authenticated
  WITH CHECK (
    fleet_id = get_user_fleet_id()
  );
