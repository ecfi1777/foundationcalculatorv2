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
import { AREA_NAME_PREFIXES, makeDefaultRebar, deriveRebarEnabled, hasRequiredData } from "@/types/calculator";

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
  | { type: "LOAD"; state: CalcState }
  | { type: "RESET" };

/** Actions that indicate data has been modified */
const DATA_ACTIONS = new Set([
  "ADD_AREA", "DELETE_AREA", "UPDATE_AREA", "RENAME_AREA",
  "ADD_SEGMENT", "UPDATE_SEGMENT", "DELETE_SEGMENT",
  "ADD_SECTION", "UPDATE_SECTION", "DELETE_SECTION",
  "UPDATE_REBAR",
]);

/**
 * After modifying an area, check if a draft should be promoted.
 * Returns the areas array with the draft flag cleared if required data exists.
 */
function maybePromoteDraft(areas: CalcArea[], areaId: string): CalcArea[] {
  return areas.map((a) => {
    if (a.id !== areaId || !a.isDraft) return a;
    if (hasRequiredData(a)) return { ...a, isDraft: false };
    return a;
  });
}

/**
 * When leaving a draft area (tab/area switch), promote or discard it.
 */
function resolveOutgoingDraft(areas: CalcArea[], leavingAreaId: string | null): CalcArea[] {
  if (!leavingAreaId) return areas;
  const area = areas.find((a) => a.id === leavingAreaId);
  if (!area || !area.isDraft) return areas;

  if (hasRequiredData(area)) {
    // Promote
    return areas.map((a) => a.id === leavingAreaId ? { ...a, isDraft: false } : a);
  }
  // Discard empty draft
  return areas.filter((a) => a.id !== leavingAreaId);
}

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "SET_TAB": {
      const areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
      return { ...state, areas, activeTab: action.tab, activeAreaId: null };
    }
    case "SET_ACTIVE_AREA": {
      const areas = resolveOutgoingDraft(state.areas, state.activeAreaId);
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
      let areas = state.areas.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a));
      areas = maybePromoteDraft(areas, action.id);
      return { ...state, areas };
    }
    case "RENAME_AREA":
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === action.id ? { ...a, name: action.name } : a)),
      };
    case "ADD_SEGMENT": {
      let areas = state.areas.map((a) =>
        a.id === action.areaId ? { ...a, segments: [...a.segments, action.segment] } : a
      );
      areas = maybePromoteDraft(areas, action.areaId);
      return { ...state, areas };
    }
    case "UPDATE_SEGMENT": {
      let areas = state.areas.map((a) =>
        a.id === action.areaId
          ? {
              ...a,
              segments: a.segments.map((s) =>
                s.id === action.segmentId ? { ...s, ...action.patch } : s
              ),
            }
          : a
      );
      areas = maybePromoteDraft(areas, action.areaId);
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
      let areas = state.areas.map((a) =>
        a.id === action.areaId ? { ...a, sections: [...a.sections, action.section] } : a
      );
      areas = maybePromoteDraft(areas, action.areaId);
      return { ...state, areas };
    }
    case "UPDATE_SECTION": {
      let areas = state.areas.map((a) =>
        a.id === action.areaId
          ? {
              ...a,
              sections: a.sections.map((s) =>
                s.id === action.sectionId ? { ...s, ...action.patch } : s
              ),
            }
          : a
      );
      areas = maybePromoteDraft(areas, action.areaId);
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
      let areas = state.areas.map((a) => {
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
      areas = maybePromoteDraft(areas, action.areaId);
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
      localStorage.setItem("tfc_anon_has_data", "true");
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
        sections: [],
        rebarEnabled: false,
        rebarConfigs: {},
      };
      dispatch({ type: "ADD_AREA", area });
      return area;
    },
    [state.areas, dispatch]
  );

  const activeArea = state.activeAreaId
    ? state.areas.find((a) => a.id === state.activeAreaId) ?? null
    : null;

  return (
    <CalculatorContext.Provider value={{ state, dispatch, addArea, getAreasForType, activeArea, isDirty, markClean }}>
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
