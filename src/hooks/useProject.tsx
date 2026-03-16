import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCalculatorState, type CalcState } from "@/hooks/useCalculatorState";
import type {
  CalcArea, CalcSection, Segment, RebarConfig, RebarConfigsMap,
  RebarElementType, CalculatorType, FootingMode, DbCalculatorType,
} from "@/types/calculator";
import { makeDefaultRebar, deriveRebarEnabled, CALC_TYPE_TO_DB, DB_TO_CALC_TYPE } from "@/types/calculator";
import { toast } from "sonner";

// ── Types ─────────────────────────────────────────────
export interface Project {
  id: string;
  name: string;
  notes: string | null;
  org_id: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

type PendingAction = { type: "save" } | { type: "newProject" } | null;

interface ProjectContextType {
  currentProject: Project | null;
  projects: Project[];
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  isProjectLocked: boolean;
  subscriptionTier: string;
  pendingAction: PendingAction;
  setPendingAction: (a: PendingAction) => void;
  clearPendingAction: () => void;
  loadProjects: () => Promise<void>;
  loadProject: (id: string) => Promise<void>;
  saveProject: (name?: string, notes?: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createNewProject: () => void;
  resetToBlank: () => void;
  clearAllState: () => void;
  updateProjectMeta: (name: string, notes: string | null) => Promise<void>;
  projectCount: number;
  editableProjectCount: number;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}

// ── Helpers ───────────────────────────────────────────

function mapDbRebarToConfig(rc: any): RebarConfig {
  return {
    id: rc.id,
    element_type: rc.element_type,
    hEnabled: rc.h_enabled,
    hBarSize: rc.h_bar_size,
    hNumRows: rc.h_num_rows,
    hOverlapIn: Number(rc.h_overlap_in),
    hWastePct: Number(rc.h_waste_pct),
    hTotalLf: Number(rc.h_total_lf) || 0,
    vEnabled: rc.v_enabled,
    vBarSize: rc.v_bar_size,
    vSpacingIn: Number(rc.v_spacing_in),
    vBarHeightFt: Number(rc.v_bar_height_ft),
    vBarHeightIn: Number(rc.v_bar_height_in),
    vOverlapIn: Number(rc.v_overlap_in),
    vWastePct: Number(rc.v_waste_pct),
    vTotalLf: Number(rc.v_total_lf) || 0,
    gridEnabled: rc.grid_enabled,
    gridBarSize: rc.grid_bar_size,
    gridSpacingIn: Number(rc.grid_spacing_in),
    gridOverlapIn: Number(rc.grid_overlap_in),
    gridWastePct: Number(rc.grid_waste_pct),
    gridTotalLf: Number(rc.grid_total_lf) || 0,
  };
}

function dbAreaToCalcArea(dbArea: any, segments: any[], sections: any[], rebarConfigs: any[]): CalcArea {
  const dbType = dbArea.calculator_type as DbCalculatorType;
  const type = DB_TO_CALC_TYPE[dbType] ?? (dbArea.calculator_type as CalculatorType);
  const inputs = (dbArea.inputs ?? {}) as Record<string, any>;

  // Group rebar configs by element_type
  const areaRebarRows = rebarConfigs.filter((r: any) => r.area_id === dbArea.id);
  const rebarConfigsMap: RebarConfigsMap = {};
  for (const rc of areaRebarRows) {
    rebarConfigsMap[rc.element_type as RebarElementType] = mapDbRebarToConfig(rc);
  }

  return {
    id: dbArea.id,
    name: dbArea.name,
    type,
    sortOrder: dbArea.sort_order,
    wastePct: Number(dbArea.waste_pct) || 0,
    footingMode: inputs.footingMode as FootingMode | undefined,
    dimensions: inputs.dimensions ?? {},
    segments: segments
      .filter((s: any) => s.area_id === dbArea.id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((s: any): Segment => ({
        id: s.id,
        feet: s.feet,
        inches: s.inches,
        fraction: s.fraction,
        lengthInchesDecimal: Number(s.length_inches_decimal),
        sortOrder: s.sort_order,
      })),
    sections: sections
      .filter((s: any) => s.area_id === dbArea.id)
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((s: any): CalcSection => ({
        id: s.id,
        name: s.name,
        lengthFt: Number(s.length_ft),
        lengthIn: Number(s.length_in),
        widthFt: Number(s.width_ft),
        widthIn: Number(s.width_in),
        thicknessIn: Number(s.thickness_in),
        includeStone: s.include_stone,
        stoneDepthIn: Number(s.stone_depth_in) || 0,
        stoneTypeId: s.stone_type_id ?? "",
        sortOrder: s.sort_order,
      })),
    rebarEnabled: deriveRebarEnabled(rebarConfigsMap),
    rebarConfigs: rebarConfigsMap,
  };
}

async function getActiveOrgId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("user_settings")
    .select("active_org_id")
    .eq("user_id", userId)
    .single();
  return data?.active_org_id ?? null;
}

async function getSubscriptionTier(userId: string): Promise<string> {
  const { data } = await supabase
    .from("user_effective_tier")
    .select("subscription_tier")
    .eq("user_id", userId)
    .single();
  return data?.subscription_tier ?? "free";
}

// ── Provider ──────────────────────────────────────────

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { state, dispatch, isDirty, markClean } = useCalculatorState();

  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [subscriptionTier, setSubscriptionTier] = useState("free");

  const isProjectLocked = currentProject?.is_locked ?? false;

  const clearPendingAction = useCallback(() => setPendingAction(null), []);

  // ── Load projects list ──
  const loadProjects = useCallback(async () => {
    if (!user) return;
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) return;

    const tier = await getSubscriptionTier(user.id);
    setSubscriptionTier(tier);

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .order("is_locked", { ascending: true })
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
  }, [user]);

  // ── Load a specific project ──
  const loadProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data: project, error: projErr } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .is("deleted_at", null)
        .single();

      if (projErr || !project) {
        toast.error("Could not load project");
        return;
      }

      // Fetch areas
      const { data: areas } = await supabase
        .from("areas")
        .select("*")
        .eq("project_id", id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      const areaIds = (areas ?? []).map((a: any) => a.id);

      // Fetch segments, sections, rebar in parallel
      const [segRes, secRes, rebarRes] = await Promise.all([
        areaIds.length > 0
          ? supabase.from("segments").select("*").in("area_id", areaIds)
          : { data: [] },
        areaIds.length > 0
          ? supabase.from("sections").select("*").in("area_id", areaIds)
          : { data: [] },
        areaIds.length > 0
          ? supabase.from("rebar_configs").select("*").in("area_id", areaIds)
          : { data: [] },
      ]);

      const segments = segRes.data ?? [];
      const sections = secRes.data ?? [];
      const rebarConfigs = rebarRes.data ?? [];

      // Build CalcState
      const calcAreas: CalcArea[] = (areas ?? []).map((dbArea: any) =>
        dbAreaToCalcArea(dbArea, segments, sections, rebarConfigs)
      );

      const newState: CalcState = {
        areas: calcAreas,
        activeTab: calcAreas.length > 0 ? calcAreas[0].type : "footing",
        activeAreaId: calcAreas.length > 0 ? calcAreas[0].id : null,
      };

      dispatch({ type: "LOAD", state: newState });
      setCurrentProject(project as Project);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  // ── Save project ──
  const saveProject = useCallback(async (name?: string, notes?: string) => {
    if (!user) return;
    const orgId = await getActiveOrgId(user.id);
    if (!orgId) {
      toast.error("No organization found");
      return;
    }

    setIsSaving(true);
    try {
      let projectId = currentProject?.id;

      if (!projectId) {
        // First save — insert project
        const { data: newProj, error: projErr } = await supabase
          .from("projects")
          .insert({ org_id: orgId, name: name || "Untitled Project", notes: notes ?? null })
          .select()
          .single();

        if (projErr || !newProj) {
          toast.error("Failed to create project");
          return;
        }
        projectId = newProj.id;
        setCurrentProject(newProj as Project);
      } else if (name !== undefined) {
        // Update name/notes if provided
        await supabase
          .from("projects")
          .update({ name, notes: notes ?? currentProject?.notes ?? null, updated_at: new Date().toISOString() })
          .eq("id", projectId);
        setCurrentProject((prev) => prev ? { ...prev, name: name || prev.name, notes: notes ?? prev.notes } : prev);
      } else {
        // Silent save — just update timestamp
        await supabase
          .from("projects")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", projectId);
      }

      // Upsert areas
      for (const area of state.areas) {
        const anyEnabled = deriveRebarEnabled(area.rebarConfigs);

        const areaRow = {
          id: area.id,
          project_id: projectId,
          name: area.name,
          calculator_type: CALC_TYPE_TO_DB[area.type],
          sort_order: area.sortOrder,
          waste_pct: area.wastePct,
          rebar_enabled: anyEnabled,
          stone_enabled: area.sections.some(s => s.includeStone),
          inputs: { footingMode: area.footingMode, dimensions: area.dimensions },
          inputs_version: 1,
        };

        const { error: areaErr } = await supabase.from("areas").upsert(areaRow);
        if (areaErr) throw areaErr;

        // Upsert segments
        if (area.segments.length > 0) {
          const segmentRows = area.segments.map((s) => ({
            id: s.id,
            area_id: area.id,
            feet: s.feet,
            inches: s.inches,
            fraction: s.fraction,
            length_inches_decimal: s.lengthInchesDecimal,
            sort_order: s.sortOrder,
          }));
          const { error: segErr } = await supabase.from("segments").upsert(segmentRows);
          if (segErr) throw segErr;
        }
        // Delete segments that are no longer present
        const { data: existingSegs } = await supabase
          .from("segments")
          .select("id")
          .eq("area_id", area.id);
        const currentSegIds = new Set(area.segments.map((s) => s.id));
        const toDeleteSegs = (existingSegs ?? []).filter((s: any) => !currentSegIds.has(s.id));
        if (toDeleteSegs.length > 0) {
          await supabase.from("segments").delete().in("id", toDeleteSegs.map((s: any) => s.id));
        }

        // Upsert sections
        if (area.sections.length > 0) {
          const sectionRows = area.sections.map((s) => ({
            id: s.id,
            area_id: area.id,
            name: s.name,
            length_ft: s.lengthFt,
            length_in: s.lengthIn,
            width_ft: s.widthFt,
            width_in: s.widthIn,
            thickness_in: s.thicknessIn,
            include_stone: s.includeStone,
            stone_depth_in: s.stoneDepthIn || null,
            stone_type_id: s.stoneTypeId || null,
            sort_order: s.sortOrder,
          }));
          const { error: secErr } = await supabase.from("sections").upsert(sectionRows);
          if (secErr) throw secErr;
        }
        // Delete removed sections
        const { data: existingSecs } = await supabase
          .from("sections")
          .select("id")
          .eq("area_id", area.id);
        const currentSecIds = new Set(area.sections.map((s) => s.id));
        const toDeleteSecs = (existingSecs ?? []).filter((s: any) => !currentSecIds.has(s.id));
        if (toDeleteSecs.length > 0) {
          await supabase.from("sections").delete().in("id", toDeleteSecs.map((s: any) => s.id));
        }

        // Upsert rebar configs — ALL configs, not just active ones
        for (const [elementType, config] of Object.entries(area.rebarConfigs)) {
          if (!config) continue;
          const { error: rebarErr } = await supabase.from("rebar_configs").upsert(
            {
              area_id: area.id,
              element_type: elementType,
              h_enabled: config.hEnabled,
              h_bar_size: config.hBarSize,
              h_num_rows: config.hNumRows,
              h_overlap_in: config.hOverlapIn,
              h_waste_pct: config.hWastePct,
              h_total_lf: 0,
              v_enabled: config.vEnabled,
              v_bar_size: config.vBarSize,
              v_spacing_in: config.vSpacingIn,
              v_bar_height_ft: config.vBarHeightFt,
              v_bar_height_in: config.vBarHeightIn,
              v_overlap_in: config.vOverlapIn,
              v_waste_pct: config.vWastePct,
              v_total_lf: 0,
              grid_enabled: config.gridEnabled,
              grid_bar_size: config.gridBarSize,
              grid_spacing_in: config.gridSpacingIn,
              grid_overlap_in: config.gridOverlapIn,
              grid_waste_pct: config.gridWastePct,
              grid_total_lf: 0,
            },
            { onConflict: "area_id,element_type" }
          );
          if (rebarErr) throw rebarErr;
        }
      }

      // Delete areas that were removed from local state
      const { data: existingAreas } = await supabase
        .from("areas")
        .select("id")
        .eq("project_id", projectId)
        .is("deleted_at", null);
      const currentAreaIds = new Set(state.areas.map((a) => a.id));
      const toDeleteAreas = (existingAreas ?? []).filter((a: any) => !currentAreaIds.has(a.id));
      for (const a of toDeleteAreas) {
        await supabase.from("areas").update({ deleted_at: new Date().toISOString() }).eq("id", a.id);
      }

      // Invoke recalculate-project edge function
      try {
        const { data: recalcData } = await supabase.functions.invoke("recalculate-project", {
          body: { project_id: projectId },
        });
        // Merge canonical values if returned
        if (recalcData?.areas) {
          for (const updatedArea of recalcData.areas) {
            const localArea = state.areas.find((a) => a.id === updatedArea.id);
            if (!localArea) continue;

            const rebarPatch: RebarConfigsMap = {};
            for (const [elementType, totals] of Object.entries(updatedArea.rebar ?? {})) {
              const existing = localArea.rebarConfigs?.[elementType as RebarElementType];
              if (existing) {
                const t = totals as any;
                rebarPatch[elementType as RebarElementType] = {
                  ...existing,
                  hTotalLf: t.h_total_lf ?? 0,
                  vTotalLf: t.v_total_lf ?? 0,
                  gridTotalLf: t.grid_total_lf ?? 0,
                };
              }
            }

            dispatch({
              type: "UPDATE_AREA",
              id: updatedArea.id,
              patch: {
                rebarConfigs: { ...localArea.rebarConfigs, ...rebarPatch },
              },
            });
          }
        }
      } catch {
        console.warn("Recalculation failed, save still successful");
      }

      markClean();
      await loadProjects();
      toast.success("Project saved");
    } catch (err) {
      console.error("Save failed:", err);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  }, [user, currentProject, state, dispatch, markClean, loadProjects]);

  // ── Delete project ──
  const deleteProject = useCallback(async (id: string) => {
    const { data, error } = await supabase.rpc("soft_delete_project", { _project_id: id });

    if (error) {
      console.error("Delete project error:", error);
      toast.error("Failed to delete project");
      return;
    }

    if (!data) {
      toast.error("Failed to delete project");
      return;
    }

    setProjects((prev) => prev.filter((p) => p.id !== id));

    if (currentProject?.id === id) {
      resetToBlankInternal();
    }

    toast.success("Project deleted");
  }, [currentProject]);

  // ── Reset to blank ──
  const resetToBlankInternal = useCallback(() => {
    dispatch({ type: "RESET" });
    setCurrentProject(null);
  }, [dispatch]);

  const resetToBlank = resetToBlankInternal;

  // ── Create new project ──
  const createNewProject = useCallback(() => {
    resetToBlankInternal();
  }, [resetToBlankInternal]);

  // ── Update project name/notes ──
  const updateProjectMeta = useCallback(async (name: string, notes: string | null) => {
    if (!currentProject) return;
    const { error } = await supabase
      .from("projects")
      .update({ name, notes, updated_at: new Date().toISOString() })
      .eq("id", currentProject.id);

    if (error) {
      toast.error("Failed to update project");
      return;
    }

    setCurrentProject((prev) => prev ? { ...prev, name, notes } : prev);
    setProjects((prev) => prev.map((p) => p.id === currentProject.id ? { ...p, name, notes } : p));
    toast.success("Project updated");
  }, [currentProject]);

  return (
    <ProjectContext.Provider value={{
      currentProject,
      projects,
      isLoading,
      isSaving,
      isDirty,
      isProjectLocked,
      subscriptionTier,
      pendingAction,
      setPendingAction,
      clearPendingAction,
      loadProjects,
      loadProject,
      saveProject,
      deleteProject,
      createNewProject,
      resetToBlank,
      updateProjectMeta,
      projectCount: projects.length,
      editableProjectCount: projects.filter(p => !p.is_locked).length,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}
