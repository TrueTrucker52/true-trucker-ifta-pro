
-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  fleet_id uuid REFERENCES public.fleets(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'system',
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  is_read boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium',
  action_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read, dismiss)
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications FOR SELECT TO authenticated
USING (is_admin());

-- Admins can manage all notifications (insert for any user)
CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Fleet owners can insert notifications for their fleet drivers
CREATE POLICY "Fleet owners can insert fleet notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (
  is_fleet_owner() AND (
    fleet_id = get_user_fleet_id()
  )
);

-- System can insert notifications (for triggers/functions)
CREATE POLICY "Authenticated users can insert own notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
