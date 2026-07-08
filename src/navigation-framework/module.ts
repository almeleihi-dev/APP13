export {
  NAVIGATION_FRAMEWORK_VERSION,
  SCREEN_REGIONS,
  STANDARD_SCREEN_REGIONS,
  buildScreenRegions,
  type ScreenRegion,
  type ScreenLayoutSpec,
  type ScreenDefinition,
  type ScreenRegionSpec,
} from "./foundation/screen-schema.js";

export { buildScreenContext, type ScreenContext } from "./foundation/screen-context.js";
export { resolveLayoutStructure, LAYOUT_BREAKPOINTS, type LayoutBreakpoint, type LayoutStructure } from "./foundation/layout.js";
export { DEFAULT_SAFE_AREA, SAFE_AREA_COMPLIANCE_RULES, validateSafeAreaCompliance, type SafeAreaSpec } from "./foundation/safe-area.js";

export { TOP_NAVIGATION_SPEC, resolveTopNavigationBackBehavior, type TopNavigationSpec } from "./navigation/top-navigation.js";
export { BOTTOM_NAVIGATION_SPEC, type BottomNavigationSpec } from "./navigation/bottom-navigation.js";
export { SIDE_NAVIGATION_SPEC, type SideNavigationSpec } from "./navigation/side-navigation.js";
export {
  NAVIGATION_STACK_SPEC,
  createStackEntry,
  canPopStack,
  popStack,
  type NavigationStackEntry,
  type NavigationPresentation,
} from "./navigation/navigation-stack.js";
export {
  NAVIGATION_STATE_SPEC,
  buildInitialNavigationState,
  applyPresentation,
  setNavigationMode,
  startTransition,
  endTransition,
  type NavigationState,
  type NavigationPhase,
} from "./navigation/navigation-state.js";

export { NEED_LAYOUT, NEED_LAYOUT_TOKENS } from "./layouts/need-layout.js";
export { ACTION_LAYOUT, ACTION_LAYOUT_TOKENS } from "./layouts/action-layout.js";
export { TRANSITION_LAYOUT, TRANSITION_LAYOUT_SPEC } from "./layouts/transition-layout.js";
export {
  MODAL_LAYOUT,
  MODAL_BEHAVIOR,
  BOTTOM_SHEET_BEHAVIOR,
  DIALOG_BEHAVIOR,
  OVERLAY_BEHAVIOR,
} from "./layouts/modal-layout.js";

export {
  TRANSITION_ENGINE_SPEC,
  createTransitionEngineState,
  advanceTransitionEngine,
  resolveStageTextForProgress,
  type TransitionEngineState,
} from "./transitions/transition-engine.js";
export { PROGRESS_ENGINE_SPEC, resolveProgressValue, selectProgressVariant } from "./transitions/progress-engine.js";
export {
  BACKGROUND_TRANSITION_SPEC,
  resolveBackgroundToken,
  buildBackgroundTransitionSteps,
  type BackgroundTransitionDirection,
} from "./transitions/background-transition.js";

export {
  SCREEN_LAYOUT_REGISTRY,
  NAVIGATION_PATTERN_REGISTRY,
  TRANSITION_PATTERN_REGISTRY,
  getScreenLayout,
  getNavigationFrameworkCatalog,
} from "./registry/screen-registry.js";

export {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
  type NavigationValidationResult,
} from "./validation/navigation-validator.js";

import { validateNavigationFramework } from "./validation/navigation-validator.js";
import { getNavigationFrameworkCatalog, SCREEN_LAYOUT_REGISTRY } from "./registry/screen-registry.js";
import { NAVIGATION_FRAMEWORK_VERSION } from "./foundation/screen-schema.js";

export interface AnActNavigationFrameworkModule {
  version: typeof NAVIGATION_FRAMEWORK_VERSION;
  validate: typeof validateNavigationFramework;
  getCatalog: typeof getNavigationFrameworkCatalog;
  getLayouts: () => typeof SCREEN_LAYOUT_REGISTRY;
}

export function createAnActNavigationFrameworkModule(): AnActNavigationFrameworkModule {
  return {
    version: NAVIGATION_FRAMEWORK_VERSION,
    validate: validateNavigationFramework,
    getCatalog: getNavigationFrameworkCatalog,
    getLayouts: () => SCREEN_LAYOUT_REGISTRY,
  };
}

export const NAVIGATION_FRAMEWORK_PHILOSOPHY = {
  name: "AN ACT Navigation & Screen Framework",
  version: NAVIGATION_FRAMEWORK_VERSION,
  principles: [
    "Every screen follows the official 8-region anatomy",
    "Need Mode and Action Mode layouts are mandatory patterns",
    "Official transition screen bridges mode changes",
    "Navigation stack governs back, modal, sheet, and overlay behavior",
    "Consumes CH3-X1 tokens and CH3-X2 components only",
  ],
} as const;
