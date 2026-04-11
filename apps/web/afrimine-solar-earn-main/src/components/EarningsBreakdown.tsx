import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Zap, Gift } from "lucide-react";

interface EarningsBreakdownProps {
  miningEarnings: number;
  bonusEarnings: number;
  boostMultiplier: number;
  isMining: boolean;
}

export function EarningsBreakdown({
  miningEarnings,
  bonusEarnings,
  boostMultiplier,
  isMining,
}: EarningsBreakdownProps) {
  const boostedMining = miningEarnings * boostMultiplier;
  const total = boostedMining + bonusEarnings;

  return (
    <Card className="p-5 bg-card border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
      <div className="relative space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs text-muted-foreground uppercase tracking-wider font-semibold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            Earnings Breakdown
          </h3>
          {isMining && <TrendingUp className="w-4 h-4 text-success animate-pulse" />}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Mining
              {boostMultiplier > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                  {boostMultiplier}x
                </span>
              )}
            </div>
            <span className="text-sm font-mono font-semibold text-foreground">
              ${boostedMining.toFixed(6)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Gift className="w-3.5 h-3.5 text-accent" />
              Bonus
            </div>
            <span className="text-sm font-mono font-semibold text-foreground">
              ${bonusEarnings.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-border pt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-2xl font-bold font-mono text-accent tabular-nums">
              ${total.toFixed(6)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
