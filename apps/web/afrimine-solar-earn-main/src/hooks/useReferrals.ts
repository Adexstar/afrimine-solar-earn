import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ReferralStats {
  totalInvited: number;
  tier1Count: number;
  tier2Count: number;
  totalEarnings: number;
}

export function useReferrals() {
  const [stats, setStats] = useState<ReferralStats>({
    totalInvited: 0,
    tier1Count: 0,
    tier2Count: 0,
    totalEarnings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferralStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Get referral counts
        const { data: referrals } = await supabase
          .from("referrals")
          .select("tier")
          .eq("inviter_id", user.id);

        const tier1Count = referrals?.filter(r => r.tier === 1).length || 0;
        const tier2Count = referrals?.filter(r => r.tier === 2).length || 0;

        // Get referral earnings
        const { data: earnings } = await supabase
          .from("referral_earnings")
          .select("amount_usd")
          .eq("earner_id", user.id);

        const totalEarnings = earnings?.reduce((sum, e) => sum + Number(e.amount_usd), 0) || 0;

        setStats({
          totalInvited: tier1Count,
          tier1Count,
          tier2Count,
          totalEarnings,
        });
      } catch (err) {
        console.error("Failed to fetch referral stats:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReferralStats();
  }, []);

  return { stats, loading };
}
