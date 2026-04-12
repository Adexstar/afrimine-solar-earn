
-- Add pending_rewards column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pending_rewards numeric DEFAULT 0;

-- Conversion function (atomic, security definer)
CREATE OR REPLACE FUNCTION public.convert_pending_rewards(_user_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending numeric;
  converted numeric;
BEGIN
  SELECT pending_rewards INTO pending
  FROM profiles WHERE user_id = _user_id FOR UPDATE;

  IF pending IS NULL OR pending <= 0 THEN
    RETURN 0;
  END IF;

  converted := pending * 0.20;

  UPDATE profiles
  SET balance_usd = COALESCE(balance_usd, 0) + converted,
      pending_rewards = pending_rewards - converted,
      updated_at = now()
  WHERE user_id = _user_id;

  RETURN converted;
END;
$$;
