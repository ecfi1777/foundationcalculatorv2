import { useState, useRef, useEffect } from "react";
import { useProject } from "@/hooks/useProject";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import type { CalcArea, CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS } from "@/types/calculator";
import { Plus, X, Pencil, Check } from "lucide-react";

interface AreaSelectorProps {
  areas: CalcArea[];
  activeAreaId: string | null;
  onSelect: (id: string) => void;
  onAdd: (customName?: string) => void;
  onDiscard?: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  type: CalculatorType;
}

export function AreaSelector({ areas, activeAreaId, onSelect, onAdd, onDiscard, onRename, type }: AreaSelectorProps) {
  const { currentProject } = useProject();
  const typeLabel = CALCULATOR_LABELS[type]?.toLowerCase() ?? type;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);

  const activeArea = areas.find((a) => a.id === activeAreaId);

  const startEditing = () => {
    if (!activeArea) return;
    setEditName(activeArea.name);
    setEditing(true);
  };

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const saveRename = () => {
    savingRef.current = true;
    const trimmed = editName.trim();
    if (trimmed && trimmed !== activeArea?.name && activeAreaId && onRename) {
      onRename(activeAreaId, trimmed);
    }
    setEditing(false);
    setTimeout(() => { savingRef.current = false; }, 0);
  };

  const cancelRename = () => {
    setEditing(false);
  };

  return (
    <div className="flex flex-col border-b border-border bg-card/50">
      <div className="flex items-center gap-2 px-3 py-2">
        {editing && activeArea ? (
          <div className="flex flex-1 items-center gap-1">
            <Input
              ref={inputRef}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); saveRename(); }
                if (e.key === "Escape") { e.preventDefault(); cancelRename(); }
              }}
              onBlur={() => {
                if (!savingRef.current) cancelRename();
              }}
              className="h-9 flex-1"
            />
            <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onMouseDown={() => saveRename()}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={cancelRename}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            {areas.length > 0 ? (
              <Select value={activeAreaId ?? ""} onValueChange={onSelect}>
                <SelectTrigger className="h-9 flex-1 bg-secondary/50">
                  <SelectValue placeholder="Select area…" />
                </SelectTrigger>
                <SelectContent>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="flex-1 text-sm text-muted-foreground">No {typeLabel} areas</span>
            )}
            {activeAreaId && onRename && (
              <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
          </>
        )}
        <Button
          size="sm"
          className="h-9 gap-1"
          onClick={() => onAdd()}
        >
          <Plus className="h-3.5 w-3.5" />
          Add Area
        </Button>
        {activeAreaId && onDiscard && !currentProject && (
          <Button
            size="sm"
            variant="outline"
            className="h-9 gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setConfirmOpen(true)}
          >
            <X className="h-3.5 w-3.5" />
            Discard Area
          </Button>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (activeAreaId && onDiscard) onDiscard(activeAreaId);
          setConfirmOpen(false);
        }}
        title="Discard Area"
        description={`Are you sure you want to discard "${activeArea?.name ?? "this area"}"? All sections, measurements, and settings for this area will be permanently removed.`}
        confirmLabel="Discard"
        variant="destructive"
      />
    </div>
  );
}
