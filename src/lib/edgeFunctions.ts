/**
 * Helper for calling Supabase Edge Functions via fetch.
 */
import type { Session } from "@supabase/supabase-js";

const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

export async function callEdgeFunction<T = unknown>(
  fnName: string,
  body: Record<string, unknown>,
  session: Session
): Promise<T> {
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/${fnName}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `${fnName} failed`);
  return data as T;
}
