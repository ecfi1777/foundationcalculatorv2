import { describe, it, expect } from "vitest";
import { calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid } from "../rebar";

describe("calcRebarHorizontal", () => {
  it("calculates horizontal rebar with splices", () => {
    // 100 LF, 2 rows, 20ft bars, 12" overlap
    // 100/20 = 5 bars → 4 splices × 1ft = 4ft overlap
    // per row = 104 ft, × 2 = 208 LF
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 2, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(208);
  });

  it("no splice when under one bar length", () => {
    const result = calcRebarHorizontal({
      linearFt: 15, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(15);
  });

  it("applies waste", () => {
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 5,
    });
    expect(result.totalWithWasteLf).toBeCloseTo(result.totalLf * 1.05);
  });
});

describe("calcRebarVertical", () => {
  it("calculates vertical bars", () => {
    // 50 LF wall, 48" spacing → ceil(600/48) + 1 = 13 + 1 = 14 bars
    // bar height 4ft + 12" overlap = 5ft each → 14 × 5 = 70 LF
    const result = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(14);
    expect(result.totalLf).toBeCloseTo(70);
  });

  it("handles partial height", () => {
    // bar height 3'6" = 3.5ft + 12" overlap = 4.5ft
    const result = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 24, overlapIn: 12, wastePct: 0,
    });
    // ceil(120/24) + 1 = 6 bars × 4.5 = 27 LF
    expect(result.numBars).toBe(6);
    expect(result.totalLf).toBeCloseTo(27);
  });
});

describe("calcRebarSlabGrid", () => {
  it("calculates grid rebar for a slab section", () => {
    // 10ft × 10ft, 12" spacing, 20ft bars, 12" overlap
    // Lengthwise: ceil(120/12) + 1 = 11 bars, each 10ft (no splice), = 110 LF
    // Widthwise: ceil(120/12) + 1 = 11 bars, each 10ft = 110 LF
    // Total = 220 LF
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(11);
    expect(result.totalLf).toBeCloseTo(220);
  });

  it("adds splices for long runs", () => {
    // 30ft × 10ft, 12" spacing, 20ft bars
    // Lengthwise bars: ceil(120/12)+1 = 11, each needs splice: ceil(30/20)-1 = 1 splice × 1ft
    // so each bar = 31ft → 11 × 31 = 341
    // Widthwise bars: ceil(360/12)+1 = 31, each 10ft (no splice) → 31 × 10 = 310
    // Total = 651
    const result = calcRebarSlabGrid({
      lengthFt: 30, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(31);
    expect(result.totalLf).toBeCloseTo(651);
  });
});
