import { supabase } from "@/lib/supabase/client";
import type { TakeoffEntry } from "@/components/seo/TakeoffPanel";

const SEO_TAKEOFF_KEY = "tfc_seo_takeoff";

/**
 * Migrates a saved SEO page takeoff from localStorage into a new
 * Supabase project for the authenticated user.
 *
 * Called once after sign-in when hasSeoTakeoff() returns true.
 * Clears localStorage regardless of success or failure.
 */
export async function migrateSeoTakeoff(userId: string): Promise<void> {
  const raw = localStorage.getItem(SEO_TAKEOFF_KEY);

  // Always clear first — if anything goes wrong we don't retry
  // on next login and confuse the user with stale data.
  localStorage.removeItem(SEO_TAKEOFF_KEY);

  if (!raw) return;

  let entries: TakeoffEntry[];
  try {
    entries = JSON.parse(raw) as TakeoffEntry[];
  } catch {
    return;
  }

  if (!Array.isArray(entries) || entries.length === 0) return;

  // Skip rebar — it cannot be mapped to a standalone app area type.
  const migratableEntries = entries.filter(
    (e) => e.tab === "slab" || e.tab === "footing" || e.tab === "wall"
  );

  if (migratableEntries.length === 0) return;

  // Get the user's active org
  const { data: settings } = await supabase
    .from("user_settings")
    .select("active_org_id")
    .eq("user_id", userId)
    .single();

  const orgId = settings?.active_org_id;
  if (!orgId) return;

  // Create the project
  const { data: project } = await supabase
    .from("projects")
    .insert({ name: "My Takeoff", org_id: orgId })
    .select("id")
    .single();

  if (!project) return;

  // Migrate each entry as a separate area
  for (let i = 0; i < migratableEntries.length; i++) {
    const entry = migratableEntries[i];
    const areaName = (entry.name && entry.name.trim())
      ? entry.name.trim()
      : entry.label;

    // ── Build the area inputs payload ──────────────────────
    let calculatorType: string;
    let inputsPayload: Record<string, unknown>;

    if (entry.tab === "slab") {
      calculatorType = "slab";
      inputsPayload = { footingMode: null, dimensions: {} };

    } else if (entry.tab === "footing") {
      calculatorType = "footings";
      inputsPayload = {
        footingMode: "footingsOnly",
        dimensions: {
          widthIn: parseFloat(entry.inputs.footW ?? "24"),
          depthIn: parseFloat(entry.inputs.footD ?? "12"),
        },
      };

    } else if (entry.tab === "wall") {
      calculatorType = "walls";
      inputsPayload = {
        footingMode: null,
        dimensions: {
          heightIn: parseFloat(entry.inputs.wallH ?? "48"),
          thicknessIn: parseFloat(entry.inputs.wallT ?? "8"),
        },
      };

    } else {
      continue;
    }

    // ── Insert the area row ────────────────────────────────
    const { data: areaRow, error: areaError } = await supabase
      .from("areas")
      .insert({
        project_id: project.id,
        name: areaName,
        calculator_type: calculatorType,
        sort_order: i,
        waste_pct: entry.wastePct ?? 0,
        inputs: inputsPayload,
        inputs_version: 1,
      })
      .select("id")
      .single();

    if (areaError || !areaRow) {
      console.error("migrateSeoTakeoff: failed to insert area", areaError?.message);
      continue;
    }

    // ── Slab: insert one section ───────────────────────────
    if (entry.tab === "slab") {
      const lengthFt = parseFloat(entry.inputs.slabL ?? "0");
      const widthFt = parseFloat(entry.inputs.slabW ?? "0");
      const thicknessIn = parseFloat(entry.inputs.slabT ?? "4");

      if (lengthFt > 0 && widthFt > 0) {
        const { error: secError } = await supabase
          .from("sections")
          .insert({
            area_id: areaRow.id,
            name: "Section 1",
            sort_order: 0,
            length_ft: lengthFt,
            length_in: 0,
            length_fraction: "0",
            width_ft: widthFt,
            width_in: 0,
            width_fraction: "0",
            thickness_in: thicknessIn,
            include_stone: false,
            stone_depth_in: null,
            stone_type_id: null,
          });

        if (secError) {
          console.error("migrateSeoTakeoff: failed to insert section", secError.message);
        }
      }
    }

    // ── Footing: insert one segment ────────────────────────
    if (entry.tab === "footing") {
      const lf = parseFloat(entry.inputs.footLf ?? "0");

      if (lf > 0) {
        const { error: segError } = await supabase
          .from("segments")
          .insert({
            area_id: areaRow.id,
            feet: Math.floor(lf),
            inches: Math.round((lf - Math.floor(lf)) * 12),
            fraction: "0",
            sort_order: 0,
            length_inches_decimal: lf * 12,
          });

        if (segError) {
          console.error("migrateSeoTakeoff: failed to insert footing segment", segError.message);
        }
      }
    }

    // ── Wall: insert one segment ───────────────────────────
    if (entry.tab === "wall") {
      const lf = parseFloat(entry.inputs.wallLf ?? "0");

      if (lf > 0) {
        const { error: segError } = await supabase
          .from("segments")
          .insert({
            area_id: areaRow.id,
            feet: Math.floor(lf),
            inches: Math.round((lf - Math.floor(lf)) * 12),
            fraction: "0",
            sort_order: 0,
            length_inches_decimal: lf * 12,
          });

        if (segError) {
          console.error("migrateSeoTakeoff: failed to insert wall segment", segError.message);
        }
      }
    }
  }
}
