import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ArrowLeft, Wallet as WalletIcon, Send, DollarSign, Smartphone, Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const Wallet = () => {
  const { profile, loading: profileLoading } = useProfile();
  const [payoutMethod, setPayoutMethod] = useState("mpesa");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [country, setCountry] = useState("KE");
  const [cashoutLoading, setCashoutLoading] = useState(false);
  const navigate = useNavigate();

  const balance = profile?.balance_usd || 0;
  const minCashout = 1.5;
  const canCashout = balance >= minCashout;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleCashout = async () => {
    if (!canCashout) {
      toast.error(`Minimum cashout amount is $${minCashout}`);
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
          body: {
            amount_usd: balance,
            phone: phoneNumber,
            country,
          },
        });
      } else if (payoutMethod === "usdt") {
        response = await supabase.functions.invoke("cashout-usdt", {
          body: {
            amount_usd: balance,
            tron_address: walletAddress,
          },
        });
      } else {
        response = await supabase.functions.invoke("cashout-lightning", {
          body: { amount_usd: balance },
        });
      }

      if (response.error) {
        throw new Error(response.error.message || "Cashout failed");
      }

      const data = response.data;
      if (data.success) {
        toast.success(data.message || "Cashout request submitted!");
      } else {
        throw new Error(data.error || "Cashout failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process cashout");
    } finally {
      setCashoutLoading(false);
    }
  };

  const calculateReceived = () => {
    const fee = Number(balance) * 0.02; // 2% fee
    return (Number(balance) - fee).toFixed(4);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const convertToLocalCurrency = (usd: number) => {
    // Example conversion rates
    const rates = {
      NGN: 1650,
      KES: 165,
      GHS: 16,
      ZAR: 19,
      XAF: 650,
    };
    return {
      NGN: (usd * rates.NGN).toFixed(2),
      KES: (usd * rates.KES).toFixed(2),
      GHS: (usd * rates.GHS).toFixed(2),
    };
  };

  const localValues = convertToLocalCurrency(balance);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Wallet & Cashout</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Balance Card */}
        <Card className="p-8 bg-gradient-solar border-0 shadow-glow">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
              <WalletIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-white/80 text-sm mb-2">Your Balance</p>
              <h2 className="text-5xl font-bold text-white mb-2">
                ${balance.toFixed(4)}
              </h2>
              <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
                <span>≈ NGN {localValues.NGN}</span>
                <span>•</span>
                <span>≈ KES {localValues.KES}</span>
                <span>•</span>
                <span>≈ GHS {localValues.GHS}</span>
              </div>
            </div>
            <div className="pt-4">
              <p className="text-white/80 text-sm">
                Minimum cashout: <span className="font-semibold">${minCashout}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* Cashout Form */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Send className="w-6 h-6 text-primary" />
            Cash Out
          </h2>

          <div className="space-y-6">
            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Select Payment Method</Label>
              <RadioGroup value={payoutMethod} onValueChange={setPayoutMethod}>
                <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <RadioGroupItem value="mpesa" id="mpesa" />
                  <Label htmlFor="mpesa" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Smartphone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">M-Pesa / Mobile Money</p>
                      <p className="text-sm text-muted-foreground">Instant transfer to your phone</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg border border-border cursor-pointer hover:bg-secondary/80 transition-colors">
                  <RadioGroupItem value="usdt" id="usdt" />
                  <Label htmlFor="usdt" className="flex items-center gap-3 cursor-pointer flex-1">
                    <DollarSign className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-semibold">USDT (TRC-20)</p>
                      <p className="text-sm text-muted-foreground">Low fees, crypto transfer</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-secondary rounded-lg border border-border opacity-50">
                  <RadioGroupItem value="lightning" id="lightning" disabled />
                  <Label htmlFor="lightning" className="flex items-center gap-3 flex-1">
                    <WalletIcon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">Bitcoin Lightning</p>
                      <p className="text-sm text-muted-foreground">Coming soon</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Phone Number Input (M-Pesa) */}
            {payoutMethod === "mpesa" && (
              <div className="space-y-2">
                <Label htmlFor="phone">M-Pesa Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+254 712 345 678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your M-Pesa registered phone number
                </p>
              </div>
            )}

            {/* Wallet Address Input (USDT) */}
            {payoutMethod === "usdt" && (
              <div className="space-y-2">
                <Label htmlFor="wallet">USDT Wallet Address (TRC-20)</Label>
                <Input
                  id="wallet"
                  type="text"
                  placeholder="TXhC..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="h-12 font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Make sure to use a TRC-20 compatible wallet
                </p>
              </div>
            )}

            {/* You'll Receive */}
            <Card className="p-4 bg-primary/10 border-primary">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">You'll receive:</span>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">
                    ${calculateReceived()}
                  </p>
                  <p className="text-xs text-muted-foreground">After 2% fee</p>
                </div>
              </div>
            </Card>

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
                "Request Cashout"
              ) : (
                `Minimum $${minCashout} required`
              )}
            </Button>

            {!canCashout && (
              <p className="text-center text-sm text-muted-foreground">
                Keep mining! You need ${(minCashout - balance).toFixed(4)} more to cash out.
              </p>
            )}
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-secondary border-border">
          <h3 className="font-semibold text-foreground mb-2">Payment Information</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Payments processed within 24 hours</li>
            <li>• Minimum cashout: ${minCashout}</li>
            <li>• 2% processing fee applies</li>
            <li>• M-Pesa transfers are instant</li>
            <li>• USDT transfers take 5-15 minutes</li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default Wallet;
