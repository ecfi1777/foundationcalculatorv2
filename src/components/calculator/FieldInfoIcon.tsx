import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useIsMobile } from "@/hooks/use-mobile";

interface FieldInfoIconProps {
  /** Tooltip/dialog body text. */
  content: string;
  /** Optional dialog title on mobile. Defaults to "Info". */
  title?: string;
  /** aria-label for the icon button. Defaults to "More information". */
  ariaLabel?: string;
}

/**
 * Inline info icon (ⓘ) for field-level notes — e.g. the v2.3 spec §8.10 hold-down
 * warning on vertical rebar height and L-bar vertical leg inputs.
 * Renders a Tooltip on desktop, Dialog on mobile.
 */
export function FieldInfoIcon({
  content,
  title = "Info",
  ariaLabel = "More information",
}: FieldInfoIconProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={ariaLabel}
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{content}</p>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="text-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
