import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import { useReferrals } from "@/hooks/useReferrals";
import { Users, DollarSign, Copy, Share2 } from "lucide-react";
import { toast } from "sonner";

export function ReferralCard() {
  const { profile } = useProfile();
  const { stats, loading } = useReferrals();

  const copyReferralCode = () => {
    if (profile?.referral_code) {
      navigator.clipboard.writeText(profile.referral_code);
      toast.success("Referral code copied!");
    }
  };

  const shareReferral = () => {
    if (!profile?.referral_code) return;
    
    const message = `🚀 Start mining crypto on your phone with AfriMine!\n\n💰 Use my code: ${profile.referral_code}\n\nEarn while you sleep - even on solar power! ☀️\n\n👉 ${window.location.origin}/onboarding?ref=${profile.referral_code}`;
    
    if (navigator.share) {
      navigator.share({
        title: "Join AfriMine",
        text: message,
      });
    } else {
      navigator.clipboard.writeText(message);
      toast.success("Share message copied to clipboard!");
    }
  };

  const shareToWhatsApp = () => {
    if (!profile?.referral_code) return;
    const message = encodeURIComponent(`🚀 Start mining crypto on your phone with AfriMine!\n\n💰 Use my code: ${profile.referral_code}\n\nEarn while you sleep - even on solar power! ☀️\n\n👉 ${window.location.origin}/onboarding?ref=${profile.referral_code}`);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const shareToTelegram = () => {
    if (!profile?.referral_code) return;
    const message = encodeURIComponent(`🚀 Start mining crypto on your phone with AfriMine!\n\n💰 Use my code: ${profile.referral_code}\n\nEarn while you sleep - even on solar power! ☀️\n\n👉 ${window.location.origin}/onboarding?ref=${profile.referral_code}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${message}`, "_blank");
  };

  if (loading || !profile) {
    return (
      <Card className="p-6 bg-card border-border animate-pulse">
        <div className="h-32 bg-secondary rounded" />
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Referral Earnings
        </h3>
        <Button variant="ghost" size="sm" onClick={copyReferralCode}>
          <Copy className="w-4 h-4 mr-2" />
          {profile.referral_code}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-secondary rounded-lg text-center">
          <div className="text-2xl font-bold text-foreground">{stats.totalInvited}</div>
          <div className="text-xs text-muted-foreground">People Invited</div>
        </div>
        <div className="p-4 bg-secondary rounded-lg text-center">
          <div className="text-2xl font-bold text-accent flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
            {stats.totalEarnings.toFixed(4)}
          </div>
          <div className="text-xs text-muted-foreground">Referral Earnings</div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground mb-4 space-y-1">
        <p>• Tier 1 (direct): 15% of their mining rewards forever</p>
        <p>• Tier 2 (their invites): 5% of mining rewards</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={shareToWhatsApp}
        >
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={shareToTelegram}
        >
          Telegram
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={shareReferral}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
