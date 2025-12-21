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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          business_address: string | null
          business_email: string | null
          business_hours: Json | null
          business_name: string | null
          business_phone: string | null
          business_website: string | null
          id: number
          notifications: Json | null
          price_deep: number | null
          price_move_in_out: number | null
          price_office: number | null
          price_post_construction: number | null
          price_standard: number | null
          updated_at: string | null
        }
        Insert: {
          business_address?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          id?: number
          notifications?: Json | null
          price_deep?: number | null
          price_move_in_out?: number | null
          price_office?: number | null
          price_post_construction?: number | null
          price_standard?: number | null
          updated_at?: string | null
        }
        Update: {
          business_address?: string | null
          business_email?: string | null
          business_hours?: Json | null
          business_name?: string | null
          business_phone?: string | null
          business_website?: string | null
          id?: number
          notifications?: Json | null
          price_deep?: number | null
          price_move_in_out?: number | null
          price_office?: number | null
          price_post_construction?: number | null
          price_standard?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          address_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          id: string
          is_recurring: boolean | null
          is_running_late: boolean | null
          parent_recurring_id: string | null
          recurring_frequency: string | null
          scheduled_date: string
          scheduled_time_end: string
          scheduled_time_start: string
          service_type: Database["public"]["Enums"]["service_type"]
          special_instructions: string | null
          status: Database["public"]["Enums"]["appointment_status"]
          team_members: string[] | null
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_recurring?: boolean | null
          is_running_late?: boolean | null
          parent_recurring_id?: string | null
          recurring_frequency?: string | null
          scheduled_date: string
          scheduled_time_end: string
          scheduled_time_start: string
          service_type: Database["public"]["Enums"]["service_type"]
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          team_members?: string[] | null
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_recurring?: boolean | null
          is_running_late?: boolean | null
          parent_recurring_id?: string | null
          recurring_frequency?: string | null
          scheduled_date?: string
          scheduled_time_end?: string
          scheduled_time_start?: string
          service_type?: Database["public"]["Enums"]["service_type"]
          special_instructions?: string | null
          status?: Database["public"]["Enums"]["appointment_status"]
          team_members?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_parent_recurring_id_fkey"
            columns: ["parent_recurring_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
        ]
      }
      auth_handoff_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      booking_requests: {
        Row: {
          address: string | null
          created_at: string
          email: string
          gift_certificate: string | null
          id: string
          name: string
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          service_level: string | null
          service_type: string | null
          space_size: string | null
          special_requests: string | null
          status: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          gift_certificate?: string | null
          id?: string
          name: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service_level?: string | null
          service_type?: string | null
          space_size?: string | null
          special_requests?: string | null
          status?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          gift_certificate?: string | null
          id?: string
          name?: string
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          service_level?: string | null
          service_type?: string | null
          space_size?: string | null
          special_requests?: string | null
          status?: string | null
        }
        Relationships: []
      }
      customer_credits: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          customer_id: string
          description: string | null
          id: string
          invoice_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          description?: string | null
          id?: string
          invoice_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          description?: string | null
          id?: string
          invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_credits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_credits_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_credits_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_invite_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          token_hash: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          token_hash: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          token_hash?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_invite_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          read_at: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          read_at?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      customer_reviews: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          rating: number
          review_text: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          rating: number
          review_text?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          rating?: number
          review_text?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          appointment_id: string | null
          archived: boolean | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          disputed: boolean | null
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          refund_amount: number | null
          refund_reason: string | null
          service_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          archived?: boolean | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          disputed?: boolean | null
          due_date?: string | null
          id?: string
          invoice_number: string
          line_items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          refund_amount?: number | null
          refund_reason?: string | null
          service_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          archived?: boolean | null
          created_at?: string
          customer_email?: string | null
          customer_id?: string | null
          disputed?: boolean | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          line_items?: Json | null
          notes?: string | null
          paid_date?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          refund_amount?: number | null
          refund_reason?: string | null
          service_date?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: Database["public"]["Enums"]["account_status"]
          admin_notes: string | null
          avatar_url: string | null
          birth_day: number | null
          birth_month: number | null
          communication_preference:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          account_status: Database["public"]["Enums"]["account_status"]
          admin_notes?: string | null
          avatar_url?: string | null
          birth_day?: number | null
          birth_month?: number | null
          communication_preference?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name?: string | null
          full_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          account_status?: Database["public"]["Enums"]["account_status"]
          admin_notes?: string | null
          avatar_url?: string | null
          birth_day?: number | null
          birth_month?: number | null
          communication_preference?:
            | Database["public"]["Enums"]["communication_preference"]
            | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action: string
          attempts: number | null
          created_at: string
          id: string
          ip_address: string
          window_start: string
        }
        Insert: {
          action: string
          attempts?: number | null
          created_at?: string
          id?: string
          ip_address: string
          window_start?: string
        }
        Update: {
          action?: string
          attempts?: number | null
          created_at?: string
          id?: string
          ip_address?: string
          window_start?: string
        }
        Relationships: []
      }
      service_addresses: {
        Row: {
          city: string
          created_at: string
          id: string
          is_primary: boolean | null
          is_registration_address: boolean | null
          place_id: string | null
          state: string
          street_address: string
          unit: string | null
          updated_at: string
          user_id: string
          zip_code: string
        }
        Insert: {
          city: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_registration_address?: boolean | null
          place_id?: string | null
          state: string
          street_address: string
          unit?: string | null
          updated_at?: string
          user_id: string
          zip_code: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          is_registration_address?: boolean | null
          place_id?: string | null
          state?: string
          street_address?: string
          unit?: string | null
          updated_at?: string
          user_id?: string
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_history: {
        Row: {
          appointment_id: string
          completed_date: string
          created_at: string
          customer_feedback: string | null
          customer_id: string
          customer_rating: number | null
          id: string
          notes: string | null
          photos: string[] | null
          service_type: Database["public"]["Enums"]["service_type"]
          team_members: string[] | null
        }
        Insert: {
          appointment_id: string
          completed_date: string
          created_at?: string
          customer_feedback?: string | null
          customer_id: string
          customer_rating?: number | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          service_type: Database["public"]["Enums"]["service_type"]
          team_members?: string[] | null
        }
        Update: {
          appointment_id?: string
          completed_date?: string
          created_at?: string
          customer_feedback?: string | null
          customer_id?: string
          customer_rating?: number | null
          id?: string
          notes?: string | null
          photos?: string[] | null
          service_type?: Database["public"]["Enums"]["service_type"]
          team_members?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "service_history_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_history_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          address_id: string | null
          admin_notes: string | null
          created_at: string
          customer_id: string
          id: string
          is_flexible: boolean | null
          is_recurring: boolean | null
          preferred_date: string | null
          preferred_time: string | null
          recurring_frequency: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          special_requests: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
        }
        Insert: {
          address_id?: string | null
          admin_notes?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_flexible?: boolean | null
          is_recurring?: boolean | null
          preferred_date?: string | null
          preferred_time?: string | null
          recurring_frequency?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Update: {
          address_id?: string | null
          admin_notes?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_flexible?: boolean | null
          is_recurring?: boolean | null
          preferred_date?: string | null
          preferred_time?: string | null
          recurring_frequency?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          special_requests?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "service_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_account_credit:
        | {
            Args: {
              p_amount: number
              p_created_by?: string
              p_customer_id: string
              p_description: string
              p_invoice_id?: string
            }
            Returns: string
          }
        | {
            Args: { p_credit_amount: number; p_customer_id: string }
            Returns: undefined
          }
      auto_archive_old_invoices: { Args: never; Returns: undefined }
      auto_complete_appointments: { Args: never; Returns: undefined }
      generate_invoice_number: { Args: never; Returns: string }
      get_invoices_due_today: {
        Args: never
        Returns: {
          amount: number
          appointment_id: string | null
          archived: boolean | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          disputed: boolean | null
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          refund_amount: number | null
          refund_reason: string | null
          service_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_invoices_overdue_5_days: {
        Args: never
        Returns: {
          amount: number
          appointment_id: string | null
          archived: boolean | null
          created_at: string
          customer_email: string | null
          customer_id: string | null
          disputed: boolean | null
          due_date: string | null
          id: string
          invoice_number: string
          line_items: Json | null
          notes: string | null
          paid_date: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          refund_amount: number | null
          refund_reason: string | null
          service_date: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "invoices"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
      mark_overdue_invoices: { Args: never; Returns: undefined }
      send_admin_notification: {
        Args: {
          notification_link?: string
          notification_message?: string
          notification_title: string
          notification_type: string
        }
        Returns: string
      }
    }
    Enums: {
      account_status: "pending" | "active" | "suspended" | "deleted"
      appointment_status:
        | "pending"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "not_completed"
        | "en_route"
      communication_preference: "text" | "email" | "both"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      payment_method: "stripe" | "zelle" | "cash" | "check"
      request_status: "pending" | "approved" | "declined" | "completed"
      service_type:
        | "standard"
        | "deep"
        | "move_in_out"
        | "post_construction"
        | "office"
      user_role: "customer" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      account_status: ["pending", "active", "suspended", "deleted"],
      appointment_status: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "not_completed",
        "en_route",
      ],
      communication_preference: ["text", "email", "both"],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      payment_method: ["stripe", "zelle", "cash", "check"],
      request_status: ["pending", "approved", "declined", "completed"],
      service_type: [
        "standard",
        "deep",
        "move_in_out",
        "post_construction",
        "office",
      ],
      user_role: ["customer", "admin"],
    },
  },
} as const
