import {
  createStackEntry,
  popStack,
  canPopStack,
} from "../../../navigation-framework/navigation/navigation-stack.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { ProfileScreenId } from "../domain/profile-screen.js";
import { PROFILE_SCREEN_ROUTES } from "../domain/profile-screen.js";
import type { ProfileScreenNavigationView } from "../domain/profile-screen.js";

export const PROFILE_NAV_ITEMS = [
  { id: "home", label: "Profile", icon: "profile", route: "/profile/home" },
  { id: "achievements", label: "Achievements", icon: "achievement", route: "/profile/achievements" },
  { id: "settings", label: "Settings", icon: "settings", route: "/profile/settings" },
] as const;

const NEED_HOME_ROUTE = "/need/home";
const ACTION_HOME_ROUTE = "/action/home";
const TIMELINE_HOME_ROUTE = "/timeline/home";
const NOTIFICATIONS_HOME_ROUTE = "/notification/home";

export function buildProfileNavigationView(
  navigation: NavigationState,
  screenId: ProfileScreenId
): ProfileScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "profile-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: true,
    activeNavId: resolveActiveNavId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
    returnToNeedHomeRoute: NEED_HOME_ROUTE,
    returnToActionHomeRoute: ACTION_HOME_ROUTE,
    returnToTimelineRoute: TIMELINE_HOME_ROUTE,
    returnToNotificationsRoute: NOTIFICATIONS_HOME_ROUTE,
  };
}

function resolveActiveNavId(screenId: ProfileScreenId): string {
  if (screenId === "profile-achievements") return "achievements";
  if (screenId === "profile-settings") return "settings";
  return "home";
}

export function resolveNextRoute(screenId: ProfileScreenId): string | undefined {
  switch (screenId) {
    case "profile-home":
      return PROFILE_SCREEN_ROUTES["profile-identity"];
    case "profile-identity":
      return PROFILE_SCREEN_ROUTES["profile-live-frame"];
    case "profile-live-frame":
      return PROFILE_SCREEN_ROUTES["profile-achievements"];
    case "profile-achievements":
      return PROFILE_SCREEN_ROUTES["profile-analytics"];
    case "profile-analytics":
      return PROFILE_SCREEN_ROUTES["profile-history"];
    case "profile-history":
      return PROFILE_SCREEN_ROUTES["profile-settings"];
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: ProfileScreenId): NavigationState {
  const route = PROFILE_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: screenId !== "profile-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: true,
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
): { navigation: NavigationState; screenId: ProfileScreenId } {
  const screenMap: Record<string, ProfileScreenId> = {
    home: "profile-home",
    achievements: "profile-achievements",
    settings: "profile-settings",
  };
  const targetScreen = screenMap[itemId] ?? "profile-home";
  const item = PROFILE_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? PROFILE_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "profile-home", route: PROFILE_SCREEN_ROUTES["profile-home"], presentation: "push" })]
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
