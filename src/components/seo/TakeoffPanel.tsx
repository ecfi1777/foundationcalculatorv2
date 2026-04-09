import { useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export interface TakeoffEntry {
  id: string;
  tab: "slab" | "footing" | "wall" | "rebar";
  label: string;
  name: string;
  volumeCy: number;
  withWasteCy: number;
  wastePct: number;
  inputs: {
    slabL?: string;
    slabW?: string;
    slabT?: string;
    slabWaste?: string;
    footLf?: string;
    footW?: string;
    footD?: string;
    footWaste?: string;
    wallLf?: string;
    wallH?: string;
    wallT?: string;
    wallWaste?: string;
    rebarL?: string;
    rebarW?: string;
    rebarSpacing?: string;
    rebarWaste?: string;
  };
}

interface TakeoffPanelProps {
  entries: TakeoffEntry[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onEdit: (entry: TakeoffEntry) => void;
  onRename: (id: string, name: string) => void;
}

export function TakeoffPanel({ entries, onRemove, onClear, onEdit, onRename }: TakeoffPanelProps) {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const totalConcreteCy = entries
    .filter((e) => e.tab !== "rebar")
    .reduce((sum, e) => sum + e.withWasteCy, 0);

  const totalRebarLf = entries
    .filter((e) => e.tab === "rebar")
    .reduce((sum, e) => sum + e.withWasteCy, 0);

  return (
    <div className="flex flex-col h-full">
      {/* ZONE 1: Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Your Takeoff</h2>
        <p className="text-xs text-muted-foreground">
          Add items below — totals accumulate here
        </p>
      </div>

      {/* ZONE 2: Scrollable list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-4 mb-3">
              <svg
                className="h-6 w-6 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">
              No items yet
            </p>
            <p className="text-sm text-muted-foreground">
              Calculate a section below to start your takeoff
            </p>
          </div>
        ) : (
          entries.map((entry) => {
            const isConfirmingDelete = pendingDeleteId === entry.id;

            return (
              <div
                key={entry.id}
                className="rounded-lg border border-border bg-card p-3 space-y-2"
              >
                {isConfirmingDelete ? (
                  <div className="py-2 space-y-3">
                    <p className="text-sm font-medium text-foreground text-center">
                      Remove this item?
                    </p>
                    <p className="text-xs text-muted-foreground text-center truncate">
                      {entry.name ? `"${entry.name}"` : entry.label}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => {
                          onRemove(entry.id);
                          setPendingDeleteId(null);
                        }}
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPendingDeleteId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Row 0: Name input */}
                    <Input
                      placeholder="Name this area…"
                      value={entry.name}
                      onChange={(e) => onRename(entry.id, e.target.value)}
                      className="h-7 text-xs px-2 border-border bg-transparent placeholder:text-muted-foreground/50 focus-visible:ring-1"
                    />

                    {/* Row 1: Dimensions label + action buttons */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {entry.label}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => onEdit(entry)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => setPendingDeleteId(entry.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Row 2: Base quantity */}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {entry.tab === "rebar" ? "Rebar Linear Feet:" : "Cubic Yards:"}
                      </span>
                      <span className="font-mono text-foreground">
                        {entry.tab === "rebar"
                          ? `${entry.volumeCy.toFixed(0)} LF`
                          : `${entry.volumeCy.toFixed(2)} yd³`}
                      </span>
                    </div>

                    <Separator />

                    {/* Row 3: With waste */}
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">
                        With {entry.wastePct}% Waste:
                      </span>
                      <span className="font-semibold text-primary font-mono">
                        {entry.tab === "rebar"
                          ? `${entry.withWasteCy.toFixed(0)} LF`
                          : `${entry.withWasteCy.toFixed(2)} yd³`}
                      </span>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ZONE 3: Pinned footer */}
      <div className="border-t border-border bg-card px-4 py-3 space-y-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Project Totals
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Concrete</span>
            <span className="font-semibold text-primary font-mono">
              {totalConcreteCy.toFixed(2)} yd³
            </span>
          </div>
          {totalRebarLf > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-foreground">Rebar</span>
              <span className="font-semibold text-primary font-mono">
                {Math.round(totalRebarLf).toLocaleString()} LF
              </span>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-destructive"
            onClick={onClear}
          >
            Clear all items
          </Button>
        )}

        <Button asChild className="w-full" size="sm">
          <Link to="/auth">
            {entries.length === 0
              ? "Create Free Account →"
              : "Save This Takeoff →"}
          </Link>
        </Button>

        {entries.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Create a free TFC account to save this takeoff, export a PDF report,
            and run full concrete takeoffs on any job.
          </p>
        )}
      </div>
    </div>
  );
}
