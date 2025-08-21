-- Check what other functions need search path fixes and update them

-- Fix log_auth_event function
CREATE OR REPLACE FUNCTION public.log_auth_event(event_type text, user_email text DEFAULT NULL::text, ip_address text DEFAULT NULL::text, user_agent text DEFAULT NULL::text, details jsonb DEFAULT NULL::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  -- In production, this would insert into a security_logs table
  -- For now, we'll just ensure the function exists for the auth system
  RAISE LOG 'Security Event - Type: %, Email: %, IP: %, Details: %', 
    event_type, user_email, ip_address, details;
END;
$function$;

-- Fix should_rate_limit function
CREATE OR REPLACE FUNCTION public.should_rate_limit(identifier text, max_attempts integer DEFAULT 5, window_minutes integer DEFAULT 15)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  attempt_count integer;
  window_start timestamp;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- In a full implementation, this would check a rate_limit_attempts table
  -- For now, return false (no rate limiting) but structure is in place
  RETURN false;
END;
$function$;