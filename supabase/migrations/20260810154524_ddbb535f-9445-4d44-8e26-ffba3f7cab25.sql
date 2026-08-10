CREATE TABLE public.receipt_assignment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  previous_trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  source TEXT NOT NULL CHECK (source IN ('auto','manual','review','batch','undo')),
  match_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_receipt_assignment_history_user_created ON public.receipt_assignment_history(user_id, created_at DESC);
CREATE INDEX idx_receipt_assignment_history_receipt ON public.receipt_assignment_history(receipt_id);

GRANT SELECT, INSERT ON public.receipt_assignment_history TO authenticated;
GRANT ALL ON public.receipt_assignment_history TO service_role;

ALTER TABLE public.receipt_assignment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own assignment history"
ON public.receipt_assignment_history FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can log their own assignment history"
ON public.receipt_assignment_history FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND EXISTS (
  SELECT 1 FROM public.receipts r WHERE r.id = receipt_id AND r.user_id = auth.uid()
));