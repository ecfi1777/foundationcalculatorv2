/**
 * Calculator UI State Types
 */

export type CalculatorType =
  | "footing"
  | "wall"
  | "gradeBeam"
  | "curbGutter"
  | "slab"
  | "pierPad"
  | "cylinder"
  | "steps";

export type FootingMode = "footingsOnly" | "footingsWalls" | "wallsOnly";

export type RebarElementType = "footing" | "wall" | "grade_beam" | "curb" | "slab";

export const CALCULATOR_LABELS: Record<CalculatorType, string> = {
  footing: "Footings",
  wall: "Walls",
  gradeBeam: "Grade Beams",
  curbGutter: "Curb & Gutter",
  slab: "Slabs",
  pierPad: "Pier Pads",
  cylinder: "Cylinders",
  steps: "Steps",
};

/** DB spec value for areas.calculator_type */
export type DbCalculatorType =
  | "footings"
  | "walls"
  | "grade_beam"
  | "curb"
  | "slab"
  | "pier_pad"
  | "cylinder"
  | "steps";

/** App type → DB spec value */
export const CALC_TYPE_TO_DB: Record<CalculatorType, DbCalculatorType> = {
  footing: "footings",
  wall: "walls",
  gradeBeam: "grade_beam",
  curbGutter: "curb",
  slab: "slab",
  pierPad: "pier_pad",
  cylinder: "cylinder",
  steps: "steps",
};

/** DB spec value → App type */
export const DB_TO_CALC_TYPE: Record<DbCalculatorType, CalculatorType> = {
  footings: "footing",
  walls: "wall",
  grade_beam: "gradeBeam",
  curb: "curbGutter",
  slab: "slab",
  pier_pad: "pierPad",
  cylinder: "cylinder",
  steps: "steps",
};

export const AREA_NAME_PREFIXES: Record<CalculatorType, string> = {
  footing: "Footing Area",
  wall: "Wall Area",
  gradeBeam: "Grade Beam Area",
  curbGutter: "Curb Area",
  slab: "Slab Area",
  pierPad: "Pier Pad Area",
  cylinder: "Cylinder Area",
  steps: "Steps Area",
};

export const BAR_SIZES = ["#3", "#4", "#5", "#6"] as const;
export type BarSize = (typeof BAR_SIZES)[number];

// ── Segment ────────────────────────────────────────────
export interface Segment {
  id: string;
  feet: number;
  inches: number;
  fraction: string; // "0" | "1/4" | "1/2" | "3/4"
  lengthInchesDecimal: number;
  sortOrder: number;
}

// ── Section (Slab / Pier Pad) ──────────────────────────
export interface CalcSection {
  id: string;
  name: string;
  lengthFt: number;
  lengthIn: number;
  widthFt: number;
  widthIn: number;
  thicknessIn: number; // slabs only
  includeStone: boolean;
  stoneDepthIn: number;
  stoneTypeId: string; // default stone type
  sortOrder: number;
}

// ── Rebar Config ───────────────────────────────────────
export interface RebarConfig {
  id?: string;
  element_type: RebarElementType;
  // Horizontal
  hEnabled: boolean;
  hBarSize: BarSize;
  hNumRows: number;
  hOverlapIn: number;
  hWastePct: number;
  hTotalLf?: number;
  // Vertical
  vEnabled: boolean;
  vBarSize: BarSize;
  vSpacingIn: number;
  vBarHeightFt: number;
  vBarHeightIn: number;
  vOverlapIn: number;
  vWastePct: number;
  vTotalLf?: number;
  // Slab grid
  gridEnabled: boolean;
  gridBarSize: BarSize;
  gridSpacingIn: number;
  gridOverlapIn: number;
  gridWastePct: number;
  gridTotalLf?: number;
}

export function makeDefaultRebar(elementType: RebarElementType): RebarConfig {
  return {
    element_type: elementType,
    hEnabled: false,
    hBarSize: "#4",
    hNumRows: 1,
    hOverlapIn: 12,
    hWastePct: 0,
    vEnabled: false,
    vBarSize: "#4",
    vSpacingIn: 12,
    vBarHeightFt: 0,
    vBarHeightIn: 0,
    vOverlapIn: 12,
    vWastePct: 0,
    gridEnabled: false,
    gridBarSize: "#4",
    gridSpacingIn: 12,
    gridOverlapIn: 12,
    gridWastePct: 0,
  };
}

/** Map of element_type → RebarConfig */
export type RebarConfigsMap = Partial<Record<RebarElementType, RebarConfig>>;

/** Derive rebarEnabled from configs map */
export function deriveRebarEnabled(configs: RebarConfigsMap): boolean {
  return Object.values(configs).some(
    (rc) => rc && (rc.hEnabled || rc.vEnabled || rc.gridEnabled)
  );
}

/** Map calculator_type to element_type(s) */
export function getElementTypes(
  calcType: CalculatorType,
  footingMode?: FootingMode
): RebarElementType[] {
  switch (calcType) {
    case "footing": {
      const mode = footingMode ?? "footingsOnly";
      if (mode === "footingsOnly") return ["footing"];
      if (mode === "wallsOnly") return ["wall"];
      return ["footing", "wall"];
    }
    case "wall":
      return ["wall"];
    case "gradeBeam":
      return ["grade_beam"];
    case "curbGutter":
      return ["curb"];
    case "slab":
      return ["slab"];
    case "pierPad":
      return ["footing"];
    default:
      return [];
  }
}

/** Get single element_type for non-footing calculator types */
export function calcTypeToElementType(calcType: CalculatorType): RebarElementType {
  switch (calcType) {
    case "wall": return "wall";
    case "gradeBeam": return "grade_beam";
    case "curbGutter": return "curb";
    case "slab": return "slab";
    default: return "footing";
  }
}

// ── Area ───────────────────────────────────────────────
export interface CalcArea {
  id: string;
  name: string;
  type: CalculatorType;
  sortOrder: number;
  wastePct: number;

  /** True when newly created and not yet validated with required measurements */
  isDraft?: boolean;

  // Footing mode
  footingMode?: FootingMode;

  // Dimension inputs (type-specific)
  dimensions: Record<string, number>;

  // For linear calculators
  segments: Segment[];

  // For slab / pier pad
  sections: CalcSection[];

  // Rebar - keyed by element_type
  rebarEnabled: boolean;
  rebarConfigs: RebarConfigsMap;
}

/**
 * Check if an area has enough required measurement data to be shown in quantities.
 * Linear types need at least one segment with length > 0.
 * Section-based types need at least one section with non-zero dimensions.
 * Cylinder/Steps have dimension defaults that count as valid.
 */
export function hasRequiredData(area: CalcArea): boolean {
  switch (area.type) {
    case "footing":
    case "wall":
    case "gradeBeam":
    case "curbGutter":
      return area.segments.length > 0 && area.segments.some(s => s.lengthInchesDecimal > 0);
    case "slab":
    case "pierPad":
      return area.sections.length > 0 && area.sections.some(s =>
        (s.lengthFt > 0 || s.lengthIn > 0) && (s.widthFt > 0 || s.widthIn > 0)
      );
    case "cylinder":
      return (area.dimensions.diameterIn ?? 0) > 0
        && ((area.dimensions.heightFt ?? 0) > 0 || (area.dimensions.heightIn ?? 0) > 0)
        && (area.dimensions.quantity ?? 0) > 0;
    case "steps":
      return (area.dimensions.numSteps ?? 0) > 0
        && (area.dimensions.riseIn ?? 0) > 0
        && (area.dimensions.runIn ?? 0) > 0
        && (area.dimensions.widthIn ?? 0) > 0;
    default:
      return false;
  }
}

// ── Computed Results ───────────────────────────────────
export interface RebarResult {
  elementType: RebarElementType;
  horizLf: number | null;
  horizBarSize: BarSize | null;
  vertLf: number | null;
  vertBarSize: BarSize | null;
  vertLabel: string; // "Dowels" for footing, "Vertical" for wall
  gridLf: number | null;
  gridBarSize: BarSize | null;
  gridSpacingIn: number | null;
}

export interface AreaResult {
  areaId: string;
  areaName: string;
  type: CalculatorType;
  footingMode?: FootingMode;
  totalLinearFt: number;
  totalSqft: number;
  footingVolumeCy: number;
  wallVolumeCy: number | null;
  totalVolumeCy: number;
  totalWithWasteCy: number;
  // Rebar per element type
  rebarResults: RebarResult[];
  // Stone (slab sections)
  stoneTons: number | null;
  stoneDepthIn: number | null;
  stoneTypeName: string | null;
  // Steps
  volumeEachCy?: number;
}

export interface ProjectTotals {
  concreteCy: number;
  stoneTons: number;
  rebarLf: number;
}
