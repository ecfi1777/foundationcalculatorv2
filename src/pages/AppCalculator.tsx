import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider, useCalculatorState } from "@/hooks/useCalculatorState";
import { ProjectProvider } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";
import { consumeDraft, stashExitTarget, getExitTarget } from "@/lib/workspaceHandoff";
import type { CalcState } from "@/hooks/useCalculatorState";
import type { CalculatorType } from "@/types/calculator";

const VALID_TABS: CalculatorType[] = [
  "footing", "wall", "gradeBeam", "curbGutter",
  "slab", "pierPad", "cylinder", "steps",
];

/**
 * Inner component that has access to CalculatorProvider context.
 * Handles draft hydration and workspace navigation.
 */
function WorkspaceShell() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { dispatch } = useCalculatorState();
  const hasHydrated = useRef(false);

  const fromParam = searchParams.get("from");
  const tabParam = searchParams.get("tab") as CalculatorType | null;

  // Store the exit target from the `from` query param
  useEffect(() => {
    if (fromParam) {
      stashExitTarget(fromParam);
    }
  }, [fromParam]);

  // On mount: consume handoff draft if available, else apply tab param
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const handoff = consumeDraft<CalcState>();
    if (handoff) {
      // Handoff draft wins — hydrate workspace with SEO page state
      dispatch({ type: "LOAD", state: handoff });
      // Also set the tab if provided (in case handoff state had a different activeTab)
      if (tabParam && VALID_TABS.includes(tabParam) && handoff.activeTab !== tabParam) {
        dispatch({ type: "SET_TAB", tab: tabParam });
      }
    } else if (tabParam && VALID_TABS.includes(tabParam)) {
      // No handoff — just switch to the requested tab without wiping existing state
      dispatch({ type: "SET_TAB", tab: tabParam });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExitWorkspace = () => {
    const target = fromParam || getExitTarget() || "/concrete-calculator";
    navigate(target);
  };

  return (
    <CalculatorLayout
      mode="workspace"
      onExitWorkspace={handleExitWorkspace}
    />
  );
}

const AppCalculator = () => {
  const { loading } = useAuth();

  useEffect(() => {
    captureRefCode();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Concrete Calculator"
        description="Calculate concrete yardage for footings, slabs, walls, grade beams, pier pads, and more."
        canonical="https://foundationcalculator.com/app"
        noIndex={true}
      />
      <CalculatorProvider>
        <ProjectProvider>
          <WorkspaceShell />
        </ProjectProvider>
      </CalculatorProvider>
    </>
  );
};

export default AppCalculator;
