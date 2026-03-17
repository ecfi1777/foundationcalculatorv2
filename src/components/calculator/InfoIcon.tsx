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

interface InfoIconProps {
  calculatorName: string;
}

export function InfoIcon({ calculatorName }: InfoIconProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const content = (
    <div className="flex items-center justify-center rounded-md border-2 border-dashed border-border bg-muted/50 p-8">
      <span className="text-sm text-muted-foreground">diagram — {calculatorName}</span>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          aria-label="More information"
          className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <Info className="h-4 w-4" />
        </button>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{calculatorName}</DialogTitle>
            </DialogHeader>
            {content}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground">
          <Info className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="w-64 p-4">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
