import type { ActionRuntimeScreenView, ActionScreenSection } from "../domain/action-screen.js";
import { ACTION_SCREEN_PROTOTYPE_MAP, ACTION_SCREEN_ROUTES } from "../domain/action-screen.js";
import { resolveActionLayoutBinding } from "../domain/action-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildActionNavigationView, buildNavigationAccessibility } from "../application/action-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { ActionScreenId } from "../domain/action-screen.js";

export interface BuildActionScreenViewInput {
  screenId: ActionScreenId;
  sections: ActionScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildActionScreenViewInput): ActionRuntimeScreenView {
  const layout = resolveActionLayoutBinding(input.screenId);
  const prototype = getPrototype(ACTION_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildActionNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: ACTION_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: ACTION_SCREEN_ROUTES[input.screenId],
    mode: layout.mode,
    layoutId: layout.layoutId,
    designTokens: [...prototype.designTokens],
    typography: prototype.typography,
    spacing: prototype.spacing,
    regions: [...layout.regions],
    sections: input.sections,
    navigation: navView,
    accessibility: {
      ...accessibility,
      reducedMotion: input.reducedMotion ?? accessibility.reducedMotion,
    },
    generatedAt: input.generatedAt,
  };
}

export function buildComponentInstance(input: {
  id: string;
  componentId: string;
  variant?: string;
  props: Record<string, unknown>;
  label?: string;
  role?: string;
}): import("../domain/action-screen.js").RuntimeComponentInstance {
  return {
    id: input.id,
    componentId: input.componentId,
    variant: input.variant,
    props: input.props,
    accessibility: {
      label: input.label,
      role: input.role,
      tabIndex: 0,
    },
  };
}
