import { describe, it, expect } from "vitest";
import { calcRebarHorizontal, calcRebarVertical, calcRebarSlabGrid } from "../rebar";

describe("calcRebarHorizontal — FLOOR splice count (per spec)", () => {
  it("calculates horizontal rebar with splices using FLOOR", () => {
    // 100 LF, 2 rows, 20ft bars, 12" overlap
    // num_splices = floor(100/20) = 5
    // overlap_lf = 5 × 1ft × 2 rows = 10
    // total = (100 × 2) + 10 = 210
    const result = calcRebarHorizontal({
      linearFt: 100, numRows: 2, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(210);
  });

  it("exact multiple: 20 ft → 1 splice", () => {
    // floor(20/20) = 1 splice → overlap = 1ft → total = 20 + 1 = 21
    const result = calcRebarHorizontal({
      linearFt: 20, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(21);
  });

  it("exact multiple: 40 ft → 2 splices", () => {
    // floor(40/20) = 2 → overlap = 2ft → total = 40 + 2 = 42
    const result = calcRebarHorizontal({
      linearFt: 40, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(42);
  });

  it("exact multiple: 60 ft → 3 splices", () => {
    // floor(60/20) = 3 → overlap = 3ft → total = 60 + 3 = 63
    const result = calcRebarHorizontal({
      linearFt: 60, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(63);
  });

  it("non-multiple: 25 ft → 1 splice", () => {
    // floor(25/20) = 1 → overlap = 1ft → total = 25 + 1 = 26
    const result = calcRebarHorizontal({
      linearFt: 25, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(26);
  });

  it("non-multiple: 37 ft → 1 splice", () => {
    // floor(37/20) = 1 → overlap = 1ft → total = 37 + 1 = 38
    const result = calcRebarHorizontal({
      linearFt: 37, numRows: 1, overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(38);
  });

  it("no splice when under one bar length", () => {
    // floor(15/20) = 0 splices
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
    const result = calcRebarVertical({
      linearFt: 50, barHeightFt: 4, barHeightIn: 0,
      spacingIn: 48, overlapIn: 12, wastePct: 0,
    });
    expect(result.numBars).toBe(13);
    expect(result.totalLf).toBeCloseTo(52);
  });

  it("handles partial height", () => {
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

describe("calcRebarSlabGrid — FLOOR splice count", () => {
  it("calculates grid rebar for a slab section (10×10)", () => {
    // splices: floor(10/20)=0 both directions → no overlap added
    const result = calcRebarSlabGrid({
      lengthFt: 10, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.barsLengthwise).toBe(11);
    expect(result.barsWidthwise).toBe(11);
    expect(result.totalLf).toBeCloseTo(220);
  });

  it("adds splices for long runs (30×10)", () => {
    // barsLengthwise = floor(10*12/12)+1 = 11
    // barsWidthwise  = floor(30*12/12)+1 = 31
    // spliceLength = floor(30/20) × 1ft = 1ft
    // spliceWidth  = floor(10/20) × 1ft = 0ft
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

  it("exact multiple lengthwise: 40 ft → 2 splices per bar", () => {
    // barsLengthwise = floor(10*12/12)+1 = 11
    // barsWidthwise  = floor(40*12/12)+1 = 41
    // spliceLength = floor(40/20) × 1ft = 2ft
    // spliceWidth  = floor(10/20) × 1ft = 0ft
    // lfLengthwise = 11 × (40 + 2) = 462
    // lfWidthwise  = 41 × (10 + 0) = 410
    // total = 872
    const result = calcRebarSlabGrid({
      lengthFt: 40, widthFt: 10, spacingIn: 12,
      overlapIn: 12, barLengthFt: 20, wastePct: 0,
    });
    expect(result.totalLf).toBeCloseTo(872);
  });

  it("uses floor for non-even dimensions (25×16 @ 18in)", () => {
    // barsLengthwise = floor(16*12/18)+1 = 11
    // barsWidthwise  = floor(25*12/18)+1 = 17
    // spliceLength = floor(25/20) × 1ft = 1ft → 26ft
    // spliceWidth  = floor(16/20) × 1ft = 0ft → 16ft
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
