import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import Stripe from "https://esm.sh/stripe@17.7.0?target=deno";
import { executeAffiliatePayout } from "../_shared/affiliatePayout.ts";

serve(async (req) => {
  // Only POST allowed
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate cron secret
  const cronSecret = req.headers.get("x-cron-secret");
  const expectedSecret = Deno.env.get("CRON_SECRET");

  if (!expectedSecret || !cronSecret || cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2024-06-20",
    });

    const result = await executeAffiliatePayout(supabase, stripe);
    const executionTimeMs = Date.now() - startTime;

    const response = { ...result, execution_time_ms: executionTimeMs };

    console.log("Monthly payout completed:", JSON.stringify(response));

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    const executionTimeMs = Date.now() - startTime;
    console.error("Monthly payout failed:", msg, `(${executionTimeMs}ms)`);
    return new Response(JSON.stringify({ error: msg, execution_time_ms: executionTimeMs }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
