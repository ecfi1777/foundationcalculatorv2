
-- ============================================
-- Total Foundation Calculator V2 — Full Schema
-- ============================================

-- 11. stone_types (created first for FK reference from sections)
CREATE TABLE public.stone_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  density_tons_per_cy DECIMAL NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.stone_types ENABLE ROW LEVEL SECURITY;

-- 1. users (extends Supabase Auth)
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. organizations
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_sub_id TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'past_due', 'trialing')),
  trial_ends_at TIMESTAMPTZ,
  seat_count INTEGER NOT NULL DEFAULT 1,
  promo_code_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 3. org_members
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- 4. org_invites
CREATE TABLE public.org_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

-- 5. projects
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 6. areas
CREATE TABLE public.areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  calculator_type TEXT NOT NULL CHECK (calculator_type IN ('footings', 'walls', 'grade_beam', 'curb', 'slab', 'pier_pad', 'cylinder', 'steps')),
  sort_order INTEGER NOT NULL,
  inputs JSONB,
  inputs_version INTEGER NOT NULL DEFAULT 1,
  rebar_enabled BOOLEAN NOT NULL DEFAULT false,
  stone_enabled BOOLEAN NOT NULL DEFAULT false,
  waste_pct DECIMAL NOT NULL DEFAULT 0,
  total_linear_ft DECIMAL NOT NULL DEFAULT 0,
  total_sqft DECIMAL NOT NULL DEFAULT 0,
  footing_volume_cy DECIMAL NOT NULL DEFAULT 0,
  wall_volume_cy DECIMAL,
  total_volume_cy DECIMAL NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;

-- 7. segments
CREATE TABLE public.segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL,
  feet INTEGER NOT NULL,
  inches INTEGER NOT NULL DEFAULT 0,
  fraction TEXT NOT NULL DEFAULT '0' CHECK (fraction IN ('0', '1/4', '1/2', '3/4')),
  length_inches_decimal DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.segments ENABLE ROW LEVEL SECURITY;

-- 8. sections
CREATE TABLE public.sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  length_ft DECIMAL NOT NULL,
  length_in DECIMAL NOT NULL DEFAULT 0,
  width_ft DECIMAL NOT NULL,
  width_in DECIMAL NOT NULL DEFAULT 0,
  thickness_in DECIMAL NOT NULL,
  include_stone BOOLEAN NOT NULL DEFAULT false,
  stone_depth_in DECIMAL,
  stone_type_id UUID REFERENCES public.stone_types(id),
  stone_waste_pct DECIMAL,
  sqft DECIMAL NOT NULL DEFAULT 0,
  volume_cy DECIMAL NOT NULL DEFAULT 0,
  stone_tons DECIMAL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;

-- 9. rebar_configs
CREATE TABLE public.rebar_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  area_id UUID NOT NULL UNIQUE REFERENCES public.areas(id) ON DELETE CASCADE,
  h_enabled BOOLEAN NOT NULL DEFAULT false,
  h_bar_size TEXT NOT NULL DEFAULT '#4' CHECK (h_bar_size IN ('#3', '#4', '#5', '#6')),
  h_num_rows INTEGER NOT NULL DEFAULT 1,
  h_overlap_in DECIMAL NOT NULL DEFAULT 12,
  h_waste_pct DECIMAL NOT NULL DEFAULT 0,
  h_total_lf DECIMAL NOT NULL DEFAULT 0,
  v_enabled BOOLEAN NOT NULL DEFAULT false,
  v_bar_size TEXT NOT NULL DEFAULT '#4',
  v_spacing_in DECIMAL NOT NULL DEFAULT 12,
  v_bar_height_ft DECIMAL NOT NULL DEFAULT 0,
  v_bar_height_in DECIMAL NOT NULL DEFAULT 0,
  v_overlap_in DECIMAL NOT NULL DEFAULT 12,
  v_waste_pct DECIMAL NOT NULL DEFAULT 0,
  v_total_lf DECIMAL NOT NULL DEFAULT 0,
  grid_enabled BOOLEAN NOT NULL DEFAULT false,
  grid_bar_size TEXT NOT NULL DEFAULT '#4',
  grid_spacing_in DECIMAL NOT NULL DEFAULT 12,
  grid_overlap_in DECIMAL NOT NULL DEFAULT 12,
  grid_waste_pct DECIMAL NOT NULL DEFAULT 0,
  grid_total_lf DECIMAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.rebar_configs ENABLE ROW LEVEL SECURITY;

-- 10. user_settings
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  active_org_id UUID REFERENCES public.organizations(id),
  rebar_overlap_in DECIMAL NOT NULL DEFAULT 12,
  visible_calculators TEXT[],
  units TEXT NOT NULL DEFAULT 'imperial' CHECK (units IN ('imperial', 'metric')),
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'es')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 12. promo_codes
CREATE TABLE public.promo_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('pct_discount', 'flat_discount', 'full_unlock', 'trial')),
  discount_pct INTEGER,
  discount_cents INTEGER,
  trial_days INTEGER,
  grants_premium BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER,
  uses_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- 13. user_promos
CREATE TABLE public.user_promos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  promo_code_id UUID NOT NULL REFERENCES public.promo_codes(id) ON DELETE CASCADE,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_promos ENABLE ROW LEVEL SECURITY;

-- 14. affiliates
CREATE TABLE public.affiliates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL UNIQUE,
  referral_link TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  commission_pct INTEGER NOT NULL DEFAULT 20,
  stripe_connect_id TEXT,
  total_referred INTEGER NOT NULL DEFAULT 0,
  total_earned_cents INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

-- 15. referrals
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'signed_up' CHECK (status IN ('signed_up', 'converted', 'churned')),
  signed_up_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at TIMESTAMPTZ,
  churned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 16. affiliate_commissions
CREATE TABLE public.affiliate_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at TIMESTAMPTZ
);
ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- user_effective_tier VIEW
-- ============================================
CREATE OR REPLACE VIEW public.user_effective_tier AS
SELECT
  u.id AS user_id,
  o.id AS org_id,
  o.subscription_tier,
  o.subscription_status,
  o.trial_ends_at,
  om.role
FROM public.users u
JOIN public.org_members om ON om.user_id = u.id AND om.status = 'active'
JOIN public.organizations o ON o.id = om.org_id;

-- ============================================
-- updated_at trigger function
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.org_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON public.areas FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_segments_updated_at BEFORE UPDATE ON public.segments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON public.sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rebar_configs_updated_at BEFORE UPDATE ON public.rebar_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_promos_updated_at BEFORE UPDATE ON public.user_promos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliates_updated_at BEFORE UPDATE ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 15 INDEXES
-- ============================================
CREATE INDEX idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_org_invites_org_id ON public.org_invites(org_id);
CREATE INDEX idx_org_invites_email ON public.org_invites(email);
CREATE INDEX idx_org_invites_token ON public.org_invites(token);
CREATE INDEX idx_projects_org_id ON public.projects(org_id);
CREATE INDEX idx_areas_project_id ON public.areas(project_id);
CREATE INDEX idx_segments_area_id ON public.segments(area_id);
CREATE INDEX idx_sections_area_id ON public.sections(area_id);
CREATE INDEX idx_user_promos_user_id ON public.user_promos(user_id);
CREATE INDEX idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX idx_affiliates_referral_code ON public.affiliates(referral_code);
CREATE INDEX idx_referrals_affiliate_id ON public.referrals(affiliate_id);
CREATE INDEX idx_affiliate_commissions_affiliate_id ON public.affiliate_commissions(affiliate_id);

-- ============================================
-- Seed stone_types
-- ============================================
INSERT INTO public.stone_types (name, description, density_tons_per_cy, is_active, sort_order)
VALUES ('Crushed #57 Stone (3/4 in)', 'Ideal for creating a stable, locking base for driveways and slabs', 1.4, true, 1);
