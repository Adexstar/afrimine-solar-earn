import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DollarSign, Lock, ArrowRightLeft, Loader2 } from "lucide-react";

interface DualBalanceCardProps {
  balanceUsd: number;
  pendingRewards: number;
  onConverted?: () => void;
}

export function DualBalanceCard({ balanceUsd, pendingRewards, onConverted }: DualBalanceCardProps) {
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    try {
      const { data, error } = await (supabase.rpc as any)("convert_pending_rewards", {
        _user_id: (await supabase.auth.getUser()).data.user?.id,
      });
      if (error) throw error;
      const converted = Number(data) || 0;
      if (converted > 0) {
        toast.success(`$${converted.toFixed(4)} unlocked to your balance!`);
        onConverted?.();
      } else {
        toast.info("No rewards to convert yet.");
      }
    } catch (err: any) {
      toast.error(err.message || "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  return (
    <Card className="p-5 bg-card border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <div className="relative space-y-4">
        {/* Mining Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Mining Balance</p>
              <p className="text-xl font-bold font-mono text-foreground">${balanceUsd.toFixed(4)}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-success/20 text-success font-semibold">Withdrawable</span>
        </div>

        {/* Bonus Balance */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-accent" />
            <div>
              <p className="text-xs text-muted-foreground">Bonus Balance</p>
              <p className="text-xl font-bold font-mono text-foreground">${pendingRewards.toFixed(2)}</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-1 rounded-full bg-accent/20 text-accent font-semibold">Locked 🔒</span>
        </div>

        {/* Convert Button */}
        {pendingRewards > 0 && (
          <Button
            onClick={handleConvert}
            disabled={converting}
            variant="outline"
            className="w-full border-accent text-accent hover:bg-accent/10"
          >
            {converting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowRightLeft className="w-4 h-4 mr-2" />
            )}
            Convert 20% to Withdrawable
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground text-center">
          Locked rewards convert at 20%. Mine, streak, or invite to unlock.
        </p>
      </div>
    </Card>
  );
}
