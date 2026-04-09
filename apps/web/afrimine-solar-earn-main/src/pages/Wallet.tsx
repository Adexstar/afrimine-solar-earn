import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import {
  ArrowLeft,
  Wallet as WalletIcon,
  Send,
  DollarSign,
  Smartphone,
  Loader2,
  History,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import WithdrawalHistory from "@/components/WithdrawalHistory";

const QUICK_AMOUNTS = [5, 10, 25, 50];

const Wallet = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [payoutMethod, setPayoutMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const navigate = useNavigate();

  const balance = profile?.balance_usd || 0;
  const minCashout = 1.5;
  const amount = Number(withdrawAmount) || 0;
  const fee = amount * 0.02;
  const received = amount - fee;
  const canCashout = amount >= minCashout && amount <= balance;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  const handleCashout = async () => {
    if (amount < minCashout) {
      toast.error(`Minimum cashout amount is $${minCashout}`);
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    if (payoutMethod === "mpesa" && !phoneNumber) {
      toast.error("Please enter your M-Pesa phone number");
      return;
    }
    if (payoutMethod === "usdt" && !walletAddress) {
      toast.error("Please enter your USDT wallet address");
      return;
    }

    setCashoutLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to cash out");
        return;
      }

      let response;
      if (payoutMethod === "mpesa") {
        response = await supabase.functions.invoke("cashout-mobile-money", {
          body: { amount_usd: amount, phone: phoneNumber, country: "KE" },
        });
      } else if (payoutMethod === "usdt") {
        response = await supabase.functions.invoke("cashout-usdt", {
          body: { amount_usd: amount, tron_address: walletAddress },
        });
      } else {
        response = await supabase.functions.invoke("cashout-lightning", {
          body: { amount_usd: amount },
        });
      }

      if (response.error) throw new Error(response.error.message || "Cashout failed");
      const data = response.data;
      if (data.success) {
        toast.success(data.message || "Cashout request submitted!");
        setWithdrawAmount("");
      } else {
        throw new Error(data.error || "Cashout failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process cashout");
    } finally {
      setCashoutLoading(false);
    }
  };

  const convertToLocalCurrency = (usd: number) => ({
    NGN: (usd * 1650).toFixed(2),
    KES: (usd * 165).toFixed(2),
    GHS: (usd * 16).toFixed(2),
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const localValues = convertToLocalCurrency(balance);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-foreground">Wallet & Cashout</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Balance Card */}
        <Card className="p-6 bg-gradient-solar border-0 shadow-glow">
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <WalletIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Your Balance</p>
              <h2 className="text-4xl font-bold text-white font-mono">${balance.toFixed(4)}</h2>
              <div className="flex items-center justify-center gap-3 text-white/60 text-xs mt-2 flex-wrap">
                <span>≈ ₦{localValues.NGN}</span>
                <span>•</span>
                <span>≈ KES {localValues.KES}</span>
                <span>•</span>
                <span>≈ GH₵ {localValues.GHS}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border text-center">
            <TrendingUp className="w-5 h-5 text-success mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="text-lg font-bold text-foreground font-mono">
              ${(profile?.total_earned_usd || 0).toFixed(2)}
            </p>
          </Card>
          <Card className="p-4 bg-card border-border text-center">
            <History className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xs text-muted-foreground">Total Paid</p>
            <p className="text-lg font-bold text-foreground font-mono">
              ${(profile?.total_paid_usd || 0).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Cashout Form */}
        <Card className="p-5 bg-card border-border">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Cash Out
          </h2>

          <div className="space-y-5">
            {/* Amount Input */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Withdrawal Amount (USD)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-14 text-2xl font-mono text-center"
                min={minCashout}
                max={balance}
                step="0.01"
              />
              {/* Quick Select Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <Button
                    key={amt}
                    variant={Number(withdrawAmount) === amt ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWithdrawAmount(String(amt))}
                    disabled={amt > balance}
                    className="font-mono"
                  >
                    ${amt}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => setWithdrawAmount(String(balance))}
              >
                Withdraw All (${balance.toFixed(4)})
              </Button>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Payment Method</Label>
              <RadioGroup value={payoutMethod} onValueChange={setPayoutMethod}>
                <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">M-Pesa / Mobile Money</p>
                      <p className="text-xs text-muted-foreground">Instant transfer</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <RadioGroupItem value="usdt" id="usdt" />
                  <Label htmlFor="usdt" className="flex items-center gap-3 cursor-pointer flex-1">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-semibold text-sm">USDT (TRC-20)</p>
                      <p className="text-xs text-muted-foreground">Low fees</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-secondary rounded-lg border border-border opacity-50">
                  <RadioGroupItem value="lightning" id="lightning" disabled />
                  <Label htmlFor="lightning" className="flex items-center gap-3 flex-1">
                    <Zap className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-sm">Bitcoin Lightning</p>
                      <p className="text-xs text-muted-foreground">Coming soon</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Inputs */}
            {payoutMethod === "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12"
                />
              </div>
            )}
            {payoutMethod === "usdt" && (
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-sm">USDT Wallet Address (TRC-20)</Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="TXhC..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="h-12 font-mono text-sm"
                />
              </div>
            )}

            {/* Fee Breakdown */}
            {amount > 0 && (
              <Card className="p-4 bg-primary/10 border-primary">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono text-foreground">${amount.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fee (2%)</span>
                    <span className="font-mono text-destructive">-${fee.toFixed(4)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-semibold text-foreground">You'll receive</span>
                    <span className="text-xl font-bold font-mono text-success">
                      ${received.toFixed(4)}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Cashout Button */}
            <Button
              onClick={handleCashout}
              disabled={!canCashout || cashoutLoading}
              className="w-full h-14 text-lg bg-gradient-solar hover:opacity-90"
            >
              {cashoutLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : canCashout ? (
                `Withdraw $${amount.toFixed(2)}`
              ) : amount > balance ? (
                "Insufficient balance"
              ) : (
                `Minimum $${minCashout} required`
              )}
            </Button>

            {!canCashout && amount < minCashout && amount > 0 && (
              <p className="text-center text-xs text-muted-foreground">
                Need ${(minCashout - balance).toFixed(4)} more to cash out
              </p>
            )}
          </div>
        </Card>

        {/* Info */}
        <Card className="p-4 bg-secondary border-border">
          <h3 className="font-semibold text-foreground mb-2 text-sm">Payment Info</h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Processed within 24 hours</li>
            <li>• Minimum: ${minCashout} • Fee: 2%</li>
            <li>• M-Pesa: instant • USDT: 5-15 min</li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default Wallet;
