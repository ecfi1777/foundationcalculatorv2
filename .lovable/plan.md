

# Create Cron Schedule Migration

## Change — Create `supabase/migrations/20260408004200_schedule_affiliate_payout_cron.sql`

Single new file. No other files modified.

```sql
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
```

**Key details:**
- URL is hardcoded to the actual project endpoint (not a `current_setting()` placeholder)
- Service role key is fetched at runtime from vault via `vault.decrypted_secrets`
- No other files are touched

