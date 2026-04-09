
-- Add mining columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mining_active boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_heartbeat timestamptz,
  ADD COLUMN IF NOT EXISTS daily_streak integer DEFAULT 0;

-- Create withdrawals table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  amount numeric(12,4) NOT NULL,
  method text NOT NULL,
  destination text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own withdrawals"
  ON public.withdrawals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawals"
  ON public.withdrawals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all withdrawals"
  ON public.withdrawals FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update withdrawals"
  ON public.withdrawals FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Real-time view for active miners count
CREATE OR REPLACE VIEW public.active_miners_count AS
SELECT count(*) as total_active
FROM public.profiles
WHERE mining_active = true
AND last_heartbeat > (NOW() - INTERVAL '5 minutes');
