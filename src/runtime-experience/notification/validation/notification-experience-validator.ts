import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../../design-system/foundation/colors.js";
import { getCoreUiComponent } from "../../../design-system/core-ui/registry/component-registry.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validatePrototypeLibrary } from "../../../prototype-library/validation/prototype-validator.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  NOTIFICATION_SCREEN_IDS,
  NOTIFICATION_SCREEN_PROTOTYPE_MAP,
  NOTIFICATION_EXPERIENCE_FLOW,
  NOTIFICATION_LIFECYCLE_FLOW,
} from "../domain/notification-screen.js";
import { resolveNotificationLayoutBinding } from "../domain/notification-layout.js";
import { NOTIFICATION_FILTER_IDS, NOTIFICATION_LIST_STATUS_FILTERS } from "../domain/notification-state.js";
import { NOTIFICATION_TYPE_ORDER } from "../domain/notification-item.js";
import { NOTIFICATION_SETTINGS_OPTIONS } from "../application/notification-builder.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";

export interface NotificationExperienceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    screens: number;
    sections: number;
    prototypes: number;
    components: number;
    designTokens: number;
    navigation: boolean;
    accessibility: boolean;
    notificationTypes: number;
    filters: number;
    settingsOptions: number;
    needExperienceLink: boolean;
    actionExperienceLink: boolean;
    contractExperienceLink: boolean;
    chatExperienceLink: boolean;
    timelineExperienceLink: boolean;
  };
}

const NOTIFICATION_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "notification-home": [
    "core-ui-badge",
    "core-ui-card",
    "core-ui-toast",
    "core-ui-timeline-card",
    "core-ui-contract-card",
    "core-ui-live-frame",
    "core-ui-bottom-navigation",
  ],
  "notification-list": [
    "core-ui-navigation-bar",
    "core-ui-chip",
    "core-ui-card",
    "core-ui-bottom-navigation",
  ],
  "notification-detail": [
    "core-ui-badge",
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-chip",
    "core-ui-button",
    "core-ui-contract-card",
  ],
  "notification-filters": [
    "core-ui-navigation-bar",
    "core-ui-chip",
  ],
  "notification-settings": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-bottom-navigation",
  ],
  "notification-empty-state": [
    "core-ui-card",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
};

export function validateNotificationExperience(): NotificationExperienceValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const componentIds = new Set<string>();
  const tokenPaths = new Set<string>();

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  const prototypes = validatePrototypeLibrary();
  if (!prototypes.valid) errors.push(...prototypes.errors.map((e) => `Prototype: ${e}`));

  for (const screenId of NOTIFICATION_SCREEN_IDS) {
    const prototypeId = NOTIFICATION_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveNotificationLayoutBinding(screenId);
    if (layout.layoutId !== prototype.layout.layoutId && screenId !== "notification-empty-state") {
      errors.push(
        `Screen ${screenId} layout mismatch: runtime=${layout.layoutId} prototype=${prototype.layout.layoutId}`
      );
    }

    for (const token of prototype.designTokens) {
      if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
        errors.push(`Screen ${screenId} uses non-semantic token: ${token}`);
      }
      tokenPaths.add(token);
    }

    const expectedComponents = NOTIFICATION_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Notification experience must use need-layout");
  }

  if (NOTIFICATION_EXPERIENCE_FLOW.length < 5) {
    errors.push("Notification experience flow must include home, list, detail, filters, and settings");
  }

  if (NOTIFICATION_LIFECYCLE_FLOW.length < 8) {
    errors.push("Notification lifecycle flow must include all lifecycle stages");
  }

  if (NOTIFICATION_TYPE_ORDER.length < 9) {
    errors.push("Notification must support all required notification types");
  }

  if (NOTIFICATION_FILTER_IDS.length < 7) {
    errors.push("Notification must support all required filters");
  }

  if (NOTIFICATION_LIST_STATUS_FILTERS.length < 4) {
    errors.push("Notification list must support Unread, Read, Important, Archived");
  }

  if (NOTIFICATION_SETTINGS_OPTIONS.length < 6) {
    errors.push("Notification settings must include Push, Email, SMS, In-App, Sound, Vibration");
  }

  const requiredScreens = [
    "notification-home",
    "notification-list",
    "notification-detail",
    "notification-filters",
    "notification-settings",
    "notification-empty-state",
  ] as const;
  for (const screen of requiredScreens) {
    if (!NOTIFICATION_SCREEN_IDS.includes(screen)) {
      errors.push(`Missing required notification screen: ${screen}`);
    }
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Notification experience validation passed (${NOTIFICATION_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Notification experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: NOTIFICATION_SCREEN_IDS.length,
      sections: 6,
      prototypes: NOTIFICATION_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      notificationTypes: NOTIFICATION_TYPE_ORDER.length,
      filters: NOTIFICATION_FILTER_IDS.length,
      settingsOptions: NOTIFICATION_SETTINGS_OPTIONS.length,
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
      actionExperienceLink: ACTION_EXPERIENCE_VERSION.length > 0,
      contractExperienceLink: CONTRACT_EXPERIENCE_VERSION.length > 0,
      chatExperienceLink: CHAT_EXPERIENCE_VERSION.length > 0,
      timelineExperienceLink: TIMELINE_EXPERIENCE_VERSION.length > 0,
    },
  };
}
