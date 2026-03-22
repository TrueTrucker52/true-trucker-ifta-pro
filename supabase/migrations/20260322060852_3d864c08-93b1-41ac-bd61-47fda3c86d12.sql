-- Lock down self-issued rewards and constrain self-created trial offers
DROP POLICY IF EXISTS "Users can insert own rewards" ON public.referral_rewards;

DROP POLICY IF EXISTS "Users can insert own trial offers" ON public.trial_offers;
CREATE POLICY "Users can insert safe trial offers"
ON public.trial_offers
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND offer_type IN ('discount', 'launch_special', 'trial_extension')
  AND discount_percent IN (10, 15, 20, 25, 30)
  AND was_accepted IS NOT TRUE
  AND was_shown IS NOT TRUE
  AND (offer_code IS NULL OR offer_code IN ('LAUNCH20', 'ELDUPGRADE'))
  AND (offer_expires_at IS NULL OR offer_expires_at > now())
);

CREATE OR REPLACE FUNCTION public.protect_trial_offer_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.offer_type := OLD.offer_type;
    NEW.discount_percent := OLD.discount_percent;
    NEW.offer_code := OLD.offer_code;
    NEW.offer_expires_at := OLD.offer_expires_at;
    NEW.user_id := OLD.user_id;
    NEW.created_at := OLD.created_at;

    IF OLD.was_accepted IS TRUE THEN
      NEW.was_accepted := TRUE;
    END IF;

    IF OLD.was_shown IS TRUE THEN
      NEW.was_shown := TRUE;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_trial_offer_fields_trigger ON public.trial_offers;
CREATE TRIGGER protect_trial_offer_fields_trigger
BEFORE UPDATE ON public.trial_offers
FOR EACH ROW
EXECUTE FUNCTION public.protect_trial_offer_fields();