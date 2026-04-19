import { describe, it, expect } from "vitest";
import {
  toTotalInches,
  inchesToFeet,
  cubicFtToCy,
  applyWaste,
  calcSpliceOverlap,
} from "../utils";

describe("utils", () => {
  it("toTotalInches converts correctly", () => {
    expect(toTotalInches({ feet: 2, inches: 6, fraction: "1/2" })).toBeCloseTo(30.5);
    expect(toTotalInches({ feet: 0, inches: 0, fraction: "0" })).toBe(0);
    expect(toTotalInches({ feet: 1, inches: 0, fraction: "0" })).toBe(12);
  });

  it("inchesToFeet", () => {
    expect(inchesToFeet(12)).toBe(1);
    expect(inchesToFeet(6)).toBe(0.5);
  });

  it("cubicFtToCy", () => {
    expect(cubicFtToCy(27)).toBe(1);
    expect(cubicFtToCy(54)).toBe(2);
  });

  it("applyWaste", () => {
    expect(applyWaste(10, 10)).toBeCloseTo(11);
    expect(applyWaste(10, 0)).toBe(10);
    expect(applyWaste(100, 5)).toBeCloseTo(105);
  });

  it("calcSpliceOverlap (FLOOR per spec)", () => {
    // 50 ft / 20 ft = floor(2.5) = 2 splices × 12in = 2 ft
    expect(calcSpliceOverlap(50, 20, 12)).toBeCloseTo(2);
    // exact multiple: 20 ft → floor(20/20) = 1 splice → 1 ft
    expect(calcSpliceOverlap(20, 20, 12)).toBeCloseTo(1);
    // exact multiple: 40 ft → 2 splices → 2 ft
    expect(calcSpliceOverlap(40, 20, 12)).toBeCloseTo(2);
    // 15 ft → floor(0.75) = 0 splices
    expect(calcSpliceOverlap(15, 20, 12)).toBe(0);
    // 0 ft → 0
    expect(calcSpliceOverlap(0, 20, 12)).toBe(0);
  });
});
