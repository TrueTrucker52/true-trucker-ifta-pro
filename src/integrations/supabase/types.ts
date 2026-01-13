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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      bills_of_lading: {
        Row: {
          bol_image_url: string | null
          bol_number: string
          commodity_description: string | null
          consignee_address: string | null
          consignee_city: string | null
          consignee_name: string
          consignee_state: string | null
          consignee_zip: string | null
          created_at: string
          delivery_date: string | null
          freight_charges: number | null
          id: string
          notes: string | null
          pickup_date: string
          pieces: number | null
          shipper_address: string | null
          shipper_city: string | null
          shipper_name: string
          shipper_state: string | null
          shipper_zip: string | null
          status: string
          trip_id: string | null
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          bol_image_url?: string | null
          bol_number: string
          commodity_description?: string | null
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_name: string
          consignee_state?: string | null
          consignee_zip?: string | null
          created_at?: string
          delivery_date?: string | null
          freight_charges?: number | null
          id?: string
          notes?: string | null
          pickup_date: string
          pieces?: number | null
          shipper_address?: string | null
          shipper_city?: string | null
          shipper_name: string
          shipper_state?: string | null
          shipper_zip?: string | null
          status?: string
          trip_id?: string | null
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          bol_image_url?: string | null
          bol_number?: string
          commodity_description?: string | null
          consignee_address?: string | null
          consignee_city?: string | null
          consignee_name?: string
          consignee_state?: string | null
          consignee_zip?: string | null
          created_at?: string
          delivery_date?: string | null
          freight_charges?: number | null
          id?: string
          notes?: string | null
          pickup_date?: string
          pieces?: number | null
          shipper_address?: string | null
          shipper_city?: string | null
          shipper_name?: string
          shipper_state?: string | null
          shipper_zip?: string | null
          status?: string
          trip_id?: string | null
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bills_of_lading_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_email: string
          customer_name: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string
          stripe_invoice_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_email: string
          customer_name?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_email?: string
          customer_name?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_address: string | null
          company_name: string | null
          company_setup_completed: boolean | null
          created_at: string
          dot_number: string | null
          email: string
          feid_number: string | null
          id: string
          phone: string | null
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_status: string
          subscription_tier: string | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company_address?: string | null
          company_name?: string | null
          company_setup_completed?: boolean | null
          created_at?: string
          dot_number?: string | null
          email: string
          feid_number?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: string
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company_address?: string | null
          company_name?: string | null
          company_setup_completed?: boolean | null
          created_at?: string
          dot_number?: string | null
          email?: string
          feid_number?: string | null
          id?: string
          phone?: string | null
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_status?: string
          subscription_tier?: string | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      receipts: {
        Row: {
          created_at: string
          fuel_tax: number | null
          gallons: number | null
          id: string
          location: string | null
          price_per_gallon: number | null
          raw_ocr_text: string | null
          receipt_date: string
          receipt_image_url: string | null
          receipt_time: string | null
          state_code: string | null
          total_amount: number | null
          updated_at: string
          user_id: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          fuel_tax?: number | null
          gallons?: number | null
          id?: string
          location?: string | null
          price_per_gallon?: number | null
          raw_ocr_text?: string | null
          receipt_date: string
          receipt_image_url?: string | null
          receipt_time?: string | null
          state_code?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          fuel_tax?: number | null
          gallons?: number | null
          id?: string
          location?: string | null
          price_per_gallon?: number | null
          raw_ocr_text?: string | null
          receipt_date?: string
          receipt_image_url?: string | null
          receipt_time?: string | null
          state_code?: string | null
          total_amount?: number | null
          updated_at?: string
          user_id?: string
          vendor?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      test_accounts: {
        Row: {
          account_type: string
          created_at: string
          email: string
          expires_at: string | null
          id: string
          is_active: boolean
          notes: string | null
          password_hash: string
        }
        Insert: {
          account_type?: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          password_hash: string
        }
        Update: {
          account_type?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          password_hash?: string
        }
        Relationships: []
      }
      trip_logs: {
        Row: {
          created_at: string
          date: string
          end_location: string
          id: string
          miles: number
          notes: string | null
          purpose: string
          start_location: string
          updated_at: string
          user_id: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          end_location: string
          id?: string
          miles: number
          notes?: string | null
          purpose: string
          start_location: string
          updated_at?: string
          user_id: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          end_location?: string
          id?: string
          miles?: number
          notes?: string | null
          purpose?: string
          start_location?: string
          updated_at?: string
          user_id?: string
          vehicle_id?: string | null
        }
        Relationships: []
      }
      trip_miles: {
        Row: {
          created_at: string
          id: string
          miles: number
          state_code: string
          trip_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          miles?: number
          state_code: string
          trip_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          miles?: number
          state_code?: string
          trip_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_miles_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          created_at: string
          destination_city: string
          destination_state: string
          destination_zip: string | null
          end_date: string | null
          fuel_cost: number | null
          fuel_gallons: number | null
          id: string
          notes: string | null
          origin_city: string
          origin_state: string
          origin_zip: string | null
          start_date: string
          status: string | null
          total_miles: number | null
          trip_number: string | null
          truck_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination_city: string
          destination_state: string
          destination_zip?: string | null
          end_date?: string | null
          fuel_cost?: number | null
          fuel_gallons?: number | null
          id?: string
          notes?: string | null
          origin_city: string
          origin_state: string
          origin_zip?: string | null
          start_date: string
          status?: string | null
          total_miles?: number | null
          trip_number?: string | null
          truck_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination_city?: string
          destination_state?: string
          destination_zip?: string | null
          end_date?: string | null
          fuel_cost?: number | null
          fuel_gallons?: number | null
          id?: string
          notes?: string | null
          origin_city?: string
          origin_state?: string
          origin_zip?: string | null
          start_date?: string
          status?: string | null
          total_miles?: number | null
          trip_number?: string | null
          truck_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trips_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      trucks: {
        Row: {
          created_at: string
          fuel_type: string | null
          id: string
          ifta_account_number: string | null
          is_active: boolean
          license_plate: string | null
          make: string | null
          model: string | null
          registration_state: string | null
          unit_number: string
          updated_at: string
          user_id: string
          vin: string | null
          year: number | null
        }
        Insert: {
          created_at?: string
          fuel_type?: string | null
          id?: string
          ifta_account_number?: string | null
          is_active?: boolean
          license_plate?: string | null
          make?: string | null
          model?: string | null
          registration_state?: string | null
          unit_number: string
          updated_at?: string
          user_id: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          created_at?: string
          fuel_type?: string | null
          id?: string
          ifta_account_number?: string | null
          is_active?: boolean
          license_plate?: string | null
          make?: string | null
          model?: string | null
          registration_state?: string | null
          unit_number?: string
          updated_at?: string
          user_id?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          active: boolean | null
          created_at: string
          fuel_type: string | null
          id: string
          license_plate: string | null
          make: string | null
          model: string | null
          updated_at: string
          user_id: string
          vehicle_name: string
          vin: string | null
          year: number | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          updated_at?: string
          user_id: string
          vehicle_name: string
          vin?: string | null
          year?: number | null
        }
        Update: {
          active?: boolean | null
          created_at?: string
          fuel_type?: string | null
          id?: string
          license_plate?: string | null
          make?: string | null
          model?: string | null
          updated_at?: string
          user_id?: string
          vehicle_name?: string
          vin?: string | null
          year?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_auth_event: {
        Args: {
          details?: Json
          event_type: string
          ip_address?: string
          user_agent?: string
          user_email?: string
        }
        Returns: undefined
      }
      should_rate_limit: {
        Args: {
          identifier: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      validate_test_account: {
        Args: { email_input: string; password_input: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
