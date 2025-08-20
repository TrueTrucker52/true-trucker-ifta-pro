-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the trial reminder function to run every day at 10:00 AM UTC
SELECT cron.schedule(
  'send-trial-reminders-daily',
  '0 10 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://tlvngzfoxpjdltbpmzaz.supabase.co/functions/v1/send-trial-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsdm5nemZveHBqZGx0YnBtemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMDAwNTcsImV4cCI6MjA2ODc3NjA1N30.m3ko_uTf9fNUKSsZFkUV6LFyLDEg0sp67G_g3fVMRxA"}'::jsonb,
      body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);