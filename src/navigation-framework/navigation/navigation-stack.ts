export type NavigationPresentation = "push" | "modal" | "sheet" | "overlay" | "replace";

export interface NavigationStackEntry {
  screenId: string;
  route: string;
  presentation: NavigationPresentation;
  params?: Record<string, string>;
  timestamp: string;
}

export interface NavigationStackSpec {
  id: "navigation-stack";
  maxDepth: number;
  backBehavior: {
    pop: "remove-top-entry";
    modalDismiss: "remove-modal-entry";
    sheetDismiss: "remove-sheet-entry";
    rootGuard: "prevent-pop-at-root";
  };
  presentationRules: Record<NavigationPresentation, { addsToStack: boolean; blocksBottomNav: boolean }>;
}

export const NAVIGATION_STACK_SPEC: NavigationStackSpec = {
  id: "navigation-stack",
  maxDepth: 32,
  backBehavior: {
    pop: "remove-top-entry",
    modalDismiss: "remove-modal-entry",
    sheetDismiss: "remove-sheet-entry",
    rootGuard: "prevent-pop-at-root",
  },
  presentationRules: {
    push: { addsToStack: true, blocksBottomNav: false },
    modal: { addsToStack: true, blocksBottomNav: true },
    sheet: { addsToStack: true, blocksBottomNav: true },
    overlay: { addsToStack: false, blocksBottomNav: false },
    replace: { addsToStack: false, blocksBottomNav: false },
  },
};

export function createStackEntry(input: {
  screenId: string;
  route: string;
  presentation?: NavigationPresentation;
  params?: Record<string, string>;
}): NavigationStackEntry {
  return {
    screenId: input.screenId,
    route: input.route,
    presentation: input.presentation ?? "push",
    params: input.params,
    timestamp: new Date().toISOString(),
  };
}

export function canPopStack(stack: NavigationStackEntry[]): boolean {
  return stack.length > 1;
}

export function popStack(stack: NavigationStackEntry[]): NavigationStackEntry[] {
  if (!canPopStack(stack)) return stack;
  return stack.slice(0, -1);
}
