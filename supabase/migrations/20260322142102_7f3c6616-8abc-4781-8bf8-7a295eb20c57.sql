BEGIN;

CREATE OR REPLACE FUNCTION public.lookup_fleet_by_invite_code(invite_code_input text)
RETURNS TABLE (
  id uuid,
  company_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.id, f.company_name
  FROM public.fleets f
  WHERE upper(f.invite_code) = upper(trim(invite_code_input))
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.lookup_fleet_by_invite_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_fleet_by_invite_code(text) TO authenticated;

COMMIT;