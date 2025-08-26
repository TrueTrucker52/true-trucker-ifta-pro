-- Create BOL (Bill of Lading) management table
CREATE TABLE public.bills_of_lading (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  bol_number TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  delivery_date DATE,
  shipper_name TEXT NOT NULL,
  shipper_address TEXT,
  shipper_city TEXT,
  shipper_state TEXT,
  shipper_zip TEXT,
  consignee_name TEXT NOT NULL,
  consignee_address TEXT,
  consignee_city TEXT,
  consignee_state TEXT,
  consignee_zip TEXT,
  commodity_description TEXT,
  weight NUMERIC,
  pieces INTEGER,
  freight_charges NUMERIC,
  bol_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'in_transit',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bills_of_lading ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own BOLs" 
ON public.bills_of_lading 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own BOLs" 
ON public.bills_of_lading 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own BOLs" 
ON public.bills_of_lading 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own BOLs" 
ON public.bills_of_lading 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bills_of_lading_updated_at
BEFORE UPDATE ON public.bills_of_lading
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();