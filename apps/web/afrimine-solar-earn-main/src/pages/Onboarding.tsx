import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sun, Zap, DollarSign, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [referralCode, setReferralCode] = useState("");
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1 w-16 rounded-full transition-all ${
                i === step ? "bg-accent" : i < step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="text-center space-y-8">
          {step === 1 && (
            <>
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-solar rounded-full flex items-center justify-center shadow-glow">
                  <Sun className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Earn Crypto
                  <br />
                  <span className="text-accent">While You Sleep</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Turn your phone into a solar-powered crypto miner. Earn real money, even on solar energy.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-4 bg-card rounded-xl border border-border">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Low Power</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <Sun className="w-8 h-8 text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Solar Ready</p>
                </div>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Real Earnings</p>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-gradient-gold rounded-full flex items-center justify-center">
                  <DollarSign className="w-12 h-12 text-background" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  Boost Your Earnings
                </h1>
                <p className="text-lg text-muted-foreground">
                  Have a referral code? Enter it below to get bonus mining power!
                </p>
              </div>
              <div className="space-y-4 mt-8">
                <Input
                  placeholder="Enter referral code (optional)"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="text-center text-lg h-14"
                />
                <p className="text-sm text-muted-foreground">
                  Don't have a code? No problem – skip this step!
                </p>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-4">
                <div className="w-24 h-24 mx-auto bg-primary rounded-full flex items-center justify-center shadow-glow">
                  <Zap className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-foreground">
                  You're Almost
                  <br />
                  <span className="text-primary">Ready to Mine!</span>
                </h1>
                <p className="text-lg text-muted-foreground">
                  Create your account to start earning crypto on your phone today.
                </p>
              </div>
              <div className="grid gap-3 mt-8 text-left">
                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Smart Battery Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically pauses when battery is low
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Solar Optimized</p>
                    <p className="text-sm text-muted-foreground">
                      Full speed when charging with solar
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Easy Cashout</p>
                    <p className="text-sm text-muted-foreground">
                      Withdraw to M-Pesa, USDT, or Bitcoin
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Navigation buttons */}
          <div className="flex gap-3 mt-12">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                size="lg"
              >
                Back
              </Button>
            )}
            <Button
              onClick={() => (step === 3 ? handleComplete() : setStep(step + 1))}
              className="flex-1 bg-gradient-solar hover:opacity-90"
              size="lg"
            >
              {step === 3 ? "Create Account" : "Continue"}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {step === 1 && (
            <button
              onClick={handleComplete}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
            >
              Already have an account? Sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
