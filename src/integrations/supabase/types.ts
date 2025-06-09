export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_accounts: {
        Row: {
          created_at: string
          email: string
          id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          wallet_address: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      currencies: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
          symbol: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
          symbol: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
          symbol?: string
        }
        Relationships: []
      }
      exchange_rates: {
        Row: {
          currency: string
          id: number
          rate: number
          updated_at: string
        }
        Insert: {
          currency: string
          id?: number
          rate: number
          updated_at?: string
        }
        Update: {
          currency?: string
          id?: number
          rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      gcoin_price_history: {
        Row: {
          change_24h: number | null
          id: string
          market_cap: number | null
          price: number
          timestamp: string
          volume: number
        }
        Insert: {
          change_24h?: number | null
          id?: string
          market_cap?: number | null
          price?: number
          timestamp?: string
          volume?: number
        }
        Update: {
          change_24h?: number | null
          id?: string
          market_cap?: number | null
          price?: number
          timestamp?: string
          volume?: number
        }
        Relationships: []
      }
      global_transaction_feed: {
        Row: {
          amount: number
          created_at: string
          id: string
          price: number | null
          timestamp: string
          transaction_id: string | null
          transaction_type: string
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          price?: number | null
          timestamp?: string
          transaction_id?: string | null
          transaction_type: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          price?: number | null
          timestamp?: string
          transaction_id?: string | null
          transaction_type?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "global_transaction_feed_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "global_transaction_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Gwallet: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      mining_sessions: {
        Row: {
          amount_earned: number
          claimed: boolean
          created_at: string
          end_time: string
          estimated_earning: number
          id: string
          miner_id: string
          rate_per_second: number
          start_time: string
          user_id: string
        }
        Insert: {
          amount_earned?: number
          claimed?: boolean
          created_at?: string
          end_time: string
          estimated_earning?: number
          id?: string
          miner_id: string
          rate_per_second?: number
          start_time?: string
          user_id: string
        }
        Update: {
          amount_earned?: number
          claimed?: boolean
          created_at?: string
          end_time?: string
          estimated_earning?: number
          id?: string
          miner_id?: string
          rate_per_second?: number
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          created_at: string
          email: string
          id: string
          updated_at: string
          username: string
          wallet_address: string
        }
        Insert: {
          balance?: number
          created_at?: string
          email: string
          id: string
          updated_at?: string
          username: string
          wallet_address: string
        }
        Update: {
          balance?: number
          created_at?: string
          email?: string
          id?: string
          updated_at?: string
          username?: string
          wallet_address?: string
        }
        Relationships: []
      }
      staking_positions: {
        Row: {
          amount: number
          created_at: string
          duration_days: number
          end_date: string
          estimated_reward: number
          id: string
          start_date: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          duration_days: number
          end_date?: string
          estimated_reward: number
          id?: string
          start_date?: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          duration_days?: number
          end_date?: string
          estimated_reward?: number
          id?: string
          start_date?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          description: string | null
          fee: number | null
          id: string
          recipient: string | null
          related_transaction_id: string | null
          sender: string | null
          status: string
          timestamp: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          description?: string | null
          fee?: number | null
          id?: string
          recipient?: string | null
          related_transaction_id?: string | null
          sender?: string | null
          status: string
          timestamp?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          description?: string | null
          fee?: number | null
          id?: string
          recipient?: string | null
          related_transaction_id?: string | null
          sender?: string | null
          status?: string
          timestamp?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action: string
          id: string
          ip_address: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          action: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          action?: string
          id?: string
          ip_address?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      user_login_history: {
        Row: {
          id: string
          ip_address: unknown | null
          login_time: string
          status: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: unknown | null
          login_time?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: unknown | null
          login_time?: string
          status?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_login_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_miners: {
        Row: {
          id: string
          miner_id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          id?: string
          miner_id: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          id?: string
          miner_id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: []
      }
      verify_transaction_pin: {
        Row: {
          created_at: string | null
          pin: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          pin: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          pin?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_mining_rewards: {
        Args: { user_id_param: string; amount_param: number }
        Returns: undefined
      }
      admin_create_profile: {
        Args: {
          p_id: string
          p_wallet_address: string
          p_username: string
          p_email: string
          p_balance?: number
        }
        Returns: undefined
      }
      admin_insert_transaction: {
        Args: { transaction_data: Json }
        Returns: undefined
      }
      admin_search_user: {
        Args: { search_term: string }
        Returns: {
          id: string
          username: string
          email: string
          wallet_address: string
          balance: number
          created_at: string
          last_login: string
          last_ip: unknown
        }[]
      }
      admin_update_balance: {
        Args: { p_user_id: string; p_amount: number }
        Returns: undefined
      }
      admin_update_exchange_rate: {
        Args: { p_currency: string; p_rate: number }
        Returns: undefined
      }
      admin_update_transaction: {
        Args: { p_transaction_id: string; p_user_id: string; p_updates: Json }
        Returns: undefined
      }
      buy_gcoin: {
        Args: { currency_code: string; currency_amount: number }
        Returns: string
      }
      get_admin_session: {
        Args: { admin_email: string; admin_password: string }
        Returns: Json
      }
      get_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          wallet_address: string
          balance: number
          username: string
          email: string
        }[]
      }
      get_user_activity_stats: {
        Args: { days?: number }
        Returns: Json
      }
      process_completed_stakes: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      purchase_miner: {
        Args: { miner_id_param: string; price_param: number }
        Returns: undefined
      }
      sell_gcoin: {
        Args: { gcoin_amount: number; currency_code: string }
        Returns: string
      }
      send_money: {
        Args:
          | { amount: number; recipient_wallet: string; note?: string }
          | {
              amount: number
              recipient_wallet: string
              pin: string
              note?: string
            }
        Returns: string
      }
      stake_gcoin: {
        Args: { amount: number; duration_days: number }
        Returns: string
      }
      unstake_gcoin: {
        Args: { staking_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
