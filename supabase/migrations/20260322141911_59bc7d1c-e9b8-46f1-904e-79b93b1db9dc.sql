BEGIN;

DROP POLICY IF EXISTS "Drivers can view their fleet" ON public.fleets;

DROP POLICY IF EXISTS "fleet_owners_see_all" ON public.fleets;
CREATE POLICY "fleet_owners_see_all"
ON public.fleets
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

DROP VIEW IF EXISTS public.fleet_member_view;
CREATE VIEW public.fleet_member_view
WITH (security_invoker = true)
AS
SELECT
  f.id,
  f.company_name,
  f.owner_id,
  f.created_at
FROM public.fleets f
WHERE f.id IN (
  SELECT fm.fleet_id
  FROM public.fleet_members fm
  WHERE fm.driver_id = auth.uid()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
);

GRANT SELECT ON public.fleet_member_view TO authenticated;

COMMIT;