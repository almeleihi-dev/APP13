import type { ProfileRuntimeScreenView, ProfileScreenSection } from "../domain/profile-screen.js";
import { PROFILE_SCREEN_PROTOTYPE_MAP, PROFILE_SCREEN_ROUTES } from "../domain/profile-screen.js";
import { resolveProfileLayoutBinding } from "../domain/profile-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildProfileNavigationView, buildNavigationAccessibility } from "../application/profile-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { ProfileScreenId } from "../domain/profile-screen.js";

export interface BuildProfileScreenViewInput {
  screenId: ProfileScreenId;
  sections: ProfileScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildProfileScreenViewInput): ProfileRuntimeScreenView {
  const layout = resolveProfileLayoutBinding(input.screenId);
  const prototype = getPrototype(PROFILE_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildProfileNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: PROFILE_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: PROFILE_SCREEN_ROUTES[input.screenId],
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
}): import("../domain/profile-screen.js").RuntimeComponentInstance {
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
