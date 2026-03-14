// Keys for anonymous user data stored in localStorage
const ANON_PROJECTS_KEY = "tfc_anon_projects";
const ANON_AREAS_KEY = "tfc_anon_areas";
const ANON_SEGMENTS_KEY = "tfc_anon_segments";
const ANON_SECTIONS_KEY = "tfc_anon_sections";
const ANON_HAS_DATA_KEY = "tfc_anon_has_data";
const REF_CODE_KEY = "tfc_ref_code";
const PROMO_CODE_KEY = "tfc_promo_code";

export interface AnonProject {
  id: string;
  name: string;
  notes?: string;
  created_at: string;
}

export interface AnonArea {
  id: string;
  project_id: string;
  name: string;
  calculator_type: string;
  sort_order: number;
  inputs?: Record<string, unknown>;
  created_at: string;
}

export interface AnonSegment {
  id: string;
  area_id: string;
  feet: number;
  inches: number;
  fraction: string;
  sort_order: number;
}

export interface AnonSection {
  id: string;
  area_id: string;
  name: string;
  sort_order: number;
  length_ft: number;
  length_in: number;
  width_ft: number;
  width_in: number;
  thickness_in: number;
}

// --- Getters ---

export function getAnonProjects(): AnonProject[] {
  try {
    return JSON.parse(localStorage.getItem(ANON_PROJECTS_KEY) || "[]");
  } catch { return []; }
}

export function getAnonAreas(): AnonArea[] {
  try {
    return JSON.parse(localStorage.getItem(ANON_AREAS_KEY) || "[]");
  } catch { return []; }
}

export function getAnonSegments(): AnonSegment[] {
  try {
    return JSON.parse(localStorage.getItem(ANON_SEGMENTS_KEY) || "[]");
  } catch { return []; }
}

export function getAnonSections(): AnonSection[] {
  try {
    return JSON.parse(localStorage.getItem(ANON_SECTIONS_KEY) || "[]");
  } catch { return []; }
}

// --- Setters ---

export function saveAnonProjects(projects: AnonProject[]) {
  localStorage.setItem(ANON_PROJECTS_KEY, JSON.stringify(projects));
}

export function saveAnonAreas(areas: AnonArea[]) {
  localStorage.setItem(ANON_AREAS_KEY, JSON.stringify(areas));
  if (areas.length > 0) {
    localStorage.setItem(ANON_HAS_DATA_KEY, "true");
  }
}

export function saveAnonSegments(segments: AnonSegment[]) {
  localStorage.setItem(ANON_SEGMENTS_KEY, JSON.stringify(segments));
}

export function saveAnonSections(sections: AnonSection[]) {
  localStorage.setItem(ANON_SECTIONS_KEY, JSON.stringify(sections));
}

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
  return localStorage.getItem(ANON_HAS_DATA_KEY) === "true";
}

// --- Cleanup ---

export function clearAnonData() {
  localStorage.removeItem(ANON_PROJECTS_KEY);
  localStorage.removeItem(ANON_AREAS_KEY);
  localStorage.removeItem(ANON_SEGMENTS_KEY);
  localStorage.removeItem(ANON_SECTIONS_KEY);
  localStorage.removeItem(ANON_HAS_DATA_KEY);
  localStorage.removeItem(REF_CODE_KEY);
  localStorage.removeItem(PROMO_CODE_KEY);
}
