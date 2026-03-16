import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: adminRow } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!adminRow?.is_admin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    if (!body.id) {
      return new Response(JSON.stringify({ error: "Promo id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate type-specific fields if type is provided
    if (body.type) {
      const validTypes = ["pct_discount", "flat_discount", "trial", "full_unlock"];
      if (!validTypes.includes(body.type)) {
        return new Response(JSON.stringify({ error: `Invalid type` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const updateData: any = {};
    if (body.code != null) updateData.code = body.code.toUpperCase();
    if (body.type != null) updateData.type = body.type;
    if (body.discount_pct !== undefined) updateData.discount_pct = body.discount_pct;
    if (body.discount_cents !== undefined) updateData.discount_cents = body.discount_cents;
    if (body.trial_days !== undefined) updateData.trial_days = body.trial_days;
    if (body.max_uses !== undefined) updateData.max_uses = body.max_uses;
    if (body.expires_at !== undefined) updateData.expires_at = body.expires_at;
    if (body.is_active !== undefined) updateData.is_active = body.is_active;
    if (body.grants_premium !== undefined) updateData.grants_premium = body.grants_premium;

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .update(updateData)
      .eq("id", body.id)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(promo), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
