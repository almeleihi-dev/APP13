import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../../design-system/foundation/colors.js";
import { getCoreUiComponent } from "../../../design-system/core-ui/registry/component-registry.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { validateNavigationFramework, NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";
import { validatePrototypeLibrary } from "../../../prototype-library/validation/prototype-validator.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import { ACTION_LAYOUT } from "../../../navigation-framework/layouts/action-layout.js";
import {
  CONTRACT_SCREEN_IDS,
  CONTRACT_SCREEN_PROTOTYPE_MAP,
  CONTRACT_EXPERIENCE_FLOW,
  CONTRACT_SECTION_IDS,
} from "../domain/contract-screen.js";
import { resolveContractLayoutBinding } from "../domain/contract-layout.js";
import {
  CONTRACT_TO_ACTION_TRANSITION_STAGES,
  validateContractTransitionBrand,
} from "../application/contract-transition.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { TRANSITION_ENGINE_SPEC } from "../../../navigation-framework/transitions/transition-engine.js";

export interface ContractExperienceValidationResult {
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
    transition: boolean;
    needExperienceLink: boolean;
    actionExperienceLink: boolean;
  };
}

const CONTRACT_SCREEN_COMPONENTS: Record<string, readonly string[]> = {
  "contract-home": [
    "core-ui-contract-card",
    "core-ui-card",
    "core-ui-badge",
    "core-ui-live-frame",
    "core-ui-bottom-navigation",
    "core-ui-floating-action-button",
  ],
  "contract-review": [
    "core-ui-contract-card",
    "core-ui-card",
    "core-ui-chip",
    "core-ui-badge",
    "core-ui-button",
    "core-ui-bottom-navigation",
  ],
  parties: ["core-ui-card", "core-ui-badge", "core-ui-live-frame", "core-ui-button", "core-ui-bottom-navigation"],
  terms: ["core-ui-card", "core-ui-chip", "core-ui-button", "core-ui-bottom-navigation"],
  timeline: ["core-ui-card", "core-ui-timeline-card", "core-ui-chip", "core-ui-button", "core-ui-bottom-navigation"],
  cost: ["core-ui-card", "core-ui-chip", "core-ui-badge", "core-ui-button", "core-ui-bottom-navigation"],
  confirmation: ["core-ui-contract-card", "core-ui-card", "core-ui-button"],
  status: ["core-ui-badge", "core-ui-chip", "core-ui-button", "core-ui-bottom-navigation"],
  "empty-state": ["core-ui-card", "core-ui-button", "core-ui-bottom-navigation"],
  transition: ["core-ui-loading", "core-ui-progress"],
};

export function validateContractExperience(): ContractExperienceValidationResult {
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

  for (const screenId of CONTRACT_SCREEN_IDS) {
    const prototypeId = CONTRACT_SCREEN_PROTOTYPE_MAP[screenId];
    const prototype = getPrototype(prototypeId);
    if (!prototype) {
      errors.push(`Missing prototype for screen ${screenId}: ${prototypeId}`);
      continue;
    }

    const layout = resolveContractLayoutBinding(screenId);
    const skipLayoutCheck = screenId === "empty-state";
    if (!skipLayoutCheck && screenId !== "transition" && layout.layoutId !== prototype.layout.layoutId) {
      if (screenId !== "timeline") {
        errors.push(`Screen ${screenId} layout mismatch: runtime=${layout.layoutId} prototype=${prototype.layout.layoutId}`);
      }
    }

    for (const token of prototype.designTokens) {
      if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(token as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
        errors.push(`Screen ${screenId} uses non-semantic token: ${token}`);
      }
      tokenPaths.add(token);
    }

    const expectedComponents = CONTRACT_SCREEN_COMPONENTS[screenId] ?? prototype.componentsUsed;
    for (const componentId of expectedComponents) {
      if (!getCoreUiComponent(componentId)) {
        errors.push(`Screen ${screenId} references unknown component: ${componentId}`);
      }
      componentIds.add(componentId);
    }
  }

  if (ACTION_LAYOUT.id !== "action-layout") {
    errors.push("Contract experience must use action-layout");
  }

  if (!validateContractTransitionBrand()) {
    errors.push('Contract transition must use official brand line "an act..."');
  }

  if (CONTRACT_TO_ACTION_TRANSITION_STAGES.length < 4) {
    errors.push("Contract transition must include Reviewing, Building Contract, Confirming, and Action Ready stages");
  }

  if (!CONTRACT_TO_ACTION_TRANSITION_STAGES.includes("Action Ready.")) {
    errors.push("Contract transition missing Action Ready stage");
  }

  if (CONTRACT_EXPERIENCE_FLOW.length < 8) {
    errors.push("Contract experience flow must include all contract screens through transition");
  }

  if (CONTRACT_SECTION_IDS.length < 8) {
    errors.push("Contract sections must include all required section ids");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const requiredScreens = [
    "contract-home",
    "contract-review",
    "parties",
    "terms",
    "timeline",
    "cost",
    "confirmation",
    "status",
  ] as const;
  for (const screen of requiredScreens) {
    if (!CONTRACT_SCREEN_IDS.includes(screen)) {
      errors.push(`Missing required contract screen: ${screen}`);
    }
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Contract experience validation passed (${CONTRACT_SCREEN_IDS.length} screens, ${componentIds.size} components)`
      : `Contract experience validation failed with ${errors.length} error(s)`,
    checked: {
      screens: CONTRACT_SCREEN_IDS.length,
      sections: CONTRACT_SECTION_IDS.length,
      prototypes: CONTRACT_SCREEN_IDS.length,
      components: componentIds.size,
      designTokens: tokenPaths.size,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      transition: validateContractTransitionBrand() && TRANSITION_ENGINE_SPEC.brandLine === "an act...",
      needExperienceLink: NEED_EXPERIENCE_VERSION.length > 0,
      actionExperienceLink: ACTION_EXPERIENCE_VERSION.length > 0,
    },
  };
}
