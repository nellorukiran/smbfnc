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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      item_details: {
        Row: {
          buy_date: string | null
          buy_price: number | null
          created_at: string | null
          cus_id: number | null
          cus_name: string | null
          id: string
          item_name: string | null
          model_name: string | null
          profit: number | null
          saled_price: number | null
          shop_name: string | null
        }
        Insert: {
          buy_date?: string | null
          buy_price?: number | null
          created_at?: string | null
          cus_id?: number | null
          cus_name?: string | null
          id?: string
          item_name?: string | null
          model_name?: string | null
          profit?: number | null
          saled_price?: number | null
          shop_name?: string | null
        }
        Update: {
          buy_date?: string | null
          buy_price?: number | null
          created_at?: string | null
          cus_id?: number | null
          cus_name?: string | null
          id?: string
          item_name?: string | null
          model_name?: string | null
          profit?: number | null
          saled_price?: number | null
          shop_name?: string | null
        }
        Relationships: []
      }
      smb_customer_details: {
        Row: {
          aadhar_number: string | null
          actual_price: number | null
          address: string | null
          advance: number | null
          created_by: string | null
          created_date: string | null
          cust_status: string | null
          customer_id: string
          customer_name: string
          doc_charges: number | null
          due_amount: number | null
          due_time: string | null
          id: string
          interest_amount: number | null
          penalty: number | null
          per_month_due: number | null
          phone_number: string | null
          product_model: string | null
          product_name: string | null
          profit: number | null
          purchase_date: string | null
          purchase_date_str: string | null
          sale_price: number | null
          shop_name: string | null
          total_due_amount: number | null
          total_dues: number | null
          total_profit: number | null
          updated_by: string | null
          updated_date: string | null
        }
        Insert: {
          aadhar_number?: string | null
          actual_price?: number | null
          address?: string | null
          advance?: number | null
          created_by?: string | null
          created_date?: string | null
          cust_status?: string | null
          customer_id: string
          customer_name: string
          doc_charges?: number | null
          due_amount?: number | null
          due_time?: string | null
          id?: string
          interest_amount?: number | null
          penalty?: number | null
          per_month_due?: number | null
          phone_number?: string | null
          product_model?: string | null
          product_name?: string | null
          profit?: number | null
          purchase_date?: string | null
          purchase_date_str?: string | null
          sale_price?: number | null
          shop_name?: string | null
          total_due_amount?: number | null
          total_dues?: number | null
          total_profit?: number | null
          updated_by?: string | null
          updated_date?: string | null
        }
        Update: {
          aadhar_number?: string | null
          actual_price?: number | null
          address?: string | null
          advance?: number | null
          created_by?: string | null
          created_date?: string | null
          cust_status?: string | null
          customer_id?: string
          customer_name?: string
          doc_charges?: number | null
          due_amount?: number | null
          due_time?: string | null
          id?: string
          interest_amount?: number | null
          penalty?: number | null
          per_month_due?: number | null
          phone_number?: string | null
          product_model?: string | null
          product_name?: string | null
          profit?: number | null
          purchase_date?: string | null
          purchase_date_str?: string | null
          sale_price?: number | null
          shop_name?: string | null
          total_due_amount?: number | null
          total_dues?: number | null
          total_profit?: number | null
          updated_by?: string | null
          updated_date?: string | null
        }
        Relationships: []
      }
      smb_customer_transactions: {
        Row: {
          address: string | null
          created_by: string | null
          created_date: string | null
          cust_status: string | null
          customer_id: string
          customer_name: string | null
          due_time: string | null
          id: string
          next_due_amount: number | null
          penalty: number | null
          per_month_due: number | null
          phone_number: string | null
          product_name: string | null
          purchase_date: string | null
          purchase_date_str: string | null
          total_due_amount: number | null
          total_dues: number | null
          updated_by: string | null
          updated_date: string | null
        }
        Insert: {
          address?: string | null
          created_by?: string | null
          created_date?: string | null
          cust_status?: string | null
          customer_id: string
          customer_name?: string | null
          due_time?: string | null
          id?: string
          next_due_amount?: number | null
          penalty?: number | null
          per_month_due?: number | null
          phone_number?: string | null
          product_name?: string | null
          purchase_date?: string | null
          purchase_date_str?: string | null
          total_due_amount?: number | null
          total_dues?: number | null
          updated_by?: string | null
          updated_date?: string | null
        }
        Update: {
          address?: string | null
          created_by?: string | null
          created_date?: string | null
          cust_status?: string | null
          customer_id?: string
          customer_name?: string | null
          due_time?: string | null
          id?: string
          next_due_amount?: number | null
          penalty?: number | null
          per_month_due?: number | null
          phone_number?: string | null
          product_name?: string | null
          purchase_date?: string | null
          purchase_date_str?: string | null
          total_due_amount?: number | null
          total_dues?: number | null
          updated_by?: string | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smb_customer_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "smb_customer_details"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      smb_products: {
        Row: {
          category: string | null
          created_at: string
          default_interest_rate: number | null
          description: string | null
          id: number
          is_active: boolean | null
          product_name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          default_interest_rate?: number | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          product_name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          default_interest_rate?: number | null
          description?: string | null
          id?: number
          is_active?: boolean | null
          product_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      smb_shops: {
        Row: {
          address: string | null
          created_at: string
          id: number
          is_active: boolean | null
          phone_number: string | null
          shop_name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          phone_number?: string | null
          shop_name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: number
          is_active?: boolean | null
          phone_number?: string | null
          shop_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      smb_transactions_history: {
        Row: {
          balance_due: number | null
          created_by: string | null
          created_date: string | null
          customer_id: string
          id: string
          paid_date: string | null
          paid_due: number | null
          transaction_date: string | null
          transaction_id: string
          updated_by: string | null
          updated_date: string | null
        }
        Insert: {
          balance_due?: number | null
          created_by?: string | null
          created_date?: string | null
          customer_id: string
          id?: string
          paid_date?: string | null
          paid_due?: number | null
          transaction_date?: string | null
          transaction_id: string
          updated_by?: string | null
          updated_date?: string | null
        }
        Update: {
          balance_due?: number | null
          created_by?: string | null
          created_date?: string | null
          customer_id?: string
          id?: string
          paid_date?: string | null
          paid_due?: number | null
          transaction_date?: string | null
          transaction_id?: string
          updated_by?: string | null
          updated_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smb_transactions_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "smb_customer_details"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      smb_users: {
        Row: {
          approval_status: string
          created_at: string
          email: string | null
          enabled: boolean | null
          id: string
          phone_number: string | null
          role: string
          updated_at: string
          user_id: string | null
          user_name: string
        }
        Insert: {
          approval_status?: string
          created_at?: string
          email?: string | null
          enabled?: boolean | null
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
          user_name: string
        }
        Update: {
          approval_status?: string
          created_at?: string
          email?: string | null
          enabled?: boolean | null
          id?: string
          phone_number?: string | null
          role?: string
          updated_at?: string
          user_id?: string | null
          user_name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
