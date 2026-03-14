import { describe, it, expect } from "vitest";
import { calcStoneBase } from "../stoneBase";

describe("calcStoneBase", () => {
  it("calculates stone tonnage", () => {
    // 600 sqft × 4" deep = 600 × (4/12) / 27 = 7.407 cy
    // × 1.4 tons/cy = 10.37 tons
    const result = calcStoneBase({
      sqft: 600, depthIn: 4, densityTonsPerCy: 1.4, wastePct: 0,
    });
    const expectedCy = (600 * (4 / 12)) / 27;
    expect(result.volumeCy).toBeCloseTo(expectedCy, 5);
    expect(result.tons).toBeCloseTo(expectedCy * 1.4, 5);
  });

  it("applies waste to tons", () => {
    const result = calcStoneBase({
      sqft: 100, depthIn: 6, densityTonsPerCy: 1.4, wastePct: 10,
    });
    expect(result.tonsWithWaste).toBeCloseTo(result.tons * 1.1, 5);
  });
});
