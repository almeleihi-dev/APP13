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
  TIMELINE_SCREEN_IDS,
  TIMELINE_SCREEN_PROTOTYPE_MAP,
  TIMELINE_EXPERIENCE_FLOW,
  TIMELINE_LIFECYCLE_FLOW,
} from "../domain/timeline-screen.js";
import { resolveTimelineLayoutBinding } from "../domain/timeline-layout.js";
import { TIMELINE_FILTER_IDS } from "../domain/timeline-state.js";
import { TIMELINE_EVENT_TYPE_ORDER } from "../domain/timeline-event.js";
import { TIMELINE_PROGRESS_STAGES } from "../application/timeline-builder.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";

export interface TimelineExperienceValidationResult {
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
    eventTypes: number;
    filters: number;
    progressStages: number;
    needExperienceLink: boolean;
    actionExperienceLink: boolean;
    contractExperienceLink: boolean;
    chatExperienceLink: boolean;
  };
}

const TIMELINE_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "timeline-home": [
    "core-ui-badge",
    "core-ui-card",
    "core-ui-timeline-card",
    "core-ui-live-frame",
    "core-ui-bottom-navigation",
  ],
  "timeline-history": [
    "core-ui-navigation-bar",
    "core-ui-timeline-card",
    "core-ui-bottom-navigation",
  ],
  "timeline-detail": [
    "core-ui-navigation-bar",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-contract-card",
    "core-ui-avatar",
    "core-ui-chip",
    "core-ui-button",
  ],
  "timeline-progress": [
    "core-ui-navigation-bar",
    "core-ui-timeline-card",
    "core-ui-badge",
    "core-ui-bottom-navigation",
  ],
  "timeline-filters": [
    "core-ui-navigation-bar",
    "core-ui-chip",
  ],
  "timeline-empty-state": [
    "core-ui-card",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
};

export function validateTimelineExperience(): TimelineExperienceValidationResult {
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

  for (const screenId of TIMELINE_SCREEN_IDS) {
    const prototypeId = TIMELINE_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveTimelineLayoutBinding(screenId);
    if (layout.layoutId !== prototype.layout.layoutId && screenId !== "timeline-empty-state") {
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

    const expectedComponents = TIMELINE_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Timeline experience must use need-layout");
  }

  if (TIMELINE_EXPERIENCE_FLOW.length < 5) {
    errors.push("Timeline experience flow must include home, history, detail, progress, and filters");
  }

  if (TIMELINE_LIFECYCLE_FLOW.length < 8) {
    errors.push("Timeline lifecycle flow must include all lifecycle stages");
  }

  if (TIMELINE_EVENT_TYPE_ORDER.length < 10) {
    errors.push("Timeline must support all required event types");
  }

  if (TIMELINE_FILTER_IDS.length < 6) {
    errors.push("Timeline must support all required filters");
  }

  if (TIMELINE_PROGRESS_STAGES.length < 5) {
    errors.push("Timeline progress must include Need, Match, Contract, Action, Completion stages");
  }

  const requiredScreens = [
    "timeline-home",
    "timeline-history",
    "timeline-detail",
    "timeline-progress",
    "timeline-filters",
    "timeline-empty-state",
  ] as const;
  for (const screen of requiredScreens) {
    if (!TIMELINE_SCREEN_IDS.includes(screen)) {
      errors.push(`Missing required timeline screen: ${screen}`);
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
      ? `Timeline experience validation passed (${TIMELINE_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Timeline experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: TIMELINE_SCREEN_IDS.length,
      sections: 6,
      prototypes: TIMELINE_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      eventTypes: TIMELINE_EVENT_TYPE_ORDER.length,
      filters: TIMELINE_FILTER_IDS.length,
      progressStages: TIMELINE_PROGRESS_STAGES.length,
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
      actionExperienceLink: ACTION_EXPERIENCE_VERSION.length > 0,
      contractExperienceLink: CONTRACT_EXPERIENCE_VERSION.length > 0,
      chatExperienceLink: CHAT_EXPERIENCE_VERSION.length > 0,
    },
  };
}
