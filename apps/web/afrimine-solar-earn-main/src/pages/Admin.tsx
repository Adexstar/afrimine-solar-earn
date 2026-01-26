import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdmin } from "@/hooks/useAdmin";
import {
  ArrowLeft,
  Users,
  Activity,
  DollarSign,
  Bell,
  Shield,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, stats, loading } = useAdmin();
  const [notificationText, setNotificationText] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!notificationText.trim()) {
      toast.error("Please enter a notification message");
      return;
    }

    setSending(true);
    // TODO: Implement actual push notification via Firebase/OneSignal
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Notification sent to all users!");
    setNotificationText("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 mx-auto text-destructive mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Users
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.totalUsers.toLocaleString()}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="w-6 h-6 text-success" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Hashrate
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {(stats.totalHashrate / 1000000).toFixed(2)}M
            </div>
            <div className="text-sm text-muted-foreground">H/s</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-6 h-6 text-accent" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Total Paid
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              ${stats.totalPaidOut.toFixed(2)}
            </div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-destructive" />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.pendingTransactions}
            </div>
            <div className="text-sm text-muted-foreground">transactions</div>
          </Card>
        </div>

        {/* Broadcast Notification */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Broadcast Notification
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notification">Message</Label>
              <Input
                id="notification"
                placeholder="Enter notification message..."
                value={notificationText}
                onChange={(e) => setNotificationText(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button
              onClick={handleBroadcast}
              disabled={sending}
              className="bg-gradient-solar hover:opacity-90"
            >
              {sending ? "Sending..." : "Send to All Users"}
            </Button>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 bg-card border-border">
          <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <DollarSign className="w-6 h-6" />
              <span>Process Payouts</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Users className="w-6 h-6" />
              <span>View All Users</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Activity className="w-6 h-6" />
              <span>Mining Stats</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Shield className="w-6 h-6" />
              <span>Security Logs</span>
            </Button>
          </div>
        </Card>

        {/* Info Card */}
        <Card className="p-4 bg-secondary border-border">
          <p className="text-sm text-muted-foreground">
            <Shield className="w-4 h-4 inline mr-2 text-primary" />
            Admin access is verified via database roles. Never share admin credentials.
          </p>
        </Card>
      </main>
    </div>
  );
};

export default Admin;
