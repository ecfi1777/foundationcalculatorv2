import { describe, it, expect } from "vitest";
import { calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid } from "../rebar";

describe("calcRebarHorizontal — ceil-1 splice count", () => {
  it("calculates horizontal rebar with splices", () => {
    // 100 LF, 2 rows, 20ft bars, 12" overlap
    // num_splices = max(ceil(100/20) - 1, 0) = max(5 - 1, 0) = 4
    // overlap_lf = 4 × 1 × 2 = 8
    // total = (100 × 2) + 8 = 208
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 2, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(208);
  });

  it("no splice when under one bar length", () => {
    // ceil(15/20) - 1 = 1 - 1 = 0 splices
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

  it("returns zero for invalid inputs", () => {
    const result = calcRebarHorizontal({
      linearFt: -5, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
    expect(result.totalWithWasteLf).toBe(0);
  });

  it("returns zero when barLengthFt <= 0", () => {
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 1, overlapIn: 12, barLengthFt: 0, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
  });
});

describe("calcRebarVertical — floor, no overlap", () => {
  it("calculates vertical bars", () => {
    // 50 LF wall, 48" spacing
    // num_bars = floor(50*12/48) + 1 = floor(12.5) + 1 = 12 + 1 = 13
    // bar height = 4ft, total = 13 × 4 = 52 LF
    const result = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(13);
    expect(result.totalLf).toBeCloseTo(52);
  });

  it("handles partial height", () => {
    // 10 LF, 24" spacing
    // num_bars = floor(10*12/24) + 1 = floor(5) + 1 = 6
    // bar height = 3'6" = 3.5ft, total = 6 × 3.5 = 21 LF
    const result = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 24, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(6);
    expect(result.totalLf).toBeCloseTo(21);
  });

  it("returns zero for spacingIn <= 0", () => {
    const result = calcRebarVertical({
      linearFt: 10, barHeightFt: 3, barHeightIn: 6,
      spacingIn: 0, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(0);
    expect(result.totalLf).toBe(0);
  });
});

describe("calcRebarSlabGrid", () => {
  it("calculates grid rebar for a slab section", () => {
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(11);
    expect(result.totalLf).toBeCloseTo(220);
  });

  it("adds splices for long runs", () => {
    // barsLengthwise = floor(10*12/12)+1 = 11
    // barsWidthwise  = floor(30*12/12)+1 = 31
    // spliceLength(30ft, 20ft bars) = (ceil(30/20)-1) × 1ft = 1ft
    // spliceWidth(10ft, 20ft bars)  = (ceil(10/20)-1) × 1ft = 0ft
    // lfLengthwise = 11 × (30 + 1) = 341
    // lfWidthwise  = 31 × (10 + 0) = 310
    // total = 651
    const result = calcRebarSlabGrid({
      lengthFt: 30, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(31);
    expect(result.totalLf).toBeCloseTo(651);
  });

  it("uses floor for non-even dimensions (25×16 @ 18in)", () => {
    // barsLengthwise = floor(16*12/18)+1 = floor(10.667)+1 = 11
    // barsWidthwise  = floor(25*12/18)+1 = floor(16.667)+1 = 17
    // spliceLength(25ft) = (ceil(25/20)-1) × 1ft = 1ft → each = 26ft
    // spliceWidth(16ft)  = (ceil(16/20)-1) × 1ft = 0ft → each = 16ft
    // lfLengthwise = 11 × 26 = 286
    // lfWidthwise  = 17 × 16 = 272
    // total = 558
    const result = calcRebarSlabGrid({
      lengthFt: 25, widthFt: 16, spacingIn: 18,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(17);
    expect(result.totalLf).toBeCloseTo(558);
  });

  it("returns zero for invalid inputs", () => {
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 0,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBe(0);
  });
});
