CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred_user_id_unique
ON public.referrals (referred_user_id);