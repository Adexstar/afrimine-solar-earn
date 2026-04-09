import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, ArrowDownRight } from "lucide-react";

type Withdrawal = {
  id: string;
  amount: number;
  method: string;
  destination: string | null;
  status: string | null;
  created_at: string | null;
};

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  failed: "bg-red-500/20 text-red-400 border-red-500/30",
};

const WithdrawalHistory = () => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await (supabase as any)
        .from("withdrawals")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setWithdrawals((data as unknown as Withdrawal[]) || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 bg-card border-border">
      <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <History className="w-5 h-5 text-accent" />
        Withdrawal History
      </h2>

      {withdrawals.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No withdrawals yet. Cash out to see your history here.
        </p>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w) => (
            <div
              key={w.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground font-mono">
                    -${w.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {w.method} {w.destination ? `• ${w.destination.slice(0, 8)}…` : ""}
                  </p>
                </div>
              </div>
              <div className="text-right space-y-1">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0.5 capitalize ${statusColor[w.status || "pending"]}`}
                >
                  {w.status || "pending"}
                </Badge>
                <p className="text-[10px] text-muted-foreground">
                  {w.created_at
                    ? new Date(w.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default WithdrawalHistory;
