import type { SemanticColorTokenPath } from "../../foundation/colors.js";
import type { SpacingTokenName } from "../../foundation/spacing.js";
import type { TypographyStyle } from "../../foundation/typography.js";
import type { RadiusToken } from "../../foundation/radius.js";
import type { ElevationLevel } from "../../foundation/elevation.js";
import type { MotionDuration } from "../../foundation/motion.js";

export const CORE_UI_SCHEMA_VERSION = "an-act-core-ui-v1" as const;

export type VisualState = "default" | "hover" | "pressed" | "focused" | "loading" | "disabled";
export type InteractionState = VisualState | "empty" | "typing" | "valid" | "invalid" | "readonly";

export interface ComponentAccessibilityRules {
  minimumTouchTargetPx: number;
  requiresLabel: boolean;
  requiresFocusRing: boolean;
  supportsKeyboardActivation: boolean;
  ariaRole?: string;
  reducedMotionFallback: boolean;
}

export interface ComponentSpacingSpec {
  paddingX: SpacingTokenName;
  paddingY: SpacingTokenName;
  gap?: SpacingTokenName;
  minHeight: number;
  minWidth?: number;
}

export interface ComponentTypographySpec {
  primary: TypographyStyle;
  secondary?: TypographyStyle;
}

export interface ComponentMotionSpec {
  duration: MotionDuration;
  properties: string[];
}

export interface ResponsiveBehavior {
  compact: { minHeight?: number; paddingX?: SpacingTokenName; paddingY?: SpacingTokenName };
  regular: { minHeight?: number; paddingX?: SpacingTokenName; paddingY?: SpacingTokenName };
  expanded: { minHeight?: number; paddingX?: SpacingTokenName; paddingY?: SpacingTokenName };
}

export interface ComponentVariantSpec {
  id: string;
  name: string;
  colors: {
    background: SemanticColorTokenPath;
    text: SemanticColorTokenPath;
    border?: SemanticColorTokenPath;
    accent?: SemanticColorTokenPath;
  };
}

export interface ComponentStateSpec {
  id: InteractionState;
  colorOverrides?: Partial<ComponentVariantSpec["colors"]>;
  motion?: MotionDuration;
  elevation?: ElevationLevel;
}

export interface CoreUiComponentDefinition {
  id: string;
  name: string;
  purpose: string;
  category: string;
  variants: ComponentVariantSpec[];
  visualStates: ComponentStateSpec[];
  interactionStates: ComponentStateSpec[];
  accessibility: ComponentAccessibilityRules;
  designTokens: SemanticColorTokenPath[];
  spacing: ComponentSpacingSpec;
  typography: ComponentTypographySpec;
  radius: RadiusToken;
  elevation: ElevationLevel;
  motion: ComponentMotionSpec;
  responsive: ResponsiveBehavior;
}

export function collectDesignTokens(definition: CoreUiComponentDefinition): SemanticColorTokenPath[] {
  const tokens = new Set<SemanticColorTokenPath>(definition.designTokens);
  for (const variant of definition.variants) {
    tokens.add(variant.colors.background);
    tokens.add(variant.colors.text);
    if (variant.colors.border) tokens.add(variant.colors.border);
    if (variant.colors.accent) tokens.add(variant.colors.accent);
  }
  return [...tokens];
}

export const STANDARD_VISUAL_STATES: ComponentStateSpec[] = [
  { id: "default" },
  { id: "hover", motion: "fast" },
  { id: "pressed", motion: "fast", elevation: "none" },
  { id: "focused", elevation: "low" },
  { id: "loading", motion: "normal" },
  { id: "disabled", motion: "fast", elevation: "none" },
];

export const STANDARD_INPUT_STATES: ComponentStateSpec[] = [
  { id: "empty" },
  { id: "typing", motion: "fast" },
  { id: "valid" },
  { id: "invalid" },
  { id: "disabled", elevation: "none" },
  { id: "readonly", elevation: "none" },
];

export const DEFAULT_ACCESSIBILITY: ComponentAccessibilityRules = {
  minimumTouchTargetPx: 44,
  requiresLabel: true,
  requiresFocusRing: true,
  supportsKeyboardActivation: true,
  reducedMotionFallback: true,
};

export const DEFAULT_RESPONSIVE: ResponsiveBehavior = {
  compact: { paddingX: "space-12", paddingY: "space-8" },
  regular: { paddingX: "space-16", paddingY: "space-12" },
  expanded: { paddingX: "space-24", paddingY: "space-16" },
};
