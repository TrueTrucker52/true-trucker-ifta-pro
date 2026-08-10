CREATE TABLE public.ifta_reminder_settings (
  user_id uuid NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean NOT NULL DEFAULT true,
  lead_days integer[] NOT NULL DEFAULT '{30,14,7,1}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ifta_reminder_settings TO authenticated;
GRANT ALL ON public.ifta_reminder_settings TO service_role;

ALTER TABLE public.ifta_reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own IFTA reminder settings"
  ON public.ifta_reminder_settings FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users create own IFTA reminder settings"
  ON public.ifta_reminder_settings FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own IFTA reminder settings"
  ON public.ifta_reminder_settings FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own IFTA reminder settings"
  ON public.ifta_reminder_settings FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_ifta_reminder_settings_updated_at
  BEFORE UPDATE ON public.ifta_reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Validate allowed lead-day values server side
CREATE OR REPLACE FUNCTION public.validate_ifta_reminder_lead_days()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF NEW.lead_days IS NULL OR array_length(NEW.lead_days, 1) IS NULL THEN
    RAISE EXCEPTION 'At least one reminder lead time is required';
  END IF;

  IF EXISTS (
    SELECT 1 FROM unnest(NEW.lead_days) AS d WHERE d NOT IN (30, 14, 7, 1)
  ) THEN
    RAISE EXCEPTION 'Reminder lead times must be 30, 14, 7 or 1 days';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_ifta_reminder_lead_days_trigger
  BEFORE INSERT OR UPDATE ON public.ifta_reminder_settings
  FOR EACH ROW EXECUTE FUNCTION public.validate_ifta_reminder_lead_days();

-- Send log: one row per user / deadline / lead time, prevents duplicates
CREATE TABLE public.ifta_reminder_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deadline_date date NOT NULL,
  lead_days integer NOT NULL,
  quarter integer NOT NULL,
  quarter_year integer NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, deadline_date, lead_days)
);

GRANT SELECT ON public.ifta_reminder_log TO authenticated;
GRANT ALL ON public.ifta_reminder_log TO service_role;

ALTER TABLE public.ifta_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own IFTA reminder log"
  ON public.ifta_reminder_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());

REVOKE ALL ON FUNCTION public.validate_ifta_reminder_lead_days() FROM PUBLIC, anon, authenticated;