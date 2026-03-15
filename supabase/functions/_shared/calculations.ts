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
  wastePct: number;
}

export interface RebarHorizontalResult {
  totalLf: number;
  totalWithWasteLf: number;
}

export interface RebarVerticalInput {
  linearFt: number;
  barHeightFt: number;
  barHeightIn: number;
  spacingIn: number;
  overlapIn: number;
  wastePct: number;
}

export interface RebarVerticalResult {
  numBars: number;
  totalLf: number;
  totalWithWasteLf: number;
}

export interface RebarSlabGridInput {
  lengthFt: number;
  widthFt: number;
  spacingIn: number;
  overlapIn: number;
  barLengthFt: number;
  wastePct: number;
}

export interface RebarSlabGridResult {
  barsLengthwise: number;
  barsWidthwise: number;
  totalLf: number;
  totalWithWasteLf: number;
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
  if (totalLengthFt <= 0) return 0;
  const numBars = Math.ceil(totalLengthFt / barLengthFt);
  const splices = Math.max(numBars - 1, 0);
  return splices * inchesToFeet(overlapIn);
}

// ── Volume Calculators ────────────────────────────────

export function calcFooting(input: FootingInput): FootingResult {
  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const footingVolumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);

  let wallVolumeCy: number | null = null;
  if (input.wall) {
    const wallHeightFt = inchesToFeet(input.wall.heightIn);
    const wallThicknessFt = inchesToFeet(input.wall.thicknessIn);
    wallVolumeCy = cubicFtToCy(input.linearFt * wallThicknessFt * wallHeightFt);
  }

  const totalVolumeCy = footingVolumeCy + (wallVolumeCy ?? 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);

  return { footingVolumeCy, wallVolumeCy, totalVolumeCy, totalWithWasteCy };
}

export function calcWall(input: WallInput): WallResult {
  const heightFt = inchesToFeet(input.heightIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const volumeCy = cubicFtToCy(input.linearFt * heightFt * thicknessFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcGradeBeam(input: GradeBeamInput): GradeBeamResult {
  const widthFt = inchesToFeet(input.widthIn);
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.linearFt * widthFt * depthFt);
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcCurbGutter(input: CurbGutterInput): CurbGutterResult {
  const curbFt3 = input.linearFt * (input.curbDepthIn / 12) * (input.curbHeightIn / 12);
  const gutterFt3 = input.linearFt * (input.gutterWidthIn / 12) * (input.flagThicknessIn / 12);
  const volumeCy = (curbFt3 + gutterFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, input.wastePct);
  return { volumeCy, volumeWithWasteCy };
}

export function calcSlabSection(input: SlabSectionInput): SlabSectionResult {
  const lengthFt = input.lengthFt + inchesToFeet(input.lengthIn);
  const widthFt = input.widthFt + inchesToFeet(input.widthIn);
  const thicknessFt = inchesToFeet(input.thicknessIn);
  const sqft = lengthFt * widthFt;
  const volumeCy = cubicFtToCy(sqft * thicknessFt);
  return { sqft, volumeCy };
}

export function calcSlabArea(input: SlabAreaInput): SlabAreaResult {
  const sections = input.sections.map(calcSlabSection);
  const totalSqft = sections.reduce((sum, s) => sum + s.sqft, 0);
  const totalVolumeCy = sections.reduce((sum, s) => sum + s.volumeCy, 0);
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { sections, totalSqft, totalVolumeCy, totalWithWasteCy };
}

export function calcPierPad(input: PierPadInput): PierPadResult {
  const lFt = inchesToFeet(input.lengthIn);
  const wFt = inchesToFeet(input.widthIn);
  const dFt = inchesToFeet(input.depthIn);
  const volumeEachCy = cubicFtToCy(lFt * wFt * dFt);
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}

export function calcCylinder(input: CylinderInput): CylinderResult {
  const heightFtTotal = input.heightFt + input.heightIn / 12;
  const radiusFt = (input.diameterIn / 12) / 2;
  const volumeFt3 = Math.PI * radiusFt * radiusFt * heightFtTotal;
  const volumeEachCy = volumeFt3 / 27;
  const totalVolumeCy = volumeEachCy * input.quantity;
  const totalWithWasteCy = applyWaste(totalVolumeCy, input.wastePct);
  return { volumeEachCy, totalVolumeCy, totalWithWasteCy };
}

export function calcSteps(input: StepsInput): StepsResult {
  const { riseIn, runIn, widthIn, numSteps, throatDepthIn, wastePct } = input;

  const A = riseIn * runIn * widthIn / 2;
  const h = Math.sqrt(riseIn * riseIn + runIn * runIn);
  const B = h * widthIn * throatDepthIn;
  const V1 = (A + B) * (numSteps - 1);
  const V2 = riseIn * runIn * widthIn;
  const stairsFt3 = (V1 + V2) * 0.0005787037;

  let platformFt3 = 0;
  if (input.platformDepthIn && input.platformDepthIn > 0) {
    const platformWidthIn = input.platformWidthIn ?? widthIn;
    platformFt3 = (input.platformDepthIn / 12) * (platformWidthIn / 12) * (widthIn / 12);
  }

  const volumeCy = (stairsFt3 + platformFt3) / 27;
  const volumeWithWasteCy = applyWaste(volumeCy, wastePct);

  return { volumeCy, volumeWithWasteCy };
}

// ── Rebar Calculators ─────────────────────────────────

export function calcRebarHorizontal(input: RebarHorizontalInput): RebarHorizontalResult {
  const numSplices = Math.floor(input.linearFt / input.barLengthFt);
  const overlapLf = numSplices * inchesToFeet(input.overlapIn) * input.numRows;
  const totalLf = (input.linearFt * input.numRows) + overlapLf;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { totalLf, totalWithWasteLf };
}

export function calcRebarVertical(input: RebarVerticalInput): RebarVerticalResult {
  const numBars = Math.floor(input.linearFt * 12 / input.spacingIn) + 1;
  const barHeightFt = input.barHeightFt + inchesToFeet(input.barHeightIn);
  const totalLf = numBars * barHeightFt;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { numBars, totalLf, totalWithWasteLf };
}

export function calcRebarSlabGrid(input: RebarSlabGridInput): RebarSlabGridResult {
  const lengthIn = input.lengthFt * 12;
  const widthIn = input.widthFt * 12;

  const barsLengthwise = Math.floor(widthIn / input.spacingIn) + 1;
  const barsWidthwise = Math.floor(lengthIn / input.spacingIn) + 1;

  const spliceLength = calcSpliceOverlap(input.lengthFt, input.barLengthFt, input.overlapIn);
  const lfLengthwise = barsLengthwise * (input.lengthFt + spliceLength);

  const spliceWidth = calcSpliceOverlap(input.widthFt, input.barLengthFt, input.overlapIn);
  const lfWidthwise = barsWidthwise * (input.widthFt + spliceWidth);

  const totalLf = lfLengthwise + lfWidthwise;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);

  return { barsLengthwise, barsWidthwise, totalLf, totalWithWasteLf };
}

// ── Stone Base ────────────────────────────────────────

export function calcStoneBase(input: StoneBaseInput): StoneBaseResult {
  const depthFt = inchesToFeet(input.depthIn);
  const volumeCy = cubicFtToCy(input.sqft * depthFt);
  const tons = volumeCy * input.densityTonsPerCy;
  const tonsWithWaste = applyWaste(tons, input.wastePct);
  return { volumeCy, tons, tonsWithWaste };
}
