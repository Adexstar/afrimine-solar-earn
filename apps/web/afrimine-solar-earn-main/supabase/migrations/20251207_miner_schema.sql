-- Create profiles table
create table profiles (
  id uuid references auth.users(id) primary key,
  username text,
  device_id text,
  created_at timestamptz default now()
);

-- Create devices table (tracks every device a user logs in from)
create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  device_id text,
  model text,
  platform text,
  last_active timestamptz default now()
);

-- Create mining_sessions table (tracks each mining session)
create table mining_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  device_id text,
  started_at timestamptz default now(),
  stopped_at timestamptz,
  avg_hashrate float8,
  total_hashes numeric,
  status text default 'running'
);

-- Create earnings table (mining credits)
create table earnings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  amount numeric,
  source text default 'mining',
  created_at timestamptz default now()
);

-- Create referrals table
create table referrals (
  id uuid primary key default gen_random_uuid(),
  referrer uuid references auth.users(id),
  referred uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Create withdrawals table (payments/withdrawals)
create table withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  amount numeric,
  method text,
  destination text,
  status text default 'pending',
  created_at timestamptz default now()
);
