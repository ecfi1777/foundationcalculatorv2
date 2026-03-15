import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  inchesToFeet,
  cubicFtToCy,
  applyWaste,
  calcFooting,
  calcWall,
  calcGradeBeam,
  calcCurbGutter,
  calcSlabArea,
  calcPierPad,
  calcCylinder,
  calcSteps,
  calcRebarHorizontal,
  calcRebarVertical,
  calcRebarSlabGrid,
  calcSpliceOverlap,
} from "../_shared/calculations.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Main handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { project_id } = await req.json();
    if (!project_id) {
      return new Response(JSON.stringify({ error: "project_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch areas
    const { data: areas, error: areasErr } = await supabase
      .from("areas")
      .select("*")
      .eq("project_id", project_id)
      .is("deleted_at", null);

    if (areasErr) throw areasErr;
    if (!areas || areas.length === 0) {
      return new Response(JSON.stringify({ areas: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const areaIds = areas.map((a: any) => a.id);

    // Fetch segments, sections, rebar_configs in parallel
    const [segRes, secRes, rebarRes] = await Promise.all([
      supabase.from("segments").select("*").in("area_id", areaIds),
      supabase.from("sections").select("*").in("area_id", areaIds),
      supabase.from("rebar_configs").select("*").in("area_id", areaIds),
    ]);

    const segments = segRes.data ?? [];
    const sections = secRes.data ?? [];
    const rebarConfigs = rebarRes.data ?? [];

    const updatedAreas: any[] = [];

    for (const area of areas) {
      const areaSegments = segments.filter((s: any) => s.area_id === area.id);
      const areaSections = sections.filter((s: any) => s.area_id === area.id);
      const areaRebarConfigs = rebarConfigs.filter((r: any) => r.area_id === area.id);
      const inputs = (area.inputs ?? {}) as Record<string, any>;
      const dims = inputs.dimensions ?? {};
      const wastePct = Number(area.waste_pct) || 0;

      // Sum segment lengths
      const totalLinearFt = areaSegments.reduce((sum: number, s: any) => sum + Number(s.length_inches_decimal), 0) / 12;

      let footingVolumeCy = 0;
      let wallVolumeCy: number | null = null;
      let totalVolumeCy = 0;
      let totalSqft = 0;

      switch (area.calculator_type) {
        case "footing": {
          const footingMode = inputs.footingMode ?? "footingsOnly";
          const showFooting = footingMode !== "wallsOnly";
          const showWall = footingMode === "footingsWalls" || footingMode === "wallsOnly";

          if (showFooting) {
            const r = calcFooting({
              linearFt: totalLinearFt,
              widthIn: dims.widthIn ?? 12,
              depthIn: dims.depthIn ?? 8,
              wastePct,
              wall: showWall ? { heightIn: dims.wallHeightIn ?? 48, thicknessIn: dims.wallThicknessIn ?? 8 } : undefined,
            });
            footingVolumeCy = r.footingVolumeCy;
            wallVolumeCy = r.wallVolumeCy;
            totalVolumeCy = r.totalWithWasteCy;
          } else if (showWall) {
            const r = calcWall({
              linearFt: totalLinearFt,
              heightIn: dims.wallHeightIn ?? 48,
              thicknessIn: dims.wallThicknessIn ?? 8,
              wastePct,
            });
            wallVolumeCy = r.volumeCy;
            totalVolumeCy = r.volumeWithWasteCy;
          }
          break;
        }
        case "wall": {
          const r = calcWall({
            linearFt: totalLinearFt,
            heightIn: dims.heightIn ?? 48,
            thicknessIn: dims.thicknessIn ?? 8,
            wastePct,
          });
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
        case "gradeBeam": {
          const r = calcGradeBeam({
            linearFt: totalLinearFt,
            widthIn: dims.widthIn ?? 12,
            depthIn: dims.depthIn ?? 12,
            wastePct,
          });
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
        case "curbGutter": {
          const r = calcCurbGutter({
            linearFt: totalLinearFt,
            curbDepthIn: dims.curbDepthIn ?? 6,
            curbHeightIn: dims.curbHeightIn ?? 6,
            gutterWidthIn: dims.gutterWidthIn ?? 12,
            flagThicknessIn: dims.flagThicknessIn ?? 4,
            wastePct,
          });
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
        case "slab": {
          if (areaSections.length > 0) {
            const slabSections = areaSections.map((s: any) => ({
              lengthFt: Number(s.length_ft), lengthIn: Number(s.length_in),
              widthFt: Number(s.width_ft), widthIn: Number(s.width_in),
              thicknessIn: Number(s.thickness_in),
            }));
            const r = calcSlabArea({ sections: slabSections, wastePct });
            totalSqft = r.totalSqft;
            totalVolumeCy = r.totalWithWasteCy;
          }
          break;
        }
        case "pierPad": {
          if (areaSections.length > 0) {
            // PierPad uses sections for multiple pads
            let totalPierVol = 0;
            for (const s of areaSections) {
              const lIn = Number(s.length_ft) * 12 + Number(s.length_in);
              const wIn = Number(s.width_ft) * 12 + Number(s.width_in);
              totalPierVol += cubicFtToCy(inchesToFeet(lIn) * inchesToFeet(wIn) * inchesToFeet(dims.depthIn ?? 6));
            }
            totalVolumeCy = applyWaste(totalPierVol, wastePct);
          }
          break;
        }
        case "cylinder": {
          const r = calcCylinder({
            diameterIn: dims.diameterIn ?? 12,
            heightFt: dims.heightFt ?? 4,
            heightIn: dims.heightIn ?? 0,
            quantity: dims.quantity ?? 1,
            wastePct,
          });
          totalVolumeCy = r.totalWithWasteCy;
          break;
        }
        case "steps": {
          const r = calcSteps({
            numSteps: dims.numSteps ?? 3,
            riseIn: dims.riseIn ?? 7,
            runIn: dims.runIn ?? 11,
            throatDepthIn: dims.throatDepthIn ?? 6,
            widthIn: dims.widthIn ?? 36,
            platformDepthIn: dims.platformDepthIn ?? 0,
            platformWidthIn: dims.platformWidthIn ?? 0,
            wastePct,
          });
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
      }

      // Update area with canonical values
      const { error: updateErr } = await supabase
        .from("areas")
        .update({
          total_linear_ft: totalLinearFt,
          total_sqft: totalSqft,
          footing_volume_cy: footingVolumeCy,
          wall_volume_cy: wallVolumeCy,
          total_volume_cy: totalVolumeCy,
          updated_at: new Date().toISOString(),
        })
        .eq("id", area.id);

      if (updateErr) {
        console.error(`Failed to update area ${area.id}:`, updateErr);
      }

      // Compute rebar totals per element_type
      const rebarOutput: Record<string, any> = {};

      for (const rc of areaRebarConfigs) {
        const et = rc.element_type;
        let h_total_lf = 0;
        let v_total_lf = 0;
        let grid_total_lf = 0;

        if (et === "slab") {
          // Grid rebar for slab
          if (rc.grid_enabled && areaSections.length > 0) {
            let totalGridLf = 0;
            for (const sec of areaSections) {
              const lenFt = Number(sec.length_ft) + Number(sec.length_in) / 12;
              const widFt = Number(sec.width_ft) + Number(sec.width_in) / 12;
              if (lenFt > 0 && widFt > 0) {
                const gr = calcRebarSlabGrid({
                  lengthFt: lenFt,
                  widthFt: widFt,
                  spacingIn: Number(rc.grid_spacing_in) || 12,
                  overlapIn: Number(rc.grid_overlap_in) || 12,
                  barLengthFt: 20,
                  wastePct: Number(rc.grid_waste_pct) || 0,
                });
                totalGridLf += gr.totalWithWasteLf;
              }
            }
            grid_total_lf = totalGridLf;
          }
        } else {
          // Linear rebar (horiz + vert)
          if (rc.h_enabled && totalLinearFt > 0) {
            const hr = calcRebarHorizontal({
              linearFt: totalLinearFt,
              numRows: Number(rc.h_num_rows) || 1,
              overlapIn: Number(rc.h_overlap_in) || 12,
              barLengthFt: 20,
              wastePct: Number(rc.h_waste_pct) || 0,
            });
            h_total_lf = hr.totalWithWasteLf;
          }
          if (rc.v_enabled && totalLinearFt > 0) {
            const vr = calcRebarVertical({
              linearFt: totalLinearFt,
              barHeightFt: Number(rc.v_bar_height_ft) || 0,
              barHeightIn: Number(rc.v_bar_height_in) || 0,
              spacingIn: Number(rc.v_spacing_in) || 12,
              overlapIn: Number(rc.v_overlap_in) || 12,
              wastePct: Number(rc.v_waste_pct) || 0,
            });
            v_total_lf = vr.totalWithWasteLf;
          }
        }

        // Update rebar_configs row
        await supabase
          .from("rebar_configs")
          .update({
            h_total_lf: h_total_lf,
            v_total_lf: v_total_lf,
            grid_total_lf: grid_total_lf,
          })
          .eq("area_id", area.id)
          .eq("element_type", et);

        rebarOutput[et] = { h_total_lf, v_total_lf, grid_total_lf };
      }

      updatedAreas.push({
        id: area.id,
        total_linear_ft: totalLinearFt,
        total_sqft: totalSqft,
        footing_volume_cy: footingVolumeCy,
        wall_volume_cy: wallVolumeCy,
        total_volume_cy: totalVolumeCy,
        rebar: rebarOutput,
      });
    }

    return new Response(JSON.stringify({ areas: updatedAreas }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Recalculate error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
