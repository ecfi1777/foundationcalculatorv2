import { describe, it, expect } from "vitest";
import { calcCurbGutter } from "../curbGutter";

describe("calcCurbGutter", () => {
  it("calculates curb and gutter volume", () => {
    // Flag: 18" × 6" = 108 sq in
    // Curb: 6" × 6" = 36 sq in
    // Gutter: 12" × 4" = 48 sq in
    // Total cross section: 192 sq in = 192/144 = 1.3333 sq ft
    // 200 LF: 1.3333 × 200 = 266.67 cuft / 27 = 9.877 cy
    const result = calcCurbGutter({
      linearFt: 200,
      flagHeightIn: 18,
      flagDepthIn: 6,
      curbHeightIn: 6,
      curbDepthIn: 6,
      gutterWidthIn: 12,
      gutterThicknessIn: 4,
      wastePct: 0,
    });
    const crossSection = (108 + 36 + 48) / 144;
    const expected = (crossSection * 200) / 27;
    expect(result.volumeCy).toBeCloseTo(expected, 4);
  });

  it("applies waste", () => {
    const result = calcCurbGutter({
      linearFt: 100,
      flagHeightIn: 12,
      flagDepthIn: 6,
      curbHeightIn: 6,
      curbDepthIn: 6,
      gutterWidthIn: 12,
      gutterThicknessIn: 6,
      wastePct: 10,
    });
    expect(result.volumeWithWasteCy).toBeCloseTo(result.volumeCy * 1.1, 5);
  });
});
