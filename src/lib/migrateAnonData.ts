import { supabase } from "@/lib/supabase/client";
import { CALC_TYPE_TO_DB } from "@/types/calculator";
import type { CalculatorType } from "@/types/calculator";
import {
  getAnonProjects,
  getAnonAreas,
  getAnonSegments,
  getAnonSections,
  getRefCode,
  clearAnonData,
  hasAnonData,
} from "./localStorage";

/**
 * Migrates anonymous localStorage data into the authenticated user's Supabase account.
 * Called once after signup/login when anon data exists.
 */
export async function migrateAnonData(userId: string) {
  if (!hasAnonData()) return;

  // Get user's active org
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_org_id")
    .eq("user_id", userId)
    .single();

  const orgId = settings?.active_org_id;
  if (!orgId) return;

  const anonProjects = getAnonProjects();
  const anonAreas = getAnonAreas();
  const anonSegments = getAnonSegments();
  const anonSections = getAnonSections();

  // Map old local IDs → new Supabase IDs
  const projectIdMap = new Map<string, string>();
  const areaIdMap = new Map<string, string>();

  // 1. Migrate projects
  for (const proj of anonProjects) {
    const { data } = await supabase
      .from("projects")
      .insert({ name: proj.name, org_id: orgId, notes: proj.notes || null })
      .select("id")
      .single();
    if (data) projectIdMap.set(proj.id, data.id);
  }

  // 2. Migrate areas
  for (const area of anonAreas) {
    const newProjectId = projectIdMap.get(area.project_id);
    if (!newProjectId) continue;
    const { data } = await supabase
      .from("areas")
      .insert({
        project_id: newProjectId,
        name: area.name,
        calculator_type: CALC_TYPE_TO_DB[area.calculator_type as CalculatorType] ?? area.calculator_type,
        sort_order: area.sort_order,
        inputs: area.inputs as any,
      })
      .select("id")
      .single();
    if (data) areaIdMap.set(area.id, data.id);
  }

  // 3. Migrate segments
  for (const seg of anonSegments) {
    const newAreaId = areaIdMap.get(seg.area_id);
    if (!newAreaId) continue;
    await supabase.from("segments").insert({
      area_id: newAreaId,
      feet: seg.feet,
      inches: seg.inches,
      fraction: seg.fraction,
      sort_order: seg.sort_order,
    });
  }

  // 4. Migrate sections
  for (const sec of anonSections) {
    const newAreaId = areaIdMap.get(sec.area_id);
    if (!newAreaId) continue;
    await supabase.from("sections").insert({
      area_id: newAreaId,
      name: sec.name,
      sort_order: sec.sort_order,
      length_ft: sec.length_ft,
      length_in: sec.length_in,
      width_ft: sec.width_ft,
      width_in: sec.width_in,
      thickness_in: sec.thickness_in,
    });
  }

  // 5. Handle referral code
  const refCode = getRefCode();
  if (refCode) {
    const { data: affiliate } = await supabase
      .from("affiliates")
      .select("id")
      .eq("referral_code", refCode)
      .single();
    if (affiliate) {
      await supabase.from("referrals").insert({
        affiliate_id: affiliate.id,
        referred_user_id: userId,
      });
    }
  }

  // 6. Clear localStorage
  clearAnonData();
}
