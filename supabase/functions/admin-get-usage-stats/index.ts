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

    // Total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true });

    // Paid orgs
    const { count: paidOrgs } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "pro")
      .eq("subscription_status", "active");

    // Free orgs
    const { count: freeOrgs } = await supabase
      .from("organizations")
      .select("id", { count: "exact", head: true })
      .eq("subscription_tier", "free");

    // Projects all time (not deleted)
    const { count: projectsAllTime } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null);

    // Projects last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: projectsLast30 } = await supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .is("deleted_at", null)
      .gte("created_at", thirtyDaysAgo);

    // Active users last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers7d } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("updated_at", sevenDaysAgo);

    return new Response(
      JSON.stringify({
        total_users: totalUsers ?? 0,
        paid_organizations: paidOrgs ?? 0,
        free_organizations: freeOrgs ?? 0,
        projects_all_time: projectsAllTime ?? 0,
        projects_last_30_days: projectsLast30 ?? 0,
        active_users_7_days: activeUsers7d ?? 0,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
