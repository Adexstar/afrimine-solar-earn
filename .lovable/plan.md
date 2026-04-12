

# Native Mining Engine Integration

## Important Constraint

Lovable builds and manages the **web UI layer only** (React/Vite). Native Android files (Kotlin, `android/` directory, xmrig binary) must be created in your external development environment (VS Code / Android Studio). This is consistent with the existing architecture strategy.

What I **can** do here is upgrade the web-side bridge, heartbeat, and Dashboard to be fully compatible with the native module once it's wired up.

---

## What This Plan Covers

### 1. Upgraded NativeMinerBridge (Web Side)
Update `NativeMinerBridge.ts` to detect if running inside a native WebView with the real `MinerModule` exposed on `window`. If detected, call the real native methods. Otherwise, fall back to the existing simulation for web preview/development.

### 2. Enhanced Heartbeat with Session Upsert
Update `useHeartbeat.ts` to also upsert the current `mining_sessions` record with hashrate, device_id, and charging status (normal vs boost) every 5 seconds — matching the native heartbeat pattern you described.

### 3. Dashboard Power-Aware Status
Add a "Solar Boost Active" vs "Standard Mining" indicator on the Dashboard that reflects charging state, matching the native UI spec.

### 4. Native Files (For Your VS Code Setup)
I'll create reference scaffold files in the web project at `docs/native-reference/` so you can copy them into your `apps/native/` directory. These are the Kotlin and React Native TypeScript files you listed — provided as documentation, not executed by Lovable.

---

## Files to Change

| File | Action |
|------|--------|
| `src/modules/NativeMinerBridge.ts` | **Edit** — Add native WebView detection + real bridge calls |
| `src/hooks/useHeartbeat.ts` | **Edit** — Add mining_sessions upsert with hashrate & charging status |
| `src/pages/Dashboard.tsx` | **Edit** — Add Solar Boost / Standard Mining label |
| `docs/native-reference/MinerService.kt` | **Create** — Reference Kotlin foreground service |
| `docs/native-reference/MinerModule.kt` | **Create** — Reference React Native bridge module |
| `docs/native-reference/miner.ts` | **Create** — Reference RN bridge TypeScript |
| `docs/native-reference/usePower.ts` | **Create** — Reference Expo battery hook |

No database changes needed — existing tables (`mining_sessions`, `profiles`, `devices`) already support this.

---

## Technical Details

**NativeMinerBridge detection pattern:**
```typescript
declare global {
  interface Window { MinerModule?: { startMining(w: string, p: string): Promise<boolean>; stopMining(): Promise<boolean> } }
}

export async function startMining(poolUrl: string, walletAddress: string, deviceId: string): Promise<boolean> {
  if (window.MinerModule) {
    return window.MinerModule.startMining(walletAddress, poolUrl);
  }
  // existing simulation fallback
  return true;
}
```

**Heartbeat session upsert** (every 5s when mining):
```typescript
await supabase.from("mining_sessions").upsert({
  user_id, device_id, hashrate, status: isCharging ? "boost" : "normal"
}, { onConflict: "user_id,device_id" });
```

