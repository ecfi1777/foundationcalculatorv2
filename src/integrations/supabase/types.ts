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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          amount_cents: number
          created_at: string
          id: string
          paid_at: string | null
          period_end: string
          period_start: string
          referral_id: string
          status: string
          stripe_payment_id: string | null
          stripe_transfer_id: string | null
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          created_at?: string
          id?: string
          paid_at?: string | null
          period_end: string
          period_start: string
          referral_id: string
          status?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          period_end?: string
          period_start?: string
          referral_id?: string
          status?: string
          stripe_payment_id?: string | null
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          commission_pct: number
          created_at: string
          id: string
          referral_code: string
          referral_link: string
          status: string
          stripe_connect_id: string | null
          total_earned_cents: number
          total_referred: number
          updated_at: string
          user_id: string
        }
        Insert: {
          commission_pct?: number
          created_at?: string
          id?: string
          referral_code: string
          referral_link: string
          status?: string
          stripe_connect_id?: string | null
          total_earned_cents?: number
          total_referred?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          commission_pct?: number
          created_at?: string
          id?: string
          referral_code?: string
          referral_link?: string
          status?: string
          stripe_connect_id?: string | null
          total_earned_cents?: number
          total_referred?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "affiliates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          calculator_type: string
          created_at: string
          deleted_at: string | null
          footing_volume_cy: number
          id: string
          inputs: Json | null
          inputs_version: number
          name: string
          project_id: string
          rebar_enabled: boolean
          sort_order: number
          stone_enabled: boolean
          total_linear_ft: number
          total_sqft: number
          total_volume_cy: number
          updated_at: string
          wall_volume_cy: number | null
          waste_pct: number
        }
        Insert: {
          calculator_type: string
          created_at?: string
          deleted_at?: string | null
          footing_volume_cy?: number
          id?: string
          inputs?: Json | null
          inputs_version?: number
          name: string
          project_id: string
          rebar_enabled?: boolean
          sort_order: number
          stone_enabled?: boolean
          total_linear_ft?: number
          total_sqft?: number
          total_volume_cy?: number
          updated_at?: string
          wall_volume_cy?: number | null
          waste_pct?: number
        }
        Update: {
          calculator_type?: string
          created_at?: string
          deleted_at?: string | null
          footing_volume_cy?: number
          id?: string
          inputs?: Json | null
          inputs_version?: number
          name?: string
          project_id?: string
          rebar_enabled?: boolean
          sort_order?: number
          stone_enabled?: boolean
          total_linear_ft?: number
          total_sqft?: number
          total_volume_cy?: number
          updated_at?: string
          wall_volume_cy?: number | null
          waste_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          invited_by: string
          org_id: string
          status: string
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          invited_by: string
          org_id: string
          status?: string
          token: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string
          org_id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "org_invites_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["org_id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          org_id: string
          role: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          org_id: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          org_id?: string
          role?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          owner_id: string
          promo_code_used: string | null
          seat_count: number
          stripe_customer_id: string | null
          stripe_sub_id: string | null
          subscription_status: string
          subscription_tier: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          owner_id: string
          promo_code_used?: string | null
          seat_count?: number
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          promo_code_used?: string | null
          seat_count?: number
          stripe_customer_id?: string | null
          stripe_sub_id?: string | null
          subscription_status?: string
          subscription_tier?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "organizations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          is_locked: boolean
          name: string
          notes: string | null
          org_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_locked?: boolean
          name: string
          notes?: string | null
          org_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_locked?: boolean
          name?: string
          notes?: string | null
          org_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["org_id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_cents: number | null
          discount_pct: number | null
          expires_at: string | null
          grants_premium: boolean
          id: string
          is_active: boolean
          max_uses: number | null
          trial_days: number | null
          type: string
          uses_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_cents?: number | null
          discount_pct?: number | null
          expires_at?: string | null
          grants_premium?: boolean
          id?: string
          is_active?: boolean
          max_uses?: number | null
          trial_days?: number | null
          type: string
          uses_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_cents?: number | null
          discount_pct?: number | null
          expires_at?: string | null
          grants_premium?: boolean
          id?: string
          is_active?: boolean
          max_uses?: number | null
          trial_days?: number | null
          type?: string
          uses_count?: number
        }
        Relationships: []
      }
      rebar_configs: {
        Row: {
          area_id: string
          created_at: string
          element_type: string
          grid_bar_size: string
          grid_enabled: boolean
          grid_overlap_in: number
          grid_spacing_in: number
          grid_total_lf: number
          grid_waste_pct: number
          h_bar_size: string
          h_enabled: boolean
          h_num_rows: number
          h_overlap_in: number
          h_total_lf: number
          h_waste_pct: number
          id: string
          updated_at: string
          v_bar_height_ft: number
          v_bar_height_in: number
          v_bar_size: string
          v_enabled: boolean
          v_overlap_in: number
          v_spacing_in: number
          v_total_lf: number
          v_waste_pct: number
        }
        Insert: {
          area_id: string
          created_at?: string
          element_type?: string
          grid_bar_size?: string
          grid_enabled?: boolean
          grid_overlap_in?: number
          grid_spacing_in?: number
          grid_total_lf?: number
          grid_waste_pct?: number
          h_bar_size?: string
          h_enabled?: boolean
          h_num_rows?: number
          h_overlap_in?: number
          h_total_lf?: number
          h_waste_pct?: number
          id?: string
          updated_at?: string
          v_bar_height_ft?: number
          v_bar_height_in?: number
          v_bar_size?: string
          v_enabled?: boolean
          v_overlap_in?: number
          v_spacing_in?: number
          v_total_lf?: number
          v_waste_pct?: number
        }
        Update: {
          area_id?: string
          created_at?: string
          element_type?: string
          grid_bar_size?: string
          grid_enabled?: boolean
          grid_overlap_in?: number
          grid_spacing_in?: number
          grid_total_lf?: number
          grid_waste_pct?: number
          h_bar_size?: string
          h_enabled?: boolean
          h_num_rows?: number
          h_overlap_in?: number
          h_total_lf?: number
          h_waste_pct?: number
          id?: string
          updated_at?: string
          v_bar_height_ft?: number
          v_bar_height_in?: number
          v_bar_size?: string
          v_enabled?: boolean
          v_overlap_in?: number
          v_spacing_in?: number
          v_total_lf?: number
          v_waste_pct?: number
        }
        Relationships: [
          {
            foreignKeyName: "rebar_configs_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          affiliate_id: string
          churned_at: string | null
          converted_at: string | null
          created_at: string
          id: string
          referred_user_id: string
          signed_up_at: string
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          churned_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id: string
          signed_up_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          churned_at?: string | null
          converted_at?: string | null
          created_at?: string
          id?: string
          referred_user_id?: string
          signed_up_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          area_id: string
          created_at: string
          id: string
          include_stone: boolean
          length_ft: number
          length_in: number
          name: string
          sort_order: number
          sqft: number
          stone_depth_in: number | null
          stone_tons: number | null
          stone_type_id: string | null
          stone_waste_pct: number | null
          thickness_in: number
          updated_at: string
          volume_cy: number
          width_ft: number
          width_in: number
        }
        Insert: {
          area_id: string
          created_at?: string
          id?: string
          include_stone?: boolean
          length_ft: number
          length_in?: number
          name: string
          sort_order: number
          sqft?: number
          stone_depth_in?: number | null
          stone_tons?: number | null
          stone_type_id?: string | null
          stone_waste_pct?: number | null
          thickness_in: number
          updated_at?: string
          volume_cy?: number
          width_ft: number
          width_in?: number
        }
        Update: {
          area_id?: string
          created_at?: string
          id?: string
          include_stone?: boolean
          length_ft?: number
          length_in?: number
          name?: string
          sort_order?: number
          sqft?: number
          stone_depth_in?: number | null
          stone_tons?: number | null
          stone_type_id?: string | null
          stone_waste_pct?: number | null
          thickness_in?: number
          updated_at?: string
          volume_cy?: number
          width_ft?: number
          width_in?: number
        }
        Relationships: [
          {
            foreignKeyName: "sections_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_stone_type_id_fkey"
            columns: ["stone_type_id"]
            isOneToOne: false
            referencedRelation: "stone_types"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          area_id: string
          created_at: string
          feet: number
          fraction: string
          id: string
          inches: number
          length_inches_decimal: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          area_id: string
          created_at?: string
          feet: number
          fraction?: string
          id?: string
          inches?: number
          length_inches_decimal?: number
          sort_order: number
          updated_at?: string
        }
        Update: {
          area_id?: string
          created_at?: string
          feet?: number
          fraction?: string
          id?: string
          inches?: number
          length_inches_decimal?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "segments_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      stone_types: {
        Row: {
          created_at: string
          density_tons_per_cy: number
          description: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          density_tons_per_cy: number
          description: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          density_tons_per_cy?: number
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      user_promos: {
        Row: {
          applied_at: string
          created_at: string
          id: string
          promo_code_id: string
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          created_at?: string
          id?: string
          promo_code_id: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          id?: string
          promo_code_id?: string
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_promos_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_promos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_promos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          active_org_id: string | null
          created_at: string
          id: string
          language: string
          rebar_overlap_in: number
          units: string
          updated_at: string
          user_id: string
          visible_calculators: string[] | null
        }
        Insert: {
          active_org_id?: string | null
          created_at?: string
          id?: string
          language?: string
          rebar_overlap_in?: number
          units?: string
          updated_at?: string
          user_id: string
          visible_calculators?: string[] | null
        }
        Update: {
          active_org_id?: string | null
          created_at?: string
          id?: string
          language?: string
          rebar_overlap_in?: number
          units?: string
          updated_at?: string
          user_id?: string
          visible_calculators?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_active_org_id_fkey"
            columns: ["active_org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_settings_active_org_id_fkey"
            columns: ["active_org_id"]
            isOneToOne: false
            referencedRelation: "user_effective_tier"
            referencedColumns: ["org_id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_effective_tier"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_admin: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_admin?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_admin?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_effective_tier: {
        Row: {
          org_id: string | null
          role: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_active_org_id: { Args: { _user_id: string }; Returns: string }
      increment_affiliate_earnings: {
        Args: { affiliate_row_id: string; amount: number }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_area_member: {
        Args: { _area_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_owner: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_own_affiliate: {
        Args: { _affiliate_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_member: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      is_project_owner: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      soft_delete_project: { Args: { _project_id: string }; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
