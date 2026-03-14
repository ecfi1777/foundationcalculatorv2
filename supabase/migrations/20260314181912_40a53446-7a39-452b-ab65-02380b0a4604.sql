
-- ============================================
-- Phase 3: RLS Policies
-- ============================================

-- Helper: check if user is active member of an org
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND status = 'active'
  )
$$;

-- Helper: check if user is owner of an org
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id
      AND org_id = _org_id
      AND role = 'owner'
      AND status = 'active'
  )
$$;

-- Helper: check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = _user_id AND is_admin = true
  )
$$;

-- Helper: get user's active org id
CREATE OR REPLACE FUNCTION public.get_active_org_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT active_org_id FROM public.user_settings
  WHERE user_id = _user_id
$$;

-- ============================================
-- 1. users
-- ============================================
CREATE POLICY "Users can read own row"
  ON public.users FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own row"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ============================================
-- 2. organizations
-- ============================================
CREATE POLICY "Members can read their org"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (public.is_org_member(auth.uid(), id));

CREATE POLICY "Owners can update their org"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), id))
  WITH CHECK (public.is_org_owner(auth.uid(), id));

CREATE POLICY "Authenticated users can create orgs"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can delete their org"
  ON public.organizations FOR DELETE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), id));

-- ============================================
-- 3. org_members
-- ============================================
CREATE POLICY "Members can read org members"
  ON public.org_members FOR SELECT
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Owners can insert org members"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_owner(auth.uid(), org_id));

CREATE POLICY "Owners can update org members"
  ON public.org_members FOR UPDATE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), org_id))
  WITH CHECK (public.is_org_owner(auth.uid(), org_id));

CREATE POLICY "Owners can delete org members"
  ON public.org_members FOR DELETE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), org_id));

-- Allow self-insert for new org creation (owner adding themselves)
CREATE POLICY "Users can add themselves as owner"
  ON public.org_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'owner');

-- ============================================
-- 4. org_invites
-- ============================================
CREATE POLICY "Members can read org invites"
  ON public.org_invites FOR SELECT
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Owners can create invites"
  ON public.org_invites FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_owner(auth.uid(), org_id) AND invited_by = auth.uid());

CREATE POLICY "Owners can update invites"
  ON public.org_invites FOR UPDATE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), org_id))
  WITH CHECK (public.is_org_owner(auth.uid(), org_id));

CREATE POLICY "Owners can delete invites"
  ON public.org_invites FOR DELETE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), org_id));

-- ============================================
-- 5. projects (filter deleted_at IS NULL)
-- ============================================
CREATE POLICY "Members can read org projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (
    public.is_org_member(auth.uid(), org_id)
    AND deleted_at IS NULL
  );

CREATE POLICY "Members can create org projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Members can update org projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.is_org_member(auth.uid(), org_id))
  WITH CHECK (public.is_org_member(auth.uid(), org_id));

CREATE POLICY "Owners can delete org projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (public.is_org_owner(auth.uid(), org_id));

-- ============================================
-- 6. areas (filter deleted_at IS NULL, access via project→org)
-- ============================================

-- Helper: check project org membership
CREATE OR REPLACE FUNCTION public.is_project_member(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.org_members om ON om.org_id = p.org_id
    WHERE p.id = _project_id
      AND om.user_id = _user_id
      AND om.status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_project_owner(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.org_members om ON om.org_id = p.org_id
    WHERE p.id = _project_id
      AND om.user_id = _user_id
      AND om.role = 'owner'
      AND om.status = 'active'
  )
$$;

CREATE POLICY "Members can read project areas"
  ON public.areas FOR SELECT
  TO authenticated
  USING (
    public.is_project_member(auth.uid(), project_id)
    AND deleted_at IS NULL
  );

CREATE POLICY "Members can create project areas"
  ON public.areas FOR INSERT
  TO authenticated
  WITH CHECK (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Members can update project areas"
  ON public.areas FOR UPDATE
  TO authenticated
  USING (public.is_project_member(auth.uid(), project_id))
  WITH CHECK (public.is_project_member(auth.uid(), project_id));

CREATE POLICY "Owners can delete project areas"
  ON public.areas FOR DELETE
  TO authenticated
  USING (public.is_project_owner(auth.uid(), project_id));

-- ============================================
-- 7. segments (access via area→project→org)
-- ============================================

CREATE OR REPLACE FUNCTION public.is_area_member(_user_id uuid, _area_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.areas a
    JOIN public.projects p ON p.id = a.project_id
    JOIN public.org_members om ON om.org_id = p.org_id
    WHERE a.id = _area_id
      AND om.user_id = _user_id
      AND om.status = 'active'
  )
$$;

CREATE POLICY "Members can read segments"
  ON public.segments FOR SELECT
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can create segments"
  ON public.segments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can update segments"
  ON public.segments FOR UPDATE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id))
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can delete segments"
  ON public.segments FOR DELETE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

-- ============================================
-- 8. sections (access via area→project→org)
-- ============================================
CREATE POLICY "Members can read sections"
  ON public.sections FOR SELECT
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can create sections"
  ON public.sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can update sections"
  ON public.sections FOR UPDATE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id))
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can delete sections"
  ON public.sections FOR DELETE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

-- ============================================
-- 9. rebar_configs (access via area→project→org)
-- ============================================
CREATE POLICY "Members can read rebar configs"
  ON public.rebar_configs FOR SELECT
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can create rebar configs"
  ON public.rebar_configs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can update rebar configs"
  ON public.rebar_configs FOR UPDATE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id))
  WITH CHECK (public.is_area_member(auth.uid(), area_id));

CREATE POLICY "Members can delete rebar configs"
  ON public.rebar_configs FOR DELETE
  TO authenticated
  USING (public.is_area_member(auth.uid(), area_id));

-- ============================================
-- 10. user_settings
-- ============================================
CREATE POLICY "Users can read own settings"
  ON public.user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 11. stone_types (read-only for authenticated)
-- ============================================
CREATE POLICY "Authenticated users can read stone types"
  ON public.stone_types FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Admin-only write via service role; no user INSERT/UPDATE/DELETE policies

-- ============================================
-- 12. promo_codes — service role only, no user policies
-- ============================================
-- No policies = service role only access

-- ============================================
-- 13. user_promos
-- ============================================
CREATE POLICY "Users can read own promos"
  ON public.user_promos FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own promos"
  ON public.user_promos FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 14. affiliates
-- ============================================
CREATE POLICY "Users can read own affiliate"
  ON public.affiliates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own affiliate"
  ON public.affiliates FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own affiliate"
  ON public.affiliates FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================
-- 15. referrals
-- ============================================

CREATE OR REPLACE FUNCTION public.is_own_affiliate(_user_id uuid, _affiliate_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE id = _affiliate_id AND user_id = _user_id
  )
$$;

CREATE POLICY "Affiliates can read own referrals"
  ON public.referrals FOR SELECT
  TO authenticated
  USING (public.is_own_affiliate(auth.uid(), affiliate_id));

-- INSERT/UPDATE for referrals handled by service role (signup flow)

-- ============================================
-- 16. affiliate_commissions — SELECT only for affiliate owner
-- ============================================
CREATE POLICY "Affiliates can read own commissions"
  ON public.affiliate_commissions FOR SELECT
  TO authenticated
  USING (public.is_own_affiliate(auth.uid(), affiliate_id));

-- INSERT/UPDATE: service role only — no user policies
