-- Fix subscribers table RLS policies to prevent unauthorized access
-- Drop the overly permissive existing policies
DROP POLICY IF EXISTS "Service can create subscriptions" ON public.subscribers;
DROP POLICY IF EXISTS "Service can update subscriptions" ON public.subscribers;

-- Create secure policies that only allow users to modify their own data
CREATE POLICY "Users can create their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid());