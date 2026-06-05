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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          author_id: string
          body: string
          created_at: string
          hospital_id: string | null
          id: string
          target_roles: string[]
          title: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          hospital_id?: string | null
          id?: string
          target_roles?: string[]
          title: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          hospital_id?: string | null
          id?: string
          target_roles?: string[]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          complaint: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          hospital_id: string
          id: string
          patient_id: string
          plan: string | null
          visit_date: string
        }
        Insert: {
          complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          hospital_id: string
          id?: string
          patient_id: string
          plan?: string | null
          visit_date?: string
        }
        Update: {
          complaint?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          hospital_id?: string
          id?: string
          patient_id?: string
          plan?: string | null
          visit_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultations_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dispensing_log: {
        Row: {
          dispensed_at: string
          dispensed_by: string
          hospital_id: string
          id: string
          items: Json
          notes: string | null
          patient_id: string | null
          prescription_id: string | null
        }
        Insert: {
          dispensed_at?: string
          dispensed_by: string
          hospital_id: string
          id?: string
          items?: Json
          notes?: string | null
          patient_id?: string | null
          prescription_id?: string | null
        }
        Update: {
          dispensed_at?: string
          dispensed_by?: string
          hospital_id?: string
          id?: string
          items?: Json
          notes?: string | null
          patient_id?: string | null
          prescription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dispensing_log_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensing_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispensing_log_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      evacuation_entries: {
        Row: {
          created_at: string
          id: string
          last_edited_at: string
          last_edited_by_name: string | null
          list_id: string
          nurse_name: string
          owner_id: string
          place: string | null
          turn_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_edited_at?: string
          last_edited_by_name?: string | null
          list_id: string
          nurse_name: string
          owner_id: string
          place?: string | null
          turn_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          last_edited_at?: string
          last_edited_by_name?: string | null
          list_id?: string
          nurse_name?: string
          owner_id?: string
          place?: string | null
          turn_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "evacuation_entries_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "evacuation_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      evacuation_lists: {
        Row: {
          created_at: string
          destination: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          destination?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          destination?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          lat: number
          lng: number
          name: string
          name_ar: string | null
          name_fr: string | null
          phone: string | null
          type: string
          updated_at: string
          wilaya_code: number
          wilaya_name: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          lat: number
          lng: number
          name: string
          name_ar?: string | null
          name_fr?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
          wilaya_code: number
          wilaya_name: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          name?: string
          name_ar?: string | null
          name_fr?: string | null
          phone?: string | null
          type?: string
          updated_at?: string
          wilaya_code?: number
          wilaya_name?: string
        }
        Relationships: []
      }
      lab_orders: {
        Row: {
          hospital_id: string
          id: string
          notes: string | null
          ordered_at: string
          ordered_by: string
          patient_id: string
          status: string
          tests: Json
        }
        Insert: {
          hospital_id: string
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by: string
          patient_id: string
          status?: string
          tests?: Json
        }
        Update: {
          hospital_id?: string
          id?: string
          notes?: string | null
          ordered_at?: string
          ordered_by?: string
          patient_id?: string
          status?: string
          tests?: Json
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          condition: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          price_dzd: number
          seller_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price_dzd?: number
          seller_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          condition?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          price_dzd?: number
          seller_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          allergies: string | null
          created_at: string
          created_by: string
          dob: string | null
          full_name: string
          hospital_id: string
          id: string
          mrn: string | null
          notes: string | null
          phone: string | null
          sex: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          created_at?: string
          created_by: string
          dob?: string | null
          full_name: string
          hospital_id: string
          id?: string
          mrn?: string | null
          notes?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          created_at?: string
          created_by?: string
          dob?: string | null
          full_name?: string
          hospital_id?: string
          id?: string
          mrn?: string | null
          notes?: string | null
          phone?: string | null
          sex?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_stock: {
        Row: {
          batch: string | null
          brand: string | null
          created_at: string
          dci: string
          expiry: string | null
          form: string | null
          hospital_id: string
          id: string
          min_threshold: number
          qty: number
          strength: string | null
          supplier: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          batch?: string | null
          brand?: string | null
          created_at?: string
          dci: string
          expiry?: string | null
          form?: string | null
          hospital_id: string
          id?: string
          min_threshold?: number
          qty?: number
          strength?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          batch?: string | null
          brand?: string | null
          created_at?: string
          dci?: string
          expiry?: string | null
          form?: string | null
          hospital_id?: string
          id?: string
          min_threshold?: number
          qty?: number
          strength?: string | null
          supplier?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_stock_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor_id: string
          hospital_id: string
          id: string
          issued_date: string
          items: Json
          notes: string | null
          patient_id: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          hospital_id: string
          id?: string
          issued_date?: string
          items?: Json
          notes?: string | null
          patient_id: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          hospital_id?: string
          id?: string
          issued_date?: string
          items?: Json
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          hospital_id: string | null
          id: string
          phone: string | null
          role_selected: boolean
          updated_at: string
          wilaya_code: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          hospital_id?: string | null
          id: string
          phone?: string | null
          role_selected?: boolean
          updated_at?: string
          wilaya_code?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          hospital_id?: string | null
          id?: string
          phone?: string | null
          role_selected?: boolean
          updated_at?: string
          wilaya_code?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_hospital_fk"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
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
      current_hospital_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_admin_user: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "doctor" | "nurse" | "pharmacist" | "management" | "admin"
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
      app_role: ["doctor", "nurse", "pharmacist", "management", "admin"],
    },
  },
} as const
