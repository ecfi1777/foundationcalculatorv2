
-- Fix security definer view: recreate as SECURITY INVOKER
DROP VIEW IF EXISTS public.user_effective_tier;

CREATE VIEW public.user_effective_tier
WITH (security_invoker = true)
AS
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

-- promo_codes: add explicit deny-all policy comment
-- RLS is on, no policies = service-role-only access (correct by design)
