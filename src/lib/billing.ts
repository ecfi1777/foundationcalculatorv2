import type { Session } from "@supabase/supabase-js";
import { callEdgeFunction } from "@/lib/edgeFunctions";

export async function startCheckout(session: Session, activeOrgId: string): Promise<void> {
  const data = await callEdgeFunction<{ url: string }>(
    "create-checkout-session",
    { email: session.user.email, orgId: activeOrgId },
    session
  );
  if (!data?.url) throw new Error("Checkout URL was not returned.");

  const inIframe = window.self !== window.top;
  if (inIframe) {
    try {
      window.top!.location.href = data.url;
    } catch {
      window.location.href = data.url;
    }
  } else {
    window.location.href = data.url;
  }
}
