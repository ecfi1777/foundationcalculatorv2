/**
 * Workspace Handoff Utility
 *
 * Manages draft state transfer between SEO calculator pages and the /app workspace,
 * plus tracking the last-visited SEO page for "Exit Workspace" navigation.
 */

const HANDOFF_KEY = "tfc_workspace_handoff";
const EXIT_TARGET_KEY = "tfc_last_calculator_page";

/**
 * Stash the current calculator state into sessionStorage before navigating to /app.
 * This is consumed once by /app on mount to hydrate the workspace with in-progress work.
 */
export function stashDraft(state: unknown): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to stash workspace draft:", e);
  }
}

/**
 * Consume the stashed draft (read + delete). Returns parsed state or null.
 * The key is removed immediately to prevent double-hydration on refresh.
 */
export function consumeDraft<T = unknown>(): T | null {
  try {
    const raw = sessionStorage.getItem(HANDOFF_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(HANDOFF_KEY);
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn("Failed to consume workspace draft:", e);
    sessionStorage.removeItem(HANDOFF_KEY);
    return null;
  }
}

/**
 * Store the last-visited SEO calculator page path so "Exit Workspace"
 * can navigate back even if the `from` query param is missing (e.g. page refresh).
 */
export function stashExitTarget(path: string): void {
  try {
    localStorage.setItem(EXIT_TARGET_KEY, path);
  } catch {}
}

/**
 * Retrieve the stored exit target path. Does NOT delete the key
 * (it persists across sessions as a reasonable fallback).
 */
export function getExitTarget(): string | null {
  try {
    return localStorage.getItem(EXIT_TARGET_KEY);
  } catch {
    return null;
  }
}
