/**
 * Helper for calling Supabase Edge Functions via fetch.
 */
export async function callEdgeFunction(
  functionName: string,
  options: {
    method?: string;
    accessToken?: string;
    body?: unknown;
  } = {}
): Promise<Response> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const url = `https://${projectId}.supabase.co/functions/v1/${functionName}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  return fetch(url, {
    method: options.method ?? "POST",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}
