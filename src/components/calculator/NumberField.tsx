import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  onBlur?: () => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
  /** Optional inline info icon rendered after the label (and suffix). */
  infoIcon?: ReactNode;
}

export function NumberField({
  label,
  value,
  onChange,
  onBlur,
  min = 0,
  max,
  step = 1,
  suffix,
  className,
  infoIcon,
}: NumberFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1">
        <Label className="text-xs font-medium text-muted-foreground">
          {label}
          {suffix && <span className="ml-1 text-muted-foreground/70">({suffix})</span>}
        </Label>
        {infoIcon}
      </div>
      <Input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value || ""}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onBlur={onBlur}
        className="mt-1 h-9"
      />
    </div>
  );
}
