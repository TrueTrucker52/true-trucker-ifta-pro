CREATE TABLE public.user_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  addon_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  billing_interval TEXT,
  stripe_subscription_id TEXT,
  stripe_price_id TEXT,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_addons_user_addon_unique UNIQUE (user_id, addon_key),
  CONSTRAINT user_addons_addon_key_check CHECK (addon_key IN ('eld_compliance')),
  CONSTRAINT user_addons_status_check CHECK (status IN ('inactive', 'active', 'past_due', 'canceled', 'trialing')),
  CONSTRAINT user_addons_interval_check CHECK (billing_interval IS NULL OR billing_interval IN ('month', 'year'))
);

ALTER TABLE public.user_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addons"
ON public.user_addons
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all addons"
ON public.user_addons
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE INDEX idx_user_addons_user_id ON public.user_addons(user_id);
CREATE INDEX idx_user_addons_lookup ON public.user_addons(user_id, addon_key, status);

CREATE TRIGGER update_user_addons_updated_at
BEFORE UPDATE ON public.user_addons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();