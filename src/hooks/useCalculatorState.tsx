import React, { createContext, useContext, useReducer, useEffect, useCallback } from "react";
import type {
  CalcArea,
  CalcSection,
  CalculatorType,
  RebarConfig,
  Segment,
  FootingMode,
} from "@/types/calculator";
import { AREA_NAME_PREFIXES, DEFAULT_REBAR } from "@/types/calculator";

const STORAGE_KEY = "tfc_calculator_state";

interface CalcState {
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
  | { type: "UPDATE_REBAR"; areaId: string; rebar: Partial<RebarConfig> }
  | { type: "LOAD"; state: CalcState };

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.type) {
    case "SET_TAB":
      return { ...state, activeTab: action.tab, activeAreaId: null };
    case "SET_ACTIVE_AREA":
      return { ...state, activeAreaId: action.id };
    case "ADD_AREA":
      return { ...state, areas: [...state.areas, action.area], activeAreaId: action.area.id };
    case "DELETE_AREA":
      return {
        ...state,
        areas: state.areas.filter((a) => a.id !== action.id),
        activeAreaId: state.activeAreaId === action.id ? null : state.activeAreaId,
      };
    case "UPDATE_AREA":
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)),
      };
    case "RENAME_AREA":
      return {
        ...state,
        areas: state.areas.map((a) => (a.id === action.id ? { ...a, name: action.name } : a)),
      };
    case "ADD_SEGMENT":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId ? { ...a, segments: [...a.segments, action.segment] } : a
        ),
      };
    case "UPDATE_SEGMENT":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? {
                ...a,
                segments: a.segments.map((s) =>
                  s.id === action.segmentId ? { ...s, ...action.patch } : s
                ),
              }
            : a
        ),
      };
    case "DELETE_SEGMENT":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? { ...a, segments: a.segments.filter((s) => s.id !== action.segmentId) }
            : a
        ),
      };
    case "ADD_SECTION":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId ? { ...a, sections: [...a.sections, action.section] } : a
        ),
      };
    case "UPDATE_SECTION":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? {
                ...a,
                sections: a.sections.map((s) =>
                  s.id === action.sectionId ? { ...s, ...action.patch } : s
                ),
              }
            : a
        ),
      };
    case "DELETE_SECTION":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId
            ? { ...a, sections: a.sections.filter((s) => s.id !== action.sectionId) }
            : a
        ),
      };
    case "UPDATE_REBAR":
      return {
        ...state,
        areas: state.areas.map((a) =>
          a.id === action.areaId ? { ...a, rebar: { ...a.rebar, ...action.rebar } } : a
        ),
      };
    case "LOAD":
      return action.state;
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
}

const CalculatorContext = createContext<CalcCtx | null>(null);

function loadState(): CalcState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return initialState;
}

export function CalculatorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Also set the has_data flag for the save banner
    if (state.areas.length > 0) {
      localStorage.setItem("tfc_anon_has_data", "true");
    }
  }, [state]);

  const getAreasForType = useCallback(
    (type: CalculatorType) => state.areas.filter((a) => a.type === type),
    [state.areas]
  );

  const addArea = useCallback(
    (type: CalculatorType, footingMode?: FootingMode): CalcArea => {
      const existing = state.areas.filter((a) => a.type === type);
      const num = existing.length + 1;
      const area: CalcArea = {
        id: crypto.randomUUID(),
        name: `${AREA_NAME_PREFIXES[type]} (${num})`,
        type,
        sortOrder: num,
        wastePct: 0,
        footingMode: type === "footing" ? footingMode ?? "footingsOnly" : undefined,
        dimensions: getDefaultDimensions(type),
        segments: [],
        sections: [],
        rebarEnabled: false,
        rebar: { ...DEFAULT_REBAR },
      };
      dispatch({ type: "ADD_AREA", area });
      return area;
    },
    [state.areas]
  );

  const activeArea = state.activeAreaId
    ? state.areas.find((a) => a.id === state.activeAreaId) ?? null
    : null;

  return (
    <CalculatorContext.Provider value={{ state, dispatch, addArea, getAreasForType, activeArea }}>
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
