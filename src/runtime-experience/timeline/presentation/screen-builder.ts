import type { TimelineRuntimeScreenView, TimelineScreenSection } from "../domain/timeline-screen.js";
import { TIMELINE_SCREEN_PROTOTYPE_MAP, TIMELINE_SCREEN_ROUTES } from "../domain/timeline-screen.js";
import { resolveTimelineLayoutBinding } from "../domain/timeline-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildTimelineNavigationView, buildNavigationAccessibility } from "../application/timeline-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { TimelineScreenId } from "../domain/timeline-screen.js";

export interface BuildTimelineScreenViewInput {
  screenId: TimelineScreenId;
  sections: TimelineScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildTimelineScreenViewInput): TimelineRuntimeScreenView {
  const layout = resolveTimelineLayoutBinding(input.screenId);
  const prototype = getPrototype(TIMELINE_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildTimelineNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: TIMELINE_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: TIMELINE_SCREEN_ROUTES[input.screenId],
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
}): import("../domain/timeline-screen.js").RuntimeComponentInstance {
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
