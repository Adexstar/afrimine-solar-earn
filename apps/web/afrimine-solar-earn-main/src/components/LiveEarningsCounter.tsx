import { useState, useEffect, useRef } from "react";
import { DollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LiveEarningsCounterProps {
  isMining: boolean;
  hashrate: number;
  sessionEarnings: number;
  onEarningsUpdate: (earnings: number) => void;
}

const RATE_PER_HASH = 0.000001; // $0.000001 per hash

export function LiveEarningsCounter({
  isMining,
  hashrate,
  sessionEarnings,
  onEarningsUpdate,
}: LiveEarningsCounterProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isMining && hashrate > 0) {
      intervalRef.current = setInterval(() => {
        const increment = hashrate * RATE_PER_HASH;
        onEarningsUpdate(increment);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isMining, hashrate, onEarningsUpdate]);

  return (
    <Card className="p-6 bg-card border-border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Session Earnings
            </span>
          </div>
          {isMining && (
            <TrendingUp className="w-4 h-4 text-success animate-pulse" />
          )}
        </div>
        <div className="text-4xl font-bold text-foreground font-mono tabular-nums">
          ${sessionEarnings.toFixed(6)}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Rate: ${(hashrate * RATE_PER_HASH).toFixed(6)}/sec
        </div>
      </div>
    </Card>
  );
}
