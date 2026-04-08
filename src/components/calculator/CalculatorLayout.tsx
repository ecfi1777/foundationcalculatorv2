import { useState, useEffect, useCallback, useRef } from "react";
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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    currentProject, isSaving, isDirty, isProjectLocked,
    saveProject, createNewProject, resetToBlank, clearAllState, updateProjectMeta,
    pendingAction, setPendingAction, clearPendingAction,
    subscriptionTier, loadProjects, projectCount, editableProjectCount,
  } = useProject();

  // ── Sign-out handler: reset all state, clear storage, navigate home ──
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
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const hasAreas = state.areas.length > 0;
  const canExport = !!currentProject;

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
    if (isDirty) {
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
    onResetToBlank: resetToBlank,
    onExportPDF: () => handleExport("pdf"),
    onExportCSV: () => handleExport("csv"),
    isExporting,
    canExport,
    onSignOut: handleSignOut,
  };

  // ── MOBILE ──
  if (isMobile) {
    return (
      <div className="flex flex-col h-[100dvh] bg-background">
        <AppHeader {...headerProps} />

        {isProjectLocked && (
          <div className="px-3 pt-2"><LockedBanner /></div>
        )}
        <div className="px-3 pt-2">
          <SaveBanner hasAreas={hasAreas} />
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-16">
          {mobileTab === "calculator" ? (
            <div className="space-y-3 py-3">
              <CalculatorTabBar />
              <div className={cn(
                "rounded-lg border border-border bg-card p-4",
                isProjectLocked && "opacity-60 pointer-events-none"
              )}>
                <ActiveForm />
                <DraftActionButtons />
              </div>
            </div>
          ) : (
            <QuantitiesPanel />
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card flex" role="tablist">
          <button
            role="tab"
            aria-selected={mobileTab === "calculator"}
            onClick={() => setMobileTab("calculator")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "calculator" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >Calculator</button>
          <button
            role="tab"
            aria-selected={mobileTab === "quantities"}
            onClick={() => setMobileTab("quantities")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "quantities" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >Quantities</button>
        </div>
        {modals}
      </div>
    );
  }

  // ── DESKTOP ──
  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader {...headerProps} />
      {isProjectLocked && (
        <div className="px-4 pt-2"><LockedBanner /></div>
      )}
      <div className="px-4 pt-2">
        <SaveBanner hasAreas={hasAreas} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className={cn(
          "flex-1 flex flex-col border-r border-border overflow-hidden",
          isProjectLocked && "opacity-60 pointer-events-none"
        )}>
          <div className="px-4 pt-3"><CalculatorTabBar /></div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <ActiveForm />
              <DraftActionButtons />
            </div>
          </div>
        </div>
        <div className="w-[400px] flex flex-col overflow-hidden h-full">
          <QuantitiesPanel />
        </div>
      </div>
      {modals}
    </div>
  );
}
