BEGIN;

DROP VIEW IF EXISTS public.fleet_member_view;

CREATE OR REPLACE FUNCTION public.get_driver_fleet_summary(target_fleet_id uuid DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  company_name text,
  owner_id uuid,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.company_name, f.owner_id, f.created_at
  FROM public.fleets f
  WHERE EXISTS (
    SELECT 1
    FROM public.fleet_members fm
    WHERE fm.fleet_id = f.id
      AND fm.driver_id = auth.uid()
      AND fm.status = 'active'
      AND fm.invitation_status = 'accepted'
  )
  AND (target_fleet_id IS NULL OR f.id = target_fleet_id)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_driver_fleet_summary(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_driver_fleet_summary(uuid) TO authenticated;

COMMIT;