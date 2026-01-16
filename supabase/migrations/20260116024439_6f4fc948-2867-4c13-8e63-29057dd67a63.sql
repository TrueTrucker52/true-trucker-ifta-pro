-- Create a helper function to grant reviewer role (to be called after user creation)
CREATE OR REPLACE FUNCTION public.grant_reviewer_role(user_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert the reviewer role (ignore if already exists)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'reviewer')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create RLS policy for reviewers to view sample/demo data
-- Reviewers can view all data for demo purposes but cannot modify
CREATE POLICY "Reviewers can view all profiles for demo"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'reviewer'
  )
);

CREATE POLICY "Reviewers can view all trips for demo"
ON public.trips
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'reviewer'
  )
);

CREATE POLICY "Reviewers can view all receipts for demo"
ON public.receipts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'reviewer'
  )
);

CREATE POLICY "Reviewers can view all trucks for demo"
ON public.trucks
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'reviewer'
  )
);