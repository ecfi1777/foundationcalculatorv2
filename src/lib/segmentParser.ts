/**
 * Parse user-entered segment strings into structured data.
 *
 * Accepted formats (unit symbols REQUIRED):
 *   10'          → 10 feet
 *   10' 6"       → 10 feet 6 inches
 *   10' 6-1/2"   → 10 feet 6.5 inches
 *   120"         → 120 inches (= 10 feet)
 *   6-1/2"       → 6.5 inches
 *
 * Bare numbers without ' or " are REJECTED.
 * Accepted fractions: 1/16 increments (1/16, 1/8, 3/16, 1/4, … 15/16)
 */

const VALID_FRACTIONS: Record<string, number> = {
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

interface ParsedSegment {
  feet: number;
  inches: number;
  fraction: string;
  lengthInchesDecimal: number;
}

// Feet with optional inches: 10' or 10' 6" or 10' 6-1/2"
const FEET_PATTERN =
  /^(\d+)\s*['′]\s*(?:(\d+)\s*[-–]?\s*(\d+\/\d+)\s*["″]|(\d+)\s*["″])?\s*$/;

// Inches only: 120" or 6-1/2"
const INCHES_PATTERN =
  /^(\d+)\s*[-–]?\s*(\d+\/\d+)?\s*["″]\s*$/;

export type ParseResult =
  | { ok: true; segment: ParsedSegment }
  | { ok: false; reason: "empty" | "missing_units" | "invalid_fraction" | "zero_length" };

/**
 * Parse a segment input string, requiring explicit unit symbols.
 * Returns a discriminated result with an error reason on failure.
 */
export function parseSegmentInputStrict(raw: string): ParseResult {
  const input = raw.trim();
  if (!input) return { ok: false, reason: "empty" };

  // Check if input has ANY unit symbol
  const hasUnitSymbol = /['′"″]/.test(input);
  if (!hasUnitSymbol) {
    return { ok: false, reason: "missing_units" };
  }

  let feet = 0;
  let inches = 0;
  let fraction = "0";

  // Try feet pattern: 10' or 10' 6" or 10' 6-1/2"
  let m = input.match(FEET_PATTERN);
  if (m) {
    feet = parseInt(m[1], 10);
    if (m[2] !== undefined) {
      inches = parseInt(m[2], 10);
      fraction = m[3] || "0";
    } else if (m[4] !== undefined) {
      inches = parseInt(m[4], 10);
    }
  } else {
    // Try inches-only pattern: 120" or 6-1/2"
    m = input.match(INCHES_PATTERN);
    if (m) {
      const rawInches = parseInt(m[1], 10);
      fraction = m[2] || "0";
      feet = Math.floor(rawInches / 12);
      inches = rawInches % 12;
    } else {
      // Has unit symbols but doesn't match any known pattern
      return { ok: false, reason: "missing_units" };
    }
  }

  // Validate fraction
  if (fraction !== "0" && !(fraction in VALID_FRACTIONS)) {
    return { ok: false, reason: "invalid_fraction" };
  }

  const fractionVal = VALID_FRACTIONS[fraction] ?? 0;
  const lengthInchesDecimal = feet * 12 + inches + fractionVal;

  if (lengthInchesDecimal <= 0) return { ok: false, reason: "zero_length" };

  return { ok: true, segment: { feet, inches, fraction, lengthInchesDecimal } };
}

/**
 * Legacy wrapper — returns ParsedSegment | null.
 * Kept for backward compatibility with existing callers.
 */
export function parseSegmentInput(raw: string): ParsedSegment | null {
  const result = parseSegmentInputStrict(raw);
  return result.ok ? result.segment : null;
}

/** Format a segment for display: 22' 4-1/2" */
export function formatSegment(
  feet: number,
  inches: number,
  fraction: string
): string {
  let s = `${feet}'`;
  if (inches > 0 || fraction !== "0") {
    s += ` ${inches}`;
    if (fraction !== "0") s += `-${fraction}`;
    s += '"';
  }
  return s;
}
