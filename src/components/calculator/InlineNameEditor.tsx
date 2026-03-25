import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { AREA_NAME_PREFIXES, type CalculatorType } from "@/types/calculator";
import { cn } from "@/lib/utils";

/** Regex pattern that matches auto-generated default names like "Footing Area (3)" */
const DEFAULT_NAME_PATTERNS = Object.values(AREA_NAME_PREFIXES).map(
  (prefix) => new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} \\(\\d+\\)$`)
);

export function isDefaultName(name: string): boolean {
  return DEFAULT_NAME_PATTERNS.some((p) => p.test(name));
}

interface InlineNameEditorProps {
  name: string;
  onRename: (newName: string) => void;
  className?: string;
}

/**
 * Click-to-edit inline name field.
 * Default auto-generated names render in muted style.
 * Enter / blur saves; Escape cancels.
 */
export function InlineNameEditor({ name, onRename, className }: InlineNameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  const save = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== name) {
      onRename(trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(name);
    setEditing(false);
  };

  if (editing) {
    return (
      <Input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") { e.preventDefault(); save(); }
          if (e.key === "Escape") { e.preventDefault(); cancel(); }
        }}
        onBlur={save}
        className={cn("h-7 text-sm px-1.5 py-0", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "text-sm font-semibold cursor-pointer hover:underline truncate",
        isDefaultName(name) ? "text-muted-foreground italic" : "text-foreground",
        className,
      )}
      onClick={() => { setDraft(name); setEditing(true); }}
      title="Click to rename"
    >
      {name}
    </span>
  );
}
