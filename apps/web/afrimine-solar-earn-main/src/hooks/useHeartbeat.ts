import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getOrCreateDeviceId } from "@/lib/deviceId";

interface HeartbeatOptions {
  isMining: boolean;
  hashrate?: number;
  isCharging?: boolean;
}

export function useHeartbeat({ isMining, hashrate = 0, isCharging = false }: HeartbeatOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const deviceId = getOrCreateDeviceId();

        // Update profile heartbeat
        await supabase
          .from("profiles")
          .update({
            mining_active: true,
            last_heartbeat: new Date().toISOString(),
          } as any)
          .eq("user_id", user.id);

        // Upsert mining session with current stats
        await (supabase
          .from("mining_sessions") as any)
          .upsert({
            user_id: user.id,
            device_id: deviceId,
            hashrate,
            status: isCharging ? "boost" : "normal",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,device_id" });
      } catch {
        // Silently fail if columns don't exist yet
      }
    };

    const stopHeartbeat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("profiles")
          .update({ mining_active: false } as any)
          .eq("user_id", user.id);

        // Mark session idle
        const deviceId = getOrCreateDeviceId();
        await (supabase
          .from("mining_sessions") as any)
          .upsert({
            user_id: user.id,
            device_id: deviceId,
            hashrate: 0,
            status: "idle",
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id,device_id" });
      } catch {
        // Silently fail
      }
    };

    if (isMining) {
      sendHeartbeat();
      intervalRef.current = setInterval(sendHeartbeat, 5000);
    } else {
      stopHeartbeat();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMining, hashrate, isCharging]);
}
