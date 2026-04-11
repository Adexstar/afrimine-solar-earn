import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, Globe, LogOut, Copy, Cpu, BatteryCharging } from "lucide-react";

const Settings = () => {
  const [batterySaver, setBatterySaver] = useState(true);
  const [chargeOnly, setChargeOnly] = useState(true);
  const [cpuThrottle, setCpuThrottle] = useState(60);
  const [language, setLanguage] = useState("en");
  const [referralCode] = useState("AFR-XYZ123");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data } = await (supabase as any)
          .from("profiles")
          .select("cpu_throttle, charge_only_mining, language")
          .eq("user_id", user.id)
          .single();
        if (data) {
          setCpuThrottle(data.cpu_throttle ?? 60);
          setChargeOnly(data.charge_only_mining ?? true);
          setLanguage(data.language ?? "en");
        }
      }
    })();
  }, []);

  const saveSetting = async (field: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await (supabase as any)
      .from("profiles")
      .update({ [field]: value })
      .eq("user_id", user.id);
  };

  const handleCpuChange = (val: number[]) => {
    const v = val[0];
    setCpuThrottle(v);
    saveSetting("cpu_throttle", v);
    toast.success(`CPU throttle set to ${v}%`);
  };

  const handleChargeOnlyChange = (v: boolean) => {
    setChargeOnly(v);
    saveSetting("charge_only_mining", v);
    toast.success(v ? "Mine only when charging" : "Mining on battery enabled");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/auth");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base text-foreground font-medium">{userEmail || "Not available"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-4 py-2 bg-secondary rounded-lg text-foreground font-mono">{referralCode}</code>
                <Button variant="outline" size="icon" onClick={copyReferralCode}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Share this code with friends to earn bonus mining power!</p>
            </div>
          </div>
        </Card>

        {/* Device Safety */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Device Safety
          </h2>
          <div className="space-y-6">
            {/* CPU Throttle */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <Label className="text-base font-medium">CPU Throttle: {cpuThrottle}%</Label>
              </div>
              <Slider
                value={[cpuThrottle]}
                onValueCommit={handleCpuChange}
                min={30}
                max={90}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Controls how much CPU power mining uses. Lower = cooler device, less earnings.
              </p>
            </div>

            {/* Charge-only mining */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="w-4 h-4 text-muted-foreground" />
                  <Label htmlFor="charge-only" className="text-base font-medium cursor-pointer">
                    Only Mine When Charging
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground ml-6">
                  Prevents battery drain — recommended for solar users
                </p>
              </div>
              <Switch id="charge-only" checked={chargeOnly} onCheckedChange={handleChargeOnlyChange} />
            </div>

            {/* Battery saver */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="battery-saver" className="text-base font-medium cursor-pointer">
                  Smart Battery Saver
                </Label>
                <p className="text-sm text-muted-foreground">
                  Auto-pause mining when battery below 20%
                </p>
              </div>
              <Switch id="battery-saver" checked={batterySaver} onCheckedChange={setBatterySaver} />
            </div>

            <div className="p-4 bg-primary/10 rounded-lg border border-primary">
              <p className="text-sm text-foreground">
                <strong>Recommended:</strong> Keep CPU at 50-70% and charge-only ON.
                Mining auto-pauses above 50°C.
              </p>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" /> Language & Region
          </h2>
          <div className="space-y-2">
            <Label htmlFor="language">App Language</Label>
            <Select value={language} onValueChange={(v) => { setLanguage(v); saveSetting("language", v); }}>
              <SelectTrigger id="language" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="sw">Kiswahili</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="pid">Pidgin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">About AfriMine</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-foreground">Version:</strong> 1.1.0</p>
            <p>AfriMine is a solar-powered cryptocurrency mining app designed for African users. Mine crypto efficiently, even on solar power.</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">Terms of Service</Button>
              <Button variant="outline" size="sm">Privacy Policy</Button>
            </div>
          </div>
        </Card>

        <Button onClick={handleLogout} variant="destructive" className="w-full" size="lg">
          <LogOut className="w-5 h-5 mr-2" /> Log Out
        </Button>
      </main>
    </div>
  );
};

export default Settings;
