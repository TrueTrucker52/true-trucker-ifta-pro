-- Messages table
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fleet_id uuid NOT NULL REFERENCES public.fleets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  receiver_id uuid NOT NULL,
  message text NOT NULL DEFAULT '',
  message_type text NOT NULL DEFAULT 'text',
  is_read boolean NOT NULL DEFAULT false,
  is_broadcast boolean NOT NULL DEFAULT false,
  attachment_url text,
  attachment_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

-- Indexes
CREATE INDEX idx_messages_fleet_id ON public.messages(fleet_id);
CREATE INDEX idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Admins full access
CREATE POLICY "Admins can manage all messages"
ON public.messages FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Fleet owners can read/write messages in their fleet
CREATE POLICY "Fleet owners can manage fleet messages"
ON public.messages FOR ALL
TO authenticated
USING (
  fleet_id IN (SELECT id FROM public.fleets WHERE owner_id = auth.uid())
)
WITH CHECK (
  fleet_id IN (SELECT id FROM public.fleets WHERE owner_id = auth.uid())
  AND sender_id = auth.uid()
);

-- Drivers can read messages sent to them
CREATE POLICY "Drivers can read their messages"
ON public.messages FOR SELECT
TO authenticated
USING (
  receiver_id = auth.uid()
  OR sender_id = auth.uid()
);

-- Drivers can send messages (only to fleet owner, enforced in app)
CREATE POLICY "Drivers can send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND fleet_id IN (
    SELECT fm.fleet_id FROM public.fleet_members fm
    WHERE fm.driver_id = auth.uid() AND fm.status = 'active'
  )
);

-- Drivers can update their own received messages (mark as read)
CREATE POLICY "Drivers can mark messages as read"
ON public.messages FOR UPDATE
TO authenticated
USING (receiver_id = auth.uid())
WITH CHECK (receiver_id = auth.uid());

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;