import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ReferralCard } from "@/components/ReferralCard";
import { useCluster } from "@/hooks/useCluster";
import { useMinerStatus } from "@/hooks/useMinerStatus";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import {
  Sun,
  Zap,
  DollarSign,
  Wallet,
  Settings,
  Play,
  Square,
  Battery,
  Activity,
  CheckCircle2,
  Users,
} from "lucide-react";

// Mining pool configuration (placeholders for future)
const POOL_URL = "stratum+tcp://pool.example.com:3333";
const WALLET_ADDRESS = "YOUR_WALLET_ADDRESS";

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasBonus } = useCluster();
  const { 
    isMining, 
    currentHashrate, 
    statusMessage, 
    acceptedShares,
    batteryLevel,
    isCharging,
    start, 
    stop 
  } = useMinerStatus();

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const toggleMining = async () => {
    const deviceId = getOrCreateDeviceId();
    
    if (!isMining) {
      // Check battery before starting
      if (batteryLevel < 20 && !isCharging) {
        toast.error("Battery too low! Please charge your device first.");
        return;
      }
      await start(POOL_URL, WALLET_ADDRESS, deviceId);
      toast.success("Mining started!");
    } else {
      await stop();
      toast.info("Mining paused");
    }
  };

  const formatCurrency = (value: number) => {
    return `$${value.toFixed(4)}`;
  };

  // Generate dynamic mining logs based on accepted shares
  const miningLogs = Array.from({ length: Math.min(acceptedShares, 5) }, (_, i) => ({
    time: new Date(Date.now() - i * 8000).toLocaleTimeString(),
    share: `Share #${acceptedShares - i} accepted`,
    status: "success",
  }));

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-solar rounded-full flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AfriMine</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMining ? "bg-success" : "bg-border"}`} />
                <span className="text-xs text-muted-foreground">
                  {statusMessage}
                </span>
                {hasBonus && (
                  <span className="text-xs text-accent font-semibold">+25%</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/cluster")}
            >
              <Users className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/wallet")}
            >
              <Wallet className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Mining Control */}
        <div className="text-center space-y-6">
          <Button
            onClick={toggleMining}
            size="lg"
            className={`w-full max-w-md h-24 text-2xl font-bold transition-all ${
              isMining
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-gradient-solar hover:opacity-90 shadow-glow"
            }`}
          >
            {isMining ? (
              <>
                <Square className="w-8 h-8 mr-3" />
                STOP MINING
              </>
            ) : (
              <>
                <Play className="w-8 h-8 mr-3" />
                START SOLAR MINING
              </>
            )}
          </Button>

          {/* Battery & Solar Status */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border">
              <Battery className={`w-5 h-5 ${batteryLevel > 20 ? "text-success" : "text-destructive"}`} />
              <span className="text-sm font-medium">{batteryLevel}%</span>
            </div>
            {isCharging && (
              <div className="flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full border border-accent">
                <Sun className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Solar Charging</span>
              </div>
            )}
            {hasBonus && (
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full border border-primary">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Cluster Bonus</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Hashrate
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {currentHashrate.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground mt-1">H/s</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Accepted Shares
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {acceptedShares}
            </div>
            <div className="text-sm text-success mt-1">Session total</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-8 h-8 text-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Status
              </span>
            </div>
            <div className="text-xl font-bold text-foreground">
              {statusMessage}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {isMining ? "Active" : "Paused"}
            </div>
          </Card>
        </div>

        {/* Referral Card */}
        <ReferralCard />

        {/* Mining Log */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Mining Activity
          </h2>
          <div className="space-y-3">
            {miningLogs.length > 0 ? (
              miningLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{log.share}</p>
                      <p className="text-xs text-muted-foreground">{log.time}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Start mining to see activity logs
              </p>
            )}
          </div>
        </Card>

        {/* Info Banner */}
        {!isMining && (
          <Card className="p-6 bg-primary/10 border-primary">
            <div className="flex items-start gap-4">
              <Sun className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Smart Battery Protection Active
                </h3>
                <p className="text-sm text-muted-foreground">
                  Mining automatically pauses when battery drops below 20%. For best results,
                  start mining while charging with solar power!
                </p>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
