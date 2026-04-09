
CREATE OR REPLACE VIEW public.active_miners_count
WITH (security_invoker = true) AS
SELECT count(*) as total_active
FROM public.profiles
WHERE mining_active = true
AND last_heartbeat > (NOW() - INTERVAL '5 minutes');
