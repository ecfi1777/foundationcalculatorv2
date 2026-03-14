import { describe, it, expect } from "vitest";
import { calcPierPad } from "../pierPad";
import { calcCylinder } from "../cylinder";

describe("calcPierPad", () => {
  it("calculates pier pad volume", () => {
    // 4 piers × 24" × 24" × 12" = 4 × 2 × 2 × 1 / 27 = 16/27 cy
    const result = calcPierPad({
      quantity: 4, lengthIn: 24, widthIn: 24, depthIn: 12, wastePct: 0,
    });
    expect(result.volumeEachCy).toBeCloseTo(4 / 27, 5);
    expect(result.totalVolumeCy).toBeCloseTo(16 / 27, 5);
  });

  it("applies waste", () => {
    const result = calcPierPad({
      quantity: 1, lengthIn: 12, widthIn: 12, depthIn: 12, wastePct: 10,
    });
    expect(result.totalVolumeCy).toBeCloseTo(1 / 27, 5);
    expect(result.totalWithWasteCy).toBeCloseTo((1 / 27) * 1.1, 5);
  });
});

describe("calcCylinder", () => {
  it("calculates cylinder volume", () => {
    // 1 cylinder, 12" diameter, 48" height
    // r = 0.5 ft, h = 4 ft, V = π × 0.25 × 4 / 27
    const result = calcCylinder({
      quantity: 1, diameterIn: 12, heightIn: 48, wastePct: 0,
    });
    const expected = (Math.PI * 0.25 * 4) / 27;
    expect(result.volumeEachCy).toBeCloseTo(expected, 5);
    expect(result.totalVolumeCy).toBeCloseTo(expected, 5);
  });

  it("handles multiple cylinders with waste", () => {
    const result = calcCylinder({
      quantity: 6, diameterIn: 18, heightIn: 36, wastePct: 5,
    });
    const r = 18 / 2 / 12; // 0.75 ft
    const h = 36 / 12; // 3 ft
    const each = (Math.PI * r * r * h) / 27;
    expect(result.totalVolumeCy).toBeCloseTo(each * 6, 5);
    expect(result.totalWithWasteCy).toBeCloseTo(each * 6 * 1.05, 5);
  });
});
