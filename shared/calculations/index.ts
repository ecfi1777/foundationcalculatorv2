/**
 * Shared Calculation Engine
 * Single source of truth for all formula logic.
 * Importable by both the app (via src/lib/calculations/) and Edge Functions.
 */

// ── Types ─────────────────────────────────────────────

export interface ImperialLength {
  feet: number;
  inches: number;
  fraction: string;
}

export interface FootingInput {
  linearFt: number;
  widthIn: number;
  depthIn: number;
  wastePct: number;
  wall?: WallAddonInput;
}

export interface WallAddonInput {
  heightIn: number;
  thicknessIn: number;
}

export interface FootingResult {
  footingVolumeCy: number;
  wallVolumeCy: number | null;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

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

export interface CurbGutterInput {
  linearFt: number;
  curbDepthIn: number;
  curbHeightIn: number;
  gutterWidthIn: number;
  flagThicknessIn: number;
  wastePct: number;
}

export interface CurbGutterResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

export interface SlabSectionInput {
  lengthFt: number;
  lengthIn: number;
  widthFt: number;
  widthIn: number;
  thicknessIn: number;
  wastePct: number;
}

export interface SlabSectionResult {
  sqft: number;
  volumeCy: number;
  volumeWithWasteCy: number;
}

export interface SlabAreaInput {
  sections: SlabSectionInput[];
}

export interface SlabAreaResult {
  sections: SlabSectionResult[];
  totalSqft: number;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

export interface PierPadInput {
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

export interface CylinderInput {
  quantity: number;
  diameterIn: number;
  heightFt: number;
  heightIn: number;
  wastePct: number;
}

export interface CylinderResult {
  volumeEachCy: number;
  totalVolumeCy: number;
  totalWithWasteCy: number;
}

export interface StepsInput {
  widthIn: number;
  numSteps: number;
  riseIn: number;
  runIn: number;
  throatDepthIn: number;
  platformDepthIn?: number;
  platformWidthIn?: number;
  wastePct: number;
}

export interface StepsResult {
  volumeCy: number;
  volumeWithWasteCy: number;
}

export interface RebarHorizontalInput {
  linearFt: number;
  numRows: number;
  overlapIn: number;
  barLengthFt: number;
  /** v2.3: inset from each end of the run, in inches. Optional — defaults to 3 when undefined.
   *  Subtracted 2× from linearFt to produce the steel run used in splice math. */
  insetIn?: number;
  wastePct: number;
}

export interface RebarHorizontalResult {
  totalLf: number;
  totalWithWasteLf: number;
  /** v2.3: total sticks across all rows = n × numRows. */
  piecesTotal: number;
  /** v2.3: splices in a single row = n − 1, clamped at 0. */
  splicesPerRow: number;
}

export interface RebarVerticalInput {
  linearFt: number;
  barHeightFt: number;
  barHeightIn: number;
  spacingIn: number;
  overlapIn: number;
  /** v2.3: standard bar length in feet. Optional — defaults to 20 when undefined. */
  barLengthFt?: number;
  wastePct: number;
}

export interface RebarVerticalResult {
  numBars: number;
  totalLf: number;
  totalWithWasteLf: number;
  /** v2.3: total sticks across all vertical positions = numBars × pieces-per-position. */
  piecesTotal: number;
}

export interface RebarSlabGridInput {
  lengthFt: number;
  widthFt: number;
  spacingIn: number;
  overlapIn: number;
  barLengthFt: number;
  /** v2.3: inset from each edge, in inches. Optional — defaults to 3 when undefined.
   *  Applied to BOTH axes (reduces usable placement span AND steel run per bar). */
  insetIn?: number;
  wastePct: number;
}

export interface RebarSlabGridResult {
  barsLengthwise: number;
  barsWidthwise: number;
  totalLf: number;
  totalWithWasteLf: number;
  /** v2.3: total sticks = (barsLengthwise × n_lw) + (barsWidthwise × n_ww). */
  piecesTotal: number;
}

export interface RebarLBarInput {
  /** Linear feet of the run (segment sum for footings/walls/grade beams, equivalent dim for pier pads). */
  linearFt: number;
  /** On-center spacing along the run, in inches. */
  spacingIn: number;
  /** Vertical leg length — whole feet. */
  verticalFt: number;
  /** Vertical leg length — remaining inches. */
  verticalIn: number;
  /** 90° bend/hook length in inches. UI pre-fills 12″, editable per-area. */
  bendLengthIn: number;
  /** Standard bar length in feet (typically 20). */
  barLengthFt: number;
  /** Splice overlap in inches. */
  overlapIn: number;
  /** Inset along the run, in inches. Optional — defaults to 3. */
  insetIn?: number;
  /** Waste percentage (0–100). */
  wastePct: number;
}

export interface RebarLBarResult {
  /** Number of L-bar positions along the run (post-inset, floor+1). */
  numLBars: number;
  /** Pieces per individual L-bar (1 normally; 2+ if vertical leg + bend exceeds a standard bar). */
  piecesPerLBar: number;
  /** Linear feet ordered per individual L-bar = piecesPerLBar × barLengthFt. */
  lfPerLBar: number;
  totalLf: number;
  totalWithWasteLf: number;
  /** Total sticks = numLBars × piecesPerLBar. */
  piecesTotal: number;
}

export interface StoneBaseInput {
  sqft: number;
  depthIn: number;
  densityTonsPerCy: number;
  wastePct: number;
}

export interface StoneBaseResult {
  volumeCy: number;
  tons: number;
  tonsWithWaste: number;
}

// ── Fraction Map ──────────────────────────────────────

const FRACTION_MAP: Record<string, number> = {
  "0": 0, "1/16": 1/16, "1/8": 1/8, "3/16": 3/16, "1/4": 1/4,
  "5/16": 5/16, "3/8": 3/8, "7/16": 7/16, "1/2": 1/2, "9/16": 9/16,
  "5/8": 5/8, "11/16": 11/16, "3/4": 3/4, "13/16": 13/16, "7/8": 7/8,
  "15/16": 15/16,
};

// ── Utilities ─────────────────────────────────────────

export function toTotalInches(length: ImperialLength): number {
  const fractionVal = FRACTION_MAP[length.fraction] ?? 0;
  return length.feet * 12 + length.inches + fractionVal;
}

export function inchesToFeet(inches: number): number {
  return inches / 12;
}

export function cubicFtToCy(cubicFt: number): number {
  return cubicFt / 27;
}

export function applyWaste(value: number, wastePct: number): number {
  return value * (1 + wastePct / 100);
}

export function calcSpliceOverlap(
  totalLengthFt: number,
  barLengthFt: number,
  overlapIn: number
): number {
  if (totalLengthFt <= 0 || barLengthFt <= 0) return 0;
  // Corrects spec inconsistency: only add splices when more than one bar is
  // required. splices = max(ceil(L / barLen) - 1, 0).
  const splices = Math.max(Math.ceil(totalLengthFt / barLengthFt) - 1, 0);
  return splices * inchesToFeet(overlapIn);
}

// 1/1728 — converts cubic inches to cubic feet (12^3 = 1728)
const CUBIC_IN_TO_FT3 = 0.0005787037;

// ── Volume Calculators ────────────────────────────────

export function calcFooting(input: FootingInput): FootingResult {
  if (input.linearFt <= 0 || input.widthIn < 0 || input.depthIn < 0) {
    return { footingVolumeCy: 0, wallVolumeCy: null, totalVolumeCy: 0, totalWithWasteCy: 0 };
  }

  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const footingVolumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);

  let wallVolumeCy: number | null = null;
  if (input.wall) {
    if (input.wall.heightIn < 0 || input.wall.thicknessIn < 0) {
      return { footingVolumeCy: 0, wallVolumeCy: null, totalVolumeCy: 0, totalWithWasteCy: 0 };
    }
    const wallHeightFt = inchesToFeet(input.wall.heightIn);
    const wallThicknessFt = inchesToFeet(input.wall.thicknessIn);
    wallVolumeCy = cubicFtToCy(input.linearFt * wallThicknessFt * wallHeightFt);
  }

  const totalVolumeCy = footingVolumeCy + (wallVolumeCy ?? 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);

  return { footingVolumeCy, wallVolumeCy, totalVolumeCy, totalWithWasteCy };
}

export function calcWall(input: WallInput): WallResult {
  if (input.linearFt <= 0 || input.heightIn < 0 || input.thicknessIn < 0) {
    return { volumeCy: 0, volumeWithWasteCy: 0 };
  }
  const heightFt = inchesToFeet(input.heightIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const volumeCy = cubicFtToCy(input.linearFt * heightFt * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcGradeBeam(input: GradeBeamInput): GradeBeamResult {
  if (input.linearFt <= 0 || input.widthIn < 0 || input.depthIn < 0) {
    return { volumeCy: 0, volumeWithWasteCy: 0 };
  }
  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcCurbGutter(input: CurbGutterInput): CurbGutterResult {
  if (input.linearFt <= 0 || input.curbDepthIn < 0 || input.curbHeightIn < 0 ||
      input.gutterWidthIn < 0 || input.flagThicknessIn < 0) {
    return { volumeCy: 0, volumeWithWasteCy: 0 };
  }
  const curbFt3 = input.linearFt * inchesToFeet(input.curbDepthIn) * inchesToFeet(input.curbHeightIn);
  const gutterFt3 = input.linearFt * inchesToFeet(input.gutterWidthIn) * inchesToFeet(input.flagThicknessIn);
  const volumeCy = cubicFtToCy(curbFt3 + gutterFt3);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcSlabSection(input: SlabSectionInput): SlabSectionResult {
  const lengthFt = input.lengthFt + inchesToFeet(input.lengthIn);
  const widthFt = input.widthFt + inchesToFeet(input.widthIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  if (lengthFt <= 0 || widthFt <= 0 || thicknessFt < 0) return { sqft: 0, volumeCy: 0, volumeWithWasteCy: 0 };
  const sqft = lengthFt * widthFt;
  const volumeCy = cubicFtToCy(sqft * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { sqft, volumeCy, volumeWithWasteCy };
}

export function calcSlabArea(input: SlabAreaInput): SlabAreaResult {
  const sections = input.sections.map(calcSlabSection);
  const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0);
  const totalVolumeCy = sections.reduce((sum, s) => sum + s.volumeCy, 0);
  const totalWithWasteCy = sections.reduce((sum, s) => sum + s.volumeWithWasteCy, 0);
  return { sections, totalSqft, totalVolumeCy, totalWithWasteCy };
}

export function calcPierPad(input: PierPadInput): PierPadResult {
  if (input.quantity <= 0 || input.lengthIn < 0 || input.widthIn < 0 || input.depthIn < 0) {
    return { volumeEachCy: 0, totalVolumeCy: 0, totalWithWasteCy: 0 };
  }
  const lFt = inchesToFeet(input.lengthIn);
  const wFt = inchesToFeet(input.widthIn);
  const dFt = inchesToFeet(input.depthIn);
  const volumeEachCy = cubicFtToCy(lFt * wFt * dFt);
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}

export function calcCylinder(input: CylinderInput): CylinderResult {
  if (input.quantity <= 0 || input.diameterIn <= 0) {
    return { volumeEachCy: 0, totalVolumeCy: 0, totalWithWasteCy: 0 };
  }
  const heightFtTotal = input.heightFt + inchesToFeet(input.heightIn);
  if (heightFtTotal <= 0) return { volumeEachCy: 0, totalVolumeCy: 0, totalWithWasteCy: 0 };
  const radiusFt = inchesToFeet(input.diameterIn) / 2;
  const volumeFt3 = Math.PI * radiusFt * radiusFt * heightFtTotal;
  const volumeEachCy = volumeFt3 / 27;
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}

export function calcSteps(input: StepsInput): StepsResult {
  const { riseIn, runIn, widthIn, numSteps, throatDepthIn, wastePct } = input;

  if (riseIn <= 0 || runIn <= 0 || widthIn <= 0 || numSteps <= 0 || throatDepthIn < 0) {
    return { volumeCy: 0, volumeWithWasteCy: 0 };
  }

  const A = riseIn * runIn * widthIn / 2;
  const h = Math.sqrt(riseIn * riseIn + runIn * runIn);
  const B = h * widthIn * throatDepthIn;
  const V1 = (A + B) * (numSteps - 1);
  const V2 = riseIn * runIn * widthIn;
  const stairsFt3 = (V1 + V2) * CUBIC_IN_TO_FT3;

  let platformFt3 = 0;
  if (input.platformDepthIn && input.platformDepthIn > 0) {
    const platformWidthIn = input.platformWidthIn ?? widthIn;
    platformFt3 = inchesToFeet(input.platformDepthIn) * inchesToFeet(platformWidthIn) * inchesToFeet(widthIn);
  }

  const volumeCy = (stairsFt3 + platformFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, wastePct);

  return { volumeCy, volumeWithWasteCy };
}

// ── Rebar Calculators (v2.3) ──────────────────────────

/**
 * Scenario B piece count — overlap is INSIDE the steel run, not additive.
 * Two 20 ft bars with 12″ overlap cover 39 ft, not 41 ft.
 *
 * @returns 0 for invalid input, 1 when the run fits in one bar, else
 *          ceil((steelRunFt − overlapFt) / (barLengthFt − overlapFt)).
 */
export function calcPieceCount(
  steelRunFt: number,
  barLengthFt: number,
  overlapFt: number
): number {
  if (steelRunFt <= 0 || barLengthFt <= 0) return 0;
  if (steelRunFt <= barLengthFt) return 1;
  const denom = barLengthFt - overlapFt;
  if (denom <= 0) return 1; // pathological: overlap ≥ bar length → one bar covers nothing extra
  return Math.ceil((steelRunFt - overlapFt) / denom);
}

export function calcRebarHorizontal(input: RebarHorizontalInput): RebarHorizontalResult {
  const ZERO: RebarHorizontalResult = { totalLf: 0, totalWithWasteLf: 0, piecesTotal: 0, splicesPerRow: 0 };
  if (input.linearFt <= 0 || input.numRows <= 0 || input.barLengthFt <= 0) return { ...ZERO };

  const insetFt = inchesToFeet(input.insetIn ?? 3);
  const overlapFt = inchesToFeet(input.overlapIn);
  const steelRunFt = input.linearFt - 2 * insetFt;
  if (steelRunFt <= 0) return { ...ZERO }; // run too short for rebar at this inset

  const n = calcPieceCount(steelRunFt, input.barLengthFt, overlapFt);
  const lfPerRow = n * input.barLengthFt;
  const totalLf = lfPerRow * input.numRows;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return {
    totalLf,
    totalWithWasteLf,
    piecesTotal: n * input.numRows,
    splicesPerRow: Math.max(n - 1, 0),
  };
}

export function calcRebarVertical(input: RebarVerticalInput): RebarVerticalResult {
  const ZERO: RebarVerticalResult = { numBars: 0, totalLf: 0, totalWithWasteLf: 0, piecesTotal: 0 };
  if (input.linearFt <= 0 || input.spacingIn <= 0) return { ...ZERO };

  const barLengthFt = input.barLengthFt ?? 20;
  if (barLengthFt <= 0) return { ...ZERO };

  const barHeightFt = input.barHeightFt + inchesToFeet(input.barHeightIn);
  if (barHeightFt <= 0) return { ...ZERO };

  const overlapFt = inchesToFeet(input.overlapIn);
  const numBars = Math.floor((input.linearFt * 12) / input.spacingIn) + 1;
  const nPer = calcPieceCount(barHeightFt, barLengthFt, overlapFt);
  const lfPerPosition = nPer * barLengthFt;
  const totalLf = numBars * lfPerPosition;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return {
    numBars,
    totalLf,
    totalWithWasteLf,
    piecesTotal: numBars * nPer,
  };
}

export function calcRebarSlabGrid(input: RebarSlabGridInput): RebarSlabGridResult {
  const ZERO: RebarSlabGridResult = {
    barsLengthwise: 0, barsWidthwise: 0,
    totalLf: 0, totalWithWasteLf: 0, piecesTotal: 0,
  };
  if (input.lengthFt <= 0 || input.widthFt <= 0 || input.spacingIn <= 0 || input.barLengthFt <= 0) {
    return { ...ZERO };
  }

  const insetFt = inchesToFeet(input.insetIn ?? 3);
  const overlapFt = inchesToFeet(input.overlapIn);
  const spacingFt = input.spacingIn / 12;

  const lSteelLength = input.lengthFt - 2 * insetFt; // bars running lengthwise
  const wSteelWidth = input.widthFt - 2 * insetFt;   // bars running widthwise
  if (lSteelLength <= 0 || wSteelWidth <= 0) return { ...ZERO };

  // Placement axis uses floor on the INSET-REDUCED opposite dimension.
  const barsLengthwise = Math.floor(wSteelWidth / spacingFt) + 1;
  const barsWidthwise  = Math.floor(lSteelLength / spacingFt) + 1;

  const nLw = calcPieceCount(lSteelLength, input.barLengthFt, overlapFt);
  const nWw = calcPieceCount(wSteelWidth,  input.barLengthFt, overlapFt);

  const lfLengthwise = barsLengthwise * nLw * input.barLengthFt;
  const lfWidthwise  = barsWidthwise  * nWw * input.barLengthFt;

  const totalLf = lfLengthwise + lfWidthwise;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  const piecesTotal = (barsLengthwise * nLw) + (barsWidthwise * nWw);

  return { barsLengthwise, barsWidthwise, totalLf, totalWithWasteLf, piecesTotal };
}

export function calcRebarLBar(input: RebarLBarInput): RebarLBarResult {
  const ZERO: RebarLBarResult = {
    numLBars: 0, piecesPerLBar: 0, lfPerLBar: 0,
    totalLf: 0, totalWithWasteLf: 0, piecesTotal: 0,
  };
  if (input.linearFt <= 0 || input.spacingIn <= 0 || input.barLengthFt <= 0) return { ...ZERO };

  const insetFt = inchesToFeet(input.insetIn ?? 3);
  const overlapFt = inchesToFeet(input.overlapIn);
  const bendFt = inchesToFeet(input.bendLengthIn);
  const verticalFt = input.verticalFt + inchesToFeet(input.verticalIn);

  const totalSteelPerLBar = verticalFt + bendFt;
  if (totalSteelPerLBar <= 0) return { ...ZERO };

  const lPlacement = input.linearFt - 2 * insetFt;
  if (lPlacement <= 0) return { ...ZERO };

  const numLBars = Math.floor((lPlacement * 12) / input.spacingIn) + 1;
  const piecesPerLBar = calcPieceCount(totalSteelPerLBar, input.barLengthFt, overlapFt);
  const lfPerLBar = piecesPerLBar * input.barLengthFt;
  const totalLf = numLBars * lfPerLBar;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return {
    numLBars,
    piecesPerLBar,
    lfPerLBar,
    totalLf,
    totalWithWasteLf,
    piecesTotal: numLBars * piecesPerLBar,
  };
}

// ── Stone Base ────────────────────────────────────────

export function calcStoneBase(input: StoneBaseInput): StoneBaseResult {
  if (input.sqft <= 0 || input.depthIn < 0 || input.densityTonsPerCy <= 0) {
    return { volumeCy: 0, tons: 0, tonsWithWaste: 0 };
  }
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.sqft * depthFt);
  const tons = volumeCy * input.densityTonsPerCy;
  const tonsWithWaste = applyWaste(tons, input.wastePct);
  return { volumeCy, tons, tonsWithWaste };
}
