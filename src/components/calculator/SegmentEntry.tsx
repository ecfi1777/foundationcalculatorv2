import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseSegmentInputStrict, formatSegment, type ParseResult } from "@/lib/segmentParser";
import type { Segment } from "@/types/calculator";
import { Pencil, Trash2, Plus } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  missing_units: "Please specify units using ' for feet or \" for inches",
  invalid_fraction: "Invalid fraction — use 1/16\" increments (e.g. 1/4, 3/8, 7/16)",
  zero_length: "Length must be greater than zero",
};

interface SegmentEntryProps {
  segments: Segment[];
  onAdd: (seg: Omit<Segment, "id" | "sortOrder">) => void;
  onUpdate: (id: string, seg: Partial<Segment>) => void;
  onDelete: (id: string) => void;
}

export function SegmentEntry({ segments, onAdd, onUpdate, onDelete }: SegmentEntryProps) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [error, setError] = useState("");
  const [editError, setEditError] = useState("");

  const totalLf = segments.reduce((sum, s) => sum + s.lengthInchesDecimal, 0) / 12;

  const handleAdd = () => {
    setError("");
    const result = parseSegmentInputStrict(input);
    if (result.ok === false) {
      setError(ERROR_MESSAGES[result.reason] ?? "Invalid format");
      return;
    }
    onAdd(result.segment);
    setInput("");
  };

  const handleEditSave = (id: string) => {
    setEditError("");
    const result = parseSegmentInputStrict(editInput);
    if (result.ok === false) {
      setEditError(ERROR_MESSAGES[result.reason] ?? "Invalid format");
      return;
    }
    onUpdate(id, result.segment);
    setEditingId(null);
    setEditInput("");
  };

  const startEdit = (seg: Segment) => {
    setEditingId(seg.id);
    setEditInput(formatSegment(seg.feet, seg.inches, seg.fraction));
    setError("");
    setEditError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditInput("");
    setEditError("");
  };

  return (
    <div className="space-y-3">
      <div>
        <div className="flex gap-2">
          <Input
            placeholder={`e.g. 10' 6" or 120"`}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-9 flex-1"
          />
          <Button size="sm" onClick={handleAdd} className="h-9 gap-1">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
        {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      </div>

      {segments.length > 0 && (
        <div className="space-y-1.5">
          {segments.map((seg) => (
            <div key={seg.id}>
              <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm">
                {editingId === seg.id ? (
                  <div className="flex flex-1 gap-2">
                    <Input
                      value={editInput}
                      onChange={(e) => { setEditInput(e.target.value); setEditError(""); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditSave(seg.id);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditSave(seg.id)}>
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" aria-label="Cancel editing" onClick={cancelEdit}>
                      Cancel
                    </Button>
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
              {editingId === seg.id && editError && (
                <p className="text-xs text-destructive mt-1 ml-1">{editError}</p>
              )}
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
