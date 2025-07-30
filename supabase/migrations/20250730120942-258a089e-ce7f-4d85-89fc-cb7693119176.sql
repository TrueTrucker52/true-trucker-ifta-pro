-- Optimize RLS policies for better performance by using (select auth.uid()) instead of auth.uid()

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create optimized policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own profile" ON public.profiles  
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING ((select auth.uid()) = user_id);

-- Drop existing policies for receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can create their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;

-- Create optimized policies for receipts
CREATE POLICY "Users can view their own receipts" ON public.receipts
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own receipts" ON public.receipts
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own receipts" ON public.receipts
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own receipts" ON public.receipts
FOR DELETE USING ((select auth.uid()) = user_id);

-- Drop existing policy for subscribers
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

-- Create optimized policy for subscribers
CREATE POLICY "select_own_subscription" ON public.subscribers
FOR SELECT USING ((user_id = (select auth.uid())) OR (email = (select auth.email())));

-- Drop existing policies for trip_logs
DROP POLICY IF EXISTS "Users can view their own trip logs" ON public.trip_logs;
DROP POLICY IF EXISTS "Users can create their own trip logs" ON public.trip_logs;
DROP POLICY IF EXISTS "Users can update their own trip logs" ON public.trip_logs;
DROP POLICY IF EXISTS "Users can delete their own trip logs" ON public.trip_logs;

-- Create optimized policies for trip_logs
CREATE POLICY "Users can view their own trip logs" ON public.trip_logs
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own trip logs" ON public.trip_logs
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own trip logs" ON public.trip_logs
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own trip logs" ON public.trip_logs
FOR DELETE USING ((select auth.uid()) = user_id);

-- Drop existing policies for vehicles
DROP POLICY IF EXISTS "Users can view their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can create their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can update their own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Users can delete their own vehicles" ON public.vehicles;

-- Create optimized policies for vehicles
CREATE POLICY "Users can view their own vehicles" ON public.vehicles
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own vehicles" ON public.vehicles
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own vehicles" ON public.vehicles
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own vehicles" ON public.vehicles
FOR DELETE USING ((select auth.uid()) = user_id);

-- Drop existing policies for invoices
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;

-- Create optimized policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
FOR SELECT USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create their own invoices" ON public.invoices
FOR INSERT WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own invoices" ON public.invoices
FOR UPDATE USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own invoices" ON public.invoices
FOR DELETE USING ((select auth.uid()) = user_id);