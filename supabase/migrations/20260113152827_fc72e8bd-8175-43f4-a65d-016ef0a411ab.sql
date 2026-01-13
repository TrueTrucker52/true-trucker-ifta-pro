-- Add user_id column to trip_miles for direct access control (instead of relying on JOIN)
ALTER TABLE public.trip_miles ADD COLUMN IF NOT EXISTS user_id uuid;

-- Populate user_id from the trips table for existing records
UPDATE public.trip_miles 
SET user_id = trips.user_id 
FROM public.trips 
WHERE trip_miles.trip_id = trips.id AND trip_miles.user_id IS NULL;

-- Make user_id NOT NULL after populating
ALTER TABLE public.trip_miles ALTER COLUMN user_id SET NOT NULL;

-- Drop existing RESTRICTIVE policies
DROP POLICY IF EXISTS "Users can view trip miles for their trips" ON public.trip_miles;
DROP POLICY IF EXISTS "Users can create trip miles for their trips" ON public.trip_miles;
DROP POLICY IF EXISTS "Users can update trip miles for their trips" ON public.trip_miles;
DROP POLICY IF EXISTS "Users can delete trip miles for their trips" ON public.trip_miles;

-- Create new PERMISSIVE policies using direct user_id check
CREATE POLICY "Users can view their own trip miles"
ON public.trip_miles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trip miles"
ON public.trip_miles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip miles"
ON public.trip_miles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip miles"
ON public.trip_miles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);