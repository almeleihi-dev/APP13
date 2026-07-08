import { BOTTOM_NAVIGATION_SPEC } from "../../../navigation-framework/navigation/bottom-navigation.js";
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
import type { NeedScreenId } from "../domain/need-screen.js";
import { NEED_SCREEN_ROUTES } from "../domain/need-screen.js";
import { NEED_BOTTOM_NAV_TARGETS } from "../domain/need-actions.js";
import type { NeedScreenNavigationView } from "../domain/need-screen.js";

const BOTTOM_NAV_ROUTE_MAP: Record<string, string> = {
  home: "/need/home",
  search: "/need/search",
  timeline: "/need/timeline",
  profile: "/need/profile",
};

export function resolveBottomNavItems() {
  return BOTTOM_NAVIGATION_SPEC.defaultItems.map((item) => ({
    ...item,
    route: BOTTOM_NAV_ROUTE_MAP[item.id] ?? item.route,
  }));
}

export function resolveActiveBottomNavId(screenId: NeedScreenId): string {
  if (screenId === "search" || screenId === "opportunity-list" || screenId === "empty-state") {
    return "search";
  }
  return "home";
}

export function buildNeedNavigationView(
  navigation: NavigationState,
  screenId: NeedScreenId
): NeedScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "need-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: navigation.bottomNavigationVisible,
    activeBottomNavId: resolveActiveBottomNavId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
  };
}

export function resolveNextRoute(screenId: NeedScreenId): string | undefined {
  switch (screenId) {
    case "need-home":
      return NEED_SCREEN_ROUTES.search;
    case "search":
      return NEED_SCREEN_ROUTES["opportunity-list"];
    case "opportunity-list":
      return NEED_SCREEN_ROUTES.request;
    case "request":
      return NEED_SCREEN_ROUTES.transition;
    default:
      return undefined;
  }
}

export function navigateToScreen(
  navigation: NavigationState,
  screenId: NeedScreenId
): NavigationState {
  const route = NEED_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: true,
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: screenId !== "request" && screenId !== "transition",
  };
}

export function navigateBack(navigation: NavigationState): NavigationState {
  if (!canPopStack(navigation.stack)) {
    return navigation;
  }
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
): { navigation: NavigationState; screenId: NeedScreenId } {
  const targetScreen = NEED_BOTTOM_NAV_TARGETS[itemId] ?? "need-home";
  const route = BOTTOM_NAV_ROUTE_MAP[itemId] ?? NEED_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "need-home", route: NEED_SCREEN_ROUTES["need-home"], presentation: "push" })]
          : [...navigation.stack, createStackEntry({ screenId: targetScreen, route, presentation: "push" })],
      bottomNavigationVisible: true,
    },
  };
}

export function beginNeedTransition(navigation: NavigationState): NavigationState {
  return startTransition(navigation);
}

export function completeNeedTransition(navigation: NavigationState): NavigationState {
  return endTransition(navigation, "action");
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
