import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Inlined calculation helpers (same formulas as src/lib/calculations/) ──

function inchesToFeet(inches: number): number { return inches / 12; }
function cubicFtToCy(cubicFt: number): number { return cubicFt / 27; }
function applyWaste(value: number, wastePct: number): number { return value * (1 + wastePct / 100); }

function calcFooting(linearFt: number, widthIn: number, depthIn: number, wastePct: number, wall?: { heightIn: number; thicknessIn: number }) {
  const footingVolumeCy = cubicFtToCy(linearFt * inchesToFeet(widthIn) * inchesToFeet(depthIn));
  let wallVolumeCy: number | null = null;
  if (wall) {
    wallVolumeCy = cubicFtToCy(linearFt * inchesToFeet(wall.thicknessIn) * inchesToFeet(wall.heightIn));
  }
  const totalVolumeCy = footingVolumeCy + (wallVolumeCy ?? 0);
  return { footingVolumeCy, wallVolumeCy, totalVolumeCy, totalWithWasteCy: applyWaste(totalVolumeCy, wastePct) };
}

function calcWall(linearFt: number, heightIn: number, thicknessIn: number, wastePct: number) {
  const volumeCy = cubicFtToCy(linearFt * inchesToFeet(heightIn) * inchesToFeet(thicknessIn));
  return { volumeCy, volumeWithWasteCy: applyWaste(volumeCy, wastePct) };
}

function calcGradeBeam(linearFt: number, widthIn: number, depthIn: number, wastePct: number) {
  const volumeCy = cubicFtToCy(linearFt * inchesToFeet(widthIn) * inchesToFeet(depthIn));
  return { volumeCy, volumeWithWasteCy: applyWaste(volumeCy, wastePct) };
}

function calcCurbGutter(linearFt: number, curbDepthIn: number, curbHeightIn: number, gutterWidthIn: number, flagThicknessIn: number, wastePct: number) {
  const curbFt3 = linearFt * (curbDepthIn / 12) * (curbHeightIn / 12);
  const gutterFt3 = linearFt * (gutterWidthIn / 12) * (flagThicknessIn / 12);
  const volumeCy = (curbFt3 + gutterFt3) / 27;
  return { volumeCy, volumeWithWasteCy: applyWaste(volumeCy, wastePct) };
}

function calcSlabArea(sections: Array<{ lengthFt: number; lengthIn: number; widthFt: number; widthIn: number; thicknessIn: number }>, wastePct: number) {
  let totalSqft = 0, totalVolumeCy = 0;
  for (const s of sections) {
    const lf = s.lengthFt + s.lengthIn / 12;
    const wf = s.widthFt + s.widthIn / 12;
    const sqft = lf * wf;
    totalSqft += sqft;
    totalVolumeCy += cubicFtToCy(sqft * inchesToFeet(s.thicknessIn));
  }
  return { totalSqft, totalVolumeCy, totalWithWasteCy: applyWaste(totalVolumeCy, wastePct) };
}

function calcPierPad(sections: Array<{ lengthFt: number; lengthIn: number; widthFt: number; widthIn: number }>, depthIn: number, wastePct: number) {
  let totalVolumeCy = 0;
  for (const s of sections) {
    const lIn = s.lengthFt * 12 + s.lengthIn;
    const wIn = s.widthFt * 12 + s.widthIn;
    totalVolumeCy += cubicFtToCy(inchesToFeet(lIn) * inchesToFeet(wIn) * inchesToFeet(depthIn));
  }
  return { totalVolumeCy, totalWithWasteCy: applyWaste(totalVolumeCy, wastePct) };
}

function calcCylinder(diameterIn: number, heightFt: number, heightIn: number, quantity: number, wastePct: number) {
  const radiusFt = (diameterIn / 12) / 2;
  const heightFtTotal = heightFt + heightIn / 12;
  const volumeEachCy = (Math.PI * radiusFt * radiusFt * heightFtTotal) / 27;
  const totalVolumeCy = volumeEachCy * quantity;
  return { totalVolumeCy, totalWithWasteCy: applyWaste(totalVolumeCy, wastePct) };
}

function calcSteps(numSteps: number, riseIn: number, runIn: number, throatDepthIn: number, widthIn: number, platformDepthIn: number, platformWidthIn: number, wastePct: number) {
  const A = riseIn * runIn * widthIn / 2;
  const h = Math.sqrt(riseIn * riseIn + runIn * runIn);
  const B = h * widthIn * throatDepthIn;
  const V1 = (A + B) * (numSteps - 1);
  const V2 = riseIn * runIn * widthIn;
  const stairsFt3 = (V1 + V2) * 0.0005787037;
  let platformFt3 = 0;
  if (platformDepthIn > 0) {
    platformFt3 = (platformDepthIn / 12) * ((platformWidthIn || widthIn) / 12) * (widthIn / 12);
  }
  const volumeCy = (stairsFt3 + platformFt3) / 27;
  return { volumeCy, volumeWithWasteCy: applyWaste(volumeCy, wastePct) };
}

// ── Rebar calculation helpers ──

function calcRebarHorizontal(linearFt: number, numRows: number, overlapIn: number, barLengthFt: number, wastePct: number) {
  const numSplices = Math.floor(linearFt / barLengthFt);
  const overlapLf = numSplices * inchesToFeet(overlapIn) * numRows;
  const totalLf = (linearFt * numRows) + overlapLf;
  return { totalLf, totalWithWasteLf: applyWaste(totalLf, wastePct) };
}

function calcRebarVertical(linearFt: number, barHeightFt: number, barHeightIn: number, spacingIn: number, wastePct: number) {
  const numBars = Math.floor(linearFt * 12 / spacingIn) + 1;
  const barHFt = barHeightFt + inchesToFeet(barHeightIn);
  const totalLf = numBars * barHFt;
  return { totalLf, totalWithWasteLf: applyWaste(totalLf, wastePct) };
}

function calcSpliceOverlap(totalLengthFt: number, barLengthFt: number, overlapIn: number): number {
  if (totalLengthFt <= 0) return 0;
  const numBars = Math.ceil(totalLengthFt / barLengthFt);
  const splices = Math.max(numBars - 1, 0);
  return splices * inchesToFeet(overlapIn);
}

function calcRebarSlabGrid(lengthFt: number, widthFt: number, spacingIn: number, overlapIn: number, barLengthFt: number, wastePct: number) {
  const lengthIn = lengthFt * 12;
  const widthIn = widthFt * 12;
  const barsLengthwise = Math.floor(widthIn / spacingIn) + 1;
  const barsWidthwise = Math.floor(lengthIn / spacingIn) + 1;
  const spliceLength = calcSpliceOverlap(lengthFt, barLengthFt, overlapIn);
  const lfLengthwise = barsLengthwise * (lengthFt + spliceLength);
  const spliceWidth = calcSpliceOverlap(widthFt, barLengthFt, overlapIn);
  const lfWidthwise = barsWidthwise * (widthFt + spliceWidth);
  const totalLf = lfLengthwise + lfWidthwise;
  return { totalLf, totalWithWasteLf: applyWaste(totalLf, wastePct) };
}

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
            const r = calcFooting(totalLinearFt, dims.widthIn ?? 12, dims.depthIn ?? 8, wastePct,
              showWall ? { heightIn: dims.wallHeightIn ?? 48, thicknessIn: dims.wallThicknessIn ?? 8 } : undefined);
            footingVolumeCy = r.footingVolumeCy;
            wallVolumeCy = r.wallVolumeCy;
            totalVolumeCy = r.totalWithWasteCy;
          } else if (showWall) {
            const r = calcWall(totalLinearFt, dims.wallHeightIn ?? 48, dims.wallThicknessIn ?? 8, wastePct);
            wallVolumeCy = r.volumeCy;
            totalVolumeCy = r.volumeWithWasteCy;
          }
          break;
        }
        case "wall": {
          const r = calcWall(totalLinearFt, dims.heightIn ?? 48, dims.thicknessIn ?? 8, wastePct);
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
        case "gradeBeam": {
          const r = calcGradeBeam(totalLinearFt, dims.widthIn ?? 12, dims.depthIn ?? 12, wastePct);
          totalVolumeCy = r.volumeWithWasteCy;
          break;
        }
        case "curbGutter": {
          const r = calcCurbGutter(totalLinearFt, dims.curbDepthIn ?? 6, dims.curbHeightIn ?? 6, dims.gutterWidthIn ?? 12, dims.flagThicknessIn ?? 4, wastePct);
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
            const r = calcSlabArea(slabSections, wastePct);
            totalSqft = r.totalSqft;
            totalVolumeCy = r.totalWithWasteCy;
          }
          break;
        }
        case "pierPad": {
          if (areaSections.length > 0) {
            const pierSections = areaSections.map((s: any) => ({
              lengthFt: Number(s.length_ft), lengthIn: Number(s.length_in),
              widthFt: Number(s.width_ft), widthIn: Number(s.width_in),
            }));
            const r = calcPierPad(pierSections, dims.depthIn ?? 6, wastePct);
            totalVolumeCy = r.totalWithWasteCy;
          }
          break;
        }
        case "cylinder": {
          const r = calcCylinder(dims.diameterIn ?? 12, dims.heightFt ?? 4, dims.heightIn ?? 0, dims.quantity ?? 1, wastePct);
          totalVolumeCy = r.totalWithWasteCy;
          break;
        }
        case "steps": {
          const r = calcSteps(dims.numSteps ?? 3, dims.riseIn ?? 7, dims.runIn ?? 11, dims.throatDepthIn ?? 6, dims.widthIn ?? 36, dims.platformDepthIn ?? 0, dims.platformWidthIn ?? 0, wastePct);
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
                const gr = calcRebarSlabGrid(
                  lenFt, widFt,
                  Number(rc.grid_spacing_in) || 12,
                  Number(rc.grid_overlap_in) || 12,
                  20,
                  Number(rc.grid_waste_pct) || 0
                );
                totalGridLf += gr.totalWithWasteLf;
              }
            }
            grid_total_lf = totalGridLf;
          }
        } else {
          // Linear rebar (horiz + vert)
          if (rc.h_enabled && totalLinearFt > 0) {
            const hr = calcRebarHorizontal(
              totalLinearFt,
              Number(rc.h_num_rows) || 1,
              Number(rc.h_overlap_in) || 12,
              20,
              Number(rc.h_waste_pct) || 0
            );
            h_total_lf = hr.totalWithWasteLf;
          }
          if (rc.v_enabled && totalLinearFt > 0) {
            const vr = calcRebarVertical(
              totalLinearFt,
              Number(rc.v_bar_height_ft) || 0,
              Number(rc.v_bar_height_in) || 0,
              Number(rc.v_spacing_in) || 12,
              Number(rc.v_waste_pct) || 0
            );
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
