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

    // Extract user from JWT (gateway already verified the token)
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

    // Admin check
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

    // Fetch users with their org info
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    // Get org membership + org details for each user
    const userIds = (users || []).map((u: any) => u.id);
    const { data: members } = await supabase
      .from("org_members")
      .select("user_id, org_id, role, organizations(name, subscription_tier, subscription_status, stripe_sub_id)")
      .in("user_id", userIds)
      .eq("status", "active");

    const memberMap: Record<string, any> = {};
    for (const m of members || []) {
      // Use first org found (primary)
      if (!memberMap[m.user_id]) {
        memberMap[m.user_id] = m;
      }
    }

    const result = (users || []).map((u: any) => {
      const m = memberMap[u.id];
      const org = m?.organizations;
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        updated_at: u.updated_at,
        org_name: org?.name || null,
        org_id: m?.org_id || null,
        subscription_tier: org?.subscription_tier || "free",
        subscription_status: org?.subscription_status || "active",
        stripe_sub_id: org?.stripe_sub_id || null,
      };
    });

    return new Response(JSON.stringify(result), {
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
