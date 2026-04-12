/**
 * REFERENCE FILE — Copy to apps/native/src/hooks/usePower.ts
 * Expo battery hook for React Native.
 */

import * as Battery from "expo-battery";
import { useEffect, useState } from "react";

export function usePower() {
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    Battery.getBatteryStateAsync().then((state) => {
      setIsCharging(state === Battery.BatteryState.CHARGING);
    });

    const sub = Battery.addBatteryStateListener(({ batteryState }) => {
      setIsCharging(batteryState === Battery.BatteryState.CHARGING);
    });

    return () => sub.remove();
  }, []);

  return { isCharging };
}
