import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, Globe, LogOut, Copy } from "lucide-react";

const Settings = () => {
  const [batterySaver, setBatterySaver] = useState(true);
  const [language, setLanguage] = useState("en");
  const [referralCode] = useState("AFR-XYZ123");
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email || "");
      }
    });
  }, []);

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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-2xl">
        {/* Profile Section */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="text-base text-foreground font-medium">{userEmail || "Not available"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Your Referral Code</Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-4 py-2 bg-secondary rounded-lg text-foreground font-mono">
                  {referralCode}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyReferralCode}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Share this code with friends to earn bonus mining power!
              </p>
            </div>
          </div>
        </Card>

        {/* Mining Settings */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Mining Settings
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Label htmlFor="battery-saver" className="text-base font-medium cursor-pointer">
                  Smart Battery Saver
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically pause mining when battery is below 20%
                </p>
              </div>
              <Switch
                id="battery-saver"
                checked={batterySaver}
                onCheckedChange={setBatterySaver}
              />
            </div>
            <div className="p-4 bg-primary/10 rounded-lg border border-primary">
              <p className="text-sm text-foreground">
                <strong>Recommended:</strong> Keep this enabled to protect your device battery
                and maximize mining efficiency when charging.
              </p>
            </div>
          </div>
        </Card>

        {/* Language Settings */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Language & Region
          </h2>
          <div className="space-y-2">
            <Label htmlFor="language">App Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language" className="w-full">
                <SelectValue />
              </SelectTrigger>
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
            <p>
              <strong className="text-foreground">Version:</strong> 1.0.0 (MVP)
            </p>
            <p>
              AfriMine is a solar-powered cryptocurrency mining app designed for African users.
              Mine crypto efficiently, even on solar power.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                Terms of Service
              </Button>
              <Button variant="outline" size="sm">
                Privacy Policy
              </Button>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </main>
    </div>
  );
};

export default Settings;
