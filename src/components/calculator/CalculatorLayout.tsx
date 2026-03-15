import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCalculatorState } from "@/hooks/useCalculatorState";
import { useProject } from "@/hooks/useProject";
import { useAuth } from "@/hooks/useAuth";
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
import { cn } from "@/lib/utils";

function ActiveForm({ disabled }: { disabled: boolean }) {
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    currentProject, isSaving, isDirty, isProjectLocked,
    saveProject, createNewProject, resetToBlank, updateProjectMeta,
    pendingAction, setPendingAction, clearPendingAction,
    subscriptionTier, loadProjects, projectCount, editableProjectCount,
  } = useProject();

  const [mobileTab, setMobileTab] = useState<"calculator" | "quantities">("calculator");
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectList, setShowProjectList] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showNewProjectConfirm, setShowNewProjectConfirm] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const hasAreas = state.areas.length > 0;

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
          setShowNameModal(true);
        } else {
          saveProject();
        }
      } else if (pendingAction.type === "newProject") {
        clearPendingAction();
        createNewProject();
      }
    }
  }, [user, pendingAction, clearPendingAction, currentProject, saveProject, createNewProject]);

  // ── Save handler ──
  const handleSave = useCallback(() => {
    if (!user) {
      setPendingAction({ type: "save" });
      setShowAccountModal(true);
      return;
    }
    if (!currentProject) {
      setShowNameModal(true);
      return;
    }
    saveProject();
  }, [user, currentProject, saveProject, setPendingAction]);

  // ── New Project handler ──
  const handleNewProject = useCallback(() => {
    if (!user) {
      setPendingAction({ type: "newProject" });
      setShowAccountModal(true);
      return;
    }
    if (isDirty) {
      setShowNewProjectConfirm(true);
      return;
    }
    // Check free tier limit (1 project for free)
    if (subscriptionTier === "free" && projectCount >= 1) {
      // Open paywall handled elsewhere — for now just allow
    }
    createNewProject();
  }, [user, isDirty, subscriptionTier, projectCount, createNewProject, setPendingAction]);

  // ── First save confirm ──
  const handleNameConfirm = useCallback((name: string) => {
    setShowNameModal(false);
    saveProject(name);
  }, [saveProject]);

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
    </>
  );

  // ── MOBILE ──
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen bg-background">
        <AppHeader
          projectName={projectName}
          onProjectNameChange={() => currentProject && setShowEditModal(true)}
          onSave={handleSave}
          onOpenProjects={() => setShowProjectList(true)}
          onNewProject={handleNewProject}
          onEditProject={() => currentProject && setShowEditModal(true)}
          isSaving={isSaving}
          isProjectLocked={isProjectLocked}
          hasProject={!!currentProject}
        />

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
                <ActiveForm disabled={isProjectLocked} />
              </div>
            </div>
          ) : (
            <QuantitiesPanel />
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card flex">
          <button
            onClick={() => setMobileTab("calculator")}
            className={cn(
              "flex-1 py-3 text-sm font-medium text-center transition-colors",
              mobileTab === "calculator" ? "text-primary bg-primary/10" : "text-muted-foreground"
            )}
          >Calculator</button>
          <button
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
      <AppHeader
        projectName={projectName}
        onProjectNameChange={() => currentProject && setShowEditModal(true)}
        onSave={handleSave}
        onOpenProjects={() => setShowProjectList(true)}
        onNewProject={handleNewProject}
        onEditProject={() => currentProject && setShowEditModal(true)}
        isSaving={isSaving}
        isProjectLocked={isProjectLocked}
        hasProject={!!currentProject}
      />
      {isProjectLocked && (
        <div className="px-4 pt-2"><LockedBanner /></div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div className={cn(
          "flex-1 flex flex-col border-r border-border overflow-hidden",
          isProjectLocked && "opacity-60 pointer-events-none"
        )}>
          <div className="px-4 pt-3"><CalculatorTabBar /></div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <ActiveForm disabled={isProjectLocked} />
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
