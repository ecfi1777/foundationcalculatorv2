import { useState, useRef, useEffect, useCallback } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS, hasRequiredData } from "@/types/calculator";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";

const TABS: CalculatorType[] = [
  "footing",
  "wall",
  "gradeBeam",
  "curbGutter",
  "slab",
  "pierPad",
  "cylinder",
  "steps",
];

export function CalculatorTabBar() {
  const { state, dispatch, addArea, activeArea } = useCalculatorState();
  const activeRef = useRef<HTMLButtonElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<CalculatorType | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [state.activeTab]);

  // Auto-create draft area for the default tab on first render
  useEffect(() => {
    if (!state.activeAreaId && state.areas.length === 0) {
      addArea(state.activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activateTab = useCallback((tab: CalculatorType) => {
    dispatch({ type: "SET_TAB", tab });
    // Auto-create a draft for the new tab
    addArea(tab);
  }, [dispatch, addArea]);

  const handleTabClick = useCallback((tab: CalculatorType) => {
    // If clicking the same tab with no active area, create a new draft
    if (tab === state.activeTab) {
      if (!state.activeAreaId) {
        addArea(tab);
      }
      return;
    }
    // Guard: unsaved draft with data
    if (activeArea?.isDraft && hasRequiredData(activeArea)) {
      setPendingTab(tab);
      setDiscardOpen(true);
      return;
    }
    activateTab(tab);
  }, [state.activeTab, state.activeAreaId, activeArea, activateTab, addArea]);

  const confirmDiscard = () => {
    if (activeArea) {
      dispatch({ type: "DELETE_AREA", id: activeArea.id });
    }
    setDiscardOpen(false);
    if (pendingTab) {
      activateTab(pendingTab);
      setPendingTab(null);
    }
  };

  const cancelDiscard = () => {
    setDiscardOpen(false);
    setPendingTab(null);
  };

  return (
    <>
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab}
            ref={state.activeTab === tab ? activeRef : undefined}
            onClick={() => handleTabClick(tab)}
            className={cn(
              "whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              state.activeTab === tab
                ? "border-primary text-primary bg-secondary/30"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            )}
          >
            {CALCULATOR_LABELS[tab]}
          </button>
        ))}
      </div>

      <ConfirmDialog
        open={discardOpen}
        onClose={cancelDiscard}
        onConfirm={confirmDiscard}
        title="Discard unsaved area?"
        description={`"${activeArea?.name ?? "This area"}" has unsaved measurements. Do you want to discard it?`}
        confirmLabel="Discard"
        variant="destructive"
      />
    </>
  );
}
