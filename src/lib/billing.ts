import type { Session } from "@supabase/supabase-js";

export async function startCheckout(session: Session, activeOrgId: string): Promise<void> {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const response = await fetch(
    `https://${projectId}.supabase.co/functions/v1/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email: session.user.email, orgId: activeOrgId }),
    }
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Could not start checkout");
  if (!data?.url) throw new Error("Checkout URL was not returned.");

  const inIframe = window.self !== window.top;
  if (inIframe) {
    const opened = window.open(data.url, "_blank", "noopener,noreferrer");
    if (!opened) window.location.href = data.url;
  } else {
    window.location.href = data.url;
  }
  return data.url;
}
