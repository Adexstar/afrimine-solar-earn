import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ReferralCard } from "@/components/ReferralCard";
import { LiveEarningsCounter } from "@/components/LiveEarningsCounter";
import { ActiveMinersWidget } from "@/components/ActiveMinersWidget";
import { DailyStreakWidget } from "@/components/DailyStreakWidget";
import { useCluster } from "@/hooks/useCluster";
import { useMinerStatus } from "@/hooks/useMinerStatus";
import { useProfile } from "@/hooks/useProfile";
import { useHeartbeat } from "@/hooks/useHeartbeat";
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
  TrendingUp,
  Clock,
  BarChart3,
} from "lucide-react";

const POOL_URL = "stratum+tcp://pool.example.com:3333";
const WALLET_ADDRESS = "YOUR_WALLET_ADDRESS";

const Dashboard = () => {
  const navigate = useNavigate();
  const { hasBonus } = useCluster();
  const { profile } = useProfile();
  const {
    isMining,
    currentHashrate,
    statusMessage,
    acceptedShares,
    batteryLevel,
    isCharging,
    start,
    stop,
  } = useMinerStatus();

  const [sessionEarnings, setSessionEarnings] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);

  // Heartbeat sync
  useHeartbeat(isMining);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/auth");
    });
  }, [navigate]);

  // Session timer
  useEffect(() => {
    if (!isMining) return;
    const timer = setInterval(() => setSessionDuration((p) => p + 1), 1000);
    return () => clearInterval(timer);
  }, [isMining]);

  // Track total hashes
  useEffect(() => {
    if (isMining && currentHashrate > 0) {
      const interval = setInterval(() => {
        setTotalHashes((p) => p + currentHashrate);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isMining, currentHashrate]);

  const handleEarningsUpdate = useCallback((increment: number) => {
    setSessionEarnings((prev) => prev + increment);
  }, []);

  const toggleMining = async () => {
    const deviceId = getOrCreateDeviceId();
    if (!isMining) {
      if (batteryLevel < 20 && !isCharging) {
        toast.error("Battery too low! Please charge your device first.");
        return;
      }
      setSessionEarnings(0);
      setSessionDuration(0);
      setTotalHashes(0);
      await start(POOL_URL, WALLET_ADDRESS, deviceId);
      toast.success("Mining started! ⛏️");
    } else {
      await stop();
      toast.info("Mining paused");
    }
  };

  const formatDuration = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const miningLogs = Array.from({ length: Math.min(acceptedShares, 5) }, (_, i) => ({
    time: new Date(Date.now() - i * 8000).toLocaleTimeString(),
    share: `Share #${acceptedShares - i} accepted`,
  }));

  const dailyStreak = (profile as any)?.daily_streak || 0;

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-solar rounded-full flex items-center justify-center shadow-glow">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AfriMine</h1>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMining ? "bg-success animate-pulse" : "bg-border"}`} />
                <span className="text-xs text-muted-foreground">{statusMessage}</span>
                {hasBonus && <span className="text-xs text-accent font-semibold">+25%</span>}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigate("/cluster")}>
              <Users className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigate("/wallet")}>
              <Wallet className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => navigate("/settings")}>
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-5">
        {/* Mining Control Button */}
        <div className="text-center space-y-4">
          <Button
            onClick={toggleMining}
            size="lg"
            className={`w-full max-w-md h-20 text-xl font-bold transition-all ${
              isMining
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-gradient-solar hover:opacity-90 shadow-glow"
            }`}
          >
            {isMining ? (
              <>
                <Square className="w-7 h-7 mr-3" />
                STOP MINING
              </>
            ) : (
              <>
                <Play className="w-7 h-7 mr-3" />
                START SOLAR MINING
              </>
            )}
          </Button>

          {/* Status Chips */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card rounded-full border border-border text-sm">
              <Battery className={`w-4 h-4 ${batteryLevel > 20 ? "text-success" : "text-destructive"}`} />
              <span className="font-medium">{batteryLevel}%</span>
            </div>
            {isCharging && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 rounded-full border border-accent text-sm">
                <Sun className="w-4 h-4 text-accent" />
                <span className="font-medium text-accent">Solar</span>
              </div>
            )}
            {isMining && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 rounded-full border border-primary text-sm">
                <Clock className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary font-mono">{formatDuration(sessionDuration)}</span>
              </div>
            )}
            {hasBonus && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 rounded-full border border-primary text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">Cluster</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Earnings */}
        <LiveEarningsCounter
          isMining={isMining}
          hashrate={currentHashrate}
          sessionEarnings={sessionEarnings}
          onEarningsUpdate={handleEarningsUpdate}
        />

        {/* Social Proof Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <ActiveMinersWidget />
          <DailyStreakWidget streak={dailyStreak} isMining={isMining} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Hashrate</span>
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {currentHashrate.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">H/s</div>
            {isMining && (
              <Progress value={Math.min((currentHashrate / 2500) * 100, 100)} className="mt-2 h-1.5" />
            )}
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Shares</span>
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {acceptedShares}
            </div>
            <div className="text-xs text-muted-foreground">accepted</div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Total Hashes</span>
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              {totalHashes > 1000000
                ? `${(totalHashes / 1000000).toFixed(1)}M`
                : totalHashes > 1000
                ? `${(totalHashes / 1000).toFixed(1)}K`
                : totalHashes}
            </div>
            <div className="text-xs text-muted-foreground">this session</div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Balance</span>
            </div>
            <div className="text-2xl font-bold text-foreground font-mono">
              ${(profile?.balance_usd || 0).toFixed(4)}
            </div>
            <div className="text-xs text-success">
              +${(profile?.total_earned_usd || 0).toFixed(2)} total
            </div>
          </Card>
        </div>

        {/* Referral Card */}
        <ReferralCard />

        {/* Mining Log */}
        <Card className="p-5 bg-card border-border">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Mining Activity
          </h2>
          <div className="space-y-2">
            {miningLogs.length > 0 ? (
              miningLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
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
          <Card className="p-5 bg-primary/10 border-primary">
            <div className="flex items-start gap-3">
              <Sun className="w-6 h-6 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Smart Battery Protection</h3>
                <p className="text-sm text-muted-foreground">
                  Mining pauses below 20% battery. Charge with solar for best results!
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
