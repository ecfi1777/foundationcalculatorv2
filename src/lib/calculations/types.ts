/**
 * Calculation Engine — Shared Types
 * Pure TypeScript, zero UI imports.
 */

// ── Unit helpers ──────────────────────────────────────────────

/** Imperial length broken into feet + inches + fraction string */
export interface ImperialLength {
  feet: number;
  inches: number;
  fraction: string; // e.g. "0", "1/2", "1/4", "3/4", "1/8", etc.
}

// ── Footing / Wall ────────────────────────────────────────────

export interface FootingInput {
  /** Total linear feet of footing */
  linearFt: number;
  /** Width in inches */
  widthIn: number;
  /** Depth/height in inches */
  depthIn: number;
  /** Waste percentage (0-100) */
  wastePct: number;
  /** Optional wall add-on */
  wall?: WallAddonInput;
}

export interface WallAddonInput {
  /** Height in inches */
  heightIn: number;
  /** Thickness in inches */
  thicknessIn: number;
}

export interface FootingResult {
  footingVolumeCy: number;
  wallVolumeCy: number | null;
  totalVolumeCy: number;
  /** Volume with waste applied */
  totalWithWasteCy: number;
}

// ── Wall Standalone ───────────────────────────────────────────

export interface WallInput {
  linearFt: number;
  heightIn: number;
  thicknessIn: number;
  wastePct: number;
}

export interface WallResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

// ── Grade Beam ────────────────────────────────────────────────

export interface GradeBeamInput {
  linearFt: number;
  widthIn: number;
  depthIn: number;
  wastePct: number;
}

export interface GradeBeamResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

// ── Curb & Gutter ─────────────────────────────────────────────

export interface CurbGutterInput {
  linearFt: number;
  /** Curb depth in inches */
  curbDepthIn: number;
  /** Curb height in inches */
  curbHeightIn: number;
  /** Gutter width in inches */
  gutterWidthIn: number;
  /** Flag/gutter thickness in inches */
  flagThicknessIn: number;
  wastePct: number;
}

export interface CurbGutterResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

// ── Slab ──────────────────────────────────────────────────────

export interface SlabSectionInput {
  lengthFt: number;
  lengthIn: number;
  widthFt: number;
  widthIn: number;
  thicknessIn: number;
}

export interface SlabSectionResult {
  sqft: number;
  volumeCy: number;
}

export interface SlabAreaInput {
  sections: SlabSectionInput[];
  wastePct: number;
}

export interface SlabAreaResult {
  sections: SlabSectionResult[];
  totalSqft: number;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

// ── Pier Pad ──────────────────────────────────────────────────

export interface PierPadInput {
  /** Number of identical piers */
  quantity: number;
  lengthIn: number;
  widthIn: number;
  depthIn: number;
  wastePct: number;
}

export interface PierPadResult {
  volumeEachCy: number;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

// ── Cylinder ──────────────────────────────────────────────────

export interface CylinderInput {
  quantity: number;
  diameterIn: number;
  heightIn: number;
  wastePct: number;
}

export interface CylinderResult {
  volumeEachCy: number;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

// ── Steps / Stairs ────────────────────────────────────────────

export interface StepsInput {
  /** Width of the staircase in inches */
  widthIn: number;
  /** Number of steps */
  numSteps: number;
  /** Rise per step in inches */
  riseIn: number;
  /** Run/tread per step in inches */
  runIn: number;
  /** Thickness of the slab/landing in inches */
  thicknessIn: number;
  /** Optional platform/landing at top: depth in inches */
  platformDepthIn?: number;
  wastePct: number;
}

export interface StepsResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

// ── Rebar ─────────────────────────────────────────────────────

export interface RebarHorizontalInput {
  /** Total linear feet of wall/footing */
  linearFt: number;
  /** Number of horizontal rows */
  numRows: number;
  /** Overlap/splice length in inches (default 12) */
  overlapIn: number;
  /** Standard bar length in feet (default 20) */
  barLengthFt: number;
  /** Waste percentage (0-100) */
  wastePct: number;
}

export interface RebarHorizontalResult {
  /** Total linear feet of rebar needed */
  totalLf: number;
  totalWithWasteLf: number;
}

export interface RebarVerticalInput {
  /** Total linear feet of wall/footing */
  linearFt: number;
  /** Height of each vertical bar in feet + inches */
  barHeightFt: number;
  barHeightIn: number;
  /** On-center spacing in inches */
  spacingIn: number;
  /** Overlap/splice in inches */
  overlapIn: number;
  /** Waste percentage */
  wastePct: number;
}

export interface RebarVerticalResult {
  numBars: number;
  totalLf: number;
  totalWithWasteLf: number;
}

export interface RebarSlabGridInput {
  /** Section length in feet (decimal) */
  lengthFt: number;
  /** Section width in feet (decimal) */
  widthFt: number;
  /** On-center spacing in inches */
  spacingIn: number;
  /** Overlap/splice in inches */
  overlapIn: number;
  /** Standard bar length in feet */
  barLengthFt: number;
  /** Waste percentage */
  wastePct: number;
}

export interface RebarSlabGridResult {
  barsLengthwise: number;
  barsWidthwise: number;
  totalLf: number;
  totalWithWasteLf: number;
}

// ── Stone Base ────────────────────────────────────────────────

export interface StoneBaseInput {
  sqft: number;
  depthIn: number;
  /** Density in tons per cubic yard */
  densityTonsPerCy: number;
  wastePct: number;
}

export interface StoneBaseResult {
  volumeCy: number;
  tons: number;
  tonsWithWaste: number;
}
