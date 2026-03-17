-- Create a security definer function to get the demo user id
CREATE OR REPLACE FUNCTION public.get_demo_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 'b71bc4fb-5bf3-4103-ba8b-05bda582a339'::uuid;
$$;

-- Drop old broad reviewer policies
DROP POLICY IF EXISTS "Reviewers can view all profiles for demo" ON public.profiles;
DROP POLICY IF EXISTS "Reviewers can view all receipts for demo" ON public.receipts;
DROP POLICY IF EXISTS "Reviewers can view all trips for demo" ON public.trips;
DROP POLICY IF EXISTS "Reviewers can view all trucks for demo" ON public.trucks;

-- Create scoped reviewer policies (only demo user's data)
CREATE POLICY "Reviewers can view demo profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'reviewer') AND user_id = public.get_demo_user_id()
);

CREATE POLICY "Reviewers can view demo receipts"
ON public.receipts FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'reviewer') AND user_id = public.get_demo_user_id()
);

CREATE POLICY "Reviewers can view demo trips"
ON public.trips FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'reviewer') AND user_id = public.get_demo_user_id()
);

CREATE POLICY "Reviewers can view demo trucks"
ON public.trucks FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'reviewer') AND user_id = public.get_demo_user_id()
);