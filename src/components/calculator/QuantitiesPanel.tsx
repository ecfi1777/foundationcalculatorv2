import { useMemo, useState, useCallback, useEffect } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type {
  AreaResult, ProjectTotals,
  RebarResult, RebarElementType,
} from "@/types/calculator";
import { hasRequiredData } from "@/types/calculator";
import { computeArea } from "@/lib/computeArea";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import { toast } from "@/hooks/use-toast";
import { InlineNameEditor } from "./InlineNameEditor";

function getRebarLabel(
  elementType: RebarElementType,
  isMultiElement: boolean
): string {
  if (!isMultiElement) return "";
  switch (elementType) {
    case "footing": return "Footing ";
    case "wall": return "Wall ";
    case "grade_beam": return "Grade Beam ";
    case "curb": return "Curb ";
    case "slab": return "";
    default: return "";
  }
}

interface QuantitiesPanelProps {
  onEditArea?: (areaId: string, tab: string) => void;
}

export function QuantitiesPanel({ onEditArea }: QuantitiesPanelProps) {
  const { state, dispatch } = useCalculatorState();
  const [deleteAreaId, setDeleteAreaId] = useState<string | null>(null);

  const [stoneTypeMap, setStoneTypeMap] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    supabase
      .from("stone_types")
      .select("id, name")
      .eq("is_active", true)
      .then(({ data, error }) => {
        if (error) {
          toast({ title: "Failed to load stone types", description: error.message, variant: "destructive" });
          return;
        }
        if (data) {
          setStoneTypeMap(new Map(data.map((r) => [r.id, r.name])));
        }
      });
  }, []);

  // Include committed areas + drafts that have sufficient data to calculate
  const visibleAreas = useMemo(
    () => state.areas.filter((a) => !a.isDraft || (hasRequiredData(a) && a.hasUserModifiedDimensions)),
    [state.areas]
  );

  const results = useMemo(
    () => visibleAreas.map((area) => computeArea(area, stoneTypeMap)),
    [visibleAreas, stoneTypeMap]
  );

  const totals: ProjectTotals = useMemo(() => {
    let concreteCy = 0;
    let stoneTons = 0;
    let rebarLf = 0;
    for (const r of results) {
      concreteCy += r.totalWithWasteCy;
      stoneTons += r.stoneTons ?? 0;
      for (const rr of r.rebarResults) {
        rebarLf += (rr.horizLf ?? 0) + (rr.vertLf ?? 0) + (rr.gridLf ?? 0);
      }
    }
    return { concreteCy, stoneTons, rebarLf };
  }, [results]);

  const isLinearType = (type: string) => ["footing", "wall", "gradeBeam", "curbGutter"].includes(type);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border">
        <h2 className="text-lg font-bold text-foreground">Quantities</h2>
        <p className="text-xs text-muted-foreground">Real-time project totals</p>
      </div>

      {/* Areas list — scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-secondary p-4 mb-3">
              <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-sm text-foreground font-medium mb-1">No areas yet</p>
            <p className="text-sm text-muted-foreground">Add segments to see calculations</p>
          </div>
        ) : (
          results.map((r) => {
            const isMultiElement = r.rebarResults.length > 1;

            return (
              <div key={r.areaId} className="rounded-lg border border-border bg-card p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <InlineNameEditor
                      name={r.areaName}
                      onRename={(newName) => dispatch({ type: "RENAME_AREA", id: r.areaId, name: newName })}
                      className="h-6"
                    />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => {
                        if (onEditArea) {
                          onEditArea(r.areaId, r.type);
                        } else {
                          dispatch({ type: "EDIT_AREA", tab: r.type, id: r.areaId });
                        }
                      }}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive"
                      onClick={() => setDeleteAreaId(r.areaId)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {isLinearType(r.type) && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Linear Feet:</span>
                    <span className="font-mono text-foreground">{r.totalLinearFt.toFixed(2)} ft</span>
                  </div>
                )}
                {r.type === "slab" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Square Feet:</span>
                    <span className="font-mono text-foreground">{Math.round(r.totalSqft)} SF</span>
                  </div>
                )}
                {r.type === "footing" && r.footingVolumeCy > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Footing Volume:</span>
                    <span className="font-mono text-foreground">{r.footingVolumeCy.toFixed(2)} yd³</span>
                  </div>
                )}
                {r.wallVolumeCy !== null && r.wallVolumeCy > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Wall Volume:</span>
                    <span className="font-mono text-foreground">{r.wallVolumeCy.toFixed(2)} yd³</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">Area Total:</span>
                  <span className="font-semibold text-primary font-mono">{r.totalWithWasteCy.toFixed(2)} yd³</span>
                </div>

                {r.rebarResults.map((rr) => {
                  const prefix = getRebarLabel(rr.elementType, isMultiElement);
                  return (
                    <div key={rr.elementType}>
                      {rr.horizLf !== null && rr.horizLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {prefix}Rebar ({rr.horizBarSize} Horiz):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.horizLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                      {rr.vertLf !== null && rr.vertLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {prefix}{rr.vertLabel} ({rr.vertBarSize}):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.vertLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                      {rr.gridLf !== null && rr.gridLf > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Rebar Grid ({rr.gridBarSize} @ {rr.gridSpacingIn}"):
                          </span>
                          <span className="font-mono text-foreground">
                            {Math.round(rr.gridLf).toLocaleString()} LF
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {r.stoneTons !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stone Base ({r.stoneDepthIn}" {r.stoneTypeName ?? "#57"}):</span>
                    <span className="font-mono text-foreground">{r.stoneTons.toFixed(2)} tons</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PROJECT TOTALS — always pinned */}
      <div className="shrink-0 border-t border-border bg-card px-4 py-3 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Project Totals
        </p>
        <div className="flex justify-between text-sm">
          <span className="text-foreground">Concrete</span>
          <span className="font-semibold text-primary font-mono">
            {totals.concreteCy.toFixed(2)} yd³
          </span>
        </div>
        {totals.stoneTons > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Stone</span>
            <span className="font-semibold text-primary font-mono">
              {totals.stoneTons.toFixed(2)} tons
            </span>
          </div>
        )}
        {totals.rebarLf > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-foreground">Rebar</span>
            <span className="font-semibold text-primary font-mono">
              {Math.round(totals.rebarLf).toLocaleString()} LF
            </span>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={!!deleteAreaId}
        onClose={() => setDeleteAreaId(null)}
        onConfirm={() => {
          if (deleteAreaId) dispatch({ type: "DELETE_AREA", id: deleteAreaId });
          setDeleteAreaId(null);
        }}
        title="Delete Area"
        description={`Are you sure you want to delete "${results.find((r) => r.areaId === deleteAreaId)?.areaName ?? "this area"}"? All measurements and settings for this area will be permanently removed.`}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  );
}
