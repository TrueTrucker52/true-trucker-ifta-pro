-- Add indexes on foreign key columns for better query performance

-- Index for invoices.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);

-- Index for profiles.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Index for receipts.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON public.receipts(user_id);

-- Index for subscribers.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- Index for trip_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_trip_logs_user_id ON public.trip_logs(user_id);

-- Index for trip_logs.vehicle_id foreign key
CREATE INDEX IF NOT EXISTS idx_trip_logs_vehicle_id ON public.trip_logs(vehicle_id);

-- Index for vehicles.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON public.vehicles(user_id);