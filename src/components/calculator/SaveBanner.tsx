import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthIntent, clearAuthIntent } from "@/lib/authIntent";

interface SaveBannerProps {
  hasAreas: boolean;
}

export function SaveBanner({ hasAreas }: SaveBannerProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (!hasAreas || user || dismissed) return null;

  const handleSignUp = () => {
    setAuthIntent({ redirectTo: "/app", action: "save" });
    navigate("/auth");
  };

  const handleDismiss = () => {
    clearAuthIntent();
    setDismissed(true);
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
      <p className="text-sm text-foreground">
        <strong>Save your work</strong> — create a free account
      </p>
      <div className="flex gap-2">
        <Button size="sm" className="h-7 text-xs" onClick={handleSignUp}>
          Sign Up
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          onClick={handleDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
