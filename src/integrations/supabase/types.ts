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
      analytics_reports: {
        Row: {
          created_at: string
          fleet_id: string | null
          fuel_by_state: Json
          fuel_cost: number
          fuel_purchased: number
          id: string
          ifta_tax_owed: number
          ifta_tax_paid: number
          miles_by_state: Json
          report_period: string
          total_miles: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          fleet_id?: string | null
          fuel_by_state?: Json
          fuel_cost?: number
          fuel_purchased?: number
          id?: string
          ifta_tax_owed?: number
          ifta_tax_paid?: number
          miles_by_state?: Json
          report_period: string
          total_miles?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          fleet_id?: string | null
          fuel_by_state?: Json
          fuel_cost?: number
          fuel_purchased?: number
          id?: string
          ifta_tax_owed?: number
          ifta_tax_paid?: number
          miles_by_state?: Json
          report_period?: string
          total_miles?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_reports_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
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
      chat_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          message_count: number
          page_context: string | null
          started_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number
          page_context?: string | null
          started_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          message_count?: number
          page_context?: string | null
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_feedback: {
        Row: {
          created_at: string
          feedback_reason: string | null
          id: string
          is_helpful: boolean
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          feedback_reason?: string | null
          id?: string
          is_helpful: boolean
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          feedback_reason?: string | null
          id?: string
          is_helpful?: boolean
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_feedback_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content?: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          device_type: string | null
          id: string
          is_complete: boolean
          onboarding_type: string
          skipped_steps: Json
          started_at: string
          step_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_complete?: boolean
          onboarding_type?: string
          skipped_steps?: Json
          started_at?: string
          step_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          is_complete?: boolean
          onboarding_type?: string
          skipped_steps?: Json
          started_at?: string
          step_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      eld_inspections: {
        Row: {
          created_at: string
          driver_id: string
          fleet_id: string | null
          id: string
          inspection_code: string | null
          inspector_name: string | null
          location: string | null
          notes: string | null
          result: string | null
          transfer_method: string | null
          truck_id: string | null
          violations_found: Json | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          fleet_id?: string | null
          id?: string
          inspection_code?: string | null
          inspector_name?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          transfer_method?: string | null
          truck_id?: string | null
          violations_found?: Json | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          fleet_id?: string | null
          id?: string
          inspection_code?: string | null
          inspector_name?: string | null
          location?: string | null
          notes?: string | null
          result?: string | null
          transfer_method?: string | null
          truck_id?: string | null
          violations_found?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "eld_inspections_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eld_inspections_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      eld_logs: {
        Row: {
          certified_at: string | null
          created_at: string
          driver_id: string
          duration_minutes: number | null
          duty_status: string
          edit_reason: string | null
          edited: boolean | null
          fleet_id: string | null
          id: string
          is_certified: boolean | null
          location_end: string | null
          location_start: string | null
          log_date: string
          notes: string | null
          odometer_end: number | null
          odometer_start: number | null
          original_data: Json | null
          status_end: string | null
          status_start: string
          truck_id: string | null
        }
        Insert: {
          certified_at?: string | null
          created_at?: string
          driver_id: string
          duration_minutes?: number | null
          duty_status?: string
          edit_reason?: string | null
          edited?: boolean | null
          fleet_id?: string | null
          id?: string
          is_certified?: boolean | null
          location_end?: string | null
          location_start?: string | null
          log_date?: string
          notes?: string | null
          odometer_end?: number | null
          odometer_start?: number | null
          original_data?: Json | null
          status_end?: string | null
          status_start?: string
          truck_id?: string | null
        }
        Update: {
          certified_at?: string | null
          created_at?: string
          driver_id?: string
          duration_minutes?: number | null
          duty_status?: string
          edit_reason?: string | null
          edited?: boolean | null
          fleet_id?: string | null
          id?: string
          is_certified?: boolean | null
          location_end?: string | null
          location_start?: string | null
          log_date?: string
          notes?: string | null
          odometer_end?: number | null
          odometer_start?: number | null
          original_data?: Json | null
          status_end?: string | null
          status_start?: string
          truck_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "eld_logs_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eld_logs_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      fleet_members: {
        Row: {
          driver_id: string
          fleet_id: string
          id: string
          invitation_status: string
          joined_at: string
          status: string
          truck_number: string | null
        }
        Insert: {
          driver_id: string
          fleet_id: string
          id?: string
          invitation_status?: string
          joined_at?: string
          status?: string
          truck_number?: string | null
        }
        Update: {
          driver_id?: string
          fleet_id?: string
          id?: string
          invitation_status?: string
          joined_at?: string
          status?: string
          truck_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fleet_members_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      fleets: {
        Row: {
          company_name: string
          created_at: string
          id: string
          invite_code: string
          owner_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          id?: string
          invite_code: string
          owner_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          id?: string
          invite_code?: string
          owner_id?: string
        }
        Relationships: []
      }
      form_drafts: {
        Row: {
          created_at: string
          current_step: number
          form_data: Json
          form_type: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_step?: number
          form_data?: Json
          form_type?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_step?: number
          form_data?: Json
          form_type?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      geofence_events: {
        Row: {
          created_at: string
          driver_id: string
          event_type: string
          fleet_id: string
          geofence_id: string
          id: string
          recorded_at: string
          truck_id: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          event_type: string
          fleet_id: string
          geofence_id: string
          id?: string
          recorded_at?: string
          truck_id: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          event_type?: string
          fleet_id?: string
          geofence_id?: string
          id?: string
          recorded_at?: string
          truck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_events_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_events_geofence_id_fkey"
            columns: ["geofence_id"]
            isOneToOne: false
            referencedRelation: "geofences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "geofence_events_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      geofences: {
        Row: {
          color: string | null
          created_at: string
          created_by: string
          fleet_id: string
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          name: string
          notify_on_enter: boolean | null
          notify_on_exit: boolean | null
          radius_meters: number
          updated_at: string
          zone_type: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by: string
          fleet_id: string
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          name: string
          notify_on_enter?: boolean | null
          notify_on_exit?: boolean | null
          radius_meters?: number
          updated_at?: string
          zone_type?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string
          fleet_id?: string
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          name?: string
          notify_on_enter?: boolean | null
          notify_on_exit?: boolean | null
          radius_meters?: number
          updated_at?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofences_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          category_id: string | null
          content: string
          created_at: string
          helpful_count: number
          id: string
          is_featured: boolean
          is_published: boolean
          not_helpful_count: number
          read_time_minutes: number
          role: string
          slug: string
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          category_id?: string | null
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          not_helpful_count?: number
          read_time_minutes?: number
          role?: string
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          category_id?: string | null
          content?: string
          created_at?: string
          helpful_count?: number
          id?: string
          is_featured?: boolean
          is_published?: boolean
          not_helpful_count?: number
          read_time_minutes?: number
          role?: string
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          article_count: number
          created_at: string
          description: string | null
          icon: string
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          article_count?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          article_count?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      hos_violations: {
        Row: {
          created_at: string
          driver_id: string
          fleet_id: string | null
          id: string
          occurred_at: string
          resolved_at: string | null
          severity: string
          truck_id: string | null
          violation_detail: string | null
          violation_type: string
          was_resolved: boolean | null
        }
        Insert: {
          created_at?: string
          driver_id: string
          fleet_id?: string | null
          id?: string
          occurred_at?: string
          resolved_at?: string | null
          severity?: string
          truck_id?: string | null
          violation_detail?: string | null
          violation_type: string
          was_resolved?: boolean | null
        }
        Update: {
          created_at?: string
          driver_id?: string
          fleet_id?: string | null
          id?: string
          occurred_at?: string
          resolved_at?: string | null
          severity?: string
          truck_id?: string | null
          violation_detail?: string | null
          violation_type?: string
          was_resolved?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hos_violations_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hos_violations_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
            referencedColumns: ["id"]
          },
        ]
      }
      ifta_reports: {
        Row: {
          confirmation_number: string | null
          created_at: string
          filed_at: string | null
          filing_deadline: string | null
          fleet_id: string | null
          id: string
          net_tax_credit: number
          net_tax_owed: number
          quarter: number
          status: string
          taxable_miles: number
          total_fuel_cost: number
          total_gallons: number
          total_miles: number
          updated_at: string
          user_id: string
          year: number
        }
        Insert: {
          confirmation_number?: string | null
          created_at?: string
          filed_at?: string | null
          filing_deadline?: string | null
          fleet_id?: string | null
          id?: string
          net_tax_credit?: number
          net_tax_owed?: number
          quarter: number
          status?: string
          taxable_miles?: number
          total_fuel_cost?: number
          total_gallons?: number
          total_miles?: number
          updated_at?: string
          user_id: string
          year: number
        }
        Update: {
          confirmation_number?: string | null
          created_at?: string
          filed_at?: string | null
          filing_deadline?: string | null
          fleet_id?: string | null
          id?: string
          net_tax_credit?: number
          net_tax_owed?: number
          quarter?: number
          status?: string
          taxable_miles?: number
          total_fuel_cost?: number
          total_gallons?: number
          total_miles?: number
          updated_at?: string
          user_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ifta_reports_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      ifta_state_breakdown: {
        Row: {
          created_at: string
          gallons_purchased: number
          gallons_used: number
          id: string
          miles_driven: number
          report_id: string
          state_code: string
          tax_credit: number
          tax_owed: number
          tax_rate: number
        }
        Insert: {
          created_at?: string
          gallons_purchased?: number
          gallons_used?: number
          id?: string
          miles_driven?: number
          report_id: string
          state_code: string
          tax_credit?: number
          tax_owed?: number
          tax_rate?: number
        }
        Update: {
          created_at?: string
          gallons_purchased?: number
          gallons_used?: number
          id?: string
          miles_driven?: number
          report_id?: string
          state_code?: string
          tax_credit?: number
          tax_owed?: number
          tax_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "ifta_state_breakdown_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "ifta_reports"
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
      messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          created_at: string
          deleted_at: string | null
          fleet_id: string
          id: string
          is_broadcast: boolean
          is_read: boolean
          message: string
          message_type: string
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          created_at?: string
          deleted_at?: string | null
          fleet_id: string
          id?: string
          is_broadcast?: boolean
          is_read?: boolean
          message?: string
          message_type?: string
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          created_at?: string
          deleted_at?: string | null
          fleet_id?: string
          id?: string
          is_broadcast?: boolean
          is_read?: boolean
          message?: string
          message_type?: string
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          body: string
          created_at: string
          expires_at: string | null
          fleet_id: string | null
          id: string
          is_read: boolean
          priority: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body?: string
          created_at?: string
          expires_at?: string | null
          fleet_id?: string | null
          id?: string
          is_read?: boolean
          priority?: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          created_at?: string
          expires_at?: string | null
          fleet_id?: string | null
          id?: string
          is_read?: boolean
          priority?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
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
          referral_code: string | null
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
          referral_code?: string | null
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
          referral_code?: string | null
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
      referral_rewards: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          referral_id: string | null
          reward_status: string
          reward_type: string
          reward_value: number
          stripe_coupon_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          reward_status?: string
          reward_type?: string
          reward_value?: number
          stripe_coupon_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          referral_id?: string | null
          reward_status?: string
          reward_type?: string
          reward_value?: number
          stripe_coupon_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_rewards_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_email: string | null
          referred_id: string | null
          referrer_id: string
          reward_applied: boolean | null
          reward_applied_at: string | null
          signed_up_at: string | null
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id: string
          reward_applied?: boolean | null
          reward_applied_at?: string | null
          signed_up_at?: string | null
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_email?: string | null
          referred_id?: string | null
          referrer_id?: string
          reward_applied?: boolean | null
          reward_applied_at?: string | null
          signed_up_at?: string | null
          status?: string
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
      support_tickets: {
        Row: {
          admin_notes: string | null
          category: string
          created_at: string
          description: string
          fleet_id: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          fleet_id?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          created_at?: string
          description?: string
          fleet_id?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
        ]
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
        }
        Insert: {
          account_type?: string
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Update: {
          account_type?: string
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
        }
        Relationships: []
      }
      trial_offers: {
        Row: {
          created_at: string
          discount_percent: number | null
          id: string
          offer_code: string | null
          offer_expires_at: string | null
          offer_type: string
          user_id: string
          was_accepted: boolean | null
          was_shown: boolean | null
        }
        Insert: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          offer_code?: string | null
          offer_expires_at?: string | null
          offer_type?: string
          user_id: string
          was_accepted?: boolean | null
          was_shown?: boolean | null
        }
        Update: {
          created_at?: string
          discount_percent?: number | null
          id?: string
          offer_code?: string | null
          offer_expires_at?: string | null
          offer_type?: string
          user_id?: string
          was_accepted?: boolean | null
          was_shown?: boolean | null
        }
        Relationships: []
      }
      trial_tracking: {
        Row: {
          converted: boolean | null
          converted_at: string | null
          converted_plan: string | null
          created_at: string
          days_remaining: number | null
          features_used: Json | null
          id: string
          last_active: string | null
          last_nudge_sent: string | null
          login_count: number | null
          nudge_count: number | null
          plan_attempted: string | null
          trial_end: string
          trial_start: string
          user_id: string
        }
        Insert: {
          converted?: boolean | null
          converted_at?: string | null
          converted_plan?: string | null
          created_at?: string
          days_remaining?: number | null
          features_used?: Json | null
          id?: string
          last_active?: string | null
          last_nudge_sent?: string | null
          login_count?: number | null
          nudge_count?: number | null
          plan_attempted?: string | null
          trial_end?: string
          trial_start?: string
          user_id: string
        }
        Update: {
          converted?: boolean | null
          converted_at?: string | null
          converted_plan?: string | null
          created_at?: string
          days_remaining?: number | null
          features_used?: Json | null
          id?: string
          last_active?: string | null
          last_nudge_sent?: string | null
          login_count?: number | null
          nudge_count?: number | null
          plan_attempted?: string | null
          trial_end?: string
          trial_start?: string
          user_id?: string
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
      trip_routes: {
        Row: {
          avg_speed: number | null
          created_at: string
          driver_id: string
          end_location: string | null
          end_time: string | null
          fleet_id: string | null
          id: string
          idle_time: number | null
          max_speed: number | null
          route_points: Json
          start_location: string | null
          start_time: string | null
          states_visited: Json
          total_miles: number | null
          trip_id: string
          truck_id: string
          updated_at: string
        }
        Insert: {
          avg_speed?: number | null
          created_at?: string
          driver_id: string
          end_location?: string | null
          end_time?: string | null
          fleet_id?: string | null
          id?: string
          idle_time?: number | null
          max_speed?: number | null
          route_points?: Json
          start_location?: string | null
          start_time?: string | null
          states_visited?: Json
          total_miles?: number | null
          trip_id: string
          truck_id: string
          updated_at?: string
        }
        Update: {
          avg_speed?: number | null
          created_at?: string
          driver_id?: string
          end_location?: string | null
          end_time?: string | null
          fleet_id?: string | null
          id?: string
          idle_time?: number | null
          max_speed?: number | null
          route_points?: Json
          start_location?: string | null
          start_time?: string | null
          states_visited?: Json
          total_miles?: number | null
          trip_id?: string
          truck_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_routes_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_routes_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_routes_truck_id_fkey"
            columns: ["truck_id"]
            isOneToOne: false
            referencedRelation: "trucks"
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
      truck_locations: {
        Row: {
          address: string | null
          battery_level: number | null
          created_at: string
          driver_id: string
          fleet_id: string
          heading: number | null
          id: string
          is_moving: boolean | null
          latitude: number
          longitude: number
          recorded_at: string
          signal_strength: string | null
          speed: number | null
          state_code: string | null
          trip_id: string | null
          truck_id: string
        }
        Insert: {
          address?: string | null
          battery_level?: number | null
          created_at?: string
          driver_id: string
          fleet_id: string
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude: number
          longitude: number
          recorded_at?: string
          signal_strength?: string | null
          speed?: number | null
          state_code?: string | null
          trip_id?: string | null
          truck_id: string
        }
        Update: {
          address?: string | null
          battery_level?: number | null
          created_at?: string
          driver_id?: string
          fleet_id?: string
          heading?: number | null
          id?: string
          is_moving?: boolean | null
          latitude?: number
          longitude?: number
          recorded_at?: string
          signal_strength?: string | null
          speed?: number | null
          state_code?: string | null
          trip_id?: string | null
          truck_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "truck_locations_fleet_id_fkey"
            columns: ["fleet_id"]
            isOneToOne: false
            referencedRelation: "fleets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truck_locations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "truck_locations_truck_id_fkey"
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
      user_addons: {
        Row: {
          activated_at: string | null
          addon_key: string
          billing_interval: string | null
          created_at: string
          expires_at: string | null
          id: string
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          addon_key: string
          billing_interval?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          addon_key?: string
          billing_interval?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
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
      voice_commands: {
        Row: {
          command_matched: string | null
          command_spoken: string
          confidence_score: number | null
          created_at: string
          id: string
          page_context: string | null
          user_id: string
          was_successful: boolean
        }
        Insert: {
          command_matched?: string | null
          command_spoken?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          page_context?: string | null
          user_id: string
          was_successful?: boolean
        }
        Update: {
          command_matched?: string | null
          command_spoken?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          page_context?: string | null
          user_id?: string
          was_successful?: boolean
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          announce_state_crossings: boolean
          auto_driving_mode: boolean
          created_at: string
          fuel_stop_reminders: boolean
          id: string
          language: string
          read_messages_aloud: boolean
          updated_at: string
          user_id: string
          voice_enabled: boolean
          voice_gender: string
          voice_speed: number
          voice_volume: number
          wake_word: string
        }
        Insert: {
          announce_state_crossings?: boolean
          auto_driving_mode?: boolean
          created_at?: string
          fuel_stop_reminders?: boolean
          id?: string
          language?: string
          read_messages_aloud?: boolean
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
          voice_gender?: string
          voice_speed?: number
          voice_volume?: number
          wake_word?: string
        }
        Update: {
          announce_state_crossings?: boolean
          auto_driving_mode?: boolean
          created_at?: string
          fuel_stop_reminders?: boolean
          id?: string
          language?: string
          read_messages_aloud?: boolean
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
          voice_gender?: string
          voice_speed?: number
          voice_volume?: number
          wake_word?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_demo_user_id: { Args: never; Returns: string }
      get_user_fleet_id: { Args: never; Returns: string }
      get_user_role: { Args: never; Returns: string }
      grant_reviewer_role: { Args: { user_email: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_fleet_owner: { Args: never; Returns: boolean }
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
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "reviewer"
        | "fleet_owner"
        | "driver"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "reviewer",
        "fleet_owner",
        "driver",
      ],
    },
  },
} as const
