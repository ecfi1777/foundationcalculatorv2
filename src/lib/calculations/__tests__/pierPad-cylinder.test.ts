import { describe, it, expect } from "vitest";
import { calcPierPad } from "../pierPad";
import { calcCylinder } from "../cylinder";

describe("calcPierPad", () => {
  it("calculates pier pad volume", () => {
    const result = calcPierPad({
      quantity: 4, lengthIn: 24, widthIn: 24, depthIn: 12, wastePct: 0,
    });
    const eachCy = (24 / 12) * (24 / 12) * (12 / 12) / 27;
    expect(result.volumeEachCy).toBeCloseTo(eachCy, 5);
    expect(result.totalVolumeCy).toBeCloseTo(eachCy * 4, 5);
  });

  it("applies waste", () => {
    const result = calcPierPad({
      quantity: 2, lengthIn: 18, widthIn: 18, depthIn: 10, wastePct: 10,
    });
    expect(result.totalWithWasteCy).toBeCloseTo(result.totalVolumeCy * 1.1, 5);
  });
});

describe("calcCylinder — heightFt + heightIn", () => {
  it("calculates cylinder volume", () => {
    // 12" diameter, 3ft 6in height, qty 5
    const result = calcCylinder({
      quantity: 5, diameterIn: 12, heightFt: 3, heightIn: 6, wastePct: 0,
    });
    const radiusFt = 0.5;
    const heightFt = 3.5;
    const volEach = Math.PI * radiusFt * radiusFt * heightFt / 27;
    expect(result.volumeEachCy).toBeCloseTo(volEach, 5);
    expect(result.totalVolumeCy).toBeCloseTo(volEach * 5, 5);
  });

  it("applies waste", () => {
    const result = calcCylinder({
      quantity: 3, diameterIn: 18, heightFt: 4, heightIn: 0, wastePct: 10,
    });
    expect(result.totalWithWasteCy).toBeCloseTo(result.totalVolumeCy * 1.1, 5);
  });
});
