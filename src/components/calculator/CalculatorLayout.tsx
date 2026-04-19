import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { stashDraft } from "@/lib/workspaceHandoff";
import { setAuthIntent, consumeAuthIntent } from "@/lib/authIntent";
import { Pencil } from "lucide-react";
import type { CalculatorType } from "@/types/calculator";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
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
import { LockedBanner } from "@/components/project/LockedBanner";
import { ProjectNameModal } from "@/components/project/ProjectNameModal";
import { ProjectEditModal } from "@/components/project/ProjectEditModal";
import { ProjectListPanel } from "@/components/project/ProjectListPanel";
import { AccountCreationModal } from "@/components/project/AccountCreationModal";
import { ConfirmDialog } from "@/components/project/ConfirmDialog";
import PaywallModal from "@/components/PaywallModal";
import { DraftActionButtons } from "./DraftActionButtons";
import { cn } from "@/lib/utils";
import { buildExportData } from "@/lib/export/buildExportData";
import { exportProjectToPDF, exportProjectToCSV } from "@/lib/export/exportService";
import { toast } from "sonner";
import { hasRequiredData } from "@/types/calculator";

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

interface CalculatorLayoutProps {
  /** "embedded" = SEO page with Open Workspace; "workspace" = /app with Exit Workspace */
  mode?: "embedded" | "workspace";
  onOpenWorkspace?: () => void;
  onExitWorkspace?: () => void;
}

export function CalculatorLayout({ mode, onOpenWorkspace, onExitWorkspace }: CalculatorLayoutProps) {
  const isMobile = useIsMobile();
  const { state, dispatch } = useCalculatorState();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    currentProject, isSaving, isDirty, isProjectLocked,
    saveProject, createNewProject, resetToBlank, clearAllState, updateProjectMeta,
    pendingAction, setPendingAction, clearPendingAction,
    subscriptionTier, loadProjects, projectCount, editableProjectCount,
  } = useProject();

  const visibleAreaCount = useMemo(
    () => state.areas.filter(a => !a.isDraft || (hasRequiredData(a) && a.hasUserModifiedDimensions)).length,
    [state.areas]
  );


  const handleSignOut = useCallback(async () => {
    clearAllState();
    localStorage.removeItem("tfc_calculator_state");
    localStorage.removeItem("tfc_anon_has_data");
    try {
      await signOut();
    } catch (err) {
      console.error("Sign-out error:", err);
      toast.error("Signed out locally, but session cleanup failed. Please clear your browser data if issues persist.");
    }
    navigate("/");
  }, [clearAllState, signOut, navigate]);

  const [mobileTab, setMobileTab] = useState<"calculator" | "quantities">("calculator");

  const handleMobileEditArea = useCallback((areaId: string, tab: string) => {
    dispatch({ type: "EDIT_AREA", tab: tab as CalculatorType, id: areaId });
    setMobileTab("calculator");
  }, [dispatch]);
  const touchStartX = useRef<number | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasAreas = state.areas.length > 0;
  const canExport = !!currentProject;
  const hasSubstantiveData =
    !!currentProject ||
    state.areas.some((area) => hasRequiredData(area));

  // Load projects on mount when authenticated
  useEffect(() => {
    if (user) loadProjects();
  }, [user, loadProjects]);

  // Handle pending action after auth
  useEffect(() => {
    if (user && pendingAction) {
      if (pendingAction.type === "save") {
        clearPendingAction();
        if (!currentProject) {
          if (subscriptionTier === "free" && editableProjectCount >= 1) {
            setShowPaywall(true);
            return;
          }
          setShowNameModal(true);
        } else {
          saveProject();
        }
      } else if (pendingAction.type === "newProject") {
        clearPendingAction();
        createNewProject();
      }
    }
  }, [user, pendingAction, clearPendingAction, currentProject, saveProject, createNewProject, subscriptionTier, editableProjectCount]);

  // ── Save handler ──
  const handleSave = useCallback(() => {
    if (!user) {
      setPendingAction({ type: "save" });
      setShowAccountModal(true);
      return;
    }
    if (currentProject) {
      saveProject();
      return;
    }
    if (subscriptionTier === "free" && editableProjectCount >= 1) {
      setShowPaywall(true);
      return;
    }
    setShowNameModal(true);
  }, [user, currentProject, saveProject, setPendingAction, subscriptionTier, editableProjectCount]);

  // ── New Project handler ──
  const handleNewProject = useCallback(() => {
    if (!user) {
      setPendingAction({ type: "newProject" });
      setShowAccountModal(true);
      return;
    }
    if (subscriptionTier === "free" && editableProjectCount >= 1) {
      setShowPaywall(true);
      return;
    }
    if (isDirty && hasSubstantiveData) {
      setShowNewProjectConfirm(true);
      return;
    }
    createNewProject();
  }, [user, subscriptionTier, editableProjectCount, isDirty, createNewProject, setPendingAction]);

  // ── First save confirm ──
  const handleNameConfirm = useCallback((name: string) => {
    setShowNameModal(false);
    saveProject(name);
  }, [saveProject]);

  // ── Export handlers ──
  const handleExport = useCallback(async (type: "pdf" | "csv") => {
    if (!currentProject || isExporting) return;
    setIsExporting(true);
    try {
      // Fetch stone types for name resolution
      const { data: stoneTypesData } = await supabase
        .from("stone_types")
        .select("id, name");
      const stoneTypesMap = new Map<string, string>();
      if (stoneTypesData) {
        for (const st of stoneTypesData) {
          stoneTypesMap.set(st.id, st.name);
        }
      }

      const exportData = buildExportData(
        state,
        { name: currentProject.name, notes: currentProject.notes ?? null },
        stoneTypesMap
      );

      if (type === "pdf") {
        await exportProjectToPDF(exportData);
      } else {
        await exportProjectToCSV(exportData);
      }
      toast.success(`${type.toUpperCase()} exported successfully`);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setIsExporting(false);
    }
  }, [currentProject, isExporting, state]);

  const projectName = currentProject?.name ?? "New Foundation Project";

  // ── Modals ──
  const modals = (
    <>
      <ProjectNameModal
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        onConfirm={handleNameConfirm}
        isSaving={isSaving}
      />
      <ProjectEditModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={updateProjectMeta}
        initialName={currentProject?.name ?? ""}
        initialNotes={currentProject?.notes ?? null}
      />
      <ProjectListPanel
        open={showProjectList}
        onClose={() => setShowProjectList(false)}
      />
      <AccountCreationModal
        open={showAccountModal}
        onClose={() => { setShowAccountModal(false); clearPendingAction(); }}
      />
      <ConfirmDialog
        open={showNewProjectConfirm}
        onClose={() => setShowNewProjectConfirm(false)}
        onConfirm={() => { setShowNewProjectConfirm(false); createNewProject(); }}
        title="Unsaved Changes"
        description="You have unsaved changes. Discard and start a new project?"
        confirmLabel="Discard and New Project"
      />
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
      />
    </>
  );

  // Wrap onOpenWorkspace to stash draft before navigating
  const handleOpenWorkspace = useCallback(() => {
    if (onOpenWorkspace) {
      stashDraft(state);
      onOpenWorkspace();
    }
  }, [onOpenWorkspace, state]);

  const headerProps = {
    projectName,
    onProjectNameChange: () => currentProject && setShowEditModal(true),
    onSave: handleSave,
    onOpenProjects: () => {
      if (!user) {
        setPendingAction({ type: "save" });
        setShowAccountModal(true);
        return;
      }
      setShowProjectList(true);
    },
    onNewProject: handleNewProject,
    onEditProject: () => currentProject && setShowEditModal(true),
    isSaving,
    isProjectLocked,
    hasProject: !!currentProject,
    isDirty,
    hasSubstantiveData,
    onResetToBlank: resetToBlank,
    onExportPDF: () => handleExport("pdf"),
    onExportCSV: () => handleExport("csv"),
    isExporting,
    canExport,
    onSignOut: handleSignOut,
    mode,
    onOpenWorkspace: handleOpenWorkspace,
    onExitWorkspace,
  };

  // ── MOBILE ──
  if (isMobile) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <AppHeader {...headerProps} />

        {isProjectLocked && (
          <div className="px-3 pt-2"><LockedBanner /></div>
        )}

        {/* Mobile project name row */}
        <div className="flex items-center gap-2 px-3 pt-2">
          <span className="text-muted-foreground text-sm">/</span>
          <button
            onClick={() => currentProject && setShowEditModal(true)}
            disabled={!currentProject}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground truncate min-w-0 disabled:opacity-50 disabled:cursor-default"
          >
            <span className="truncate">{currentProject?.name ?? "New Foundation Project"}</span>
            {currentProject && <Pencil className="h-3 w-3 text-muted-foreground shrink-0" />}
          </button>
        </div>

        <div className="px-3 pt-2">
          <SaveBanner hasAreas={hasAreas} />
        </div>

        <div className="flex items-center justify-end px-3 pb-1">
          <button
            onClick={() => setMobileTab(mobileTab === "calculator" ? "quantities" : "calculator")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {mobileTab === "calculator" ? (
              <>View Quantities <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg></>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg> Back to Calculator</>
            )}
          </button>
        </div>

        {mobileTab === "calculator" && (
          <div className="px-3 pt-3">
            <CalculatorTabBar />
          </div>
        )}

        <main
          className="flex-1 overflow-y-auto px-3"
          style={{ touchAction: 'pan-y' }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const deltaX = e.changedTouches[0].clientX - touchStartX.current;
            if (deltaX > 60 && mobileTab === "quantities") setMobileTab("calculator");
            else if (deltaX < -60 && mobileTab === "calculator") setMobileTab("quantities");
            touchStartX.current = null;
          }}
        >
          {mobileTab === "calculator" ? (
            <div className="space-y-3 py-3">
              <div className={cn(
                "rounded-lg border border-border bg-card p-4",
                isProjectLocked && "opacity-60 pointer-events-none"
              )}>
                <ActiveForm />
                <DraftActionButtons />
              </div>
            </div>
          ) : (
            <QuantitiesPanel onEditArea={handleMobileEditArea} />
          )}
        </main>

        <div
          className="border-t-2 border-border bg-card flex shrink-0"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          role="tablist"
        >
          <button
            role="tab"
            aria-selected={mobileTab === "calculator"}
            onClick={() => setMobileTab("calculator")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold transition-all",
              mobileTab === "calculator"
                ? "text-primary border-t-2 border-primary -mt-[2px] bg-primary/5"
                : "text-muted-foreground border-t-2 border-transparent -mt-[2px]"
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/>
            </svg>
            Calculator
          </button>
          <button
            role="tab"
            aria-selected={mobileTab === "quantities"}
            onClick={() => setMobileTab("quantities")}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-3 text-xs font-semibold transition-all relative",
              mobileTab === "quantities"
                ? "text-primary border-t-2 border-primary -mt-[2px] bg-primary/5"
                : "text-muted-foreground border-t-2 border-transparent -mt-[2px]"
            )}
          >
            {visibleAreaCount > 0 && (
              <span className="absolute top-1 right-1/4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 leading-none">
                {visibleAreaCount}
              </span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Quantities
          </button>
        </div>
        {modals}
      </div>
    );
  }

  // ── DESKTOP ──
  return (
    <div className="flex flex-col bg-background">
      <AppHeader {...headerProps} />
      {isProjectLocked && (
        <div className="px-4 pt-2"><LockedBanner /></div>
      )}
      <div className="px-4 pt-2">
        <SaveBanner hasAreas={hasAreas} />
      </div>
      <main className="flex h-[75vh] min-h-[600px] max-h-[900px] items-stretch overflow-hidden rounded-xl border border-border">
        <div className={cn(
          "flex-1 flex flex-col overflow-hidden bg-card/60",
          isProjectLocked && "opacity-60 pointer-events-none"
        )}>
          <div className="shrink-0 px-4 pt-4"><CalculatorTabBar /></div>
          <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3">
            <ActiveForm />
          </div>
          <div className="shrink-0 border-t border-border bg-background/50 px-4 py-3">
            <DraftActionButtons />
          </div>
        </div>
        <div className="w-[340px] flex flex-col overflow-hidden border-l border-border/60 bg-card">
          <QuantitiesPanel />
        </div>
      </main>
      {modals}
    </div>
  );
}
