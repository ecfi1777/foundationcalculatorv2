/**
 * Database type definitions for Total Foundation Calculator V2.
 * Matches master spec Section 3.3 — exact snake_case field names.
 */

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_sub_id: string | null;
  subscription_tier: "free" | "pro";
  subscription_status: "active" | "cancelled" | "past_due" | "trialing";
  trial_ends_at: string | null;
  seat_count: number;
  promo_code_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string | null;
  role: "owner" | "member";
  status: "active" | "suspended";
  joined_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrgInvite {
  id: string;
  org_id: string;
  invited_by: string;
  email: string;
  token: string;
  status: "pending" | "accepted" | "revoked";
  expires_at: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  notes: string | null;
  is_locked: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  project_id: string;
  name: string;
  calculator_type:
    | "footings"
    | "walls"
    | "grade_beam"
    | "curb"
    | "slab"
    | "pier_pad"
    | "cylinder"
    | "steps";
  sort_order: number;
  inputs: Record<string, unknown>;
  inputs_version: number;
  rebar_enabled: boolean;
  stone_enabled: boolean;
  waste_pct: number;
  total_linear_ft: number;
  total_sqft: number;
  footing_volume_cy: number;
  wall_volume_cy: number | null;
  total_volume_cy: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Segment {
  id: string;
  area_id: string;
  sort_order: number;
  feet: number;
  inches: number;
  fraction: "0" | "1/4" | "1/2" | "3/4";
  length_inches_decimal: number;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  area_id: string;
  name: string;
  sort_order: number;
  length_ft: number;
  length_in: number;
  length_fraction: string;
  width_ft: number;
  width_in: number;
  width_fraction: string;
  thickness_in: number;
  include_stone: boolean;
  stone_depth_in: number | null;
  stone_type_id: string | null;
  stone_waste_pct: number | null;
  sqft: number;
  volume_cy: number;
  stone_tons: number | null;
  created_at: string;
  updated_at: string;
}

export interface RebarConfig {
  id: string;
  area_id: string;
  h_enabled: boolean;
  h_bar_size: "#3" | "#4" | "#5" | "#6";
  h_num_rows: number;
  h_overlap_in: number;
  h_waste_pct: number;
  h_total_lf: number;
  v_enabled: boolean;
  v_bar_size: string;
  v_spacing_in: number;
  v_bar_height_ft: number;
  v_bar_height_in: number;
  v_overlap_in: number;
  v_waste_pct: number;
  v_total_lf: number;
  grid_enabled: boolean;
  grid_bar_size: string;
  grid_spacing_in: number;
  grid_overlap_in: number;
  grid_waste_pct: number;
  grid_total_lf: number;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  active_org_id: string;
  rebar_overlap_in: number;
  visible_calculators: string[] | null;
  units: "imperial" | "metric";
  language: "en" | "es";
  created_at: string;
  updated_at: string;
}

export interface StoneType {
  id: string;
  name: string;
  description: string;
  density_tons_per_cy: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "pct_discount" | "flat_discount" | "full_unlock" | "trial";
  discount_pct: number | null;
  discount_cents: number | null;
  trial_days: number | null;
  grants_premium: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface UserPromo {
  id: string;
  user_id: string;
  promo_code_id: string;
  applied_at: string;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  referral_code: string;
  referral_link: string;
  status: "active" | "suspended";
  commission_pct: number;
  stripe_connect_id: string | null;
  total_referred: number;
  total_earned_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  status: "signed_up" | "converted" | "churned";
  signed_up_at: string;
  converted_at: string | null;
  churned_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  referral_id: string;
  amount_cents: number;
  stripe_payment_id: string | null;
  status: "pending" | "paid" | "cancelled";
  period_start: string;
  period_end: string;
  created_at: string;
  paid_at: string | null;
  stripe_transfer_id: string | null;
}

// ──────────────────────────────────────────────
// View: user_effective_tier (Section 3.2)
// ──────────────────────────────────────────────

export interface UserEffectiveTier {
  user_id: string;
  org_id: string;
  subscription_tier: string;
  subscription_status: string;
  trial_ends_at: string | null;
  role: string;
}
