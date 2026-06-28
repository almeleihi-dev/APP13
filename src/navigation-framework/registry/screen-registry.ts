import type { ScreenLayoutSpec } from "../foundation/screen-schema.js";
import { NEED_LAYOUT } from "../layouts/need-layout.js";
import { ACTION_LAYOUT } from "../layouts/action-layout.js";
import { TRANSITION_LAYOUT, TRANSITION_LAYOUT_SPEC } from "../layouts/transition-layout.js";
import { MODAL_LAYOUT, MODAL_BEHAVIOR, BOTTOM_SHEET_BEHAVIOR, DIALOG_BEHAVIOR, OVERLAY_BEHAVIOR } from "../layouts/modal-layout.js";
import { TOP_NAVIGATION_SPEC } from "../navigation/top-navigation.js";
import { BOTTOM_NAVIGATION_SPEC } from "../navigation/bottom-navigation.js";
import { SIDE_NAVIGATION_SPEC } from "../navigation/side-navigation.js";
import { NAVIGATION_STACK_SPEC } from "../navigation/navigation-stack.js";
import { NAVIGATION_STATE_SPEC } from "../navigation/navigation-state.js";
import { TRANSITION_ENGINE_SPEC } from "../transitions/transition-engine.js";
import { PROGRESS_ENGINE_SPEC } from "../transitions/progress-engine.js";
import { BACKGROUND_TRANSITION_SPEC } from "../transitions/background-transition.js";

export const SCREEN_LAYOUT_REGISTRY: ScreenLayoutSpec[] = [
  NEED_LAYOUT,
  ACTION_LAYOUT,
  TRANSITION_LAYOUT,
  MODAL_LAYOUT,
];

export const NAVIGATION_PATTERN_REGISTRY = {
  topNavigation: TOP_NAVIGATION_SPEC,
  bottomNavigation: BOTTOM_NAVIGATION_SPEC,
  sideNavigation: SIDE_NAVIGATION_SPEC,
  navigationStack: NAVIGATION_STACK_SPEC,
  navigationState: NAVIGATION_STATE_SPEC,
  modal: MODAL_BEHAVIOR,
  bottomSheet: BOTTOM_SHEET_BEHAVIOR,
  dialog: DIALOG_BEHAVIOR,
  overlay: OVERLAY_BEHAVIOR,
} as const;

export const TRANSITION_PATTERN_REGISTRY = {
  transitionEngine: TRANSITION_ENGINE_SPEC,
  progressEngine: PROGRESS_ENGINE_SPEC,
  backgroundTransition: BACKGROUND_TRANSITION_SPEC,
  transitionLayout: TRANSITION_LAYOUT_SPEC,
} as const;

export function getScreenLayout(id: string): ScreenLayoutSpec | undefined {
  return SCREEN_LAYOUT_REGISTRY.find((l) => l.id === id);
}

export function getNavigationFrameworkCatalog() {
  return {
    layouts: SCREEN_LAYOUT_REGISTRY.map((l) => ({ id: l.id, name: l.name, mode: l.mode })),
    navigationPatterns: Object.keys(NAVIGATION_PATTERN_REGISTRY),
    transitionPatterns: Object.keys(TRANSITION_PATTERN_REGISTRY),
  };
}
