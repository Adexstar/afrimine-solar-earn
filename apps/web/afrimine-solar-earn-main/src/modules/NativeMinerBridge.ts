/**
 * Native Miner Bridge
 * 
 * Detects if running inside a native Android WebView with MinerModule exposed.
 * Falls back to simulation for web preview/development.
 */

declare global {
  interface Window {
    MinerModule?: {
      startMining(wallet: string, pool: string): Promise<boolean>;
      stopMining(): Promise<boolean>;
    };
  }
}

export interface MiningConfig {
  poolUrl: string;
  walletAddress: string;
  deviceId: string;
}

function isNativeAvailable(): boolean {
  return typeof window !== "undefined" && !!window.MinerModule;
}

/**
 * Start the mining engine — native if available, otherwise simulation fallback.
 */
export async function startMining(
  poolUrl: string,
  walletAddress: string,
  deviceId: string
): Promise<boolean> {
  if (isNativeAvailable()) {
    console.log("[NativeMinerBridge] Native MinerModule detected — starting real miner");
    return window.MinerModule!.startMining(walletAddress, poolUrl);
  }

  console.warn("[NativeMinerBridge] startMining() — No native module, using JS simulation");
  console.log(`[NativeMinerBridge] Config: pool=${poolUrl}, wallet=${walletAddress}, device=${deviceId}`);
  return true;
}

/**
 * Stop the mining engine — native if available, otherwise simulation fallback.
 */
export async function stopMining(): Promise<boolean> {
  if (isNativeAvailable()) {
    console.log("[NativeMinerBridge] Native MinerModule detected — stopping real miner");
    return window.MinerModule!.stopMining();
  }

  console.warn("[NativeMinerBridge] stopMining() — No native module, using JS simulation");
  return true;
}

/**
 * Check if native mining engine is available
 */
export function hasNativeMiner(): boolean {
  return isNativeAvailable();
}
