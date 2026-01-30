export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cluster_members: {
        Row: {
          cluster_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          cluster_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          cluster_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cluster_members_cluster_id_fkey"
            columns: ["cluster_id"]
            isOneToOne: false
            referencedRelation: "clusters"
            referencedColumns: ["id"]
          },
        ]
      }
      clusters: {
        Row: {
          bonus_active: boolean | null
          code: string
          created_at: string
          creator_id: string
          id: string
          max_members: number | null
          name: string
        }
        Insert: {
          bonus_active?: boolean | null
          code: string
          created_at?: string
          creator_id: string
          id?: string
          max_members?: number | null
          name: string
        }
        Update: {
          bonus_active?: boolean | null
          code?: string
          created_at?: string
          creator_id?: string
          id?: string
          max_members?: number | null
          name?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string | null
          device_id: string
          device_model: string | null
          id: string
          is_active: boolean | null
          last_seen_at: string | null
          os_version: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          device_model?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          os_version?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          device_model?: string | null
          id?: string
          is_active?: boolean | null
          last_seen_at?: string | null
          os_version?: string | null
          user_id?: string
        }
        Relationships: []
      }
      mining_rewards: {
        Row: {
          amount_usd: number
          created_at: string
          hashrate: number | null
          id: string
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          hashrate?: number | null
          id?: string
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          hashrate?: number | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          created_at: string | null
          device_id: string
          hashrate: number | null
          id: string
          pool_url: string | null
          shares_accepted: number | null
          shares_rejected: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_id: string
          hashrate?: number | null
          id?: string
          pool_url?: string | null
          shares_accepted?: number | null
          shares_rejected?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_id?: string
          hashrate?: number | null
          id?: string
          pool_url?: string | null
          shares_accepted?: number | null
          shares_rejected?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance_usd: number | null
          created_at: string
          device_id: string | null
          id: string
          language: string | null
          referral_code: string
          referred_by: string | null
          total_earned_usd: number | null
          total_paid_usd: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          balance_usd?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          language?: string | null
          referral_code: string
          referred_by?: string | null
          total_earned_usd?: number | null
          total_paid_usd?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          balance_usd?: number | null
          created_at?: string
          device_id?: string | null
          id?: string
          language?: string | null
          referral_code?: string
          referred_by?: string | null
          total_earned_usd?: number | null
          total_paid_usd?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      referral_earnings: {
        Row: {
          amount_usd: number
          created_at: string
          earner_id: string
          id: string
          percentage: number
          source_reward_id: string
          source_user_id: string
          tier: number
        }
        Insert: {
          amount_usd: number
          created_at?: string
          earner_id: string
          id?: string
          percentage: number
          source_reward_id: string
          source_user_id: string
          tier: number
        }
        Update: {
          amount_usd?: number
          created_at?: string
          earner_id?: string
          id?: string
          percentage?: number
          source_reward_id?: string
          source_user_id?: string
          tier?: number
        }
        Relationships: [
          {
            foreignKeyName: "referral_earnings_source_reward_id_fkey"
            columns: ["source_reward_id"]
            isOneToOne: false
            referencedRelation: "mining_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          invitee_id: string
          inviter_id: string
          tier: number
        }
        Insert: {
          created_at?: string
          id?: string
          invitee_id: string
          inviter_id: string
          tier?: number
        }
        Update: {
          created_at?: string
          id?: string
          invitee_id?: string
          inviter_id?: string
          tier?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount_usd: number
          created_at: string
          external_tx_id: string | null
          id: string
          payout_details: Json
          payout_method: Database["public"]["Enums"]["payout_method"]
          processed_at: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          user_id: string
        }
        Insert: {
          amount_usd: number
          created_at?: string
          external_tx_id?: string | null
          id?: string
          payout_details: Json
          payout_method: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          user_id: string
        }
        Update: {
          amount_usd?: number
          created_at?: string
          external_tx_id?: string | null
          id?: string
          payout_details?: Json
          payout_method?: Database["public"]["Enums"]["payout_method"]
          processed_at?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_cluster_code: { Args: never; Returns: string }
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      payout_method: "mobile_money" | "usdt" | "lightning"
      transaction_status: "pending" | "processing" | "completed" | "failed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      payout_method: ["mobile_money", "usdt", "lightning"],
      transaction_status: ["pending", "processing", "completed", "failed"],
    },
  },
} as const
