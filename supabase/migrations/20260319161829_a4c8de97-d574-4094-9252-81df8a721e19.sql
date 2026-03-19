-- 1. Add invitation_status column to fleet_members
ALTER TABLE public.fleet_members 
ADD COLUMN IF NOT EXISTS invitation_status text NOT NULL DEFAULT 'pending';

-- 2. Mark all existing active members as accepted (they already consented via invite code)
UPDATE public.fleet_members SET invitation_status = 'accepted' WHERE status = 'active';

-- 3. Drop the old fleet owner ALL policy that allows unconsented inserts
DROP POLICY IF EXISTS "Fleet owners can manage their fleet members" ON public.fleet_members;

-- 4. Fleet owners can INSERT fleet members only with pending invitation_status
CREATE POLICY "Fleet owners can insert fleet members as pending"
ON public.fleet_members
FOR INSERT
TO authenticated
WITH CHECK (
  fleet_id IN (SELECT id FROM fleets WHERE owner_id = auth.uid())
  AND invitation_status = 'pending'
);

-- 5. Fleet owners can SELECT their fleet members (only accepted ones for data access)
CREATE POLICY "Fleet owners can view their fleet members"
ON public.fleet_members
FOR SELECT
TO authenticated
USING (
  fleet_id IN (SELECT id FROM fleets WHERE owner_id = auth.uid())
);

-- 6. Fleet owners can UPDATE their fleet members (e.g. truck_number, status) but NOT invitation_status
CREATE POLICY "Fleet owners can update fleet member details"
ON public.fleet_members
FOR UPDATE
TO authenticated
USING (
  fleet_id IN (SELECT id FROM fleets WHERE owner_id = auth.uid())
)
WITH CHECK (
  fleet_id IN (SELECT id FROM fleets WHERE owner_id = auth.uid())
);

-- 7. Fleet owners can DELETE fleet members from their fleet
CREATE POLICY "Fleet owners can remove fleet members"
ON public.fleet_members
FOR DELETE
TO authenticated
USING (
  fleet_id IN (SELECT id FROM fleets WHERE owner_id = auth.uid())
);

-- 8. Drivers can accept/reject their own invitations
CREATE POLICY "Drivers can accept or reject invitations"
ON public.fleet_members
FOR UPDATE
TO authenticated
USING (driver_id = auth.uid())
WITH CHECK (driver_id = auth.uid());

-- 9. Drivers can also insert themselves (via invite code flow)
CREATE POLICY "Drivers can join fleet via invite code"
ON public.fleet_members
FOR INSERT
TO authenticated
WITH CHECK (
  driver_id = auth.uid()
  AND invitation_status = 'accepted'
);

-- 10. Update fleet-owner SELECT policies on data tables to require invitation_status = 'accepted'

-- analytics_reports
DROP POLICY IF EXISTS "Fleet owners can view fleet analytics" ON public.analytics_reports;
CREATE POLICY "Fleet owners can view fleet analytics"
ON public.analytics_reports
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- bills_of_lading
DROP POLICY IF EXISTS "Fleet owners can view fleet driver BOLs" ON public.bills_of_lading;
CREATE POLICY "Fleet owners can view fleet driver BOLs"
ON public.bills_of_lading
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- ifta_reports
DROP POLICY IF EXISTS "Fleet owners can view fleet reports" ON public.ifta_reports;
CREATE POLICY "Fleet owners can view fleet reports"
ON public.ifta_reports
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- ifta_state_breakdown
DROP POLICY IF EXISTS "Fleet owners can view fleet breakdowns" ON public.ifta_state_breakdown;
CREATE POLICY "Fleet owners can view fleet breakdowns"
ON public.ifta_state_breakdown
FOR SELECT
TO authenticated
USING (
  report_id IN (
    SELECT ir.id FROM ifta_reports ir
    WHERE is_fleet_owner() AND ir.user_id IN (
      SELECT fm.driver_id FROM fleet_members fm
      WHERE fm.fleet_id = get_user_fleet_id()
      AND fm.status = 'active'
      AND fm.invitation_status = 'accepted'
    )
  )
);

-- trucks
DROP POLICY IF EXISTS "Fleet owners can view fleet driver trucks" ON public.trucks;
CREATE POLICY "Fleet owners can view fleet driver trucks"
ON public.trucks
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- trips
DROP POLICY IF EXISTS "Fleet owners can view fleet driver trips" ON public.trips;
CREATE POLICY "Fleet owners can view fleet driver trips"
ON public.trips
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- profiles
DROP POLICY IF EXISTS "Fleet owners can view fleet driver profiles" ON public.profiles;
CREATE POLICY "Fleet owners can view fleet driver profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id()
    AND fm.status = 'active'
    AND fm.invitation_status = 'accepted'
  )
);

-- messages (fleet_id based, keep as-is since messaging requires active fleet membership)
-- notifications fleet_id insert policy is fine since it checks fleet ownership

-- Also update the drivers can view their fleet policy to only show accepted memberships
DROP POLICY IF EXISTS "Drivers can view their fleet" ON public.fleets;
CREATE POLICY "Drivers can view their fleet"
ON public.fleets
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT fleet_members.fleet_id FROM fleet_members
    WHERE fleet_members.driver_id = auth.uid()
    AND fleet_members.status = 'active'
    AND fleet_members.invitation_status = 'accepted'
  )
);