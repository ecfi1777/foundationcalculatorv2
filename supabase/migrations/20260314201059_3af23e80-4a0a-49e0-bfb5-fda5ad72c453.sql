
-- Stripe webhook lookup
CREATE INDEX IF NOT EXISTS idx_orgs_stripe_customer ON public.organizations(stripe_customer_id);

-- Affiliate payout batch
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.affiliate_commissions(status);

-- Partial indexes — enforce soft delete at DB level
CREATE INDEX IF NOT EXISTS idx_projects_active ON public.projects(org_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_areas_active ON public.areas(project_id) WHERE deleted_at IS NULL;
