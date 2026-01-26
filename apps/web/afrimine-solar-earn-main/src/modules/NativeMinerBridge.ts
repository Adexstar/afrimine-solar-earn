/**
 * Native Miner Bridge
 * 
 * This module provides the JavaScript/TypeScript interface for a future
 * native Android mining engine. Currently contains placeholder implementations.
 */

export interface MiningConfig {
  poolUrl: string;
  walletAddress: string;
  deviceId: string;
}

/**
 * Start the native mining engine
 * @returns Promise<boolean> - true if mining started successfully
 */
export async function startMining(
  poolUrl: string, 
  walletAddress: string, 
  deviceId: string
): Promise<boolean> {
  console.warn("[NativeMinerBridge] startMining() - Native miner not yet implemented. This is a JS placeholder.");
  console.log(`[NativeMinerBridge] Config: pool=${poolUrl}, wallet=${walletAddress}, device=${deviceId}`);
  return true;
}

/**
 * Stop the native mining engine
 * @returns Promise<boolean> - true if mining stopped successfully
 */
export async function stopMining(): Promise<boolean> {
  console.warn("[NativeMinerBridge] stopMining() - Native miner not yet implemented. This is a JS placeholder.");
  return true;
}
