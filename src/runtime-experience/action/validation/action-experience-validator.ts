import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../../design-system/foundation/colors.js";
import { getCoreUiComponent } from "../../../design-system/core-ui/registry/component-registry.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { validateNavigationFramework, NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import { validatePrototypeLibrary } from "../../../prototype-library/validation/prototype-validator.js";
import { OFFICIAL_TRANSITION_SPEC } from "../../../prototype-library/foundation/prototype-schema.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import { ACTION_LAYOUT } from "../../../navigation-framework/layouts/action-layout.js";
import { ACTION_SCREEN_IDS, ACTION_SCREEN_PROTOTYPE_MAP, ACTION_EXPERIENCE_FLOW } from "../domain/action-screen.js";
import { resolveActionLayoutBinding } from "../domain/action-layout.js";
import { TRANSITION_ENGINE_SPEC } from "../../../navigation-framework/transitions/transition-engine.js";
import { ACTION_RETURN_TRANSITION_STAGES, validateActionTransitionBrand } from "../application/action-transition.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";

export interface ActionExperienceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    screens: number;
    prototypes: number;
    components: number;
    designTokens: number;
    navigation: boolean;
    accessibility: boolean;
    transition: boolean;
    needExperienceLink: boolean;
  };
}

const ACTION_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "action-home": [
    "core-ui-navigation-bar",
    "core-ui-floating-action-button",
    "core-ui-contract-card",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-live-frame",
    "core-ui-bottom-navigation",
  ],
  "contract-preview": [
    "core-ui-navigation-bar",
    "core-ui-contract-card",
    "core-ui-button",
    "core-ui-badge",
    "core-ui-card",
    "core-ui-floating-action-button",
    "core-ui-bottom-navigation",
  ],
  "active-action": [
    "core-ui-navigation-bar",
    "core-ui-progress",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-floating-action-button",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
  "progress-screen": [
    "core-ui-navigation-bar",
    "core-ui-timeline-card",
    "core-ui-card",
    "core-ui-progress",
    "core-ui-bottom-navigation",
  ],
  "completion-screen": [
    "core-ui-navigation-bar",
    "core-ui-achievement-card",
    "core-ui-button",
    "core-ui-badge",
    "core-ui-bottom-navigation",
  ],
  "waiting-screen": ["core-ui-loading", "core-ui-progress", "core-ui-card"],
  transition: ["core-ui-loading", "core-ui-progress"],
};

export function validateActionExperience(): ActionExperienceValidationResult {
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

  for (const screenId of ACTION_SCREEN_IDS) {
    const prototypeId = ACTION_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveActionLayoutBinding(screenId);
    const skipLayoutCheck = screenId === "waiting-screen";
    if (!skipLayoutCheck && layout.layoutId !== prototype.layout.layoutId) {
      errors.push(`Screen ${screenId} layout mismatch: runtime=${layout.layoutId} prototype=${prototype.layout.layoutId}`);
    }

    for (const token of prototype.designTokens) {
      if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
        errors.push(`Screen ${screenId} uses non-semantic token: ${token}`);
      }
      tokenPaths.add(token);
    }

    const expectedComponents = ACTION_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (ACTION_LAYOUT.id !== "action-layout") {
    errors.push("Action layout must use action-layout");
  }

  if (!validateActionTransitionBrand()) {
    errors.push('Transition must use official brand line "an act..."');
  }

  if (TRANSITION_ENGINE_SPEC.brandLine !== OFFICIAL_TRANSITION_SPEC.brandLine) {
    errors.push('Transition engine brand line must be "an act..."');
  }

  for (const stage of ACTION_RETURN_TRANSITION_STAGES) {
    if (!stage.endsWith("...") && stage !== "Returning...") {
      warnings.push(`Return stage may not follow convention: ${stage}`);
    }
  }

  if (ACTION_EXPERIENCE_FLOW.length < 6) {
    errors.push("Action experience flow must include home, contract, active, progress, completion, and transition");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const transitionStep = ACTION_EXPERIENCE_FLOW.find((s) => s.screenId === "transition");
  if (!transitionStep) {
    errors.push("Action experience flow missing return transition step");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Action experience validation passed (${ACTION_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Action experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: ACTION_SCREEN_IDS.length,
      prototypes: ACTION_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      transition: validateActionTransitionBrand(),
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
    },
  };
}
