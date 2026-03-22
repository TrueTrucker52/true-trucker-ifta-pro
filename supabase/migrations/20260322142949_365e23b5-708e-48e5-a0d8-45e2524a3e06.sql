BEGIN;

-- Referrals: remove broad referrer SELECT and replace with a safe RPC
DROP POLICY IF EXISTS "Users can view own referrals as referrer" ON public.referrals;
DROP POLICY IF EXISTS "referrers_view_own_referrals" ON public.referrals;

CREATE OR REPLACE FUNCTION public.get_my_referrals()
RETURNS TABLE (
  id uuid,
  status text,
  reward_applied boolean,
  converted_at timestamptz,
  signed_up_at timestamptz,
  created_at timestamptz,
  masked_referred_email text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.status,
    r.reward_applied,
    r.converted_at,
    r.signed_up_at,
    r.created_at,
    CASE
      WHEN r.referred_email IS NULL OR position('@' in r.referred_email) = 0 THEN NULL
      ELSE left(r.referred_email, 1) || '***' || substring(r.referred_email from position('@' in r.referred_email))
    END AS masked_referred_email
  FROM public.referrals r
  WHERE r.referrer_id = auth.uid()
  ORDER BY r.created_at DESC
$$;

REVOKE ALL ON FUNCTION public.get_my_referrals() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_referrals() TO authenticated;

-- Fleets: consolidate owner access; drivers already use restricted RPCs and have no direct SELECT policy
DROP POLICY IF EXISTS "Fleet owners can view own fleet" ON public.fleets;
DROP POLICY IF EXISTS "Fleet owners can create fleet" ON public.fleets;
DROP POLICY IF EXISTS "Fleet owners can update own fleet" ON public.fleets;
DROP POLICY IF EXISTS "fleet_owners_see_all" ON public.fleets;
DROP POLICY IF EXISTS "owner_full_fleet_access" ON public.fleets;

CREATE POLICY "owner_full_fleet_access"
ON public.fleets
FOR ALL
TO authenticated
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Reviewer hardening: do not expose the SECURITY DEFINER grant function to clients
REVOKE ALL ON FUNCTION public.grant_reviewer_role(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.grant_reviewer_role(text) FROM authenticated;

COMMIT;