import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";
import { ArrowLeft, Gift, CheckCircle2, Video, Share2, Heart, CalendarCheck, UserPlus, Loader2 } from "lucide-react";

const TASK_ICONS: Record<string, any> = {
  video_ad: Video,
  social_follow: Heart,
  share: Share2,
  checkin: CalendarCheck,
  invite: UserPlus,
};

const Tasks = () => {
  const navigate = useNavigate();
  const { tasks, totalBonus, loading, completeTask, isCompleted } = useTasks();

  const handleComplete = async (taskId: string, reward: number, taskType: string) => {
    try {
      await completeTask(taskId, reward);
      toast.success(`+$${reward.toFixed(2)} earned! 🎉`);
    } catch {
      toast.error("Failed to complete task.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Earn Bonus</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6 max-w-lg">
        <Card className="p-5 bg-accent/10 border-accent">
          <div className="flex items-center gap-3">
            <Gift className="w-6 h-6 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Total Bonus Earned</p>
              <p className="text-2xl font-bold text-accent font-mono">${totalBonus.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => {
              const Icon = TASK_ICONS[task.task_type] || Gift;
              const done = isCompleted(task.id);
              return (
                <Card key={task.id} className="p-4 bg-card border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{task.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-accent">+${Number(task.reward_usd).toFixed(2)} <span className="text-[10px] text-muted-foreground font-normal">locked</span></p>
                      {done ? (
                        <div className="flex items-center gap-1 text-success text-xs mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Done
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-1 h-7 text-xs"
                          onClick={() => handleComplete(task.id, Number(task.reward_usd), task.task_type)}
                        >
                          Claim
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Tasks;
