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

    // Fetch segments + sections in parallel
    const [segRes, secRes] = await Promise.all([
      supabase.from("segments").select("*").in("area_id", areaIds),
      supabase.from("sections").select("*").in("area_id", areaIds),
    ]);

    const segments = segRes.data ?? [];
    const sections = secRes.data ?? [];

    const updatedAreas: any[] = [];

    for (const area of areas) {
      const areaSegments = segments.filter((s: any) => s.area_id === area.id);
      const areaSections = sections.filter((s: any) => s.area_id === area.id);
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

      updatedAreas.push({
        id: area.id,
        total_linear_ft: totalLinearFt,
        total_sqft: totalSqft,
        footing_volume_cy: footingVolumeCy,
        wall_volume_cy: wallVolumeCy,
        total_volume_cy: totalVolumeCy,
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
