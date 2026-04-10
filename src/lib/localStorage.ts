// Keys for anonymous user data stored in localStorage
const ANON_HAS_DATA_KEY = "tfc_anon_has_data";
const CALC_STATE_KEY = "tfc_calculator_state";
const REF_CODE_KEY = "tfc_ref_code";
const PROMO_CODE_KEY = "tfc_promo_code";


// --- Ref / Promo ---

export function captureRefCode() {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    localStorage.setItem(REF_CODE_KEY, ref);
  }
}

export function getRefCode(): string | null {
  return localStorage.getItem(REF_CODE_KEY);
}

export function getPromoCode(): string | null {
  return localStorage.getItem(PROMO_CODE_KEY);
}

export function savePromoCode(code: string) {
  localStorage.setItem(PROMO_CODE_KEY, code);
}

// --- Status ---

export function hasAnonData(): boolean {
  // Check both the old flag and the actual calculator state
  return (
    localStorage.getItem(ANON_HAS_DATA_KEY) === "true" ||
    localStorage.getItem(CALC_STATE_KEY) !== null
  );
}

// --- Cleanup ---

export function clearRefCode() {
  localStorage.removeItem(REF_CODE_KEY);
}

export function clearAnonData() {
  localStorage.removeItem(ANON_HAS_DATA_KEY);
  localStorage.removeItem(REF_CODE_KEY);
  localStorage.removeItem(PROMO_CODE_KEY);
}

