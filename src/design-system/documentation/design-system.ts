import type { SemanticColorTokens } from "../foundation/colors.js";
import { SEMANTIC_COLOR_TOKEN_PATHS, resolveSemanticColor } from "../foundation/colors.js";
import { SPACING_SCALE } from "../foundation/spacing.js";
import { RADIUS_TOKENS } from "../foundation/radius.js";
import { TYPOGRAPHY_STYLES } from "../foundation/typography.js";
import { MOTION_DURATIONS } from "../foundation/motion.js";
import { ELEVATION_LEVELS } from "../foundation/elevation.js";
import { DESIGN_TOKENS } from "../tokens/design-tokens.js";
import type { ComponentSpec } from "../components/buttons.js";

export const ACCESSIBILITY_RULES = {
  minimumTouchTargetPx: 44,
  minimumContrastRatioNormalText: 4.5,
  minimumContrastRatioLargeText: 3,
  focusRingWidthPx: 2,
  focusRingOffsetPx: 2,
  keyboardNavigationRequired: true,
  reducedMotionRespected: true,
} as const;

export interface AccessibilitySpec {
  rules: typeof ACCESSIBILITY_RULES;
  focusState: {
    ringColorToken: "border.focus";
    ringWidthPx: number;
    ringOffsetPx: number;
  };
  keyboardNavigation: {
    tabOrderLogical: true;
    escapeDismissesOverlays: true;
    enterActivatesPrimary: true;
  };
  motionReduction: {
    disableAnimations: true;
    preserveOpacityTransitions: true;
    fallbackDurationMs: 0;
  };
}

export const ACCESSIBILITY_SPEC: AccessibilitySpec = {
  rules: ACCESSIBILITY_RULES,
  focusState: {
    ringColorToken: "border.focus",
    ringWidthPx: ACCESSIBILITY_RULES.focusRingWidthPx,
    ringOffsetPx: ACCESSIBILITY_RULES.focusRingOffsetPx,
  },
  keyboardNavigation: {
    tabOrderLogical: true,
    escapeDismissesOverlays: true,
    enterActivatesPrimary: true,
  },
  motionReduction: {
    disableAnimations: true,
    preserveOpacityTransitions: true,
    fallbackDurationMs: 0,
  },
};

export interface DesignSystemValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    semanticColorPaths: number;
    spacingScale: number;
    typographyStyles: number;
    motionDurations: number;
    elevationLevels: number;
    radiusTokens: number;
    components: number;
    themes: number;
  };
}

function collectComponentSpecs(): ComponentSpec[] {
  const { components } = DESIGN_TOKENS;
  return [
    ...Object.values(components.buttons),
    ...Object.values(components.inputs),
    ...Object.values(components.cards),
    ...Object.values(components.badges),
    ...Object.values(components.navigation),
    ...Object.values(components.liveFrame),
    ...Object.values(components.avatar),
    ...Object.values(components.chips),
    ...Object.values(components.timeline),
  ];
}

function validateThemeColors(name: string, colors: SemanticColorTokens, errors: string[]): void {
  for (const path of SEMANTIC_COLOR_TOKEN_PATHS) {
    try {
      resolveSemanticColor(colors, path);
    } catch {
      errors.push(`${name} theme missing semantic color: ${path}`);
    }
  }
}

function validateComponentUsesSemanticTokens(spec: ComponentSpec, errors: string[]): void {
  const colorRefs = [
    spec.colors.background,
    spec.colors.text,
    spec.colors.border,
    spec.colors.accent,
  ].filter(Boolean) as string[];

  for (const ref of colorRefs) {
    if (!SEMANTIC_COLOR_TOKEN_PATHS.includes(ref as (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number])) {
      errors.push(`Component ${spec.id} uses non-semantic color reference: ${ref}`);
    }
  }

  if (spec.minHeight < ACCESSIBILITY_RULES.minimumTouchTargetPx && spec.id.includes("button")) {
    errors.push(`Component ${spec.id} minHeight ${spec.minHeight} below touch target minimum`);
  }
}

export function validateDesignSystem(): DesignSystemValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (SPACING_SCALE.length !== 10) {
    errors.push(`Spacing scale must contain 10 values, found ${SPACING_SCALE.length}`);
  }

  const expectedSpacing = [4, 8, 12, 16, 20, 24, 32, 40, 48, 64];
  if (!expectedSpacing.every((v, i) => SPACING_SCALE[i] === v)) {
    errors.push("Spacing scale does not match required AN ACT scale");
  }

  if (TYPOGRAPHY_STYLES.length !== 7) {
    errors.push(`Typography must define 7 styles, found ${TYPOGRAPHY_STYLES.length}`);
  }

  if (!TYPOGRAPHY_STYLES.includes("terminal")) {
    errors.push("Terminal typography style is required for an act... transitions");
  }

  const radiusKeys = Object.keys(RADIUS_TOKENS);
  for (const required of ["small", "medium", "large", "extraLarge", "pill", "circle"]) {
    if (!radiusKeys.includes(required)) {
      errors.push(`Missing radius token: ${required}`);
    }
  }

  if (Object.keys(MOTION_DURATIONS).length !== 4) {
    errors.push("Motion system must define Fast, Normal, Slow, Extra Slow durations");
  }

  validateThemeColors("need", DESIGN_TOKENS.colors.themes.need, errors);
  validateThemeColors("action", DESIGN_TOKENS.colors.themes.action, errors);

  const needBg = DESIGN_TOKENS.colors.themes.need.background.primary;
  const needText = DESIGN_TOKENS.colors.themes.need.text.primary;
  const actionBg = DESIGN_TOKENS.colors.themes.action.background.primary;
  const actionText = DESIGN_TOKENS.colors.themes.action.text.primary;

  if (needBg !== "#FFFFFF") warnings.push("Need Mode background.primary should be white");
  if (needText !== "#000000") warnings.push("Need Mode text.primary should be black");
  if (actionBg !== "#000000") warnings.push("Action Mode background.primary should be black");
  if (actionText !== "#FFFFFF") warnings.push("Action Mode text.primary should be white");

  const components = collectComponentSpecs();
  for (const spec of components) {
    validateComponentUsesSemanticTokens(spec, errors);
  }

  const transition = DESIGN_TOKENS.transitions.forward;
  if (transition.brandLine !== "an act...") {
    errors.push('Transition brand line must be "an act..."');
  }
  if (transition.statusLine !== "Preparing...") {
    errors.push('Transition status line must be "Preparing..."');
  }
  if (transition.backgroundSteps.length < 3) {
    errors.push("Transition must define white → gray → black background interpolation");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary:
      errors.length === 0
        ? "AN ACT Design System validation passed."
        : `AN ACT Design System validation failed: ${errors.join("; ")}`,
    checked: {
      semanticColorPaths: SEMANTIC_COLOR_TOKEN_PATHS.length,
      spacingScale: SPACING_SCALE.length,
      typographyStyles: TYPOGRAPHY_STYLES.length,
      motionDurations: Object.keys(MOTION_DURATIONS).length,
      elevationLevels: ELEVATION_LEVELS.length,
      radiusTokens: Object.keys(RADIUS_TOKENS).length,
      components: components.length,
      themes: 2,
    },
  };
}

export const DESIGN_SYSTEM_PHILOSOPHY = {
  name: "AN ACT Design System",
  version: DESIGN_TOKENS.version,
  principles: [
    "Framework-independent token definitions",
    "Semantic colors only — no hardcoded UI colors in components",
    "Need Mode and Action Mode as dual operating contexts",
    "Deterministic transitions between modes",
    "Accessibility by default",
    "Future extensibility through token layers",
  ],
  modes: {
    need: "Reflective planning — white surfaces, black typography, blue accents",
    action: "Execution focus — black surfaces, white typography, blue highlights",
  },
  transitionPhilosophy:
    "Official AN ACT transition uses terminal typography, an act... brand line, Preparing... status, and background interpolation through semantic transition tokens.",
} as const;

export function getDesignSystemDocumentation() {
  return {
    ...DESIGN_SYSTEM_PHILOSOPHY,
    accessibility: ACCESSIBILITY_SPEC,
    tokens: {
      colorGroups: DESIGN_TOKENS.colors.semanticGroups,
      typographyStyles: TYPOGRAPHY_STYLES,
      spacingScale: SPACING_SCALE,
      radiusTokens: Object.keys(RADIUS_TOKENS),
      motionDurations: Object.keys(MOTION_DURATIONS),
      elevationLevels: ELEVATION_LEVELS,
    },
    components: collectComponentSpecs().map((c) => ({ id: c.id, name: c.name })),
    validation: validateDesignSystem(),
  };
}
