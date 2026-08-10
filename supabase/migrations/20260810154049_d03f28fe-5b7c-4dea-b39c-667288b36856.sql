ALTER TABLE public.receipts
  ADD COLUMN IF NOT EXISTS trip_auto_assigned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS trip_match_score integer;

CREATE INDEX IF NOT EXISTS receipts_auto_assigned_idx
  ON public.receipts (user_id, trip_auto_assigned)
  WHERE trip_auto_assigned;