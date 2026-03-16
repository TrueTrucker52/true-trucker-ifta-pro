-- Trigger function: prevent non-service-role users from modifying subscription columns on profiles
CREATE OR REPLACE FUNCTION public.protect_subscription_fields_profiles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to modify anything
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For regular users, revert subscription-related fields to their original values
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.subscription_end := OLD.subscription_end;
  NEW.trial_start_date := OLD.trial_start_date;
  NEW.trial_end_date := OLD.trial_end_date;
  NEW.stripe_customer_id := OLD.stripe_customer_id;

  RETURN NEW;
END;
$$;

-- Trigger function: prevent non-service-role users from modifying subscription columns on subscribers
CREATE OR REPLACE FUNCTION public.protect_subscription_fields_subscribers()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role to modify anything
  IF current_setting('role') = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- For INSERT: force safe defaults on subscription fields
  IF TG_OP = 'INSERT' THEN
    NEW.subscribed := false;
    NEW.subscription_tier := NULL;
    NEW.subscription_end := NULL;
    NEW.stripe_customer_id := NULL;
    RETURN NEW;
  END IF;

  -- For UPDATE: revert subscription-related fields to their original values
  NEW.subscribed := OLD.subscribed;
  NEW.subscription_tier := OLD.subscription_tier;
  NEW.subscription_end := OLD.subscription_end;
  NEW.stripe_customer_id := OLD.stripe_customer_id;

  RETURN NEW;
END;
$$;

-- Attach triggers
CREATE TRIGGER protect_profiles_subscription_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_fields_profiles();

CREATE TRIGGER protect_subscribers_subscription_fields
  BEFORE INSERT OR UPDATE ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_subscription_fields_subscribers();