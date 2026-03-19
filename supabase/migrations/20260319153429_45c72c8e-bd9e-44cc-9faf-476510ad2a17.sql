
-- Help Categories
CREATE TABLE public.help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT '📖',
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  article_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view help categories" ON public.help_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage help categories" ON public.help_categories FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Help Articles
CREATE TABLE public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.help_categories(id) ON DELETE SET NULL,
  role text NOT NULL DEFAULT 'all',
  tags text[] NOT NULL DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  view_count integer NOT NULL DEFAULT 0,
  helpful_count integer NOT NULL DEFAULT 0,
  not_helpful_count integer NOT NULL DEFAULT 0,
  read_time_minutes integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_help_articles_category ON public.help_articles(category_id);
CREATE INDEX idx_help_articles_slug ON public.help_articles(slug);
CREATE INDEX idx_help_articles_published ON public.help_articles(is_published);

ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published articles" ON public.help_articles FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can manage all articles" ON public.help_articles FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Support Tickets
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE SET NULL,
  ticket_number text NOT NULL UNIQUE,
  subject text NOT NULL,
  description text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  category text NOT NULL DEFAULT 'other',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can create own tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all tickets" ON public.support_tickets FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
