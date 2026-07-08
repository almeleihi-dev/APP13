import { FLOATING_ACTION_BUTTON_COMPONENT } from "../../../design-system/core-ui/components/floating-action-button.js";
import {
  createStackEntry,
  popStack,
  canPopStack,
} from "../../../navigation-framework/navigation/navigation-stack.js";
import {
  startTransition,
  endTransition,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { ActionScreenId } from "../domain/action-screen.js";
import { ACTION_SCREEN_ROUTES } from "../domain/action-screen.js";
import { ACTION_BOTTOM_NAV_TARGETS } from "../domain/action-actions.js";
import type { ActionScreenNavigationView } from "../domain/action-screen.js";

export const ACTION_NAV_ITEMS = [
  { id: "home", label: "Home", icon: "home", route: "/action/home" },
  { id: "contract", label: "Contract", icon: "contract", route: "/action/contract" },
  { id: "progress", label: "Progress", icon: "timeline", route: "/action/progress" },
  { id: "completion", label: "Done", icon: "check", route: "/action/completion" },
] as const;

export function resolveActiveNavId(screenId: ActionScreenId): string {
  switch (screenId) {
    case "contract-preview":
      return "contract";
    case "progress-screen":
    case "active-action":
      return "progress";
    case "completion-screen":
      return "completion";
    default:
      return "home";
  }
}

export function showsFloatingAction(screenId: ActionScreenId): boolean {
  return screenId !== "completion-screen" && screenId !== "transition" && screenId !== "waiting-screen";
}

export function buildActionNavigationView(
  navigation: NavigationState,
  screenId: ActionScreenId
): ActionScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "action-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: !navigation.transitionActive && screenId !== "transition",
    floatingActionVisible: showsFloatingAction(screenId) && !navigation.transitionActive,
    activeNavId: resolveActiveNavId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
  };
}

export function resolveNextRoute(screenId: ActionScreenId): string | undefined {
  switch (screenId) {
    case "action-home":
      return ACTION_SCREEN_ROUTES["contract-preview"];
    case "contract-preview":
      return ACTION_SCREEN_ROUTES["active-action"];
    case "active-action":
      return ACTION_SCREEN_ROUTES["progress-screen"];
    case "progress-screen":
      return ACTION_SCREEN_ROUTES["completion-screen"];
    case "completion-screen":
      return ACTION_SCREEN_ROUTES.transition;
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: ActionScreenId): NavigationState {
  const route = ACTION_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    mode: screenId === "transition" ? navigation.mode : "action",
    activeRoute: route,
    canGoBack: screenId !== "action-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: screenId !== "transition" && screenId !== "waiting-screen",
  };
}

export function navigateBack(navigation: NavigationState): NavigationState {
  if (!canPopStack(navigation.stack)) return navigation;
  const stack = popStack(navigation.stack);
  const active = stack.at(-1);
  return {
    ...navigation,
    stack,
    activeRoute: active?.route ?? navigation.activeRoute,
    canGoBack: canPopStack(stack),
    bottomNavigationVisible: true,
  };
}

export function navigateBottomNav(
  navigation: NavigationState,
  itemId: string
): { navigation: NavigationState; screenId: ActionScreenId } {
  const targetScreen = ACTION_BOTTOM_NAV_TARGETS[itemId] ?? "action-home";
  const item = ACTION_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? ACTION_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "action-home", route: ACTION_SCREEN_ROUTES["action-home"], presentation: "push" })]
          : [...navigation.stack, createStackEntry({ screenId: targetScreen, route, presentation: "push" })],
      bottomNavigationVisible: true,
    },
  };
}

export function beginReturnTransition(navigation: NavigationState): NavigationState {
  return startTransition(navigation);
}

export function completeReturnTransition(navigation: NavigationState): NavigationState {
  return endTransition(navigation, "need");
}

export function buildNavigationAccessibility() {
  return {
    minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
    supportsKeyboardNavigation: NAVIGATION_ACCESSIBILITY_SPEC.keyboardNavigation.tabOrderFollowsLayout,
    supportsScreenReader: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.announceTransitionStages,
    reducedMotion: NAVIGATION_ACCESSIBILITY_SPEC.reducedMotion.skipTransitionAnimations,
    focusRegion: "mainContent",
    landmarkRegions: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.landmarkRegions,
  };
}

export function getFloatingActionComponentId(): string {
  return FLOATING_ACTION_BUTTON_COMPONENT.id;
}
