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
  if (!response.ok || !data.url) throw new Error(data.error || "Could not start checkout");
  window.location.href = data.url;
}
