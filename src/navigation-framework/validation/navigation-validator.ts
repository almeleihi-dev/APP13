import { SEMANTIC_COLOR_TOKEN_PATHS } from "../../design-system/foundation/colors.js";
import { SPACING_TOKENS } from "../../design-system/foundation/spacing.js";
import { TYPOGRAPHY_STYLES } from "../../design-system/foundation/typography.js";
import { ACCESSIBILITY_RULES } from "../../design-system/documentation/design-system.js";
import { getCoreUiComponent } from "../../design-system/core-ui/registry/component-registry.js";
import { SCREEN_REGIONS, type ScreenLayoutSpec } from "../foundation/screen-schema.js";
import { validateSafeAreaCompliance } from "../foundation/safe-area.js";
import { SCREEN_LAYOUT_REGISTRY, TRANSITION_PATTERN_REGISTRY } from "../registry/screen-registry.js";

export interface NavigationValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    layouts: number;
    regions: number;
    navigationPatterns: number;
    transitionPatterns: number;
  };
}

const REQUIRED_REGIONS = ["safeArea", "statusArea", "contentArea"] as const;

function isSemanticToken(path: string): boolean {
  return SEMANTIC_COLOR_TOKEN_PATHS.includes(path as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number]);
}

function validateLayout(layout: ScreenLayoutSpec, errors: string[], warnings: string[]): void {
  if (!isSemanticToken(layout.backgroundToken)) {
    errors.push(`Layout ${layout.id} uses non-semantic background token: ${layout.backgroundToken}`);
  }
  if (!isSemanticToken(layout.typographyToken)) {
    errors.push(`Layout ${layout.id} uses non-semantic typography token: ${layout.typographyToken}`);
  }

  if (!(layout.spacing.contentPaddingX in SPACING_TOKENS)) {
    errors.push(`Layout ${layout.id} invalid contentPaddingX: ${layout.spacing.contentPaddingX}`);
  }

  if (!TYPOGRAPHY_STYLES.includes(layout.typography.header)) {
    errors.push(`Layout ${layout.id} invalid header typography: ${layout.typography.header}`);
  }

  const regionIds = layout.regions.map((r) => r.id);
  const safeArea = validateSafeAreaCompliance(regionIds);
  if (!safeArea.valid) errors.push(...safeArea.errors.map((e) => `Layout ${layout.id}: ${e}`));

  for (const required of REQUIRED_REGIONS) {
    if (!regionIds.includes(required)) {
      errors.push(`Layout ${layout.id} missing required region: ${required}`);
    }
  }

  for (const region of layout.regions) {
    if (!SCREEN_REGIONS.includes(region.id)) {
      errors.push(`Layout ${layout.id} unknown region: ${region.id}`);
    }
    if (region.coreUiComponentId && !getCoreUiComponent(region.coreUiComponentId)) {
      errors.push(`Layout ${layout.id} region ${region.id} references unknown component: ${region.coreUiComponentId}`);
    }
  }

  if (layout.mode === "need" && layout.backgroundToken !== "background.primary") {
    warnings.push(`Layout ${layout.id} need mode typically uses background.primary`);
  }
}

function validateTransitionCompliance(errors: string[]): void {
  const engine = TRANSITION_PATTERN_REGISTRY.transitionEngine;
  if (engine.brandLine !== "an act...") {
    errors.push('Transition engine brand line must be "an act..."');
  }
  if (!engine.stageTexts.includes("Preparing...")) {
    errors.push("Transition engine must include Preparing... stage");
  }
  if (!engine.stageTexts.includes("Action Ready.")) {
    errors.push("Transition engine must include Action Ready. stage");
  }
  if (engine.supportsReverse !== true) {
    errors.push("Transition engine must support reverse transition");
  }

  const bg = TRANSITION_PATTERN_REGISTRY.backgroundTransition;
  if (bg.forward.length < 3 || bg.reverse.length < 3) {
    errors.push("Background transition must define Need → Transition → Action interpolation");
  }
}

function validateAccessibility(errors: string[], warnings: string[]): void {
  if (ACCESSIBILITY_RULES.minimumTouchTargetPx < 44) {
    errors.push("Accessibility minimum touch target must be at least 44px");
  }
  if (!ACCESSIBILITY_RULES.keyboardNavigationRequired) {
    warnings.push("Keyboard navigation should be required for navigation framework");
  }
  if (!ACCESSIBILITY_RULES.reducedMotionRespected) {
    errors.push("Navigation framework must respect reduced motion");
  }
}

export function validateNavigationFramework(): NavigationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  for (const layout of SCREEN_LAYOUT_REGISTRY) {
    validateLayout(layout, errors, warnings);
  }

  validateTransitionCompliance(errors);
  validateAccessibility(errors, warnings);

  const needLayout = SCREEN_LAYOUT_REGISTRY.find((l) => l.id === "need-layout");
  const actionLayout = SCREEN_LAYOUT_REGISTRY.find((l) => l.id === "action-layout");
  if (!needLayout) errors.push("Need layout is required");
  if (!actionLayout) errors.push("Action layout is required");

  if (needLayout && needLayout.typography.header !== "heading") {
    warnings.push("Need layout typically uses heading typography for screen header");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "AN ACT Navigation Framework validation passed."
        : `Navigation framework validation failed: ${errors.join("; ")}`,
    checked: {
      layouts: SCREEN_LAYOUT_REGISTRY.length,
      regions: SCREEN_REGIONS.length,
      navigationPatterns: 9,
      transitionPatterns: 4,
    },
  };
}

export const NAVIGATION_ACCESSIBILITY_SPEC = {
  keyboardNavigation: {
    tabOrderFollowsLayout: true,
    escapeDismissesModalSheet: true,
    enterActivatesFocusedControl: true,
  },
  focusManagement: {
    trapFocusInModal: true,
    trapFocusInSheet: true,
    restoreFocusOnDismiss: true,
    visibleFocusRing: true,
    focusRingToken: "border.focus" as const,
  },
  reducedMotion: {
    skipTransitionAnimations: true,
    preserveProgressUpdates: true,
    instantBackgroundChange: true,
  },
  screenReader: {
    landmarkRegions: SCREEN_REGIONS,
    announceTransitionStages: true,
    labelNavigationItems: true,
  },
  minimumTouchTargetPx: ACCESSIBILITY_RULES.minimumTouchTargetPx,
} as const;
