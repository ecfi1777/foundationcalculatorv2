import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { captureRefCode } from "@/lib/localStorage";
import { CalculatorProvider, useCalculatorState } from "@/hooks/useCalculatorState";
import { ProjectProvider, useProject } from "@/hooks/useProject";
import { CalculatorLayout } from "@/components/calculator/CalculatorLayout";
import { SEO } from "@/components/SEO";
import { consumeDraft, stashExitTarget, getExitTarget } from "@/lib/workspaceHandoff";
import { consumeAuthIntent } from "@/lib/authIntent";
import type { CalcState } from "@/hooks/useCalculatorState";
import type { CalculatorType } from "@/types/calculator";
import { hasRequiredData } from "@/types/calculator";

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
  const { user } = useAuth();
  const { state, dispatch } = useCalculatorState();
  const { setPendingAction, currentProject, saveProject } = useProject();
  const hasHydrated = useRef(false);
  const hasAutoSavedHandoff = useRef(false);
  // Tracks whether this mount hydrated from a handoff. Set synchronously in
  // the mount effect; consumed by the post-hydration auto-save effect.
  const hydratedFromHandoff = useRef(false);

  const fromParam = searchParams.get("from");
  const tabParam = searchParams.get("tab") as CalculatorType | null;

  // Store the exit target from the `from` query param
  useEffect(() => {
    if (fromParam) {
      stashExitTarget(fromParam);
    }
  }, [fromParam]);

  // On mount: consume handoff draft (if any), then consume auth intent (if any)
  // to resume the pending action after an auth round-trip. ProjectProvider
  // unmounts across /auth so pendingAction in React state is lost — the auth
  // intent in sessionStorage is what survives and rehydrates the resume.
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const handoff = consumeDraft<CalcState>();
    if (handoff) {
      // Handoff draft wins — hydrate workspace with pre-auth calculator state
      dispatch({ type: "LOAD", state: handoff });
      hydratedFromHandoff.current = true;
      if (tabParam && VALID_TABS.includes(tabParam) && handoff.activeTab !== tabParam) {
        dispatch({ type: "SET_TAB", tab: tabParam });
      }
    } else if (tabParam && VALID_TABS.includes(tabParam)) {
      // No handoff — just switch to the requested tab without wiping existing state
      dispatch({ type: "SET_TAB", tab: tabParam });
    }

    // Resume the pending action if the user is signed in and an intent was set
    // before /auth. Only consume for authenticated mounts — leaving it in place
    // for anon mounts preserves the intent if the user re-enters auth.
    if (user) {
      const intent = consumeAuthIntent();
      if (intent?.action) {
        setPendingAction({ type: intent.action });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After handoff hydration is reflected in state, auto-save as a new project
  // if: user is authenticated, no currentProject exists, the handoff hydrated
  // real work (at least one area with required data), and we haven't already
  // auto-saved on this mount. Creates "Untitled Project" — user can rename via
  // the header pencil. This supersedes the legacy migrateAnonData path.
  useEffect(() => {
    if (!user) return;
    if (hasAutoSavedHandoff.current) return;
    if (!hydratedFromHandoff.current) return;
    if (currentProject) return;
    if (state.areas.length === 0) return;
    if (!state.areas.some((a) => hasRequiredData(a))) return;

    hasAutoSavedHandoff.current = true;
    void saveProject("Untitled Project");
  }, [user, state.areas, currentProject, saveProject]);

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
