CREATE TABLE public.receipt_match_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggested_trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  chosen_trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  helpful boolean NOT NULL,
  match_score integer,
  day_offset integer,
  state_matched boolean NOT NULL DEFAULT false,
  gallons_matched boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.receipt_match_feedback TO authenticated;
GRANT ALL ON public.receipt_match_feedback TO service_role;

ALTER TABLE public.receipt_match_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own match feedback"
  ON public.receipt_match_feedback FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own match feedback"
  ON public.receipt_match_feedback FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own match feedback"
  ON public.receipt_match_feedback FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_receipt_match_feedback_user ON public.receipt_match_feedback(user_id, created_at DESC);