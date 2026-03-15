import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { AppHeader } from "./AppHeader";
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
    case "footing":    return <FootingForm />;
    case "wall":       return <LinearForm calcType="wall" />;
    case "gradeBeam":  return <LinearForm calcType="gradeBeam" />;
    case "curbGutter": return <CurbGutterForm />;
    case "slab":       return <SlabForm />;
    case "pierPad":    return <PierPadForm />;
    case "cylinder":   return <CylinderForm />;
    case "steps":      return <StepsForm />;
    default:           return null;
  }
}

export function CalculatorLayout() {
  const isMobile = useIsMobile();
  const { state } = useCalculatorState();
  const [mobileTab, setMobileTab] = useState<"calculator" | "quantities">("calculator");
  const [projectName, setProjectName] = useState("New Foundation Project");

  const hasAreas = state.areas.length > 0;

  // Stub — wired to Supabase in Phase 8
  const handleSave = () => console.log("Save clicked — Phase 8 will wire this up");

  // ── MOBILE ──────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AppHeader projectName={projectName} onProjectNameChange={setProjectName} onSave={handleSave} />

        {/* SaveBanner kept on mobile as an extra sign-in prompt */}
        <div className="px-3 pt-2">
          <SaveBanner hasAreas={hasAreas} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-16">
          {mobileTab === "calculator" ? (
            <div className="space-y-3 py-3">
              <CalculatorTabBar />
              <div className="rounded-lg border border-border bg-card p-4">
                <ActiveForm />
              </div>
            </div>
          ) : (
            <QuantitiesPanel />
          )}
        </div>

        {/* Sticky bottom nav */}
        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card flex">
          <button
            onClick={() => setMobileTab("calculator")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "calculator" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            Calculator
          </button>
          <button
            onClick={() => setMobileTab("quantities")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "quantities" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >
            Quantities
          </button>
        </div>
      </div>
    );
  }

  // ── DESKTOP ─────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader projectName={projectName} onProjectNameChange={setProjectName} onSave={handleSave} />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Calculator */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <div className="px-4 pt-3">
            <CalculatorTabBar />
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <ActiveForm />
            </div>
          </div>
        </div>

        {/* Right: Quantities */}
        <div className="w-[400px] flex flex-col overflow-hidden h-full">
          <QuantitiesPanel />
        </div>
      </div>
    </div>
  );
}
