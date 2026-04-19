/**
 * Durable handoff for auth-gated user intent across the /auth redirect.
 * Stored in sessionStorage so it survives provider unmount but not browser close.
 */
export type AuthIntent = {
  redirectTo: string;
  action?: "save" | "newProject";
};

const KEY = "tfc_auth_intent";

export function setAuthIntent(intent: AuthIntent): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(intent));
  } catch (err) {
    console.error("Failed to set auth intent:", err);
  }
}

/** Read without removing. Use when another component is responsible for consumption. */
export function peekAuthIntent(): AuthIntent | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthIntent) : null;
  } catch {
    return null;
  }
}

/** Read and remove atomically. */
export function consumeAuthIntent(): AuthIntent | null {
  const intent = peekAuthIntent();
  if (intent) {
    try { sessionStorage.removeItem(KEY); } catch { /* noop */ }
  }
  return intent;
}

export function clearAuthIntent(): void {
  try { sessionStorage.removeItem(KEY); } catch { /* noop */ }
}
