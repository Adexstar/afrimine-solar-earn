import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  reward_usd: number;
  task_type: string;
}

export interface TaskCompletion {
  task_id: string;
  completed_at: string;
  reward_usd: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<TaskCompletion[]>([]);
  const [totalBonus, setTotalBonus] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [tasksRes, completionsRes] = await Promise.all([
      (supabase as any).from("tasks").select("*").eq("is_active", true),
      (supabase as any)
        .from("task_completions")
        .select("task_id, completed_at, reward_usd")
        .eq("user_id", session.user.id),
    ]);

    setTasks((tasksRes.data as Task[]) || []);
    const comps = (completionsRes.data as TaskCompletion[]) || [];
    setCompletions(comps);
    setTotalBonus(comps.reduce((sum, c) => sum + Number(c.reward_usd), 0));
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const completeTask = async (taskId: string, rewardUsd: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // Insert task completion
    const { error } = await (supabase as any).from("task_completions").insert({
      user_id: session.user.id,
      task_id: taskId,
      reward_usd: rewardUsd,
    });
    if (error) throw error;

    // Credit pending_rewards (locked), not balance_usd
    const { data: profileData } = await (supabase as any)
      .from("profiles")
      .select("pending_rewards")
      .eq("user_id", session.user.id)
      .single();
    await (supabase as any)
      .from("profiles")
      .update({ pending_rewards: ((profileData?.pending_rewards as number) ?? 0) + rewardUsd })
      .eq("user_id", session.user.id);

    await fetchData();
  };

  const isCompleted = (taskId: string) => {
    const today = new Date().toDateString();
    return completions.some(
      (c) => c.task_id === taskId && new Date(c.completed_at).toDateString() === today
    );
  };

  return { tasks, completions, totalBonus, loading, completeTask, isCompleted };
}
