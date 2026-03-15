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
  // Horizontal
  hEnabled: boolean;
  hBarSize: BarSize;
  hNumRows: number;
  hOverlapIn: number;
  hWastePct: number;
  // Vertical
  vEnabled: boolean;
  vBarSize: BarSize;
  vSpacingIn: number;
  vBarHeightFt: number;
  vBarHeightIn: number;
  vOverlapIn: number;
  vWastePct: number;
  // Slab grid
  gridEnabled: boolean;
  gridBarSize: BarSize;
  gridSpacingIn: number;
  gridOverlapIn: number;
  gridWastePct: number;
}

export const DEFAULT_REBAR: RebarConfig = {
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

// ── Area ───────────────────────────────────────────────
export interface CalcArea {
  id: string;
  name: string;
  type: CalculatorType;
  sortOrder: number;
  wastePct: number;

  // Footing mode
  footingMode?: FootingMode;

  // Dimension inputs (type-specific)
  // Footing: widthIn, depthIn, wallHeightIn, wallThicknessIn
  // Wall: heightIn, thicknessIn
  // GradeBeam: widthIn, depthIn
  // CurbGutter: curbDepthIn, curbHeightIn, gutterWidthIn, flagThicknessIn
  // Cylinder: diameterIn, heightFt, heightIn, quantity
  // Steps: numSteps, riseIn, runIn, throatDepthIn, widthIn, platformDepthIn, platformWidthIn
  // PierPad: depthIn
  dimensions: Record<string, number>;

  // For linear calculators
  segments: Segment[];

  // For slab / pier pad
  sections: CalcSection[];

  // Rebar
  rebarEnabled: boolean;
  rebar: RebarConfig;
}

// ── Computed Results ───────────────────────────────────
export interface AreaResult {
  areaId: string;
  areaName: string;
  type: CalculatorType;
  totalLinearFt: number;
  totalSqft: number;
  footingVolumeCy: number;
  wallVolumeCy: number | null;
  totalVolumeCy: number;
  totalWithWasteCy: number;
  // Rebar
  rebarHorizLf: number | null;
  rebarHorizBarSize: BarSize | null;
  rebarVertLf: number | null;
  rebarVertBarSize: BarSize | null;
  rebarGridLf: number | null;
  rebarGridBarSize: BarSize | null;
  rebarGridSpacingIn: number | null;
  // Stone (slab sections)
  stoneTons: number | null;
  stoneDepthIn: number | null;
  // Steps
  volumeEachCy?: number;
}

export interface ProjectTotals {
  concreteCy: number;
  stoneTons: number;
  rebarLf: number;
}
