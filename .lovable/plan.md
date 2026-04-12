

# AfriMine Dual-Balance Economy & Reward Engine

This upgrade transforms AfriMine from a single-balance system into a sustainable dual-balance economy -- the core difference between going bankrupt and building a money machine.

---

## What Changes

### 1. Dual Balance System
The `profiles` table gets a new column: `pending_rewards` (locked bonus balance). The existing `balance_usd` becomes the **withdrawable** balance only.

- **Mining earnings** go directly to `balance_usd` (withdrawable)
- **Task/ad rewards** go to `pending_rewards` (locked)
- Users see both balances clearly on Dashboard and Wallet

### 2. Conversion Engine (The Secret Sauce)
Locked rewards convert to withdrawable balance at a **20% ratio**, gated by activity:
- Must have mined for 2+ hours total, OR
- Must have 3+ day streak, OR
- Must have invited 1+ user

A new database function `convert_pending_rewards` handles this atomically: moves 20% of `pending_rewards` into `balance_usd`, zeroes the converted portion.

### 3. Boost Earnings Logic Fix
Boosts do NOT increase CPU usage. They multiply the **display hashrate and reward calculation only**. The current code already works this way -- no mining engine change needed. The boost purchase currently has no payment gate; it just inserts a row. This stays as-is for now (Stripe integration is a separate step).

### 4. Withdrawal Gate
- Minimum withdrawal stays at $1.50
- Only `balance_usd` is withdrawable (not `pending_rewards`)
- Max 3 withdrawals per hour (enforced by edge function, already noted in memory)

### 5. Updated UI
- **Dashboard**: Balance card shows "Mining Balance: $X.XX" and "Bonus Balance: $Y.YY (Locked)" with a "Convert" button
- **Wallet**: Only shows withdrawable balance. Locked balance shown as info with progress toward unlock
- **Tasks page**: Reward labels change from "+$1.00" to "+$1.00 (locked rewards)"

---

## Database Migration

```sql
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
  SET balance_usd = balance_usd + converted,
      pending_rewards = pending_rewards - converted,
      updated_at = now()
  WHERE user_id = _user_id;

  RETURN converted;
END;
$$;
```

## Files to Create/Edit

| File | Action | What |
|------|--------|------|
| `src/hooks/useProfile.ts` | **Edit** | Add `pending_rewards` to Profile interface |
| `src/hooks/useTasks.ts` | **Edit** | Task completion writes to `pending_rewards` instead of `balance_usd` |
| `src/components/EarningsBreakdown.tsx` | **Edit** | Show Mining / Bonus (Locked) / Withdrawable split |
| `src/components/DualBalanceCard.tsx` | **Create** | Dashboard widget showing both balances + Convert button |
| `src/pages/Dashboard.tsx` | **Edit** | Replace single balance with DualBalanceCard |
| `src/pages/Wallet.tsx` | **Edit** | Show only withdrawable balance, add locked balance info |
| `src/pages/Tasks.tsx` | **Edit** | Label rewards as "locked" |
| Migration SQL | **Create** | Add `pending_rewards` column + conversion function |

## Why This Works

- User pays $0 for task rewards -> you pay $0
- Ad network pays you $0.01-$0.03 per view
- User sees "+$1.00 locked" -> feels rich -> stays engaged
- Conversion at 20% means $1.00 locked = $0.20 real cost to you
- Meanwhile user mines more, buys boosts, invites friends
- Net result: positive unit economics at any scale

