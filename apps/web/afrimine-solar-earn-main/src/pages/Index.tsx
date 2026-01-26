import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sun, Zap, DollarSign, ArrowRight } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-8">
        <div className="w-32 h-32 mx-auto bg-gradient-solar rounded-full flex items-center justify-center shadow-glow animate-pulse">
          <Sun className="w-16 h-16 text-white" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            AfriMine
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-accent">
            Earn Crypto While You Sleep
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Turn your phone into a solar-powered crypto mining machine. 
            Mine real cryptocurrency with smart battery protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 bg-card rounded-2xl border border-border">
            <Zap className="w-12 h-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Low Power</h3>
            <p className="text-sm text-muted-foreground">
              Optimized for mobile devices with smart battery management
            </p>
          </div>
          <div className="p-6 bg-card rounded-2xl border border-border">
            <Sun className="w-12 h-12 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Solar Ready</h3>
            <p className="text-sm text-muted-foreground">
              Works perfectly with solar charging for maximum efficiency
            </p>
          </div>
          <div className="p-6 bg-card rounded-2xl border border-border">
            <DollarSign className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Real Earnings</h3>
            <p className="text-sm text-muted-foreground">
              Cash out to M-Pesa, USDT, or Bitcoin Lightning
            </p>
          </div>
        </div>

        <Button
          onClick={() => navigate("/onboarding")}
          size="lg"
          className="w-full max-w-md h-16 text-xl bg-gradient-solar hover:opacity-90 shadow-glow"
        >
          Get Started
          <ArrowRight className="ml-2 w-6 h-6" />
        </Button>

        <p className="text-sm text-muted-foreground">
          Join thousands of Africans earning crypto daily
        </p>
      </div>
    </div>
  );
};

export default Index;
