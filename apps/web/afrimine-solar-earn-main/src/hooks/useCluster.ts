import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Cluster {
  id: string;
  name: string;
  code: string;
  creator_id: string;
  max_members: number;
  bonus_active: boolean;
  created_at: string;
}

export interface ClusterMember {
  id: string;
  cluster_id: string;
  user_id: string;
  joined_at: string;
}

export function useCluster() {
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [members, setMembers] = useState<ClusterMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCluster = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user is in a cluster
      const { data: membership } = await supabase
        .from("cluster_members")
        .select("cluster_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership) {
        // Fetch cluster details
        const { data: clusterData } = await supabase
          .from("clusters")
          .select("*")
          .eq("id", membership.cluster_id)
          .single();

        if (clusterData) {
          setCluster(clusterData as Cluster);

          // Fetch members
          const { data: membersData } = await supabase
            .from("cluster_members")
            .select("*")
            .eq("cluster_id", clusterData.id);

          setMembers((membersData || []) as ClusterMember[]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch cluster:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCluster();
  }, []);

  const createCluster = async (name: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate unique code
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data: newCluster, error } = await supabase
        .from("clusters")
        .insert({
          name,
          code,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to cluster
      await supabase
        .from("cluster_members")
        .insert({
          cluster_id: newCluster.id,
          user_id: user.id,
        });

      toast.success("Village cluster created!");
      await fetchCluster();
      return newCluster as Cluster;
    } catch (err: any) {
      toast.error(err.message || "Failed to create cluster");
      return null;
    }
  };

  const joinCluster = async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Find cluster by code
      const { data: foundCluster, error: findError } = await supabase
        .from("clusters")
        .select("*")
        .eq("code", code.toUpperCase())
        .single();

      if (findError || !foundCluster) {
        toast.error("Cluster not found");
        return false;
      }

      // Check if cluster is full
      const { count } = await supabase
        .from("cluster_members")
        .select("*", { count: "exact", head: true })
        .eq("cluster_id", foundCluster.id);

      if ((count || 0) >= foundCluster.max_members) {
        toast.error("This cluster is full");
        return false;
      }

      // Join cluster
      const { error: joinError } = await supabase
        .from("cluster_members")
        .insert({
          cluster_id: foundCluster.id,
          user_id: user.id,
        });

      if (joinError) {
        if (joinError.code === "23505") {
          toast.error("You're already in this cluster");
        } else {
          throw joinError;
        }
        return false;
      }

      toast.success(`Joined ${foundCluster.name}!`);
      await fetchCluster();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to join cluster");
      return false;
    }
  };

  const leaveCluster = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !cluster) return false;

      const { error } = await supabase
        .from("cluster_members")
        .delete()
        .eq("cluster_id", cluster.id)
        .eq("user_id", user.id);

      if (error) throw error;

      toast.success("Left the cluster");
      setCluster(null);
      setMembers([]);
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to leave cluster");
      return false;
    }
  };

  return {
    cluster,
    members,
    loading,
    createCluster,
    joinCluster,
    leaveCluster,
    memberCount: members.length,
    hasBonus: cluster?.bonus_active || false,
  };
}
