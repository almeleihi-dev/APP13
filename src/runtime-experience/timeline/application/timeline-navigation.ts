import {
  createStackEntry,
  popStack,
  canPopStack,
} from "../../../navigation-framework/navigation/navigation-stack.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { TimelineScreenId } from "../domain/timeline-screen.js";
import { TIMELINE_SCREEN_ROUTES } from "../domain/timeline-screen.js";
import type { TimelineScreenNavigationView } from "../domain/timeline-screen.js";

export const TIMELINE_NAV_ITEMS = [
  { id: "home", label: "Timeline", icon: "timeline", route: "/timeline/home" },
  { id: "history", label: "History", icon: "history", route: "/timeline/history" },
  { id: "progress", label: "Progress", icon: "progress", route: "/timeline/progress" },
] as const;

const NEED_HOME_ROUTE = "/need/home";
const ACTION_HOME_ROUTE = "/action/home";
const CONTRACT_HOME_ROUTE = "/contract/home";
const CHAT_HOME_ROUTE = "/chat/home";

export function buildTimelineNavigationView(
  navigation: NavigationState,
  screenId: TimelineScreenId
): TimelineScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "timeline-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: screenId !== "timeline-detail",
    activeNavId: resolveActiveNavId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
    returnToNeedHomeRoute: NEED_HOME_ROUTE,
    returnToActionHomeRoute: ACTION_HOME_ROUTE,
    returnToContractRoute: CONTRACT_HOME_ROUTE,
    returnToChatRoute: CHAT_HOME_ROUTE,
  };
}

function resolveActiveNavId(screenId: TimelineScreenId): string {
  if (screenId === "timeline-history") return "history";
  if (screenId === "timeline-progress") return "progress";
  return "home";
}

export function resolveNextRoute(screenId: TimelineScreenId): string | undefined {
  switch (screenId) {
    case "timeline-home":
      return TIMELINE_SCREEN_ROUTES["timeline-history"];
    case "timeline-history":
      return TIMELINE_SCREEN_ROUTES["timeline-detail"];
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: TimelineScreenId): NavigationState {
  const route = TIMELINE_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: screenId !== "timeline-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: screenId !== "timeline-detail",
  };
}

export function navigateToDetail(
  navigation: NavigationState,
  eventId: string
): NavigationState {
  const route = `${TIMELINE_SCREEN_ROUTES["timeline-detail"]}/${eventId}`;
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: true,
    stack: [
      ...navigation.stack,
      createStackEntry({
        screenId: "timeline-detail",
        route,
        presentation: "push",
        params: { eventId },
      }),
    ],
    bottomNavigationVisible: false,
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
): { navigation: NavigationState; screenId: TimelineScreenId } {
  const screenMap: Record<string, TimelineScreenId> = {
    home: "timeline-home",
    history: "timeline-history",
    progress: "timeline-progress",
  };
  const targetScreen = screenMap[itemId] ?? "timeline-home";
  const item = TIMELINE_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? TIMELINE_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "timeline-home", route: TIMELINE_SCREEN_ROUTES["timeline-home"], presentation: "push" })]
          : [...navigation.stack, createStackEntry({ screenId: targetScreen, route, presentation: "push" })],
      bottomNavigationVisible: true,
    },
  };
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
