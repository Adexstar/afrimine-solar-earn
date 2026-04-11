import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActiveBoost {
  tier: string;
  multiplier: number;
  expires_at: string;
}

export function useBoost() {
  const [activeBoost, setActiveBoost] = useState<ActiveBoost | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActiveBoost = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await (supabase as any)
      .from("boosts")
      .select("*")
      .eq("user_id", session.user.id)
      .gt("expires_at", new Date().toISOString())
      .order("multiplier", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setActiveBoost({
        tier: data[0].tier,
        multiplier: Number(data[0].multiplier),
        expires_at: data[0].expires_at,
      });
    } else {
      setActiveBoost(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActiveBoost();
    const interval = setInterval(fetchActiveBoost, 60000);
    return () => clearInterval(interval);
  }, []);

  const purchaseBoost = async (tier: string, multiplier: number, amountPaid: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error } = await (supabase as any).from("boosts").insert({
      user_id: session.user.id,
      tier,
      multiplier,
      expires_at,
      amount_paid: amountPaid,
    });

    if (error) throw error;
    await fetchActiveBoost();
  };

  const multiplier = activeBoost?.multiplier ?? 1;

  return { activeBoost, multiplier, loading, purchaseBoost };
}
