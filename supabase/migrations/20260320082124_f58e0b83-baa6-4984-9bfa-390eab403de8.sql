-- Performance indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_truck_id ON public.trips(truck_id);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trips_status ON public.trips(status);

CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON public.receipts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_eld_logs_driver_id ON public.eld_logs(driver_id);
CREATE INDEX IF NOT EXISTS idx_eld_logs_log_date ON public.eld_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_eld_logs_fleet_id ON public.eld_logs(fleet_id);

CREATE INDEX IF NOT EXISTS idx_ifta_reports_user_id ON public.ifta_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ifta_reports_status ON public.ifta_reports(status);
CREATE INDEX IF NOT EXISTS idx_ifta_reports_created_at ON public.ifta_reports(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bills_of_lading_user_id ON public.bills_of_lading(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_of_lading_created_at ON public.bills_of_lading(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_truck_locations_truck_id ON public.truck_locations(truck_id);
CREATE INDEX IF NOT EXISTS idx_truck_locations_fleet_id ON public.truck_locations(fleet_id);
CREATE INDEX IF NOT EXISTS idx_truck_locations_recorded_at ON public.truck_locations(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_fleet_id ON public.messages(fleet_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_fleet_members_fleet_id ON public.fleet_members(fleet_id);
CREATE INDEX IF NOT EXISTS idx_fleet_members_driver_id ON public.fleet_members(driver_id);

CREATE INDEX IF NOT EXISTS idx_analytics_reports_user_id ON public.analytics_reports(user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);

CREATE INDEX IF NOT EXISTS idx_hos_violations_driver_id ON public.hos_violations(driver_id);

CREATE INDEX IF NOT EXISTS idx_trip_miles_trip_id ON public.trip_miles(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_routes_trip_id ON public.trip_routes(trip_id);