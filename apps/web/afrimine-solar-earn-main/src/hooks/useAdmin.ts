import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AdminStats {
  totalUsers: number;
  totalHashrate: number;
  totalPaidOut: number;
  pendingTransactions: number;
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalHashrate: 0,
    totalPaidOut: 0,
    pendingTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminAndFetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // Check if user has admin role
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!roleData) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        setIsAdmin(true);

        // Fetch admin stats - using service role through RLS
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        const { data: profilesData } = await supabase
          .from("profiles")
          .select("total_paid_usd");

        const totalPaid = profilesData?.reduce((sum, p) => sum + Number(p.total_paid_usd || 0), 0) || 0;

        const { count: pendingCount } = await supabase
          .from("transactions")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setStats({
          totalUsers: userCount || 0,
          totalHashrate: Math.floor(Math.random() * 1000000) + 500000, // Simulated
          totalPaidOut: totalPaid,
          pendingTransactions: pendingCount || 0,
        });
      } catch (err) {
        console.error("Admin check failed:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAdminAndFetchStats();
  }, []);

  return { isAdmin, stats, loading };
}
