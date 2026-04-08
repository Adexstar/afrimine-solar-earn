import { Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DailyStreakWidgetProps {
  streak: number;
  isMining: boolean;
}

export function DailyStreakWidget({ streak, isMining }: DailyStreakWidgetProps) {
  const streakLevel = streak >= 30 ? "🔥 Legend" : streak >= 14 ? "⚡ Pro" : streak >= 7 ? "💪 Rising" : "🌱 Starter";
  const bonusPercent = Math.min(streak, 30); // 1% per day, max 30%

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <Flame className="w-5 h-5 text-destructive" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Daily Streak</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">{streak}</span>
            <span className="text-sm text-muted-foreground">days</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-medium">{streakLevel}</span>
          {bonusPercent > 0 && (
            <p className="text-xs text-success font-semibold">+{bonusPercent}% bonus</p>
          )}
        </div>
      </div>
      {isMining && (
        <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent to-success rounded-full transition-all duration-1000"
            style={{ width: `${Math.min((streak / 30) * 100, 100)}%` }}
          />
        </div>
      )}
    </Card>
  );
}
