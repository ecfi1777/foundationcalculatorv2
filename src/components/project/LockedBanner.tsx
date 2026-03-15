import { useState } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import PaywallModal from "@/components/PaywallModal";

export function LockedBanner() {
  const [showPaywall, setShowPaywall] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-amber-400">This project is locked. Upgrade to Pro to edit.</span>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowPaywall(true)}>
          Upgrade
        </Button>
      </div>
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
}
