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
  PROFILE_SCREEN_IDS,
  PROFILE_SCREEN_PROTOTYPE_MAP,
  PROFILE_EXPERIENCE_FLOW,
  PROFILE_RUNTIME_FLOW,
} from "../domain/profile-screen.js";
import { resolveProfileLayoutBinding } from "../domain/profile-layout.js";
import { PROFILE_SECTION_IDS } from "../domain/profile-sections.js";
import { PROFILE_SETTINGS_OPTIONS } from "../application/profile-builder.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";

export interface ProfileExperienceValidationResult {
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
    profileSections: number;
    settingsOptions: number;
    needExperienceLink: boolean;
    actionExperienceLink: boolean;
    contractExperienceLink: boolean;
    chatExperienceLink: boolean;
    timelineExperienceLink: boolean;
    notificationExperienceLink: boolean;
  };
}

const PROFILE_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "profile-home": [
    "core-ui-avatar",
    "core-ui-navigation-bar",
    "core-ui-live-frame",
    "core-ui-badge",
    "core-ui-card",
    "core-ui-bottom-navigation",
  ],
  "profile-identity": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-chip",
    "core-ui-bottom-navigation",
  ],
  "profile-live-frame": [
    "core-ui-navigation-bar",
    "core-ui-live-frame",
    "core-ui-badge",
    "core-ui-card",
    "core-ui-progress",
    "core-ui-bottom-navigation",
  ],
  "profile-achievements": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-progress",
    "core-ui-bottom-navigation",
  ],
  "profile-analytics": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-contract-card",
    "core-ui-timeline-card",
    "core-ui-bottom-navigation",
  ],
  "profile-history": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
  "profile-settings": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-bottom-navigation",
  ],
  "profile-empty-state": [
    "core-ui-card",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
};

export function validateProfileExperience(): ProfileExperienceValidationResult {
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

  for (const screenId of PROFILE_SCREEN_IDS) {
    const prototypeId = PROFILE_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveProfileLayoutBinding(screenId);
    if (layout.layoutId !== prototype.layout.layoutId && screenId !== "profile-empty-state") {
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

    const expectedComponents = PROFILE_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Profile experience must use need-layout");
  }

  if (PROFILE_EXPERIENCE_FLOW.length < 7) {
    errors.push("Profile experience flow must include all profile screens");
  }

  if (PROFILE_RUNTIME_FLOW.length < 8) {
    errors.push("Profile runtime flow must include Open Profile through Back");
  }

  if (PROFILE_SECTION_IDS.length < 6) {
    errors.push("Profile must include all required sections");
  }

  if (PROFILE_SETTINGS_OPTIONS.length < 5) {
    errors.push("Profile settings must include appearance, notifications, privacy, accessibility, language");
  }

  const requiredScreens = [
    "profile-home",
    "profile-identity",
    "profile-live-frame",
    "profile-achievements",
    "profile-analytics",
    "profile-history",
    "profile-settings",
    "profile-empty-state",
  ] as const;
  for (const screen of requiredScreens) {
    if (!PROFILE_SCREEN_IDS.includes(screen)) {
      errors.push(`Missing required profile screen: ${screen}`);
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
      ? `Profile experience validation passed (${PROFILE_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Profile experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: PROFILE_SCREEN_IDS.length,
      sections: 8,
      prototypes: PROFILE_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      profileSections: PROFILE_SECTION_IDS.length,
      settingsOptions: PROFILE_SETTINGS_OPTIONS.length,
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
      actionExperienceLink: ACTION_EXPERIENCE_VERSION.length > 0,
      contractExperienceLink: CONTRACT_EXPERIENCE_VERSION.length > 0,
      chatExperienceLink: CHAT_EXPERIENCE_VERSION.length > 0,
      timelineExperienceLink: TIMELINE_EXPERIENCE_VERSION.length > 0,
      notificationExperienceLink: NOTIFICATION_EXPERIENCE_VERSION.length > 0,
    },
  };
}
