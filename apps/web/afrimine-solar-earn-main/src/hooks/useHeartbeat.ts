import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useHeartbeat(isMining: boolean) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
          .from("profiles")
          .update({
            mining_active: true,
            last_heartbeat: new Date().toISOString(),
          } as any)
          .eq("user_id", user.id);
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
      } catch {
        // Silently fail
      }
    };

    if (isMining) {
      sendHeartbeat();
      intervalRef.current = setInterval(sendHeartbeat, 30000);
    } else {
      stopHeartbeat();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMining]);
}
