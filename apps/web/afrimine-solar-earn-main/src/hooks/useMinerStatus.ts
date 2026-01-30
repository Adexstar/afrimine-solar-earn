import { useState, useEffect, useCallback, useRef } from "react";
import { startMining, stopMining } from "@/modules/NativeMinerBridge";
import { getDeviceStatus } from "@/miner/deviceManager";
import { useCluster } from "@/hooks/useCluster";

export interface MinerStatus {
  isMining: boolean;
  currentHashrate: number;
  statusMessage: string;
  acceptedShares: number;
  batteryLevel: number;
  isCharging: boolean;
  start: (poolUrl: string, walletAddress: string, deviceId: string) => Promise<void>;
  stop: () => Promise<void>;
}

export function useMinerStatus(): MinerStatus {
  const [isMining, setIsMining] = useState(false);
  const [currentHashrate, setCurrentHashrate] = useState(0);
  const [statusMessage, setStatusMessage] = useState("Idle");
  const [acceptedShares, setAcceptedShares] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [isCharging, setIsCharging] = useState(false);
  
  const { hasBonus } = useCluster();
  const hashrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batteryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update battery status periodically
  useEffect(() => {
    const updateBattery = async () => {
      const status = await getDeviceStatus();
      setBatteryLevel(Math.round(status.batteryLevel * 100));
      setIsCharging(status.isCharging);
    };

    updateBattery();
    batteryIntervalRef.current = setInterval(updateBattery, 10000);

    return () => {
      if (batteryIntervalRef.current) {
        clearInterval(batteryIntervalRef.current);
      }
    };
  }, []);

  // Simulated hashrate increase while mining
  useEffect(() => {
    if (isMining) {
      hashrateIntervalRef.current = setInterval(() => {
        setCurrentHashrate((prev) => {
          // Base hashrate with some variance
          const baseIncrement = 50 + Math.random() * 50;
          const bonus = hasBonus ? 1.25 : 1;
          const newHashrate = Math.min(prev + baseIncrement * bonus, 2000 * bonus);
          return Math.floor(newHashrate);
        });

        // Simulate accepted shares
        if (Math.random() > 0.7) {
          setAcceptedShares((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (hashrateIntervalRef.current) {
        clearInterval(hashrateIntervalRef.current);
      }
      setCurrentHashrate(0);
    }

    return () => {
      if (hashrateIntervalRef.current) {
        clearInterval(hashrateIntervalRef.current);
      }
    };
  }, [isMining, hasBonus]);

  const start = useCallback(async (poolUrl: string, walletAddress: string, deviceId: string) => {
    // Check battery level before starting
    const status = await getDeviceStatus();
    
    if (status.batteryLevel < 0.2 && !status.isCharging) {
      setStatusMessage("Battery too low! Please charge your device.");
      return;
    }

    const success = await startMining(poolUrl, walletAddress, deviceId);
    
    if (success) {
      setIsMining(true);
      setStatusMessage(status.isCharging ? "Mining at full speed (charging)" : "Mining active");
    } else {
      setStatusMessage("Failed to start mining");
    }
  }, []);

  const stop = useCallback(async () => {
    const success = await stopMining();
    
    if (success) {
      setIsMining(false);
      setStatusMessage("Idle");
      setCurrentHashrate(0);
    } else {
      setStatusMessage("Failed to stop mining");
    }
  }, []);

  return {
    isMining,
    currentHashrate,
    statusMessage,
    acceptedShares,
    batteryLevel,
    isCharging,
    start,
    stop,
  };
}
