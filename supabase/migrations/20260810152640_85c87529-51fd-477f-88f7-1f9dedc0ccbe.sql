ALTER TABLE public.receipts ADD COLUMN IF NOT EXISTS trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_receipts_trip_id ON public.receipts(trip_id);