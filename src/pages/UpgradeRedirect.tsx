import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UpgradeRedirect() {
  const [error, setError] = useState<string | null>(null);
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Please sign in first."); return; }
        const { data: settings } = await supabase
          .from("user_settings")
          .select("active_org_id")
          .eq("user_id", session.user.id)
          .single();
        if (!settings?.active_org_id) { setError("No active organization."); return; }
        await startCheckout(session, settings.active_org_id);
        setRedirected(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    })();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background flex-col gap-4">
      {error ? (
        <>
          <p className="text-sm text-destructive">{error}</p>
          <Button onClick={() => window.location.reload()}>Try again</Button>
        </>
      ) : redirected ? (
        <p className="text-sm text-muted-foreground">Checkout opened — complete payment in the new tab.</p>
      ) : (
        <>
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to checkout…</p>
        </>
      )}
    </div>
  );
}
