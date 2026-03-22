ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscribers;
DROP POLICY IF EXISTS "Public can view subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public can insert subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Public can update subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Anyone can read subscribers" ON public.subscribers;

DROP POLICY IF EXISTS "Users can create their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public can view invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public can insert invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public can update invoices" ON public.invoices;
DROP POLICY IF EXISTS "Public can delete invoices" ON public.invoices;
DROP POLICY IF EXISTS "Anyone can read invoices" ON public.invoices;

REVOKE ALL ON TABLE public.subscribers FROM anon;
REVOKE ALL ON TABLE public.subscribers FROM public;
REVOKE ALL ON TABLE public.invoices FROM anon;
REVOKE ALL ON TABLE public.invoices FROM public;

GRANT SELECT, INSERT, UPDATE ON TABLE public.subscribers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.invoices TO authenticated;

CREATE POLICY "Authenticated users can view own subscription"
ON public.subscribers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own subscription"
ON public.subscribers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own subscription"
ON public.subscribers
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can view own invoices"
ON public.invoices
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Authenticated users can insert own invoices"
ON public.invoices
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can update own invoices"
ON public.invoices
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Authenticated users can delete own invoices"
ON public.invoices
FOR DELETE
TO authenticated
USING (user_id = auth.uid());