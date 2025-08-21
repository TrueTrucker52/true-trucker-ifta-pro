-- Create trucks table for fleet management
CREATE TABLE public.trucks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  unit_number TEXT NOT NULL,
  make TEXT,
  model TEXT,
  year INTEGER,
  vin TEXT,
  license_plate TEXT,
  registration_state TEXT,
  ifta_account_number TEXT,
  fuel_type TEXT DEFAULT 'diesel',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trucks_user_unit_unique UNIQUE (user_id, unit_number)
);

-- Enable RLS
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trucks
CREATE POLICY "Users can view their own trucks" 
ON public.trucks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trucks" 
ON public.trucks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trucks" 
ON public.trucks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trucks" 
ON public.trucks 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trips table for trip management
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  truck_id UUID NOT NULL REFERENCES public.trucks(id) ON DELETE CASCADE,
  trip_number TEXT,
  origin_city TEXT NOT NULL,
  origin_state TEXT NOT NULL,
  origin_zip TEXT,
  destination_city TEXT NOT NULL,
  destination_state TEXT NOT NULL,
  destination_zip TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  total_miles DECIMAL(10,2),
  fuel_gallons DECIMAL(10,3),
  fuel_cost DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for trips
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips
CREATE POLICY "Users can view their own trips" 
ON public.trips 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
ON public.trips 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
ON public.trips 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
ON public.trips 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trip_miles table for state-by-state mileage tracking
CREATE TABLE public.trip_miles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  state_code TEXT NOT NULL,
  miles DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT trip_miles_trip_state_unique UNIQUE (trip_id, state_code)
);

-- Enable RLS for trip_miles
ALTER TABLE public.trip_miles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_miles
CREATE POLICY "Users can view trip miles for their trips" 
ON public.trip_miles 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = trip_miles.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can create trip miles for their trips" 
ON public.trip_miles 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = trip_miles.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can update trip miles for their trips" 
ON public.trip_miles 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = trip_miles.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can delete trip miles for their trips" 
ON public.trip_miles 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.trips 
  WHERE trips.id = trip_miles.trip_id 
  AND trips.user_id = auth.uid()
));

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trucks_updated_at
  BEFORE UPDATE ON public.trucks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_miles_updated_at
  BEFORE UPDATE ON public.trip_miles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_trucks_user_id ON public.trucks(user_id);
CREATE INDEX idx_trips_user_id ON public.trips(user_id);
CREATE INDEX idx_trips_truck_id ON public.trips(truck_id);
CREATE INDEX idx_trips_start_date ON public.trips(start_date);
CREATE INDEX idx_trip_miles_trip_id ON public.trip_miles(trip_id);