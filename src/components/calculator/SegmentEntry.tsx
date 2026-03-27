import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatSegment } from "@/lib/segmentParser";
import type { Segment } from "@/types/calculator";
import { Pencil, Trash2, Plus } from "lucide-react";

const FRACTION_OPTIONS = [
  { label: "0", value: "0" },
  { label: "1/4", value: "1/4" },
  { label: "1/2", value: "1/2" },
  { label: "3/4", value: "3/4" },
] as const;

const FRACTION_MAP: Record<string, number> = {
  "0": 0, "1/4": 0.25, "1/2": 0.5, "3/4": 0.75,
};

function computeLength(feet: string, inches: string, fraction: string) {
  const f = parseInt(feet) || 0;
  const i = parseInt(inches) || 0;
  const frac = FRACTION_MAP[fraction] ?? 0;
  return f * 12 + i + frac;
}

interface SegmentEntryProps {
  segments: Segment[];
  onAdd: (seg: Omit<Segment, "id" | "sortOrder">) => void;
  onUpdate: (id: string, seg: Partial<Segment>) => void;
  onDelete: (id: string) => void;
}

function SegmentInputRow({
  feet, inches, fraction,
  onFeetChange, onInchesChange, onFractionChange,
  onSubmit, submitLabel, submitIcon,
  error, onCancel, autoFocus,
  compact,
}: {
  feet: string;
  inches: string;
  fraction: string;
  onFeetChange: (v: string) => void;
  onInchesChange: (v: string) => void;
  onFractionChange: (v: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  submitIcon?: React.ReactNode;
  error?: string;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}) {
  const length = computeLength(feet, inches, fraction);
  const inchesNum = parseInt(inches) || 0;
  const inchesError = inches !== "" && inchesNum > 11;
  const h = compact ? "h-7" : "h-9";
  const textSize = compact ? "text-xs" : "text-sm";

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 items-end">
        <div className="flex-1 min-w-[60px]">
          {!compact && <label className="text-xs text-muted-foreground mb-0.5 block">Feet</label>}
          <Input
            type="number"
            min={0}
            placeholder="ft"
            value={feet}
            onChange={(e) => onFeetChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className={`${h} ${textSize}`}
            autoFocus={autoFocus}
          />
        </div>
        <div className="flex-1 min-w-[60px]">
          {!compact && <label className="text-xs text-muted-foreground mb-0.5 block">Inches</label>}
          <Input
            type="number"
            min={0}
            max={11}
            placeholder="in"
            value={inches}
            onChange={(e) => onInchesChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            className={`${h} ${textSize} ${inchesError ? "border-destructive" : ""}`}
          />
        </div>
        <div className="min-w-[72px]">
          {!compact && <label className="text-xs text-muted-foreground mb-0.5 block">Fraction</label>}
          <Select value={fraction} onValueChange={onFractionChange}>
            <SelectTrigger className={`${h} ${textSize} w-full`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FRACTION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}"</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={onSubmit}
            className={`${h} gap-1 ${textSize}`}
            disabled={length <= 0 || inchesError}
          >
            {submitIcon}
            {submitLabel}
          </Button>
          {onCancel && (
            <Button size="sm" variant="ghost" onClick={onCancel} className={`${h} ${textSize}`}>
              Cancel
            </Button>
          )}
        </div>
      </div>
      {inchesError && <p className="text-xs text-destructive mt-1">Inches must be 0–11</p>}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

export function SegmentEntry({ segments, onAdd, onUpdate, onDelete }: SegmentEntryProps) {
  const [feetInput, setFeetInput] = useState("");
  const [inchesInput, setInchesInput] = useState("");
  const [fractionInput, setFractionInput] = useState("0");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFeet, setEditFeet] = useState("");
  const [editInches, setEditInches] = useState("");
  const [editFraction, setEditFraction] = useState("0");

  const pendingLengthIn = computeLength(feetInput, inchesInput, fractionInput);
  const storedTotalIn = segments.reduce((sum, s) => sum + s.lengthInchesDecimal, 0);
  const totalLf = (storedTotalIn + pendingLengthIn) / 12;

  const handleAdd = () => {
    const feet = parseInt(feetInput) || 0;
    const inches = parseInt(inchesInput) || 0;
    if (inches > 11) return;
    const fraction = fractionInput;
    const lengthInchesDecimal = computeLength(feetInput, inchesInput, fractionInput);
    if (lengthInchesDecimal <= 0) return;
    onAdd({ feet, inches, fraction, lengthInchesDecimal });
    setFeetInput("");
    setInchesInput("");
    setFractionInput("0");
  };

  const handleEditSave = (id: string) => {
    const feet = parseInt(editFeet) || 0;
    const inches = parseInt(editInches) || 0;
    if (inches > 11) return;
    const fraction = editFraction;
    const lengthInchesDecimal = computeLength(editFeet, editInches, editFraction);
    if (lengthInchesDecimal <= 0) return;
    onUpdate(id, { feet, inches, fraction, lengthInchesDecimal });
    setEditingId(null);
  };

  const startEdit = (seg: Segment) => {
    setEditingId(seg.id);
    setEditFeet(seg.feet > 0 ? String(seg.feet) : "");
    setEditInches(seg.inches > 0 ? String(seg.inches) : "");
    // Map old fine-grained fractions to nearest 1/4
    const frac = seg.fraction;
    const valid = FRACTION_OPTIONS.some(o => o.value === frac);
    setEditFraction(valid ? frac : "0");
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div className="space-y-3">
      <SegmentInputRow
        feet={feetInput}
        inches={inchesInput}
        fraction={fractionInput}
        onFeetChange={setFeetInput}
        onInchesChange={setInchesInput}
        onFractionChange={setFractionInput}
        onSubmit={handleAdd}
        submitLabel="Add"
        submitIcon={<Plus className="h-3.5 w-3.5" />}
      />

      {(segments.length > 0 || pendingLengthIn > 0) && (
        <div className="space-y-1.5">
          {segments.map((seg) => (
            <div key={seg.id}>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
                {editingId === seg.id ? (
                  <div className="flex-1">
                    <SegmentInputRow
                      feet={editFeet}
                      inches={editInches}
                      fraction={editFraction}
                      onFeetChange={setEditFeet}
                      onInchesChange={setEditInches}
                      onFractionChange={setEditFraction}
                      onSubmit={() => handleEditSave(seg.id)}
                      submitLabel="Save"
                      onCancel={cancelEdit}
                      autoFocus
                      compact
                    />
                  </div>
                ) : (
                  <>
                    <span className="font-mono text-foreground">
                      {formatSegment(seg.feet, seg.inches, seg.fraction)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        aria-label="Edit segment"
                        onClick={() => startEdit(seg)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 text-destructive"
                        onClick={() => onDelete(seg.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          <div className="text-sm font-medium text-foreground pt-1">
            Total: {totalLf.toFixed(2)} ft
          </div>
        </div>
      )}
    </div>
  );
}
