import { describe, it, expect } from "vitest";
import { calcCurbGutter } from "../curbGutter";

describe("calcCurbGutter — 2-component formula", () => {
  it("calculates curb and gutter volume", () => {
    // curb: 200 × (6/12) × (18/12) = 150 cuft
    // gutter: 200 × (12/12) × (4/12) = 66.667 cuft
    // total: 216.667 / 27 = 8.0247 cy
    const result = calcCurbGutter({
      linearFt: 200,
      curbDepthIn: 6,
      curbHeightIn: 18,
      gutterWidthIn: 12,
      flagThicknessIn: 4,
      wastePct: 0,
    });
    const curbFt3 = 200 * (6 / 12) * (18 / 12);
    const gutterFt3 = 200 * (12 / 12) * (4 / 12);
    const expected = (curbFt3 + gutterFt3) / 27;
    expect(result.volumeCy).toBeCloseTo(expected, 4);
  });

  it("applies waste", () => {
    const result = calcCurbGutter({
      linearFt: 100,
      curbDepthIn: 6,
      curbHeightIn: 12,
      gutterWidthIn: 12,
      flagThicknessIn: 6,
      wastePct: 10,
    });
    expect(result.volumeWithWasteCy).toBeCloseTo(result.volumeCy * 1.1, 5);
  });
});
