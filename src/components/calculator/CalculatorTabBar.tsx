import { useCalculatorState } from "@/hooks/useCalculatorState";
import type { CalculatorType } from "@/types/calculator";
import { CALCULATOR_LABELS } from "@/types/calculator";
import { cn } from "@/lib/utils";
import { useRef, useEffect } from "react";

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
  const { state, dispatch } = useCalculatorState();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [state.activeTab]);

  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-border pb-0 scrollbar-hide">
      {TABS.map((tab) => (
        <button
          key={tab}
          ref={state.activeTab === tab ? activeRef : undefined}
          onClick={() => dispatch({ type: "SET_TAB", tab })}
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
  );
}
