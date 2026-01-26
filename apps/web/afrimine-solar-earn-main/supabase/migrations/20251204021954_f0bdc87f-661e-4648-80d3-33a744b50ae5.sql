-- Add device_id column to profiles table for native miner integration
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS device_id TEXT;