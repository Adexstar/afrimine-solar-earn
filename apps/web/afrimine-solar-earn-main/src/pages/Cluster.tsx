import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCluster } from "@/hooks/useCluster";
import {
  ArrowLeft,
  Users,
  Plus,
  QrCode,
  Zap,
  Crown,
  Copy,
  Share2,
} from "lucide-react";
import { toast } from "sonner";

const Cluster = () => {
  const navigate = useNavigate();
  const { cluster, members, loading, createCluster, joinCluster, leaveCluster, hasBonus } = useCluster();
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [clusterName, setClusterName] = useState("");
  const [joinCode, setJoinCode] = useState("");

  const handleCreate = async () => {
    if (!clusterName.trim()) {
      toast.error("Please enter a cluster name");
      return;
    }
    await createCluster(clusterName);
    setShowCreate(false);
    setClusterName("");
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      toast.error("Please enter a cluster code");
      return;
    }
    await joinCluster(joinCode);
    setShowJoin(false);
    setJoinCode("");
  };

  const copyCode = () => {
    if (cluster?.code) {
      navigator.clipboard.writeText(cluster.code);
      toast.success("Code copied!");
    }
  };

  const shareCluster = () => {
    if (cluster) {
      const message = `Join my AfriMine Village Cluster! 🏘️⛏️\n\nCluster: ${cluster.name}\nCode: ${cluster.code}\n\nEarn +25% bonus hashrate when we have 5+ members!\n\nDownload: ${window.location.origin}`;
      
      if (navigator.share) {
        navigator.share({ text: message });
      } else {
        navigator.clipboard.writeText(message);
        toast.success("Share message copied!");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
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
          <h1 className="text-xl font-bold text-foreground">Village Cluster</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {cluster ? (
          <>
            {/* Cluster Info Card */}
            <Card className="p-8 bg-gradient-solar border-0 shadow-glow">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{cluster.name}</h2>
                  <div className="flex items-center justify-center gap-2 text-white/80">
                    <QrCode className="w-4 h-4" />
                    <span className="font-mono text-lg">{cluster.code}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white/80 hover:text-white h-8 w-8"
                      onClick={copyCode}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                {hasBonus && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full">
                    <Zap className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-accent">+25% Hashrate Bonus Active!</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Members */}
            <Card className="p-6 bg-card border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Members ({members.length}/{cluster.max_members})
                </h3>
                <Button variant="outline" size="sm" onClick={shareCluster}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {member.user_id === cluster.creator_id ? "Cluster Creator" : `Member ${index + 1}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {member.user_id === cluster.creator_id && (
                      <Crown className="w-5 h-5 text-accent" />
                    )}
                  </div>
                ))}
              </div>

              {members.length < 5 && (
                <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-foreground">
                    <Zap className="w-4 h-4 inline mr-2 text-primary" />
                    Invite {5 - members.length} more members to unlock the <strong>+25% hashrate bonus!</strong>
                  </p>
                </div>
              )}
            </Card>

            {/* Leave Button */}
            <Button
              variant="outline"
              className="w-full text-destructive border-destructive hover:bg-destructive/10"
              onClick={leaveCluster}
            >
              Leave Cluster
            </Button>
          </>
        ) : (
          <>
            {/* No Cluster - Create or Join */}
            <Card className="p-8 text-center bg-card border-border">
              <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Join a Village Cluster</h2>
              <p className="text-muted-foreground mb-6">
                Team up with friends and neighbors! When your cluster has 5+ members, 
                everyone gets a <strong className="text-accent">+25% hashrate bonus</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-solar hover:opacity-90"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Cluster
                </Button>
                <Button variant="outline" size="lg" onClick={() => setShowJoin(true)}>
                  <QrCode className="w-5 h-5 mr-2" />
                  Join with Code
                </Button>
              </div>
            </Card>

            {/* Create Modal */}
            {showCreate && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Create Your Cluster</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="clusterName">Cluster Name</Label>
                    <Input
                      id="clusterName"
                      placeholder="e.g., Lagos Miners, Nairobi Solar Squad"
                      value={clusterName}
                      onChange={(e) => setClusterName(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreate(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreate} className="bg-gradient-solar hover:opacity-90">
                      Create
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Join Modal */}
            {showJoin && (
              <Card className="p-6 bg-card border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Join a Cluster</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="joinCode">Cluster Code</Label>
                    <Input
                      id="joinCode"
                      placeholder="Enter 8-character code"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="mt-2 font-mono uppercase"
                      maxLength={8}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowJoin(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleJoin} className="bg-gradient-solar hover:opacity-90">
                      Join
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Benefits Card */}
            <Card className="p-6 bg-secondary border-border">
              <h3 className="font-semibold text-foreground mb-3">Cluster Benefits</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <Zap className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  +25% hashrate bonus when cluster has 5+ members
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  Max 10 members per cluster
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                  Share your code on WhatsApp, Telegram, or TikTok
                </li>
              </ul>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Cluster;
