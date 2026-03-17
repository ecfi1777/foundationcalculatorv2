import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parseSegmentInput, formatSegment } from "@/lib/segmentParser";
import type { Segment } from "@/types/calculator";
import { Pencil, Trash2, Plus } from "lucide-react";

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

  const totalLf = segments.reduce((sum, s) => sum + s.lengthInchesDecimal, 0) / 12;

  const handleAdd = () => {
    setError("");
    const parsed = parseSegmentInput(input);
    if (!parsed) {
      setError("Invalid format. Try: 22' 4-1/2\" or 22.5");
      return;
    }
    onAdd(parsed);
    setInput("");
  };

  const handleEditSave = (id: string) => {
    const parsed = parseSegmentInput(editInput);
    if (!parsed) {
      setError("Invalid format.");
      return;
    }
    onUpdate(id, parsed);
    setEditingId(null);
    setEditInput("");
    setError("");
  };

  const startEdit = (seg: Segment) => {
    setEditingId(seg.id);
    setEditInput(formatSegment(seg.feet, seg.inches, seg.fraction));
    setError("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder={`e.g. 22' 4-1/2"`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          className="h-9 flex-1"
        />
        <Button size="sm" onClick={handleAdd} className="h-9 gap-1">
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {segments.length > 0 && (
        <div className="space-y-1.5">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-1.5 text-sm"
            >
              {editingId === seg.id ? (
                <div className="flex flex-1 gap-2">
                  <Input
                    value={editInput}
                    onChange={(e) => setEditInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEditSave(seg.id)}
                    className="h-7 text-sm"
                    autoFocus
                  />
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleEditSave(seg.id)}>
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs" aria-label="Cancel editing" onClick={() => setEditingId(null)}>
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
          ))}
          <div className="text-sm font-medium text-foreground pt-1">
            Total: {totalLf.toFixed(2)} ft
          </div>
        </div>
      )}
    </div>
  );
}
