import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase/client";
import { startCheckout } from "@/lib/billing";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  "Unlimited projects",
  "Team invites (add multiple seats)",
  "All calculators included",
];

export default function PaywallModal({ open, onClose }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in first.");
        return;
      }
      const { data: settings } = await supabase
        .from("user_settings")
        .select("active_org_id")
        .eq("user_id", session.user.id)
        .single();

      if (!settings?.active_org_id) {
        toast.error("No active organization found.");
        return;
      }

      setLoading(true);
      await startCheckout(session, settings.active_org_id);
    } catch {
      toast.error("Unable to start checkout. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogTitle className="text-lg font-semibold">Upgrade to Pro</DialogTitle>

        <p className="text-sm text-muted-foreground">
          $10/seat/month — cancel anytime. No contracts.
        </p>

        <ul className="space-y-2 mt-4">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" />
              <span className="text-sm text-foreground">{f}</span>
            </li>
          ))}
        </ul>

        <Button className="w-full mt-6" onClick={handleUpgrade} disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          {loading ? "Redirecting…" : "Upgrade to Pro — $10/month"}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-2">
          Have a promo code? You can enter it on the next screen.
        </p>

        <Button variant="ghost" className="w-full" onClick={onClose}>
          Maybe later
        </Button>
      </DialogContent>
    </Dialog>
  );
}
