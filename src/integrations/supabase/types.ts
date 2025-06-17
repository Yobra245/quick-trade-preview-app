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
      api_credentials: {
        Row: {
          api_key: string
          created_at: string
          exchange: string
          id: string
          is_active: boolean | null
          passphrase: string | null
          sandbox_mode: boolean | null
          secret_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          exchange: string
          id?: string
          is_active?: boolean | null
          passphrase?: string | null
          sandbox_mode?: boolean | null
          secret_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          exchange?: string
          id?: string
          is_active?: boolean | null
          passphrase?: string | null
          sandbox_mode?: boolean | null
          secret_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_usage_log: {
        Row: {
          created_at: string
          endpoint: string
          exchange: string
          id: string
          last_request_at: string
          request_count: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          exchange: string
          id?: string
          last_request_at?: string
          request_count?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          exchange?: string
          id?: string
          last_request_at?: string
          request_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      live_orders: {
        Row: {
          average_fill_price: number | null
          created_at: string
          exchange: string
          exchange_order_id: string | null
          filled_at: string | null
          filled_quantity: number | null
          id: string
          order_type: string
          price: number | null
          quantity: number
          side: string
          status: string
          stop_price: number | null
          strategy_id: string | null
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_fill_price?: number | null
          created_at?: string
          exchange: string
          exchange_order_id?: string | null
          filled_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type: string
          price?: number | null
          quantity: number
          side: string
          status?: string
          stop_price?: number | null
          strategy_id?: string | null
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_fill_price?: number | null
          created_at?: string
          exchange?: string
          exchange_order_id?: string | null
          filled_at?: string | null
          filled_quantity?: number | null
          id?: string
          order_type?: string
          price?: number | null
          quantity?: number
          side?: string
          status?: string
          stop_price?: number | null
          strategy_id?: string | null
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market_data_cache: {
        Row: {
          change_24h: number | null
          change_percentage_24h: number | null
          exchange: string
          id: string
          price: number
          symbol: string
          timestamp: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          change_percentage_24h?: number | null
          exchange: string
          id?: string
          price: number
          symbol: string
          timestamp?: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          change_percentage_24h?: number | null
          exchange?: string
          id?: string
          price?: number
          symbol?: string
          timestamp?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read?: boolean
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          average_price: number | null
          current_value: number | null
          exchange: string | null
          id: string
          last_sync_at: string | null
          last_updated: string
          profit_loss: number | null
          profit_loss_percentage: number | null
          quantity: number
          symbol: string
          user_id: string
        }
        Insert: {
          average_price?: number | null
          current_value?: number | null
          exchange?: string | null
          id?: string
          last_sync_at?: string | null
          last_updated?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          symbol: string
          user_id: string
        }
        Update: {
          average_price?: number | null
          current_value?: number | null
          exchange?: string | null
          id?: string
          last_sync_at?: string | null
          last_updated?: string
          profit_loss?: number | null
          profit_loss_percentage?: number | null
          quantity?: number
          symbol?: string
          user_id?: string
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          condition: string
          created_at: string
          current_price: number | null
          id: string
          is_active: boolean
          symbol: string
          target_price: number
          triggered_at: string | null
          user_id: string
        }
        Insert: {
          condition: string
          created_at?: string
          current_price?: number | null
          id?: string
          is_active?: boolean
          symbol: string
          target_price: number
          triggered_at?: string | null
          user_id: string
        }
        Update: {
          condition?: string
          created_at?: string
          current_price?: number | null
          id?: string
          is_active?: boolean
          symbol?: string
          target_price?: number
          triggered_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      price_history: {
        Row: {
          close_price: number
          created_at: string
          exchange: string
          high_price: number
          id: string
          low_price: number
          open_price: number
          symbol: string
          timeframe: string
          timestamp: string
          volume: number
        }
        Insert: {
          close_price: number
          created_at?: string
          exchange: string
          high_price: number
          id?: string
          low_price: number
          open_price: number
          symbol: string
          timeframe: string
          timestamp: string
          volume: number
        }
        Update: {
          close_price?: number
          created_at?: string
          exchange?: string
          high_price?: number
          id?: string
          low_price?: number
          open_price?: number
          symbol?: string
          timeframe?: string
          timestamp?: string
          volume?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      trades: {
        Row: {
          created_at: string
          exchange: string | null
          exchange_order_id: string | null
          executed_price: number | null
          fees: number | null
          filled_at: string | null
          id: string
          order_type: string | null
          price: number
          quantity: number
          side: string
          status: string
          strategy_id: string | null
          symbol: string
          time_in_force: string | null
          total_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          exchange?: string | null
          exchange_order_id?: string | null
          executed_price?: number | null
          fees?: number | null
          filled_at?: string | null
          id?: string
          order_type?: string | null
          price: number
          quantity: number
          side: string
          status?: string
          strategy_id?: string | null
          symbol: string
          time_in_force?: string | null
          total_amount: number
          user_id: string
        }
        Update: {
          created_at?: string
          exchange?: string | null
          exchange_order_id?: string | null
          executed_price?: number | null
          fees?: number | null
          filled_at?: string | null
          id?: string
          order_type?: string | null
          price?: number
          quantity?: number
          side?: string
          status?: string
          strategy_id?: string | null
          symbol?: string
          time_in_force?: string | null
          total_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      trading_profiles: {
        Row: {
          auto_trading_enabled: boolean | null
          created_at: string
          exchange_api_key: string | null
          exchange_secret_key: string | null
          id: string
          max_position_size: number | null
          preferred_exchange: string | null
          risk_tolerance: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_trading_enabled?: boolean | null
          created_at?: string
          exchange_api_key?: string | null
          exchange_secret_key?: string | null
          id?: string
          max_position_size?: number | null
          preferred_exchange?: string | null
          risk_tolerance?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_trading_enabled?: boolean | null
          created_at?: string
          exchange_api_key?: string | null
          exchange_secret_key?: string | null
          id?: string
          max_position_size?: number | null
          preferred_exchange?: string | null
          risk_tolerance?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_strategies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          parameters: Json | null
          strategy_name: string
          strategy_type: string
          symbols: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          strategy_name: string
          strategy_type: string
          symbols: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          strategy_name?: string
          strategy_type?: string
          symbols?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_market_data_cache: {
        Args: {
          p_symbol: string
          p_exchange: string
          p_price: number
          p_volume_24h?: number
          p_change_24h?: number
          p_change_percentage_24h?: number
        }
        Returns: undefined
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
