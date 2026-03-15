CREATE OR REPLACE FUNCTION public.increment_affiliate_earnings(affiliate_row_id uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.affiliates
  SET total_earned_cents = total_earned_cents + amount,
      updated_at = now()
  WHERE id = affiliate_row_id;
END;
$$;