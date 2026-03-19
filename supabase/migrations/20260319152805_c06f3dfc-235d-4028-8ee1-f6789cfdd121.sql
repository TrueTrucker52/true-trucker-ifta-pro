
CREATE TABLE public.driver_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  step_completed integer NOT NULL DEFAULT 0,
  is_complete boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  skipped_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  device_type text,
  onboarding_type text NOT NULL DEFAULT 'driver',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_driver_onboarding_user ON public.driver_onboarding(user_id);

ALTER TABLE public.driver_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own onboarding" ON public.driver_onboarding FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own onboarding" ON public.driver_onboarding FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own onboarding" ON public.driver_onboarding FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all onboarding" ON public.driver_onboarding FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
