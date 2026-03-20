-- Fix 1: Restrict fleet owner notification inserts to only target fleet members
DROP POLICY IF EXISTS "Fleet owners can insert fleet notifications" ON public.notifications;

CREATE POLICY "Fleet owners can insert fleet notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  is_fleet_owner()
  AND fleet_id = get_user_fleet_id()
  AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
      AND fm.status = 'active'
      AND fm.invitation_status = 'accepted'
  )
);

-- Fix 2: Prevent non-admins from writing admin_notes on support tickets
CREATE OR REPLACE FUNCTION public.mask_admin_notes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NOT is_admin() THEN
    NEW.admin_notes := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS mask_admin_notes_trigger ON public.support_tickets;
CREATE TRIGGER mask_admin_notes_trigger
  BEFORE INSERT OR UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.mask_admin_notes();