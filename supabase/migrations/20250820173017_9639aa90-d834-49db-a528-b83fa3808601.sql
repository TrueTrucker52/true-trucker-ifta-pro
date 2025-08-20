-- Add trial tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP WITH TIME ZONE;

-- Update the handle_new_user function to set trial dates automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    subscription_status, 
    subscription_tier,
    trial_start_date,
    trial_end_date
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    'trial',
    'free',
    now(),
    now() + interval '7 days'
  );
  RETURN NEW;
END;
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing users who don't have trial dates set
UPDATE public.profiles 
SET 
  trial_start_date = created_at,
  trial_end_date = created_at + interval '7 days'
WHERE trial_start_date IS NULL;