import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function validatePromo(body: any): string | null {
  if (!body.code || !body.type) return "code and type are required";
  const validTypes = ["pct_discount", "flat_discount", "trial", "full_unlock"];
  if (!validTypes.includes(body.type)) return `Invalid type. Must be one of: ${validTypes.join(", ")}`;

  switch (body.type) {
    case "pct_discount":
      if (body.discount_pct == null) return "discount_pct is required for pct_discount type";
      break;
    case "flat_discount":
      if (body.discount_cents == null) return "discount_cents is required for flat_discount type";
      break;
    case "trial":
      if (body.trial_days == null) return "trial_days is required for trial type";
      break;
    case "full_unlock":
      break;
  }
  return null;
}

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
    const validationError = validatePromo(body);
    if (validationError) {
      return new Response(JSON.stringify({ error: validationError }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const insertData: any = {
      code: body.code.toUpperCase(),
      type: body.type,
      is_active: body.is_active ?? true,
      grants_premium: body.grants_premium ?? true,
      max_uses: body.max_uses ?? null,
      expires_at: body.expires_at ?? null,
      discount_pct: body.discount_pct ?? null,
      discount_cents: body.discount_cents ?? null,
      trial_days: body.trial_days ?? null,
    };

    const { data: promo, error } = await supabase
      .from("promo_codes")
      .insert(insertData)
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
