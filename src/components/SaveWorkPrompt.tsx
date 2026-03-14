import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SaveWorkPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveWorkPrompt({ open, onOpenChange }: SaveWorkPromptProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Save your work</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Create a free account to save your calculations and access them from
            any device.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={() => navigate("/auth")}>
            Create free account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
