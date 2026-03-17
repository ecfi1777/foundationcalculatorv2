/**
 * Rebar calculators — Horizontal, Vertical, Slab Grid
 */
import type {
  RebarHorizontalInput,
  RebarHorizontalResult,
  RebarVerticalInput,
  RebarVerticalResult,
  RebarSlabGridInput,
  RebarSlabGridResult,
} from "./types";
import { inchesToFeet, applyWaste, calcSpliceOverlap } from "./utils";

const ZERO_HORIZ: RebarHorizontalResult = { totalLf: 0, totalWithWasteLf: 0 };
const ZERO_VERT: RebarVerticalResult = { numBars: 0, totalLf: 0, totalWithWasteLf: 0 };
const ZERO_GRID: RebarSlabGridResult = { barsLengthwise: 0, barsWidthwise: 0, totalLf: 0, totalWithWasteLf: 0 };

/**
 * Calculate horizontal rebar linear footage with splice overlaps.
 * @param input.linearFt - Total linear feet of the run
 * @param input.numRows - Number of horizontal rows of rebar
 * @param input.barLengthFt - Standard bar length in feet (e.g., 20)
 * @param input.overlapIn - Splice overlap length in inches
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns totalLf in linear feet, totalWithWasteLf with waste applied
 */
export function calcRebarHorizontal(input: RebarHorizontalInput): RebarHorizontalResult {
  if (input.linearFt <= 0 || input.numRows <= 0 || input.barLengthFt <= 0) return { ...ZERO_HORIZ };

  const numSplices = Math.max(Math.ceil(input.linearFt / input.barLengthFt) - 1, 0);
  const overlapLf = numSplices * inchesToFeet(input.overlapIn) * input.numRows;
  const totalLf = (input.linearFt * input.numRows) + overlapLf;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { totalLf, totalWithWasteLf };
}

/**
 * Calculate vertical rebar bar count and linear footage.
 * @param input.linearFt - Total linear feet of the run
 * @param input.spacingIn - Spacing between vertical bars in inches
 * @param input.barHeightFt - Bar height, whole feet portion
 * @param input.barHeightIn - Bar height, remaining inches portion
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns numBars count, totalLf in linear feet, totalWithWasteLf with waste applied
 */
export function calcRebarVertical(input: RebarVerticalInput): RebarVerticalResult {
  if (input.linearFt <= 0 || input.spacingIn <= 0) return { ...ZERO_VERT };

  const numBars = Math.floor(input.linearFt * 12 / input.spacingIn) + 1;
  const barHeightFt = input.barHeightFt + inchesToFeet(input.barHeightIn);
  if (barHeightFt <= 0) return { ...ZERO_VERT };

  const totalLf = numBars * barHeightFt;
  const totalWithWasteLf = applyWaste(totalLf, input.wastePct);
  return { numBars, totalLf, totalWithWasteLf };
}

/**
 * Calculate slab grid rebar layout and total linear footage.
 * @param input.lengthFt - Slab length in feet
 * @param input.widthFt - Slab width in feet
 * @param input.spacingIn - Grid spacing in inches
 * @param input.barLengthFt - Standard bar length in feet
 * @param input.overlapIn - Splice overlap length in inches
 * @param input.wastePct - Waste percentage (e.g., 5 for 5%)
 * @returns barsLengthwise, barsWidthwise counts, totalLf in linear feet, totalWithWasteLf
 */
export function calcRebarSlabGrid(input: RebarSlabGridInput): RebarSlabGridResult {
  if (input.lengthFt <= 0 || input.widthFt <= 0 || input.spacingIn <= 0 || input.barLengthFt <= 0) {
    return { ...ZERO_GRID };
  }

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
