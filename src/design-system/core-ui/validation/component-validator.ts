import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../foundation/colors.js";
import { SPACING_TOKENS } from "../../foundation/spacing.js";
import { TYPOGRAPHY_STYLES } from "../../foundation/typography.js";
import { ELEVATION_LEVELS } from "../../foundation/elevation.js";
import { MOTION_DURATIONS } from "../../foundation/motion.js";
import { ACCESSIBILITY_RULES } from "../../documentation/design-system.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";
import { CORE_UI_COMPONENT_REGISTRY } from "../registry/component-registry.js";

export interface ComponentValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    components: number;
    tokenReferences: number;
    spacingReferences: number;
    typographyReferences: number;
  };
}

const REQUIRED_FIELDS: (keyof CoreUiComponentDefinition)[] = [
  "id",
  "name",
  "purpose",
  "variants",
  "visualStates",
  "interactionStates",
  "accessibility",
  "designTokens",
  "spacing",
  "typography",
  "radius",
  "elevation",
  "motion",
  "responsive",
];

function isSemanticColorToken(path: string): boolean {
  return SEMANTIC_COLOR_TOKEN_PATHS.includes(path as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number]);
}

function validateComponent(definition: CoreUiComponentDefinition, errors: string[], warnings: string[]): void {
  for (const field of REQUIRED_FIELDS) {
    if (definition[field] === undefined || definition[field] === null) {
      errors.push(`Component ${definition.id} missing required field: ${field}`);
    }
  }

  if (definition.variants.length === 0) {
    errors.push(`Component ${definition.id} must define at least one variant`);
  }

  for (const variant of definition.variants) {
    for (const [key, token] of Object.entries(variant.colors)) {
      if (token && !isSemanticColorToken(token)) {
        errors.push(`Component ${definition.id} variant ${variant.id} uses non-semantic color: ${key}=${token}`);
      }
    }
  }

  for (const token of definition.designTokens) {
    if (!isSemanticColorToken(token)) {
      errors.push(`Component ${definition.id} designTokens includes non-semantic color: ${token}`);
    }
  }

  const spacingValues = [definition.spacing.paddingX, definition.spacing.paddingY, definition.spacing.gap].filter(Boolean);
  for (const spacing of spacingValues) {
    if (spacing && !(spacing in SPACING_TOKENS)) {
      errors.push(`Component ${definition.id} uses invalid spacing token: ${spacing}`);
    }
  }

  if (!TYPOGRAPHY_STYLES.includes(definition.typography.primary)) {
    errors.push(`Component ${definition.id} uses invalid typography: ${definition.typography.primary}`);
  }
  if (definition.typography.secondary && !TYPOGRAPHY_STYLES.includes(definition.typography.secondary)) {
    errors.push(`Component ${definition.id} uses invalid secondary typography: ${definition.typography.secondary}`);
  }

  if (!ELEVATION_LEVELS.includes(definition.elevation)) {
    errors.push(`Component ${definition.id} uses invalid elevation: ${definition.elevation}`);
  }

  if (!(definition.motion.duration in MOTION_DURATIONS)) {
    errors.push(`Component ${definition.id} uses invalid motion duration: ${definition.motion.duration}`);
  }

  if (definition.accessibility.minimumTouchTargetPx < ACCESSIBILITY_RULES.minimumTouchTargetPx) {
    const interactive = definition.category === "input" || definition.category === "navigation";
    if (interactive && definition.spacing.minHeight < ACCESSIBILITY_RULES.minimumTouchTargetPx) {
      warnings.push(`Component ${definition.id} minHeight below recommended touch target`);
    }
  }

  if (definition.visualStates.length === 0) {
    errors.push(`Component ${definition.id} must define visual states`);
  }

  if (definition.interactionStates.length === 0) {
    errors.push(`Component ${definition.id} must define interaction states`);
  }

  if (definition.accessibility.requiresFocusRing && !definition.visualStates.some((s) => s.id === "focused")) {
    warnings.push(`Component ${definition.id} requires focus ring but has no focused visual state`);
  }
}

export function validateCoreUiComponent(definition: CoreUiComponentDefinition): ComponentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  validateComponent(definition, errors, warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length === 0 ? `Component ${definition.id} is valid.` : `Component ${definition.id} failed validation.`,
    checked: {
      components: 1,
      tokenReferences: definition.designTokens.length,
      spacingReferences: 2,
      typographyReferences: definition.typography.secondary ? 2 : 1,
    },
  };
}

export function validateAllCoreUiComponents(): ComponentValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let tokenReferences = 0;
  let spacingReferences = 0;
  let typographyReferences = 0;

  for (const definition of CORE_UI_COMPONENT_REGISTRY) {
    validateComponent(definition, errors, warnings);
    tokenReferences += definition.designTokens.length;
    spacingReferences += 2;
    typographyReferences += definition.typography.secondary ? 2 : 1;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? `All ${CORE_UI_COMPONENT_REGISTRY.length} core UI components validated successfully.`
        : `Core UI validation failed: ${errors.join("; ")}`,
    checked: {
      components: CORE_UI_COMPONENT_REGISTRY.length,
      tokenReferences,
      spacingReferences,
      typographyReferences,
    },
  };
}
