import type { AnActMode } from "../../design-system/foundation/transitions.js";
import type { NavigationStackEntry, NavigationPresentation } from "./navigation-stack.js";

export type NavigationPhase = "idle" | "transitioning" | "modal-open" | "sheet-open" | "overlay-open";

export interface NavigationState {
  mode: AnActMode;
  phase: NavigationPhase;
  stack: NavigationStackEntry[];
  activeRoute: string;
  canGoBack: boolean;
  bottomNavigationVisible: boolean;
  sideNavigationVisible: boolean;
  transitionActive: boolean;
}

export interface NavigationStateSpec {
  id: "navigation-state";
  initialMode: AnActMode;
  initialPhase: NavigationPhase;
  rules: {
    bottomNavHiddenDuring: NavigationPhase[];
    sideNavHiddenDuring: NavigationPhase[];
    transitionBlocksInteraction: true;
  };
}

export const NAVIGATION_STATE_SPEC: NavigationStateSpec = {
  id: "navigation-state",
  initialMode: "need",
  initialPhase: "idle",
  rules: {
    bottomNavHiddenDuring: ["transitioning", "modal-open", "sheet-open"],
    sideNavHiddenDuring: ["transitioning", "modal-open"],
    transitionBlocksInteraction: true,
  },
};

export function buildInitialNavigationState(route = "/"): NavigationState {
  return {
    mode: "need",
    phase: "idle",
    stack: [{ screenId: "root", route, presentation: "push", timestamp: new Date().toISOString() }],
    activeRoute: route,
    canGoBack: false,
    bottomNavigationVisible: true,
    sideNavigationVisible: false,
    transitionActive: false,
  };
}

export function applyPresentation(state: NavigationState, presentation: NavigationPresentation): NavigationState {
  const phaseMap: Record<NavigationPresentation, NavigationPhase> = {
    push: "idle",
    modal: "modal-open",
    sheet: "sheet-open",
    overlay: "overlay-open",
    replace: "idle",
  };
  const phase = phaseMap[presentation];
  return {
    ...state,
    phase,
    bottomNavigationVisible: !NAVIGATION_STATE_SPEC.rules.bottomNavHiddenDuring.includes(phase),
    sideNavigationVisible: !NAVIGATION_STATE_SPEC.rules.sideNavHiddenDuring.includes(phase),
  };
}

export function setNavigationMode(state: NavigationState, mode: AnActMode): NavigationState {
  return { ...state, mode };
}

export function startTransition(state: NavigationState): NavigationState {
  return {
    ...state,
    phase: "transitioning",
    transitionActive: true,
    bottomNavigationVisible: false,
    sideNavigationVisible: false,
  };
}

export function endTransition(state: NavigationState, targetMode: AnActMode): NavigationState {
  return {
    ...state,
    mode: targetMode,
    phase: "idle",
    transitionActive: false,
    bottomNavigationVisible: true,
    sideNavigationVisible: false,
  };
}
