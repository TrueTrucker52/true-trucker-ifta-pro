
-- IFTA Reports table
CREATE TABLE public.ifta_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE SET NULL,
  quarter integer NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  year integer NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  total_miles numeric NOT NULL DEFAULT 0,
  taxable_miles numeric NOT NULL DEFAULT 0,
  total_gallons numeric NOT NULL DEFAULT 0,
  total_fuel_cost numeric NOT NULL DEFAULT 0,
  net_tax_owed numeric NOT NULL DEFAULT 0,
  net_tax_credit numeric NOT NULL DEFAULT 0,
  filing_deadline date,
  filed_at timestamptz,
  confirmation_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, quarter, year)
);

CREATE INDEX idx_ifta_reports_user ON public.ifta_reports(user_id);
CREATE INDEX idx_ifta_reports_fleet ON public.ifta_reports(fleet_id);
CREATE INDEX idx_ifta_reports_status ON public.ifta_reports(status);

ALTER TABLE public.ifta_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.ifta_reports FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own reports" ON public.ifta_reports FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reports" ON public.ifta_reports FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reports" ON public.ifta_reports FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Fleet owners can view fleet reports" ON public.ifta_reports FOR SELECT TO authenticated
  USING (is_fleet_owner() AND user_id IN (SELECT fm.driver_id FROM public.fleet_members fm WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active'));
CREATE POLICY "Admins can manage all reports" ON public.ifta_reports FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- IFTA State Breakdown table
CREATE TABLE public.ifta_state_breakdown (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.ifta_reports(id) ON DELETE CASCADE,
  state_code text NOT NULL,
  miles_driven numeric NOT NULL DEFAULT 0,
  gallons_used numeric NOT NULL DEFAULT 0,
  gallons_purchased numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_owed numeric NOT NULL DEFAULT 0,
  tax_credit numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ifta_breakdown_report ON public.ifta_state_breakdown(report_id);

ALTER TABLE public.ifta_state_breakdown ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own breakdowns" ON public.ifta_state_breakdown FOR SELECT TO authenticated
  USING (report_id IN (SELECT id FROM public.ifta_reports WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert own breakdowns" ON public.ifta_state_breakdown FOR INSERT TO authenticated
  WITH CHECK (report_id IN (SELECT id FROM public.ifta_reports WHERE user_id = auth.uid()));
CREATE POLICY "Users can update own breakdowns" ON public.ifta_state_breakdown FOR UPDATE TO authenticated
  USING (report_id IN (SELECT id FROM public.ifta_reports WHERE user_id = auth.uid()));
CREATE POLICY "Users can delete own breakdowns" ON public.ifta_state_breakdown FOR DELETE TO authenticated
  USING (report_id IN (SELECT id FROM public.ifta_reports WHERE user_id = auth.uid()));
CREATE POLICY "Fleet owners can view fleet breakdowns" ON public.ifta_state_breakdown FOR SELECT TO authenticated
  USING (report_id IN (SELECT id FROM public.ifta_reports WHERE is_fleet_owner() AND user_id IN (SELECT fm.driver_id FROM public.fleet_members fm WHERE fm.fleet_id = get_user_fleet_id() AND fm.status = 'active')));
CREATE POLICY "Admins can manage all breakdowns" ON public.ifta_state_breakdown FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
