-- Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Create referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid,
  referral_code text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  referred_email text,
  signed_up_at timestamptz,
  converted_at timestamptz,
  reward_applied boolean DEFAULT false,
  reward_applied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer" ON public.referrals FOR SELECT TO authenticated USING (referrer_id = auth.uid());
CREATE POLICY "Users can view own referrals as referred" ON public.referrals FOR SELECT TO authenticated USING (referred_id = auth.uid());
CREATE POLICY "Users can insert referrals" ON public.referrals FOR INSERT TO authenticated WITH CHECK (referrer_id = auth.uid());
CREATE POLICY "Users can update own referrals" ON public.referrals FOR UPDATE TO authenticated USING (referrer_id = auth.uid());
CREATE POLICY "Admins can manage all referrals" ON public.referrals FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Create referral_rewards table
CREATE TABLE public.referral_rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reward_type text NOT NULL DEFAULT 'free_month',
  reward_value numeric NOT NULL DEFAULT 1,
  reward_status text NOT NULL DEFAULT 'pending',
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  stripe_coupon_id text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards" ON public.referral_rewards FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own rewards" ON public.referral_rewards FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own rewards" ON public.referral_rewards FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all rewards" ON public.referral_rewards FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Function to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  first_name text;
  code text;
  attempts int := 0;
BEGIN
  IF NEW.referral_code IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  first_name := UPPER(SPLIT_PART(COALESCE(NEW.email, 'USER'), '@', 1));
  first_name := LEFT(REGEXP_REPLACE(first_name, '[^A-Z]', '', 'g'), 6);
  IF first_name = '' THEN first_name := 'USER'; END IF;
  
  LOOP
    code := first_name || '-TT-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
    attempts := attempts + 1;
    EXIT WHEN attempts > 20;
  END LOOP;
  
  NEW.referral_code := code;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_referral_code();

-- Backfill existing profiles without referral codes
UPDATE public.profiles
SET referral_code = UPPER(LEFT(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z]', '', 'g'), 6)) || '-TT-' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0')
WHERE referral_code IS NULL;