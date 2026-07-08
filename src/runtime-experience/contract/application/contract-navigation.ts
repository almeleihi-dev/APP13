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
import { FLOATING_ACTION_BUTTON_COMPONENT } from "../../../design-system/core-ui/components/floating-action-button.js";
import type { ContractScreenId, ContractSectionId } from "../domain/contract-screen.js";
import { CONTRACT_SCREEN_ROUTES } from "../domain/contract-screen.js";
import {
  CONTRACT_BOTTOM_NAV_TARGETS,
  CONTRACT_SECTION_SCREEN_MAP,
} from "../domain/contract-actions.js";
import type { ContractScreenNavigationView } from "../domain/contract-screen.js";

export const CONTRACT_NAV_ITEMS = [
  { id: "home", label: "Home", icon: "home", route: "/contract/home" },
  { id: "review", label: "Review", icon: "review", route: "/contract/review" },
  { id: "parties", label: "Parties", icon: "parties", route: "/contract/parties" },
  { id: "terms", label: "Terms", icon: "terms", route: "/contract/terms" },
  { id: "timeline", label: "Timeline", icon: "timeline", route: "/contract/timeline" },
  { id: "cost", label: "Cost", icon: "cost", route: "/contract/cost" },
  { id: "status", label: "Status", icon: "status", route: "/contract/status" },
] as const;

const ACTION_HOME_ROUTE = "/action/home";

export function resolveActiveSectionId(screenId: ContractScreenId): ContractSectionId | undefined {
  const entry = Object.entries(CONTRACT_SECTION_SCREEN_MAP).find(([, sid]) => sid === screenId);
  return entry?.[0] as ContractSectionId | undefined;
}

export function showsFloatingAction(screenId: ContractScreenId): boolean {
  return screenId !== "transition" && screenId !== "empty-state" && screenId !== "confirmation";
}

export function buildContractNavigationView(
  navigation: NavigationState,
  screenId: ContractScreenId
): ContractScreenNavigationView {
  const previous = navigation.stack.length >= 2 ? navigation.stack.at(-2) : undefined;
  return {
    pattern: screenId === "contract-home" ? "tab" : "stack",
    canGoBack: navigation.canGoBack,
    backRoute: previous?.route,
    bottomNavigationVisible: !navigation.transitionActive && screenId !== "transition",
    floatingActionVisible: showsFloatingAction(screenId) && !navigation.transitionActive,
    activeSectionId: resolveActiveSectionId(screenId),
    stackDepth: navigation.stack.length,
    nextRoute: resolveNextRoute(screenId),
    returnToActionHomeRoute: ACTION_HOME_ROUTE,
  };
}

export function resolveNextRoute(screenId: ContractScreenId): string | undefined {
  switch (screenId) {
    case "contract-home":
      return CONTRACT_SCREEN_ROUTES["contract-review"];
    case "contract-review":
      return CONTRACT_SCREEN_ROUTES.parties;
    case "parties":
      return CONTRACT_SCREEN_ROUTES.terms;
    case "terms":
      return CONTRACT_SCREEN_ROUTES.timeline;
    case "timeline":
      return CONTRACT_SCREEN_ROUTES.cost;
    case "cost":
      return CONTRACT_SCREEN_ROUTES.confirmation;
    case "confirmation":
      return CONTRACT_SCREEN_ROUTES.status;
    case "status":
      return CONTRACT_SCREEN_ROUTES.transition;
    default:
      return undefined;
  }
}

export function navigateToScreen(navigation: NavigationState, screenId: ContractScreenId): NavigationState {
  const route = CONTRACT_SCREEN_ROUTES[screenId];
  return {
    ...navigation,
    activeRoute: route,
    canGoBack: screenId !== "contract-home",
    stack: [...navigation.stack, createStackEntry({ screenId, route, presentation: "push" })],
    bottomNavigationVisible: screenId !== "transition",
  };
}

export function navigateToSection(navigation: NavigationState, sectionId: ContractSectionId): NavigationState {
  return navigateToScreen(navigation, CONTRACT_SECTION_SCREEN_MAP[sectionId]);
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
): { navigation: NavigationState; screenId: ContractScreenId } {
  const targetScreen = CONTRACT_BOTTOM_NAV_TARGETS[itemId] ?? "contract-home";
  const item = CONTRACT_NAV_ITEMS.find((i) => i.id === itemId);
  const route = item?.route ?? CONTRACT_SCREEN_ROUTES[targetScreen];
  return {
    screenId: targetScreen,
    navigation: {
      ...navigation,
      activeRoute: route,
      canGoBack: itemId !== "home",
      stack:
        itemId === "home"
          ? [createStackEntry({ screenId: "contract-home", route: CONTRACT_SCREEN_ROUTES["contract-home"], presentation: "push" })]
          : [...navigation.stack, createStackEntry({ screenId: targetScreen, route, presentation: "push" })],
      bottomNavigationVisible: true,
    },
  };
}

export function beginContractTransition(navigation: NavigationState): NavigationState {
  return startTransition(navigation);
}

export function completeContractTransition(navigation: NavigationState): NavigationState {
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

export function getFloatingActionComponentId(): string {
  return FLOATING_ACTION_BUTTON_COMPONENT.id;
}
