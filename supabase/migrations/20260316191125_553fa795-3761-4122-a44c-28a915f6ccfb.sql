
-- Phase 12C: Add audit columns to affiliate_commissions
ALTER TABLE public.affiliate_commissions
  ADD COLUMN IF NOT EXISTS invoice_id text,
  ADD COLUMN IF NOT EXISTS subscription_id text;

-- Partial unique index on invoice_id for idempotent commission creation
CREATE UNIQUE INDEX IF NOT EXISTS idx_affiliate_commissions_invoice_id
  ON public.affiliate_commissions (invoice_id)
  WHERE invoice_id IS NOT NULL;

-- Phase 12C: Add Stripe Connect cache columns to affiliates
ALTER TABLE public.affiliates
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_details_submitted boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_status_checked_at timestamptz;

-- Phase 12C: Create get_affiliate_dashboard_stats RPC
-- Uses SECURITY DEFINER scoped narrowly with auth.uid() ownership validation
-- because referrals/commissions RLS uses is_own_affiliate which requires
-- the affiliate_id, but we need to join across tables.
CREATE OR REPLACE FUNCTION public.get_affiliate_dashboard_stats(affiliate_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _total_signups bigint;
  _total_conversions bigint;
  _active_referrals bigint;
  _pending_commission_cents bigint;
  _total_earned_cents bigint;
BEGIN
  -- Validate caller owns this affiliate
  _user_id := auth.uid();
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.affiliates
    WHERE id = affiliate_id AND user_id = _user_id
  ) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = '42501';
  END IF;

  -- Aggregate metrics
  SELECT count(*) INTO _total_signups
  FROM public.referrals WHERE referrals.affiliate_id = get_affiliate_dashboard_stats.affiliate_id;

  SELECT count(*) INTO _total_conversions
  FROM public.referrals
  WHERE referrals.affiliate_id = get_affiliate_dashboard_stats.affiliate_id
    AND status = 'converted';

  -- active_referrals = converted referrals (same as conversions per spec)
  _active_referrals := _total_conversions;

  SELECT COALESCE(sum(amount_cents), 0) INTO _pending_commission_cents
  FROM public.affiliate_commissions
  WHERE affiliate_commissions.affiliate_id = get_affiliate_dashboard_stats.affiliate_id
    AND status = 'pending';

  SELECT COALESCE(total_earned_cents, 0) INTO _total_earned_cents
  FROM public.affiliates
  WHERE id = get_affiliate_dashboard_stats.affiliate_id;

  RETURN json_build_object(
    'total_signups', _total_signups,
    'total_conversions', _total_conversions,
    'active_referrals', _active_referrals,
    'pending_commission_cents', _pending_commission_cents,
    'total_earned_cents', _total_earned_cents
  );
END;
$$;
