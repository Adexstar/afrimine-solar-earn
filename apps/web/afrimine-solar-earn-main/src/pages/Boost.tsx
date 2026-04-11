import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useBoost } from "@/hooks/useBoost";
import { toast } from "sonner";
import { ArrowLeft, Zap, Crown, Star, Timer } from "lucide-react";

const TIERS = [
  { key: "bronze", label: "Bronze", multiplier: 2, price: 0.99, icon: Zap, color: "text-amber-600" },
  { key: "silver", label: "Silver", multiplier: 5, price: 2.99, icon: Star, color: "text-gray-300" },
  { key: "gold", label: "Gold", multiplier: 10, price: 4.99, icon: Crown, color: "text-accent" },
];

const Boost = () => {
  const navigate = useNavigate();
  const { activeBoost, purchaseBoost } = useBoost();

  const handlePurchase = async (tier: typeof TIERS[0]) => {
    try {
      await purchaseBoost(tier.key, tier.multiplier, tier.price);
      toast.success(`${tier.label} Boost activated! ${tier.multiplier}x mining for 24h 🚀`);
    } catch {
      toast.error("Failed to purchase boost. Try again.");
    }
  };

  const timeLeft = activeBoost
    ? Math.max(0, Math.floor((new Date(activeBoost.expires_at).getTime() - Date.now()) / 3600000))
    : 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Hash Boost</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-lg">
        {activeBoost && (
          <Card className="p-5 bg-accent/10 border-accent">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-accent" />
              <div>
                <p className="font-bold text-foreground capitalize">{activeBoost.tier} Boost Active</p>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Timer className="w-3.5 h-3.5" />
                  {timeLeft}h remaining • {activeBoost.multiplier}x multiplier
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="space-y-4">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            const isActive = activeBoost?.tier === tier.key;
            return (
              <Card
                key={tier.key}
                className={`p-6 bg-card border-border transition-all ${isActive ? "ring-2 ring-accent" : ""}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${tier.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{tier.label}</h3>
                      <p className="text-sm text-muted-foreground">{tier.multiplier}x mining for 24h</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-accent">${tier.price}</span>
                </div>
                <Button
                  onClick={() => handlePurchase(tier)}
                  disabled={isActive}
                  className="w-full bg-gradient-solar hover:opacity-90"
                >
                  {isActive ? "Active" : `Activate ${tier.label}`}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Boosts multiply your mining earnings for 24 hours. Only the highest active boost applies.
        </p>
      </main>
    </div>
  );
};

export default Boost;
