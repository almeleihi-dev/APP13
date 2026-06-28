import {
  createStackEntry,
  popStack,
  canPopStack,
} from "../../../navigation-framework/navigation/navigation-stack.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import type { ChatScreenId } from "../domain/chat-screen.js";
import { CHAT_SCREEN_ROUTES } from "../domain/chat-screen.js";
import type { ChatScreenNavigationView } from "../domain/chat-screen.js";

export const CHAT_NAV_ITEMS = [
  { id: "home", label: "Chat", icon: "chat", route: "/chat/home" },
  { id: "conversations", label: "Conversations", icon: "list", route: "/chat/conversations" },
] as const;

const ACTION_HOME_ROUTE = "/action/home";
const CONTRACT_HOME_ROUTE = "/contract/home";

export function buildChatNavigationView(
  navigation: NavigationState,
  screenId: ChatScreenId
): ChatScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "chat-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: true,
    activeNavId: screenId === "conversation-list" ? "conversations" : "home",
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
    returnToActionHomeRoute: ACTION_HOME_ROUTE,
    returnToContractRoute: CONTRACT_HOME_ROUTE,
  };
}

export function resolveNextRoute(screenId: ChatScreenId): string | undefined {
  switch (screenId) {
    case "chat-home":
      return CHAT_SCREEN_ROUTES["conversation-list"];
    case "conversation-list":
      return CHAT_SCREEN_ROUTES["conversation-screen"];
    case "conversation-screen":
      return CHAT_SCREEN_ROUTES["conversation-info"];
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: ChatScreenId): NavigationState {
  const route = CHAT_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: screenId !== "chat-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: true,
  };
}

export function navigateToConversation(
  navigation: NavigationState,
  conversationId: string
): NavigationState {
  return {
    ...navigation,
    activeRoute: `${CHAT_SCREEN_ROUTES["conversation-screen"]}/${conversationId}`,
    canGoBack: true,
    stack: [
      ...navigation.stack,
      createStackEntry({
        screenId: "conversation-screen",
        route: `${CHAT_SCREEN_ROUTES["conversation-screen"]}/${conversationId}`,
        presentation: "push",
        params: { conversationId },
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
): { navigation: NavigationState; screenId: ChatScreenId } {
  const targetScreen: ChatScreenId = itemId === "conversations" ? "conversation-list" : "chat-home";
  const item = CHAT_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? CHAT_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "chat-home", route: CHAT_SCREEN_ROUTES["chat-home"], presentation: "push" })]
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
