/**
 * Calculation Engine — Shared Utilities
 * Pure functions, zero UI imports.
 */

import type { ImperialLength } from "./types";

/** Fraction string → decimal value */
const FRACTION_MAP: Record<string, number> = {
  "0": 0,
  "1/16": 1 / 16,
  "1/8": 1 / 8,
  "3/16": 3 / 16,
  "1/4": 1 / 4,
  "5/16": 5 / 16,
  "3/8": 3 / 8,
  "7/16": 7 / 16,
  "1/2": 1 / 2,
  "9/16": 9 / 16,
  "5/8": 5 / 8,
  "11/16": 11 / 16,
  "3/4": 3 / 4,
  "13/16": 13 / 16,
  "7/8": 7 / 8,
  "15/16": 15 / 16,
};

/** Convert an ImperialLength to total inches (decimal). */
export function toTotalInches(length: ImperialLength): number {
  const fractionVal = FRACTION_MAP[length.fraction] ?? 0;
  return length.feet * 12 + length.inches + fractionVal;
}

/** Convert inches to feet (decimal). */
export function inchesToFeet(inches: number): number {
  return inches / 12;
}

/** Convert cubic feet to cubic yards. */
export function cubicFtToCy(cubicFt: number): number {
  return cubicFt / 27;
}

/** Apply waste percentage: value * (1 + pct/100). */
export function applyWaste(value: number, wastePct: number): number {
  return value * (1 + wastePct / 100);
}

/**
 * Number of splices needed for a given total run using standard bar lengths.
 * splices = ceil(totalLengthFt / barLengthFt) - 1  (min 0)
 * Each splice adds `overlapIn` inches of extra rebar.
 */
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
