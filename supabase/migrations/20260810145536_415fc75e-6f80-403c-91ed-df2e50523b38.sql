CREATE TABLE public.email_send_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name text NOT NULL,
  run_id uuid NOT NULL,
  recipient_email text NOT NULL,
  user_id uuid,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  error_message text,
  provider_message_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_email_send_log_created_at ON public.email_send_log (created_at DESC);
CREATE INDEX idx_email_send_log_run ON public.email_send_log (job_name, run_id);

GRANT SELECT ON public.email_send_log TO authenticated;
GRANT ALL ON public.email_send_log TO service_role;

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email send log"
ON public.email_send_log
FOR SELECT
TO authenticated
USING (public.is_admin());