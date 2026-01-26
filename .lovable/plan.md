

# AfriMine Solar Earn - Implementation Plan

## Critical Fix Required (Manual Action)

The `package.json` is missing a `dependencies` field which is causing the build to fail. You need to manually update the root `package.json` to include the required dependencies.

**Replace your current `package.json` with:**

```json
{
  "name": "afrimine-monorepo",
  "private": true,
  "packageManager": "pnpm@9",
  "type": "module",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.10.0",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-radio-group": "^1.3.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@supabase/supabase-js": "^2.86.0",
    "@tanstack/react-query": "^5.83.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.462.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.61.1",
    "react-router-dom": "^6.30.1",
    "sonner": "^1.7.4",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "@types/react": "^18.3.23",
    "@types/react-dom": "^18.3.7",
    "@vitejs/plugin-react-swc": "^3.11.0",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.4.0",
    "vite": "^5.4.19"
  }
}
```

---

## Phase 1: Infrastructure Fixes

### 1.1 Update vite.config.ts
Add port 8080 configuration and path aliases:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./apps/web/afrimine-solar-earn-main/src"),
    },
  },
});
```

### 1.2 Add Missing Config Files
- `postcss.config.js` - PostCSS configuration for Tailwind
- `tailwind.config.ts` - Tailwind configuration with AfriMine theme

---

## Phase 2: Database Enhancements

### 2.1 Enhance Profiles Table
Add columns for social mining features:

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mining_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS daily_streak INTEGER DEFAULT 0;
```

### 2.2 Create Withdrawals Table
New table for user-specified withdrawal amounts:

```sql
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12, 4) NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL,
  payout_details JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" 
  ON public.withdrawals FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own withdrawals" 
  ON public.withdrawals FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

### 2.3 Active Miners Count View
Real-time social proof counter:

```sql
CREATE OR REPLACE VIEW active_miners_count AS
SELECT count(*) as total_active
FROM profiles
WHERE mining_active = true 
AND last_heartbeat > (NOW() - INTERVAL '5 minutes');
```

---

## Phase 3: Dashboard Enhancements

### 3.1 Add Live Earnings Display
Enhance the Dashboard to show:
- **Session Earnings** - Real-time USD counter based on hashrate
- **Today's Earnings** - Accumulated daily earnings
- **Earnings Rate** - USD per hour based on current hashrate
- **Active Miners Counter** - Social proof banner ("12,847 miners active now")

### 3.2 Earnings Calculation Logic
```typescript
// Constants for earnings calculation
const HASH_TO_USD_RATE = 0.000001; // $0.000001 per hash
const UPDATE_INTERVAL_MS = 1000;

// Calculate session earnings
const sessionEarnings = (totalHashes * HASH_TO_USD_RATE);
const earningsPerHour = (currentHashrate * 3600 * HASH_TO_USD_RATE);
```

### 3.3 Enhanced Stats Grid
Add earnings card to the existing stats grid:
- Current Hashrate (existing)
- Accepted Shares (existing)
- Session Earnings (NEW - animated counter)
- Earnings/Hour (NEW)

---

## Phase 4: Wallet Enhancements

### 4.1 Custom Withdrawal Amount Input
Replace the current "full balance" withdrawal with:
- Custom amount input field
- Quick-select buttons: $5, $10, $25, $50, Max
- Balance validation (cannot exceed available balance)
- Minimum withdrawal validation ($1.50)

### 4.2 Transaction History Section
Add withdrawal history display:
- List of recent withdrawals from the new `withdrawals` table
- Status badges (pending, processing, completed, failed)
- Date and amount for each transaction

### 4.3 Fee Calculator
Enhanced fee display:
- Show fee amount based on entered amount
- Net amount after 2% fee
- Real-time calculation as user types

---

## Phase 5: New Hooks

### 5.1 useActiveMiners Hook
Subscribe to the active miners count view for social proof:

```typescript
export function useActiveMiners() {
  // Query active_miners_count view
  // Return total_active count
  // Optional: Subscribe to realtime updates
}
```

### 5.2 useWithdrawals Hook
Manage withdrawal operations:

```typescript
export function useWithdrawals() {
  // createWithdrawal(amount, method, details)
  // getWithdrawalHistory()
  // Rate limiting: max 3 requests per hour
}
```

### 5.3 Enhance useMinerStatus Hook
Add earnings tracking to existing hook:

```typescript
// Add to MinerStatus interface
sessionEarnings: number;
totalHashes: number;
earningsPerHour: number;

// Add heartbeat sync to database
// Update profiles.mining_active and last_heartbeat
```

---

## Phase 6: UI Components

### 6.1 EarningsCounter Component
Animated counter for session earnings display:
- Smooth number animation
- USD formatting with 4 decimal places
- Green glow effect when increasing

### 6.2 ActiveMinersBanner Component
Social proof banner for dashboard:
- Shows "X miners active now"
- Subtle pulse animation
- Updates every 30 seconds

### 6.3 WithdrawalHistory Component
Transaction history list:
- Status badge (pending/completed)
- Amount and method
- Created date
- Expandable details

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `vite.config.ts` | Update | Add port 8080, path aliases |
| `postcss.config.js` | Create | PostCSS configuration |
| `tailwind.config.ts` | Create | Tailwind with AfriMine theme |
| Database Migration | Create | profiles columns + withdrawals table |
| `Dashboard.tsx` | Update | Add earnings display, active miners banner |
| `Wallet.tsx` | Update | Custom amount input, history section |
| `useActiveMiners.ts` | Create | Active miners count hook |
| `useWithdrawals.ts` | Create | Withdrawal management hook |
| `useMinerStatus.ts` | Update | Add earnings tracking, heartbeat sync |
| `EarningsCounter.tsx` | Create | Animated earnings display |
| `ActiveMinersBanner.tsx` | Create | Social proof component |
| `WithdrawalHistory.tsx` | Create | Transaction history list |

---

## Visual Design (Preserved)

All changes will maintain the existing AfriMine Solar theme:
- **Primary**: Emerald green (`hsl(155, 75%, 38%)`)
- **Accent**: Warm gold (`hsl(45, 95%, 58%)`)
- **Background**: Deep charcoal (`hsl(210, 30%, 8%)`)
- **Gradients**: Solar gradient for buttons and cards
- **Effects**: Green glow shadows, glass morphism

