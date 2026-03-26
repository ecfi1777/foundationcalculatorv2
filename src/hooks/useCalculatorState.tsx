import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import type {
  CalcArea,
  CalcSection,
  CalculatorType,
  RebarConfig,
  RebarConfigsMap,
  RebarElementType,
  Segment,
  FootingMode,
} from "@/types/calculator";
import { AREA_NAME_PREFIXES, makeDefaultRebar, deriveRebarEnabled, hasRequiredData, getMissingFields } from "@/types/calculator";

const STORAGE_KEY = "tfc_calculator_state";

export interface CalcState {
  areas: CalcArea[];
  activeTab: CalculatorType;
  activeAreaId: string | null;
}

type Action =
  | { type: "SET_TAB"; tab: CalculatorType }
  | { type: "SET_ACTIVE_AREA"; id: string | null }
  | { type: "ADD_AREA"; area: CalcArea }
  | { type: "DELETE_AREA"; id: string }
  | { type: "UPDATE_AREA"; id: string; patch: Partial<CalcArea> }
  | { type: "RENAME_AREA"; id: string; name: string }
  | { type: "ADD_SEGMENT"; areaId: string; segment: Segment }
  | { type: "UPDATE_SEGMENT"; areaId: string; segmentId: string; patch: Partial<Segment> }
  | { type: "DELETE_SEGMENT"; areaId: string; segmentId: string }
  | { type: "ADD_SECTION"; areaId: string; section: CalcSection }
  | { type: "UPDATE_SECTION"; areaId: string; sectionId: string; patch: Partial<CalcSection> }
  | { type: "DELETE_SECTION"; areaId: string; sectionId: string }
  | { type: "UPDATE_REBAR"; areaId: string; elementType: RebarElementType; rebar: Partial<RebarConfig> }
  | { type: "SAVE_AREA"; id: string }
  | { type: "LOAD"; state: CalcState }
  | { type: "RESET" };

/** Actions that indicate data has been modified */
const DATA_ACTIONS = new Set([
  "ADD_AREA", "DELETE_AREA", "UPDATE_AREA", "RENAME_AREA",
  "ADD_SEGMENT", "UPDATE_SEGMENT", "DELETE_SEGMENT",
  "ADD_SECTION", "UPDATE_SECTION", "DELETE_SECTION",
  "UPDATE_REBAR", "SAVE_AREA",
]);

/**
 * When leaving a draft area (tab/area switch), discard it only if empty.
 * If it has data, leave it in place — the UI handles the confirmation dialog.
 */
function resolveOutgoingDraft(areas: CalcArea[], leavingAreaId: string | null): CalcArea[] {
  if (!leavingAreaId) return areas;
  const area = areas.find((a) => a.id === leavingAreaId);
  if (!area || !area.isDraft) return areas;

  if (!hasRequiredData(area)) {
    // Discard empty draft silently
    return areas.filter((a) => a.id !== leavingAreaId);
  }
  // Draft has data — leave it for UI-level confirmation
  return areas;
}

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "SET_TAB": {
      let areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
      // Clear pending segment on the area being left
      if (state.activeAreaId) {
        areas = areas.map(a => a.id === state.activeAreaId ? { ...a, pendingSegmentLengthIn: 0 } : a);
      }
      return { ...state, areas, activeTab: action.tab, activeAreaId: null };
    }
    case "SET_ACTIVE_AREA": {
      let areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
      // Clear pending segment on the area being left
      if (state.activeAreaId && state.activeAreaId !== action.id) {
        areas = areas.map(a => a.id === state.activeAreaId ? { ...a, pendingSegmentLengthIn: 0 } : a);
      }
      return { ...state, areas, activeAreaId: action.id };
    }
    case "ADD_AREA": {
      // Resolve any existing draft before adding new one
      const areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
      return { ...state, areas: [...areas, action.area], activeAreaId: action.area.id };
    }
    case "DELETE_AREA":
      return {
        ...state,
        areas: state.areas.filter((a) => a.id !== action.id),
        activeAreaId: state.activeAreaId === action.id ? null : state.activeAreaId,
      };
    case "UPDATE_AREA": {
      const areas = state.areas.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a));
      return { ...state, areas };
    }
    case "RENAME_AREA":
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === action.id ? { ...a, name: action.name } : a)),
      };
    case "ADD_SEGMENT": {
      const areas = state.areas.map((a) =>
        a.id === action.areaId ? { ...a, segments: [...a.segments, action.segment] } : a
      );
      return { ...state, areas };
    }
    case "UPDATE_SEGMENT": {
      const areas = state.areas.map((a) =>
        a.id === action.areaId
          ? {
              ...a,
              segments: a.segments.map((s) =>
                s.id === action.segmentId ? { ...s, ...action.patch } : s
              ),
            }
          : a
      );
      return { ...state, areas };
    }
    case "DELETE_SEGMENT":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? { ...a, segments: a.segments.filter((s) => s.id !== action.segmentId) }
            : a
        ),
      };
    case "ADD_SECTION": {
      const areas = state.areas.map((a) =>
        a.id === action.areaId ? { ...a, sections: [...a.sections, action.section] } : a
      );
      return { ...state, areas };
    }
    case "UPDATE_SECTION": {
      const areas = state.areas.map((a) =>
        a.id === action.areaId
          ? {
              ...a,
              sections: a.sections.map((s) =>
                s.id === action.sectionId ? { ...s, ...action.patch } : s
              ),
            }
          : a
      );
      return { ...state, areas };
    }
    case "DELETE_SECTION":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? { ...a, sections: a.sections.filter((s) => s.id !== action.sectionId) }
            : a
        ),
      };
    case "UPDATE_REBAR": {
      const areas = state.areas.map((a) => {
        if (a.id !== action.areaId) return a;
        const existing = a.rebarConfigs[action.elementType] ?? makeDefaultRebar(action.elementType);
        const updated: RebarConfig = { ...existing, ...action.rebar };
        const newConfigs: RebarConfigsMap = { ...a.rebarConfigs, [action.elementType]: updated };
        return {
          ...a,
          rebarConfigs: newConfigs,
          rebarEnabled: deriveRebarEnabled(newConfigs),
        };
      });
      return { ...state, areas };
    }
    case "SAVE_AREA": {
      const areas = state.areas.map((a) => {
        if (a.id !== action.id || !a.isDraft) return a;
        return { ...a, isDraft: false, pendingSegmentLengthIn: 0 };
      });
      return { ...state, areas };
    }
    case "LOAD":
      return action.state;
    case "RESET":
      return { areas: [], activeTab: "footing", activeAreaId: null };
    default:
      return state;
  }
}

const initialState: CalcState = {
  areas: [],
  activeTab: "footing",
  activeAreaId: null,
};

interface CalcCtx {
  state: CalcState;
  dispatch: React.Dispatch<Action>;
  addArea: (type: CalculatorType, footingMode?: FootingMode) => CalcArea;
  getAreasForType: (type: CalculatorType) => CalcArea[];
  activeArea: CalcArea | null;
  isDirty: boolean;
  markClean: () => void;
  saveArea: (id: string) => { valid: boolean; missingFields: string[] };
}

const CalculatorContext = createContext<CalcCtx | null>(null);

function migrateLoadedState(raw: any): CalcState {
  // Migrate old single-rebar areas to rebarConfigs map
  if (raw?.areas) {
    raw.areas = raw.areas.map((a: any) => {
      // Clear isDraft on loaded areas (they were persisted = they had data)
      if (a.isDraft) a.isDraft = false;

      if (a.rebarConfigs) return a; // already migrated
      // Old format had `rebar: RebarConfig` field
      const oldRebar = a.rebar;
      const elementType = a.type === "slab" ? "slab"
        : a.type === "wall" ? "wall"
        : a.type === "gradeBeam" ? "grade_beam"
        : a.type === "curbGutter" ? "curb"
        : "footing";
      const rebarConfigs: RebarConfigsMap = {};
      if (oldRebar) {
        rebarConfigs[elementType as RebarElementType] = { ...oldRebar, element_type: elementType as RebarElementType };
      }
      const { rebar: _removed, ...rest } = a;
      return { ...rest, rebarConfigs };
    });
  }
  return raw;
}

function loadState(): CalcState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return migrateLoadedState(JSON.parse(raw));
  } catch {}
  return initialState;
}

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, baseDispatch] = useReducer(reducer, initialState, loadState);
  const isDirtyRef = useRef(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Wrap dispatch to track dirty state
  const dispatch: React.Dispatch<Action> = useCallback((action: Action) => {
    if (action.type === "RESET") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem("tfc_anon_has_data");
    }
    baseDispatch(action);
    if (DATA_ACTIONS.has(action.type)) {
      isDirtyRef.current = true;
      setIsDirty(true);

      // Only flag anon data for committed work
      if (action.type === "SAVE_AREA") {
        localStorage.setItem("tfc_anon_has_data", "true");
      } else if (action.type !== "ADD_AREA") {
        const currentState = stateRef.current;
        const targetId = 'areaId' in action ? (action as any).areaId
          : 'id' in action ? (action as any).id
          : currentState.activeAreaId;
        const targetArea = currentState.areas.find(a => a.id === targetId);
        if (targetArea && !targetArea.isDraft) {
          localStorage.setItem("tfc_anon_has_data", "true");
        }
      }
    }
    if (action.type === "LOAD" || action.type === "RESET") {
      isDirtyRef.current = false;
      setIsDirty(false);
    }
  }, []);

  const markClean = useCallback(() => {
    isDirtyRef.current = false;
    setIsDirty(false);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getAreasForType = useCallback(
    (type: CalculatorType) => state.areas.filter((a) => a.type === type),
    [state.areas]
  );

  const addArea = useCallback(
    (type: CalculatorType, footingMode?: FootingMode): CalcArea => {
      const prefix = AREA_NAME_PREFIXES[type];
      const pattern = new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\((\\d+)\\)$`);
      let maxNum = 0;
      for (const a of state.areas) {
        if (a.type !== type) continue;
        const m = a.name.match(pattern);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxNum) maxNum = n;
        }
      }
      const num = maxNum + 1;
      // Auto-create first section for section-based types
      const initialSections: CalcSection[] = [];
      if (type === "slab") {
        initialSections.push({
          id: crypto.randomUUID(),
          name: "Slab Section (1)",
          lengthFt: 0, lengthIn: 0, lengthFraction: "0", widthFt: 0, widthIn: 0, widthFraction: "0",
          thicknessIn: 4, wastePct: 0,
          includeStone: false, stoneDepthIn: 4, stoneTypeId: "57stone",
          sortOrder: 1,
        });
      } else if (type === "pierPad") {
        initialSections.push({
          id: crypto.randomUUID(),
          name: "Pier/Pad Section (1)",
          lengthFt: 0, lengthIn: 0, lengthFraction: "0", widthFt: 0, widthIn: 0, widthFraction: "0",
          thicknessIn: 6, wastePct: 0,
          includeStone: false, stoneDepthIn: 4, stoneTypeId: "57stone",
          sortOrder: 1,
        });
      }

      const area: CalcArea = {
        id: crypto.randomUUID(),
        name: `${AREA_NAME_PREFIXES[type]} (${num})`,
        type,
        sortOrder: num,
        wastePct: 0,
        isDraft: true,
        footingMode: type === "footing" ? footingMode ?? "footingsOnly" : undefined,
        dimensions: getDefaultDimensions(type),
        segments: [],
        sections: initialSections,
        rebarEnabled: false,
        rebarConfigs: {},
      };
      dispatch({ type: "ADD_AREA", area });
      return area;
    },
    [state.areas, dispatch]
  );

  // Keep an active draft available for the current tab when that tab has no areas.
  // This is state-driven (not mount-only), so it also covers runtime RESET/discard/delete flows.
  // Use a ref for addArea to avoid effect re-triggering when addArea's identity changes
  const addAreaRef = useRef(addArea);
  useEffect(() => { addAreaRef.current = addArea; }, [addArea]);

  useEffect(() => {
    const hasAreaForActiveTab = state.areas.some((a) => a.type === state.activeTab);
    if (!hasAreaForActiveTab && !state.activeAreaId) {
      addAreaRef.current(state.activeTab);
    }
  }, [state.activeAreaId, state.activeTab, state.areas]);

  const saveArea = useCallback(
    (id: string): { valid: boolean; missingFields: string[] } => {
      const area = state.areas.find((a) => a.id === id);
      if (!area || !area.isDraft) return { valid: true, missingFields: [] };
      const missingFields = getMissingFields(area);
      if (missingFields.length === 0) {
        dispatch({ type: "SAVE_AREA", id });
        return { valid: true, missingFields: [] };
      }
      return { valid: false, missingFields };
    },
    [state.areas, dispatch]
  );

  const activeArea = state.activeAreaId
    ? state.areas.find((a) => a.id === state.activeAreaId) ?? null
    : null;

  return (
    <CalculatorContext.Provider value={{ state, dispatch, addArea, getAreasForType, activeArea, isDirty, markClean, saveArea }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculatorState() {
  const ctx = useContext(CalculatorContext);
  if (!ctx) throw new Error("useCalculatorState must be used within CalculatorProvider");
  return ctx;
}

function getDefaultDimensions(type: CalculatorType): Record<string, number> {
  switch (type) {
    case "footing":
      return { widthIn: 12, depthIn: 8, wallHeightIn: 48, wallThicknessIn: 8 };
    case "wall":
      return { heightIn: 48, thicknessIn: 8 };
    case "gradeBeam":
      return { widthIn: 12, depthIn: 12 };
    case "curbGutter":
      return { curbDepthIn: 6, curbHeightIn: 6, gutterWidthIn: 12, flagThicknessIn: 4 };
    case "slab":
      return {};
    case "pierPad":
      return { depthIn: 6 };
    case "cylinder":
      return { diameterIn: 12, heightFt: 4, heightIn: 0, quantity: 1 };
    case "steps":
      return {
        numSteps: 3,
        riseIn: 7,
        runIn: 11,
        throatDepthIn: 6,
        widthIn: 36,
        platformDepthIn: 0,
        platformWidthIn: 0,
      };
    default:
      return {};
  }
}
