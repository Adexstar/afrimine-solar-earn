

# AfriMine Growth Engine Upgrade

This plan adds four major systems to transform AfriMine from a basic miner into a Pi/Bee Network-style retention engine with real revenue mechanics and device safety.

---

## What's Being Built

### 1. Paid Hash Boost (Revenue: $1,000+/month at scale)
A purchasable boost that multiplies mining earnings for 24 hours. Three tiers:
- **Bronze** ($0.99) -- 2x multiplier for 24h
- **Silver** ($2.99) -- 5x multiplier for 24h
- **Gold** ($4.99) -- 10x multiplier for 24h

New page `/boost` accessible from Dashboard header. Stores active boosts in a `boosts` database table with expiry tracking. The Dashboard earnings display applies the active multiplier.

### 2. Tasks & Ads System (Income Booster)
A new `/tasks` page where users complete simple actions to earn bonus credits:
- Watch a video ad (+$0.05)
- Follow social media (+$0.10)
- Share on WhatsApp (+$0.08)
- Daily check-in (+$0.02)
- Invite a friend (+$0.25)

New `tasks` database table tracks available tasks and completions. Earnings display shows the breakdown:
```
Mining:  $0.03
Bonus:   $1.20
Total:   $1.23
```

### 3. Pooled Devices
Allow users to link multiple phones to one account for combined hashrate. The existing `devices` table already supports this. New UI section on Dashboard showing "My Devices" with combined hashrate view. Each device contributes to a single earnings pool.

### 4. Enhanced Earnings Display
Replace the single earnings counter with a breakdown card:
- **Mining** earnings (base hashrate * rate)
- **Bonus** earnings (tasks + referrals + boosts + streak)
- **Total** (combined, shown prominently)

### 5. Device Safety (Already Partially Done -- Completing)
The `deviceManager.ts` already has throttling logic. This upgrade wires it into the actual mining loop:
- CPU throttle slider in Settings (default 50-70%)
- "Only mine when charging" toggle (default ON)
- Temperature display on Dashboard when mining
- Auto-pause with toast notification when battery < 20% or temp > 50C

---

## Database Changes (Migration)

```sql
-- Boosts table for paid hash multipliers
CREATE TABLE public.boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier text NOT NULL, -- bronze, silver, gold
  multiplier numeric NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.boosts ENABLE ROW LEVEL SECURITY;
-- RLS: users see/create own boosts, admins see all

-- Tasks table for earn actions
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  reward_usd numeric NOT NULL DEFAULT 0,
  task_type text NOT NULL, -- 'video_ad', 'social_follow', 'share', 'checkin', 'invite'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.task_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  task_id uuid NOT NULL REFERENCES public.tasks(id),
  completed_at timestamptz DEFAULT now(),
  reward_usd numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_completions ENABLE ROW LEVEL SECURITY;
-- RLS: tasks readable by all authenticated, completions per-user

-- Add cpu_throttle and charge_only_mining to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cpu_throttle integer DEFAULT 60,
  ADD COLUMN IF NOT EXISTS charge_only_mining boolean DEFAULT true;
```

## Files to Create/Edit

| File | Action |
|------|--------|
| `src/pages/Boost.tsx` | **Create** -- Paid boost purchase page with 3 tiers |
| `src/pages/Tasks.tsx` | **Create** -- Earn tasks list with completion tracking |
| `src/hooks/useBoost.ts` | **Create** -- Active boost state & multiplier |
| `src/hooks/useTasks.ts` | **Create** -- Task list & completion logic |
| `src/components/EarningsBreakdown.tsx` | **Create** -- Mining/Bonus/Total display |
| `src/components/DevicePool.tsx` | **Create** -- Multi-device status widget |
| `src/components/LiveEarningsCounter.tsx` | **Edit** -- Apply boost multiplier, show breakdown |
| `src/pages/Dashboard.tsx` | **Edit** -- Add boost indicator, device pool, new earnings display, temperature chip, nav to tasks/boost |
| `src/pages/Settings.tsx` | **Edit** -- Add CPU throttle slider, charge-only toggle |
| `src/hooks/useMinerStatus.ts` | **Edit** -- Wire device safety (throttle, charge-only, temp pause) |
| `src/App.tsx` | **Edit** -- Add `/boost` and `/tasks` routes |
| Migration SQL | **Create** -- boosts, tasks, task_completions tables + profile columns |

## Revenue Model Summary
- 50,000 users x $2 avg boost/task spend = **$100,000/month gross**
- 1% platform fee on mining withdrawals = **$1,000/month**
- Referral commissions drive viral growth (15% tier 1, 5% tier 2)
- Task/ad partnerships add external revenue stream

