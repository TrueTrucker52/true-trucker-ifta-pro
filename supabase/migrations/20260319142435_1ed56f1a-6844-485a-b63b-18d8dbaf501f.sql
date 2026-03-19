
-- Create form_drafts table to store driver form drafts
CREATE TABLE public.form_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type text NOT NULL DEFAULT 'account_setup',
  form_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, form_type)
);

-- Enable RLS
ALTER TABLE public.form_drafts ENABLE ROW LEVEL SECURITY;

-- Users can view their own drafts
CREATE POLICY "Users can view their own drafts"
  ON public.form_drafts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create their own drafts
CREATE POLICY "Users can create their own drafts"
  ON public.form_drafts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own drafts
CREATE POLICY "Users can update their own drafts"
  ON public.form_drafts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own drafts
CREATE POLICY "Users can delete their own drafts"
  ON public.form_drafts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_form_drafts_updated_at
  BEFORE UPDATE ON public.form_drafts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
