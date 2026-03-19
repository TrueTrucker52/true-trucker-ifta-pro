-- Fleet owners can view their drivers' trips
CREATE POLICY "Fleet owners can view fleet driver trips"
ON public.trips FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'
  )
);

-- Fleet owners can view their drivers' BOLs
CREATE POLICY "Fleet owners can view fleet driver BOLs"
ON public.bills_of_lading FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'
  )
);

-- Fleet owners can view their drivers' profiles
CREATE POLICY "Fleet owners can view fleet driver profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'
  )
);

-- Fleet owners can view their drivers' trucks
CREATE POLICY "Fleet owners can view fleet driver trucks"
ON public.trucks FOR SELECT
TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'
  )
);