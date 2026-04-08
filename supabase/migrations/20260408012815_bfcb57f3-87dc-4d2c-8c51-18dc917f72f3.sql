SELECT cron.schedule(
  'monthly-affiliate-payout',
  '0 0 1 * *',
  $$
    SELECT net.http_post(
      url := 'https://oppsfffwojbloctbzfpd.supabase.co/functions/v1/monthly-affiliate-payout-trigger',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          SELECT decrypted_secret FROM vault.decrypted_secrets
          WHERE name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1
        )
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);