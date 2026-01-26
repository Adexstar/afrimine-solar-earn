/**
 * AfriMine - Device Manager
 * 
 * Handles device status monitoring and smart mining intensity adjustment
 * based on battery level, charging status, and temperature.
 */

export interface DeviceStatus {
  batteryLevel: number; // 0-100
  isCharging: boolean;
  isSolarCharging: boolean; // Detected based on charging patterns
  temperature: number; // Celsius
  cpuUsage: number; // 0-100
}

export interface MiningIntensityConfig {
  level: number; // 0-100
  reason: string;
}

/**
 * Adjusts mining intensity based on device conditions
 * 
 * Rules:
 * - Battery < 20% and not charging → Stop mining (0%)
 * - Battery < 40% and not charging → Low intensity (30%)
 * - Temperature > 50°C → Reduce by 50%
 * - Temperature > 55°C → Stop mining (0%)
 * - Charging (any source) → Full speed (100%)
 * - Solar charging detected → Full speed (100%) + notify user
 */
export function adjustMiningIntensity(status: DeviceStatus): MiningIntensityConfig {
  // Critical temperature check
  if (status.temperature > 55) {
    return {
      level: 0,
      reason: "Device too hot (>55°C). Mining stopped for safety.",
    };
  }

  // Critical battery check
  if (status.batteryLevel < 20 && !status.isCharging) {
    return {
      level: 0,
      reason: "Battery too low (<20%). Please charge your device.",
    };
  }

  // If charging, go full speed (unless too hot)
  if (status.isCharging) {
    if (status.temperature > 50) {
      return {
        level: 50,
        reason: status.isSolarCharging
          ? "Solar charging but device warm (50°C). Mining at 50%."
          : "Charging but device warm (50°C). Mining at 50%.",
      };
    }

    return {
      level: 100,
      reason: status.isSolarCharging
        ? "🌞 Solar charging detected! Mining at full speed."
        : "Charging. Mining at full speed.",
    };
  }

  // Not charging scenarios
  if (status.temperature > 50) {
    return {
      level: 30,
      reason: "Device warm (>50°C) and not charging. Mining at 30%.",
    };
  }

  if (status.batteryLevel < 40) {
    return {
      level: 30,
      reason: "Battery below 40%. Mining at reduced intensity (30%).",
    };
  }

  // Normal conditions
  return {
    level: 70,
    reason: "Normal conditions. Mining at 70% to preserve battery.",
  };
}

/**
 * Gets device status using Web APIs
 * Falls back to simulated values if APIs are not available
 */
export async function getDeviceStatus(): Promise<DeviceStatus> {
  try {
    // Try to use Battery Status API
    // @ts-ignore - Battery API is not in all TypeScript definitions
    const battery = await navigator.getBattery?.();

    if (battery) {
      return {
        batteryLevel: Math.floor(battery.level * 100),
        isCharging: battery.charging,
        isSolarCharging: battery.charging && detectSolarCharging(battery),
        temperature: estimateTemperature(),
        cpuUsage: 0, // Not available via Web APIs
      };
    }
  } catch (error) {
    console.log("Battery API not available, using simulated values");
  }

  // Fallback: simulated values for development/testing
  return {
    batteryLevel: Math.floor(Math.random() * 30) + 70, // 70-100%
    isCharging: Math.random() > 0.5,
    isSolarCharging: Math.random() > 0.7,
    temperature: Math.floor(Math.random() * 15) + 35, // 35-50°C
    cpuUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
  };
}

/**
 * Attempts to detect solar charging based on charging patterns
 * Solar charging typically shows slower, more variable charging rates
 */
function detectSolarCharging(battery: any): boolean {
  // This is a heuristic - in production, you might:
  // 1. Monitor charging rate over time
  // 2. Detect slow/variable charging patterns
  // 3. Use ambient light sensor if available
  // 4. Let user manually indicate solar charging

  // For now, we'll use a simple random simulation
  return Math.random() > 0.6;
}

/**
 * Estimates device temperature
 * Real implementation would use device sensors if available
 */
function estimateTemperature(): number {
  // In production, this could:
  // 1. Monitor CPU frequency scaling
  // 2. Use device temperature sensors (if exposed via API)
  // 3. Estimate based on battery discharge rate
  // 4. Use thermal throttling indicators

  // Simulated temperature between 35-50°C
  return Math.floor(Math.random() * 15) + 35;
}

/**
 * Monitor device status continuously and call callback with updates
 */
export function monitorDeviceStatus(
  callback: (status: DeviceStatus) => void,
  intervalMs: number = 5000
): () => void {
  const interval = setInterval(async () => {
    const status = await getDeviceStatus();
    callback(status);
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}
