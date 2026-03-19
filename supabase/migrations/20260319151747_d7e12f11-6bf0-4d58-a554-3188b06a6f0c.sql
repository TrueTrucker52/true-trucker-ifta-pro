
-- Create analytics/report snapshots table
CREATE TABLE public.analytics_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE,
  report_period text NOT NULL,
  total_miles numeric NOT NULL DEFAULT 0,
  miles_by_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  fuel_purchased numeric NOT NULL DEFAULT 0,
  fuel_cost numeric NOT NULL DEFAULT 0,
  fuel_by_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  ifta_tax_owed numeric NOT NULL DEFAULT 0,
  ifta_tax_paid numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_reports_user ON public.analytics_reports(user_id);
CREATE INDEX idx_analytics_reports_fleet ON public.analytics_reports(fleet_id);
CREATE INDEX idx_analytics_reports_period ON public.analytics_reports(report_period);

ALTER TABLE public.analytics_reports ENABLE ROW LEVEL SECURITY;

-- Users see own reports
CREATE POLICY "Users can view own analytics"
ON public.analytics_reports FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own analytics"
ON public.analytics_reports FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own analytics"
ON public.analytics_reports FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Fleet owners see fleet analytics
CREATE POLICY "Fleet owners can view fleet analytics"
ON public.analytics_reports FOR SELECT TO authenticated
USING (
  is_fleet_owner() AND user_id IN (
    SELECT fm.driver_id FROM public.fleet_members fm
    WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'
  )
);

-- Admins see everything
CREATE POLICY "Admins can manage all analytics"
ON public.analytics_reports FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());
