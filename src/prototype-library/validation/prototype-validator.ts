import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../design-system/foundation/colors.js";
import { SPACING_TOKENS } from "../../design-system/foundation/spacing.js";
import { TYPOGRAPHY_STYLES } from "../../design-system/foundation/typography.js";
import { getCoreUiComponent } from "../../design-system/core-ui/registry/component-registry.js";
import { getScreenLayout } from "../../navigation-framework/registry/screen-registry.js";
import { validateNavigationFramework } from "../../navigation-framework/validation/navigation-validator.js";
import type { VisualPrototypeSpec, VisualFlowSpec } from "../foundation/prototype-schema.js";
import { OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";
import {
  PROTOTYPE_REGISTRY,
  FLOW_REGISTRY,
  getPrototype,
} from "../registry/prototype-registry.js";

export interface PrototypeValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    prototypes: number;
    flows: number;
    components: number;
    layouts: number;
  };
}

const REQUIRED_PROTOTYPE_FIELDS: (keyof VisualPrototypeSpec)[] = [
  "id",
  "name",
  "purpose",
  "layout",
  "navigation",
  "mode",
  "componentsUsed",
  "typography",
  "spacing",
  "motion",
  "transitionBehavior",
  "accessibility",
  "responsive",
  "designTokens",
];

function isSemanticToken(path: string): boolean {
  return SEMANTIC_COLOR_TOKEN_PATHS.includes(path as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number]);
}

function validatePrototype(prototype: VisualPrototypeSpec, errors: string[], warnings: string[]): void {
  for (const field of REQUIRED_PROTOTYPE_FIELDS) {
    if (prototype[field] === undefined) {
      errors.push(`Prototype ${prototype.id} missing field: ${field}`);
    }
  }

  const layout = getScreenLayout(prototype.layout.layoutId);
  if (!layout) {
    errors.push(`Prototype ${prototype.id} references unknown layout: ${prototype.layout.layoutId}`);
  }

  for (const token of prototype.designTokens) {
    if (!isSemanticToken(token)) {
      errors.push(`Prototype ${prototype.id} uses non-semantic token: ${token}`);
    }
  }

  for (const componentId of prototype.componentsUsed) {
    if (!getCoreUiComponent(componentId)) {
      errors.push(`Prototype ${prototype.id} references unknown component: ${componentId}`);
    }
  }

  if (!(prototype.spacing.contentPaddingX in SPACING_TOKENS)) {
    errors.push(`Prototype ${prototype.id} invalid spacing token: ${prototype.spacing.contentPaddingX}`);
  }

  if (!TYPOGRAPHY_STYLES.includes(prototype.typography.header)) {
    errors.push(`Prototype ${prototype.id} invalid header typography: ${prototype.typography.header}`);
  }

  if (prototype.accessibility.minimumTouchTargetPx < 44) {
    warnings.push(`Prototype ${prototype.id} touch target below 44px recommendation`);
  }

  if (prototype.transitionBehavior.usesOfficialTransition) {
    if (prototype.transitionBehavior.brandLine !== OFFICIAL_TRANSITION_SPEC.brandLine) {
      errors.push(`Prototype ${prototype.id} transition must use brand line "an act..."`);
    }
    if (!prototype.transitionBehavior.stageTexts?.includes("Preparing...")) {
      errors.push(`Prototype ${prototype.id} transition missing Preparing... stage`);
    }
    if (!prototype.transitionBehavior.progressVariant) {
      errors.push(`Prototype ${prototype.id} transition missing progress variant`);
    }
  }
}

function validateFlow(flow: VisualFlowSpec, errors: string[]): void {
  if (flow.steps.length < 2) {
    errors.push(`Flow ${flow.id} must have at least 2 steps`);
  }
  for (const step of flow.steps) {
    if (!getPrototype(step.screenId)) {
      errors.push(`Flow ${flow.id} references unknown screen: ${step.screenId}`);
    }
  }
}

export function validatePrototypeLibrary(): PrototypeValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const navValidation = validateNavigationFramework();
  if (!navValidation.valid) {
    errors.push(...navValidation.errors.map((e) => `Navigation: ${e}`));
  }

  let componentRefs = 0;
  const layoutIds = new Set<string>();

  for (const prototype of PROTOTYPE_REGISTRY) {
    validatePrototype(prototype, errors, warnings);
    componentRefs += prototype.componentsUsed.length;
    layoutIds.add(prototype.layout.layoutId);
  }

  for (const flow of FLOW_REGISTRY) {
    validateFlow(flow, errors);
  }

  const requiredScreens = [
    "prototype-need-home",
    "prototype-search",
    "prototype-request",
    "prototype-opportunity-list",
    "prototype-empty-state",
    "prototype-action-home",
    "prototype-contract",
    "prototype-active-action",
    "prototype-completion",
    "prototype-success",
    "prototype-transition",
    "prototype-chat",
    "prototype-timeline",
    "prototype-analytics",
    "prototype-profile",
    "prototype-notification",
    "prototype-loading",
    "prototype-error",
  ];

  for (const id of requiredScreens) {
    if (!getPrototype(id)) errors.push(`Missing required prototype: ${id}`);
  }

  const transitionProto = getPrototype("prototype-transition");
  if (transitionProto && !transitionProto.componentsUsed.includes("core-ui-loading")) {
    errors.push("Transition prototype must use core-ui-loading");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? `All ${PROTOTYPE_REGISTRY.length} prototypes and ${FLOW_REGISTRY.length} flows validated.`
        : `Prototype library validation failed: ${errors.join("; ")}`,
    checked: {
      prototypes: PROTOTYPE_REGISTRY.length,
      flows: FLOW_REGISTRY.length,
      components: componentRefs,
      layouts: layoutIds.size,
    },
  };
}

export function validateAllFlows(): PrototypeValidationResult {
  const errors: string[] = [];
  for (const flow of FLOW_REGISTRY) validateFlow(flow, errors);
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    summary: errors.length === 0 ? "All flows validated." : `Flow validation failed: ${errors.join("; ")}`,
    checked: { prototypes: 0, flows: FLOW_REGISTRY.length, components: 0, layouts: 0 },
  };
}
