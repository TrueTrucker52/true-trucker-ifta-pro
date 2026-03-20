-- Voice commands logging table
CREATE TABLE public.voice_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  command_spoken text NOT NULL DEFAULT '',
  command_matched text,
  page_context text,
  was_successful boolean NOT NULL DEFAULT false,
  confidence_score numeric,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own voice commands" ON public.voice_commands
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own voice commands" ON public.voice_commands
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all voice commands" ON public.voice_commands
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE INDEX idx_voice_commands_user ON public.voice_commands(user_id);
CREATE INDEX idx_voice_commands_created ON public.voice_commands(created_at DESC);

-- Voice settings table
CREATE TABLE public.voice_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  voice_enabled boolean NOT NULL DEFAULT false,
  voice_speed numeric NOT NULL DEFAULT 1.0,
  voice_volume numeric NOT NULL DEFAULT 0.8,
  voice_gender text NOT NULL DEFAULT 'female',
  wake_word text NOT NULL DEFAULT 'hey trucker',
  read_messages_aloud boolean NOT NULL DEFAULT true,
  announce_state_crossings boolean NOT NULL DEFAULT true,
  fuel_stop_reminders boolean NOT NULL DEFAULT true,
  auto_driving_mode boolean NOT NULL DEFAULT false,
  language text NOT NULL DEFAULT 'en-US',
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own voice settings" ON public.voice_settings
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can view all voice settings" ON public.voice_settings
  FOR SELECT TO authenticated USING (is_admin());