import { useState, useEffect, useCallback, useRef } from "react";
import { startMining, stopMining } from "@/modules/NativeMinerBridge";
import { getDeviceStatus } from "@/miner/deviceManager";
import { useCluster } from "@/hooks/useCluster";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface MinerStatus {
  isMining: boolean;
  currentHashrate: number;
  statusMessage: string;
  acceptedShares: number;
  batteryLevel: number;
  isCharging: boolean;
  temperature: number;
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
  const [temperature, setTemperature] = useState(0);
  const [cpuThrottle, setCpuThrottle] = useState(60);
  const [chargeOnly, setChargeOnly] = useState(true);

  const { hasBonus } = useCluster();
  const hashrateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const batteryIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load safety settings from profile
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any)
        .from("profiles")
        .select("cpu_throttle, charge_only_mining")
        .eq("user_id", session.user.id)
        .single();
      if (data) {
        setCpuThrottle(data.cpu_throttle ?? 60);
        setChargeOnly(data.charge_only_mining ?? true);
      }
    })();
  }, []);

  // Update battery & temperature periodically
  useEffect(() => {
    const updateBattery = async () => {
      const status = await getDeviceStatus();
      setBatteryLevel(Math.round(status.batteryLevel * 100));
      setIsCharging(status.isCharging);
      // Simulated temperature (real native bridge would provide actual)
      const simTemp = isMining ? 35 + Math.random() * 20 : 30 + Math.random() * 5;
      setTemperature(Math.round(simTemp));
    };

    updateBattery();
    batteryIntervalRef.current = setInterval(updateBattery, 10000);

    return () => {
      if (batteryIntervalRef.current) clearInterval(batteryIntervalRef.current);
    };
  }, [isMining]);

  // Safety auto-pause checks
  useEffect(() => {
    if (!isMining) return;

    // Battery too low
    if (batteryLevel < 20 && !isCharging) {
      toast.warning("Battery below 20% — mining paused to protect your device.");
      setIsMining(false);
      setStatusMessage("Paused: Low battery");
      setCurrentHashrate(0);
      return;
    }

    // Temperature too high
    if (temperature > 50) {
      toast.warning("Device temperature too high — mining throttled to 50%.");
      setStatusMessage("Throttled: High temp");
    }

    // Charge-only mode
    if (chargeOnly && !isCharging) {
      toast.warning("Charge-only mode: plug in to mine.");
      setIsMining(false);
      setStatusMessage("Paused: Not charging");
      setCurrentHashrate(0);
    }
  }, [isMining, batteryLevel, isCharging, temperature, chargeOnly]);

  // Simulated hashrate with throttle
  useEffect(() => {
    if (isMining) {
      hashrateIntervalRef.current = setInterval(() => {
        setCurrentHashrate((prev) => {
          const throttleFactor = temperature > 50 ? 0.5 : cpuThrottle / 100;
          const baseIncrement = (50 + Math.random() * 50) * throttleFactor;
          const bonus = hasBonus ? 1.25 : 1;
          const maxHash = 2000 * bonus * throttleFactor;
          return Math.floor(Math.min(prev + baseIncrement * bonus, maxHash));
        });

        if (Math.random() > 0.7) {
          setAcceptedShares((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (hashrateIntervalRef.current) clearInterval(hashrateIntervalRef.current);
      setCurrentHashrate(0);
    }

    return () => {
      if (hashrateIntervalRef.current) clearInterval(hashrateIntervalRef.current);
    };
  }, [isMining, hasBonus, cpuThrottle, temperature]);

  const start = useCallback(async (poolUrl: string, walletAddress: string, deviceId: string) => {
    const status = await getDeviceStatus();

    if (status.batteryLevel < 0.2 && !status.isCharging) {
      setStatusMessage("Battery too low! Please charge your device.");
      return;
    }

    if (chargeOnly && !status.isCharging) {
      setStatusMessage("Plug in to mine (charge-only mode).");
      toast.info("Enable 'Mine on battery' in Settings to mine without charging.");
      return;
    }

    const success = await startMining(poolUrl, walletAddress, deviceId);

    if (success) {
      setIsMining(true);
      setStatusMessage(status.isCharging ? "Mining at full speed (charging)" : "Mining active");
    } else {
      setStatusMessage("Failed to start mining");
    }
  }, [chargeOnly]);

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
    isMining, currentHashrate, statusMessage, acceptedShares,
    batteryLevel, isCharging, temperature, start, stop,
  };
}
