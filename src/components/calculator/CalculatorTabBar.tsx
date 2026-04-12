import { useState, useRef, useEffect, useCallback } from "react";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS, hasRequiredData } from "@/types/calculator";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<CalculatorType | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkOverflow();
    el.addEventListener("scroll", checkOverflow, { passive: true });
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkOverflow);
      ro.disconnect();
    };
  }, [checkOverflow]);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [state.activeTab]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -150 : 150, behavior: "smooth" });
  };

  // Draft creation is handled centrally in useCalculatorState (state-driven).

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
    if (activeArea?.isDraft && hasRequiredData(activeArea) && activeArea.hasUserModifiedDimensions) {
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
      <div className="relative">
        {/* Left fade + arrow */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
            <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <button
              onClick={() => scroll("left")}
              className="relative z-10 flex h-full items-center pl-0.5 pr-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll tabs left"
              tabIndex={-1}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable tab row */}
        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-hide"
        >
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

        {/* Right fade + arrow */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-0 z-10 flex items-center">
            <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />
            <button
              onClick={() => scroll("right")}
              className="relative z-10 flex h-full items-center pr-0.5 pl-1 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Scroll tabs right"
              tabIndex={-1}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
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
