import type { NotificationRuntimeScreenView, NotificationScreenSection } from "../domain/notification-screen.js";
import { NOTIFICATION_SCREEN_PROTOTYPE_MAP, NOTIFICATION_SCREEN_ROUTES } from "../domain/notification-screen.js";
import { resolveNotificationLayoutBinding } from "../domain/notification-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildNotificationNavigationView, buildNavigationAccessibility } from "../application/notification-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { NotificationScreenId } from "../domain/notification-screen.js";

export interface BuildNotificationScreenViewInput {
  screenId: NotificationScreenId;
  sections: NotificationScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildNotificationScreenViewInput): NotificationRuntimeScreenView {
  const layout = resolveNotificationLayoutBinding(input.screenId);
  const prototype = getPrototype(NOTIFICATION_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildNotificationNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: NOTIFICATION_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: NOTIFICATION_SCREEN_ROUTES[input.screenId],
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
}): import("../domain/notification-screen.js").RuntimeComponentInstance {
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
