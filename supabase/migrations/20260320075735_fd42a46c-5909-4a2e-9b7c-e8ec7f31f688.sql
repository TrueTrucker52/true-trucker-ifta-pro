
-- Create trial tracking table
CREATE TABLE public.trial_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_attempted text,
  trial_start timestamptz NOT NULL DEFAULT now(),
  trial_end timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  days_remaining integer DEFAULT 7,
  features_used jsonb DEFAULT '{}'::jsonb,
  login_count integer DEFAULT 0,
  last_active timestamptz DEFAULT now(),
  converted boolean DEFAULT false,
  converted_at timestamptz,
  converted_plan text,
  nudge_count integer DEFAULT 0,
  last_nudge_sent timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.trial_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial tracking" ON public.trial_tracking FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own trial tracking" ON public.trial_tracking FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trial tracking" ON public.trial_tracking FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all trial tracking" ON public.trial_tracking FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create trial offers table
CREATE TABLE public.trial_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  offer_type text NOT NULL DEFAULT 'discount' CHECK (offer_type IN ('discount', 'extension', 'bonus', 'urgency', 'comeback')),
  discount_percent integer DEFAULT 0,
  offer_code text,
  offer_expires_at timestamptz,
  was_shown boolean DEFAULT false,
  was_accepted boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.trial_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trial offers" ON public.trial_offers FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own trial offers" ON public.trial_offers FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own trial offers" ON public.trial_offers FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all trial offers" ON public.trial_offers FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
