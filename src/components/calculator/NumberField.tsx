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
}: NumberFieldProps) {
  return (
    <div className={className}>
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {suffix && <span className="ml-1 text-muted-foreground/70">({suffix})</span>}
      </Label>
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
