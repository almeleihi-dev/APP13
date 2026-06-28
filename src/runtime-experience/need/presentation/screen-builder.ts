import type { NeedRuntimeScreenView, NeedScreenSection } from "../domain/need-screen.js";
import { NEED_SCREEN_PROTOTYPE_MAP, NEED_SCREEN_ROUTES } from "../domain/need-screen.js";
import { resolveNeedLayoutBinding } from "../domain/need-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildNeedNavigationView, buildNavigationAccessibility } from "../application/need-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { NeedScreenId } from "../domain/need-screen.js";

export interface BuildScreenViewInput {
  screenId: NeedScreenId;
  sections: NeedScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildScreenViewInput): NeedRuntimeScreenView {
  const layout = resolveNeedLayoutBinding(input.screenId);
  const prototype = getPrototype(NEED_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildNeedNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: NEED_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: NEED_SCREEN_ROUTES[input.screenId],
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
}): import("../domain/need-screen.js").RuntimeComponentInstance {
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
