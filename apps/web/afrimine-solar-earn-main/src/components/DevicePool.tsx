import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Smartphone, Wifi } from "lucide-react";

interface Device {
  id: string;
  device_id: string;
  device_model: string | null;
  is_active: boolean | null;
  last_seen_at: string | null;
}

export function DevicePool() {
  const [devices, setDevices] = useState<Device[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any)
        .from("devices")
        .select("id, device_id, device_model, is_active, last_seen_at")
        .eq("user_id", session.user.id)
        .order("last_seen_at", { ascending: false });
      setDevices((data as Device[]) || []);
    };
    fetch();
  }, []);

  if (devices.length <= 1) return null;

  const activeCount = devices.filter((d) => d.is_active).length;

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <Smartphone className="w-5 h-5 text-primary" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
          Pooled Devices
        </span>
        <span className="ml-auto text-xs font-bold text-success">{activeCount} active</span>
      </div>
      <div className="space-y-2">
        {devices.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className={`w-3.5 h-3.5 ${d.is_active ? "text-success" : "text-muted-foreground"}`} />
              <span className="text-sm text-foreground">
                {d.device_model || d.device_id.slice(0, 8)}
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              d.is_active
                ? "bg-success/20 text-success"
                : "bg-muted text-muted-foreground"
            }`}>
              {d.is_active ? "Mining" : "Idle"}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
