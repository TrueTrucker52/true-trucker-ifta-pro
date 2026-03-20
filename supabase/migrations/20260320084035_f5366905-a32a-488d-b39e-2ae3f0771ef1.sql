CREATE INDEX IF NOT EXISTS idx_ifta_reports_user_id ON public.ifta_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ifta_reports_status ON public.ifta_reports(status);
CREATE INDEX IF NOT EXISTS idx_eld_logs_driver_id ON public.eld_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_truck_locations_fleet_id ON public.truck_locations(fleet_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_read ON public.messages(receiver_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_trucks_user_id ON public.trucks(user_id);