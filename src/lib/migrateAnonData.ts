import { supabase } from "@/lib/supabase/client";
import { CALC_TYPE_TO_DB } from "@/types/calculator";
import type { CalcState } from "@/hooks/useCalculatorState";
import { getRefCode, clearAnonData } from "./localStorage";

const STORAGE_KEY = "tfc_calculator_state";

const FRACTION_MAP: Record<string, number> = {
  "1/4": 0.25,
  "1/2": 0.5,
  "3/4": 0.75,
  "0": 0,
};

/**
 * Check if anonymous calculator state exists in localStorage.
 */
export function hasCalcState(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

/**
 * Migrates anonymous localStorage calculator state into the
 * authenticated user's Supabase account.
 * Called once after signup/login when anon data exists.
 */
export async function migrateAnonData(userId: string) {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  let state: CalcState;
  try {
    state = JSON.parse(raw) as CalcState;
  } catch {
    return;
  }

  if (!state.areas || state.areas.length === 0) return;

  // Get user's active org
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_org_id")
    .eq("user_id", userId)
    .single();

  const orgId = settings?.active_org_id;
  if (!orgId) return;

  // Create a project for the migrated data
  const { data: project } = await supabase
    .from("projects")
    .insert({ name: "My Project", org_id: orgId })
    .select("id")
    .single();

  if (!project) return;

  // Migrate each area
  for (const area of state.areas) {
    const dbCalcType = CALC_TYPE_TO_DB[area.type] ?? area.type;

    const { data: areaRow } = await supabase
      .from("areas")
      .insert({
        project_id: project.id,
        name: area.name,
        calculator_type: dbCalcType,
        sort_order: area.sortOrder,
        waste_pct: area.wastePct ?? 0,
        inputs: { footingMode: area.footingMode, dimensions: area.dimensions },
        inputs_version: 1,
      })
      .select("id")
      .single();

    if (!areaRow) continue;

    // Migrate segments
    if (area.segments.length > 0) {
      const segmentRows = area.segments.map((seg) => ({
        area_id: areaRow.id,
        feet: seg.feet,
        inches: seg.inches,
        fraction: seg.fraction,
        sort_order: seg.sortOrder,
        length_inches_decimal:
          seg.feet * 12 + seg.inches + (FRACTION_MAP[seg.fraction] ?? 0),
      }));
      await supabase.from("segments").insert(segmentRows);
    }

    // Migrate sections
    if (area.sections.length > 0) {
      const sectionRows = area.sections.map((sec) => ({
        area_id: areaRow.id,
        name: sec.name,
        sort_order: sec.sortOrder,
        length_ft: sec.lengthFt,
        length_in: sec.lengthIn,
        width_ft: sec.widthFt,
        width_in: sec.widthIn,
        thickness_in: sec.thicknessIn,
        include_stone: sec.includeStone,
        stone_depth_in: sec.stoneDepthIn || null,
        stone_type_id: sec.stoneTypeId || null,
      }));
      await supabase.from("sections").insert(sectionRows);
    }
  }

  // Handle referral code
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

  // Clear localStorage
  clearAnonData();
  localStorage.removeItem(STORAGE_KEY);
}
