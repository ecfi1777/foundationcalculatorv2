import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { CalculatorTabBar } from "./CalculatorTabBar";
import { QuantitiesPanel } from "./QuantitiesPanel";
import { SaveBanner } from "./SaveBanner";
import { FootingForm } from "./FootingForm";
import { LinearForm } from "./LinearForm";
import { CurbGutterForm } from "./CurbGutterForm";
import { SlabForm } from "./SlabForm";
import { PierPadForm } from "./PierPadForm";
import { CylinderForm } from "./CylinderForm";
import { StepsForm } from "./StepsForm";
import { cn } from "@/lib/utils";

function ActiveForm() {
  const { state } = useCalculatorState();
  switch (state.activeTab) {
    case "footing":
      return <FootingForm />;
    case "wall":
      return <LinearForm calcType="wall" />;
    case "gradeBeam":
      return <LinearForm calcType="gradeBeam" />;
    case "curbGutter":
      return <CurbGutterForm />;
    case "slab":
      return <SlabForm />;
    case "pierPad":
      return <PierPadForm />;
    case "cylinder":
      return <CylinderForm />;
    case "steps":
      return <StepsForm />;
    default:
      return null;
  }
}

export function CalculatorLayout() {
  const isMobile = useIsMobile();
  const { state } = useCalculatorState();
  const [mobileTab, setMobileTab] = useState<"calculator" | "quantities">("calculator");

  const hasAreas = state.areas.length > 0;

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        {/* Save banner */}
        <div className="px-3 pt-2">
          <SaveBanner hasAreas={hasAreas} />
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-3 pb-16">
          {mobileTab === "calculator" ? (
            <div className="space-y-3 py-3">
              <CalculatorTabBar />
              <ActiveForm />
            </div>
          ) : (
            <div className="py-3">
              <QuantitiesPanel />
            </div>
          )}
        </div>

        {/* Sticky bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background flex">
          <button
            onClick={() => setMobileTab("calculator")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "calculator" ? "text-primary bg-primary/5" : "text-muted-foreground"
            )}
          >
            Calculator
          </button>
          <button
            onClick={() => setMobileTab("quantities")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "quantities" ? "text-primary bg-primary/5" : "text-muted-foreground"
            )}
          >
            Quantities
          </button>
        </div>
      </div>
    );
  }

  // Desktop: split panel
  return (
    <div className="flex h-screen bg-background">
      {/* Left panel: Calculator */}
      <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
        <div className="px-4 pt-3">
          <SaveBanner hasAreas={hasAreas} />
        </div>
        <div className="px-4 pt-3">
          <CalculatorTabBar />
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ActiveForm />
        </div>
      </div>

      {/* Right panel: Quantities */}
      <div className="w-[400px] flex flex-col overflow-hidden">
        <div className="px-4 pt-4 pb-2">
          <h2 className="text-lg font-bold text-foreground">Quantities</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <QuantitiesPanel />
        </div>
      </div>
    </div>
  );
}
