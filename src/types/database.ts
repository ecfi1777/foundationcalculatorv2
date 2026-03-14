/**
 * Database type definitions for Total Foundation Calculator V2.
 *
 * TODO: Replace these placeholder interfaces with the actual table
 * definitions from the master spec Section 3.3. Use exact snake_case
 * field names to match Supabase column names.
 */

// ──────────────────────────────────────────────
// Auth / Users
// ──────────────────────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Organizations / Teams
// ──────────────────────────────────────────────

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  stripe_customer_id: string | null;
  stripe_connect_account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  invited_email: string | null;
  invited_at: string | null;
  joined_at: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────
// Projects / Calculations
// ──────────────────────────────────────────────

export interface Project {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Calculation {
  id: string;
  project_id: string;
  name: string;
  input_data: Record<string, unknown>;
  result_data: Record<string, unknown> | null;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ──────────────────────────────────────────────
// Subscriptions / Billing
// ──────────────────────────────────────────────

export interface Subscription {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  status: "active" | "canceled" | "past_due" | "trialing" | "incomplete";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string;
  invoice_pdf: string | null;
  created_at: string;
}

// ──────────────────────────────────────────────
// Invitations
// ──────────────────────────────────────────────

export interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: "admin" | "member";
  token: string;
  expires_at: string;
  accepted_at: string | null;
  invited_by: string;
  created_at: string;
}
