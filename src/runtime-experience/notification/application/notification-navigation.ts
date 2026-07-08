import {
  createStackEntry,
  popStack,
  canPopStack,
} from "../../../navigation-framework/navigation/navigation-stack.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { NotificationScreenId } from "../domain/notification-screen.js";
import { NOTIFICATION_SCREEN_ROUTES } from "../domain/notification-screen.js";
import type { NotificationScreenNavigationView } from "../domain/notification-screen.js";

export const NOTIFICATION_NAV_ITEMS = [
  { id: "home", label: "Notifications", icon: "notification", route: "/notification/home" },
  { id: "list", label: "Inbox", icon: "list", route: "/notification/list" },
  { id: "settings", label: "Settings", icon: "settings", route: "/notification/settings" },
] as const;

const NEED_HOME_ROUTE = "/need/home";
const ACTION_HOME_ROUTE = "/action/home";
const CONTRACT_HOME_ROUTE = "/contract/home";
const CHAT_HOME_ROUTE = "/chat/home";
const TIMELINE_HOME_ROUTE = "/timeline/home";

export function buildNotificationNavigationView(
  navigation: NavigationState,
  screenId: NotificationScreenId
): NotificationScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "notification-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: screenId !== "notification-detail",
    activeNavId: resolveActiveNavId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
    returnToNeedHomeRoute: NEED_HOME_ROUTE,
    returnToActionHomeRoute: ACTION_HOME_ROUTE,
    returnToContractRoute: CONTRACT_HOME_ROUTE,
    returnToChatRoute: CHAT_HOME_ROUTE,
    returnToTimelineRoute: TIMELINE_HOME_ROUTE,
  };
}

function resolveActiveNavId(screenId: NotificationScreenId): string {
  if (screenId === "notification-list") return "list";
  if (screenId === "notification-settings") return "settings";
  return "home";
}

export function resolveNextRoute(screenId: NotificationScreenId): string | undefined {
  switch (screenId) {
    case "notification-home":
      return NOTIFICATION_SCREEN_ROUTES["notification-list"];
    case "notification-list":
      return NOTIFICATION_SCREEN_ROUTES["notification-detail"];
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: NotificationScreenId): NavigationState {
  const route = NOTIFICATION_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: screenId !== "notification-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: screenId !== "notification-detail",
  };
}

export function navigateToDetail(navigation: NavigationState, notificationId: string): NavigationState {
  const route = `${NOTIFICATION_SCREEN_ROUTES["notification-detail"]}/${notificationId}`;
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: true,
    stack: [
      ...navigation.stack,
      createStackEntry({
        screenId: "notification-detail",
        route,
        presentation: "push",
        params: { notificationId },
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
): { navigation: NavigationState; screenId: NotificationScreenId } {
  const screenMap: Record<string, NotificationScreenId> = {
    home: "notification-home",
    list: "notification-list",
    settings: "notification-settings",
  };
  const targetScreen = screenMap[itemId] ?? "notification-home";
  const item = NOTIFICATION_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? NOTIFICATION_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "notification-home", route: NOTIFICATION_SCREEN_ROUTES["notification-home"], presentation: "push" })]
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
