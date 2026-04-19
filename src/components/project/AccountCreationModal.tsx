import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setAuthIntent, clearAuthIntent } from "@/lib/authIntent";
import { stashDraft } from "@/lib/workspaceHandoff";
import { useCalculatorState } from "@/hooks/useCalculatorState";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function AccountCreationModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const { state } = useCalculatorState();

  const handleDismiss = () => {
    clearAuthIntent();
    onClose();
  };

  const handleCreate = () => {
    stashDraft(state);
    setAuthIntent({ redirectTo: "/app", action: "save" });
    navigate("/auth");
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleDismiss()}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogTitle>Create an Account</DialogTitle>
        <DialogDescription className="text-muted-foreground">
          Sign up for a free account to save your projects and access them from any device.
        </DialogDescription>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={handleDismiss}>Maybe later</Button>
          <Button onClick={handleCreate}>Create Free Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
