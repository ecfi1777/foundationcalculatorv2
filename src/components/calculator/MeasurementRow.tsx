import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FRACTION_OPTIONS = [
  { label: '0"', value: "0" },
  { label: '1/4"', value: "1/4" },
  { label: '1/2"', value: "1/2" },
  { label: '3/4"', value: "3/4" },
] as const;

interface MeasurementRowProps {
  label: string;
  feetValue: number;
  inchesValue: number;
  fractionValue: string;
  onFeetChange: (v: number) => void;
  onInchesChange: (v: number) => void;
  onFractionChange: (v: string) => void;
}

export function MeasurementRow({
  label,
  feetValue,
  inchesValue,
  fractionValue,
  onFeetChange,
  onInchesChange,
  onFractionChange,
}: MeasurementRowProps) {
  return (
    <div>
      <span className="text-xs font-medium text-muted-foreground mb-1 block">{label}</span>
      <div className="grid grid-cols-3 gap-2">
        {/* Feet */}
        <div className="relative">
          <Input
            type="number"
            min={0}
            value={feetValue || ""}
            onChange={(e) => onFeetChange(parseFloat(e.target.value) || 0)}
            className="h-9 pr-7"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70 pointer-events-none">ft</span>
        </div>

        {/* Inches */}
        <div className="relative">
          <Input
            type="number"
            min={0}
            max={11}
            value={inchesValue || ""}
            onChange={(e) => onInchesChange(parseFloat(e.target.value) || 0)}
            className="h-9 pr-7"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/70 pointer-events-none">in</span>
        </div>

        {/* Fraction */}
        <Select value={fractionValue ?? "0"} onValueChange={onFractionChange}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FRACTION_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
