import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../../design-system/foundation/colors.js";
import { getCoreUiComponent } from "../../../design-system/core-ui/registry/component-registry.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { validateNavigationFramework, NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import { validatePrototypeLibrary } from "../../../prototype-library/validation/prototype-validator.js";
import { OFFICIAL_TRANSITION_SPEC } from "../../../prototype-library/foundation/prototype-schema.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import { NEED_SCREEN_IDS, NEED_SCREEN_PROTOTYPE_MAP, NEED_EXPERIENCE_FLOW } from "../domain/need-screen.js";
import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import { resolveNeedLayoutBinding } from "../domain/need-layout.js";
import { TRANSITION_ENGINE_SPEC } from "../../../navigation-framework/transitions/transition-engine.js";

export interface NeedExperienceValidationResult {
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
  };
}

const NEED_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "need-home": ["core-ui-navigation-bar", "core-ui-bottom-navigation", "core-ui-search", "core-ui-card", "core-ui-chip"],
  search: ["core-ui-navigation-bar", "core-ui-search", "core-ui-card", "core-ui-chip", "core-ui-bottom-navigation", "core-ui-loading"],
  "opportunity-list": ["core-ui-navigation-bar", "core-ui-card", "core-ui-badge", "core-ui-chip", "core-ui-bottom-navigation", "core-ui-live-frame"],
  request: ["core-ui-navigation-bar", "core-ui-input", "core-ui-button", "core-ui-card"],
  "empty-state": ["core-ui-navigation-bar", "core-ui-button", "core-ui-card", "core-ui-search", "core-ui-bottom-navigation"],
  transition: ["core-ui-loading", "core-ui-progress"],
};

export function validateNeedExperience(): NeedExperienceValidationResult {
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

  for (const screenId of NEED_SCREEN_IDS) {
    const prototypeId = NEED_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveNeedLayoutBinding(screenId);
    if (layout.layoutId !== prototype.layout.layoutId) {
      errors.push(`Screen ${screenId} layout mismatch: runtime=${layout.layoutId} prototype=${prototype.layout.layoutId}`);
    }

    for (const token of prototype.designTokens) {
      if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
        errors.push(`Screen ${screenId} uses non-semantic token: ${token}`);
      }
      tokenPaths.add(token);
    }

    const expectedComponents = NEED_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Need layout must use need-layout");
  }

  if (TRANSITION_ENGINE_SPEC.brandLine !== OFFICIAL_TRANSITION_SPEC.brandLine) {
    errors.push('Transition must use official brand line "an act..."');
  }

  for (const stage of OFFICIAL_TRANSITION_SPEC.stageTexts) {
    if (!TRANSITION_ENGINE_SPEC.stageTexts.includes(stage)) {
      errors.push(`Transition missing official stage: ${stage}`);
    }
  }

  if (NEED_EXPERIENCE_FLOW.length < 5) {
    errors.push("Need experience flow must include home, search, opportunities, request, and transition");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const transitionStep = NEED_EXPERIENCE_FLOW.find((s) => s.screenId === "transition");
  if (!transitionStep) {
    errors.push("Need experience flow missing transition step");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Need experience validation passed (${NEED_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Need experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: NEED_SCREEN_IDS.length,
      prototypes: NEED_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      transition: TRANSITION_ENGINE_SPEC.brandLine === OFFICIAL_TRANSITION_SPEC.brandLine,
    },
  };
}
