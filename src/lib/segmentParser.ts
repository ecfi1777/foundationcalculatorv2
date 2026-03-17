/**
 * Parse user-entered segment strings into structured data.
 *
 * Accepted formats:
 *   22' 4-1/2"
 *   22 ft 4-1/2 in
 *   22 feet 4-1/2 inches
 *   22.5  (decimal feet)
 *
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

/** Sorted fraction thresholds for snapping decimals to nearest 1/16 */
const FRACTION_THRESHOLDS: { max: number; label: string }[] = [
  { max: 1 / 32, label: "0" },
  { max: 3 / 32, label: "1/16" },
  { max: 5 / 32, label: "1/8" },
  { max: 7 / 32, label: "3/16" },
  { max: 9 / 32, label: "1/4" },
  { max: 11 / 32, label: "5/16" },
  { max: 13 / 32, label: "3/8" },
  { max: 15 / 32, label: "7/16" },
  { max: 17 / 32, label: "1/2" },
  { max: 19 / 32, label: "9/16" },
  { max: 21 / 32, label: "5/8" },
  { max: 23 / 32, label: "11/16" },
  { max: 25 / 32, label: "3/4" },
  { max: 27 / 32, label: "13/16" },
  { max: 29 / 32, label: "7/8" },
  { max: 31 / 32, label: "15/16" },
  { max: Infinity, label: "0" }, // rounds up to next inch
];

function snapToSixteenth(decimal: number): { fraction: string; extraInch: boolean } {
  for (const t of FRACTION_THRESHOLDS) {
    if (decimal < t.max) {
      return { fraction: t.label, extraInch: false };
    }
  }
  // >= 31/32 rounds up to next inch
  return { fraction: "0", extraInch: true };
}

interface ParsedSegment {
  feet: number;
  inches: number;
  fraction: string;
  lengthInchesDecimal: number;
}

// Pattern: 22' 4-1/2" or 22' 4" or 22'
// Fraction part allows multi-digit numerator for sixteenths (e.g. 11/16, 15/16)
const TICK_PATTERN =
  /^(\d+)\s*['′]\s*(?:(\d+)\s*[-–]?\s*(\d+\/\d+)\s*["″]?|(\d+)\s*["″]?)?\s*$/;

// Pattern: 22 ft 4-1/2 in or 22 feet 4 inches
const WORD_PATTERN =
  /^(\d+)\s*(?:ft|feet)\s*(?:(\d+)\s*[-–]?\s*(\d+\/\d+)\s*(?:in|inches?)?|(\d+)\s*(?:in|inches?))?\s*$/i;

// Pattern: just decimal feet e.g. 22.5
const DECIMAL_PATTERN = /^(\d+\.?\d*)\s*$/;

export function parseSegmentInput(raw: string): ParsedSegment | null {
  const input = raw.trim();
  if (!input) return null;

  let feet = 0;
  let inches = 0;
  let fraction = "0";

  // Try tick marks: 22' 4-1/2"
  let m = input.match(TICK_PATTERN);
  if (m) {
    feet = parseInt(m[1], 10);
    if (m[2] !== undefined) {
      inches = parseInt(m[2], 10);
      fraction = m[3] || "0";
    } else if (m[4] !== undefined) {
      inches = parseInt(m[4], 10);
    }
  } else {
    // Try word format: 22 ft 4-1/2 in
    m = input.match(WORD_PATTERN);
    if (m) {
      feet = parseInt(m[1], 10);
      if (m[2] !== undefined) {
        inches = parseInt(m[2], 10);
        fraction = m[3] || "0";
      } else if (m[4] !== undefined) {
        inches = parseInt(m[4], 10);
      }
    } else {
      // Try decimal feet — snap remainder to nearest 1/16
      m = input.match(DECIMAL_PATTERN);
      if (m) {
        const decimalFeet = parseFloat(m[1]);
        feet = Math.floor(decimalFeet);
        const remainderIn = (decimalFeet - feet) * 12;
        inches = Math.floor(remainderIn);
        const remainderFrac = remainderIn - inches;
        const snap = snapToSixteenth(remainderFrac);
        fraction = snap.fraction;
        if (snap.extraInch) inches += 1;
        // Handle inch overflow
        if (inches >= 12) {
          feet += Math.floor(inches / 12);
          inches = inches % 12;
        }
      } else {
        return null;
      }
    }
  }

  // Validate fraction
  if (fraction !== "0" && !(fraction in VALID_FRACTIONS)) {
    return null;
  }

  const fractionVal = VALID_FRACTIONS[fraction] ?? 0;
  const lengthInchesDecimal = feet * 12 + inches + fractionVal;

  if (lengthInchesDecimal <= 0) return null;

  return { feet, inches, fraction, lengthInchesDecimal };
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
