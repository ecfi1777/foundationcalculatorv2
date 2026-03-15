/**
 * Parse user-entered segment strings into structured data.
 *
 * Accepted formats:
 *   22' 4-1/2"
 *   22 ft 4-1/2 in
 *   22 feet 4-1/2 inches
 *   22.5  (decimal feet)
 *
 * Accepted fractions: 1/4, 1/2, 3/4 only
 */

const VALID_FRACTIONS: Record<string, number> = {
  "1/4": 0.25,
  "1/2": 0.5,
  "3/4": 0.75,
};

interface ParsedSegment {
  feet: number;
  inches: number;
  fraction: string;
  lengthInchesDecimal: number;
}

// Pattern: 22' 4-1/2" or 22' 4" or 22'
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
      // Try decimal feet
      m = input.match(DECIMAL_PATTERN);
      if (m) {
        const decimalFeet = parseFloat(m[1]);
        feet = Math.floor(decimalFeet);
        const remainderIn = (decimalFeet - feet) * 12;
        inches = Math.floor(remainderIn);
        const remainderFrac = remainderIn - inches;
        // Snap to nearest valid fraction
        if (remainderFrac >= 0.625) fraction = "3/4";
        else if (remainderFrac >= 0.375) fraction = "1/2";
        else if (remainderFrac >= 0.125) fraction = "1/4";
        else fraction = "0";
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
