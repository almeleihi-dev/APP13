import type { SemanticColorTokenPath } from "../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../design-system/foundation/typography.js";
import type { MotionDuration } from "../../design-system/foundation/motion.js";
import type { AnActMode } from "../../design-system/foundation/transitions.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../navigation-framework/validation/navigation-validator.js";

export const PROTOTYPE_LIBRARY_VERSION = "an-act-prototype-library-v1" as const;

export type PrototypeMode = AnActMode | "transition" | "shared" | "system";
export type PrototypeCategory = "need" | "action" | "shared" | "system";

export interface PrototypeAccessibilityRules {
  minimumTouchTargetPx: number;
  requiresLabels: boolean;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotionFallback: boolean;
  landmarkRegions: readonly string[];
}

export interface PrototypeResponsiveBehavior {
  compact: { columns: number; showsBottomNav: boolean };
  regular: { columns: number; showsBottomNav: boolean };
  expanded: { columns: number; showsSideNav: boolean };
}

export interface PrototypeTransitionBehavior {
  usesOfficialTransition: boolean;
  direction?: "need-to-action" | "action-to-need";
  brandLine?: string;
  stageTexts?: readonly string[];
  progressVariant?: "terminal" | "linear" | "circular";
}

export interface PrototypeNavigationSpec {
  layoutId: string;
  topNavigation: boolean;
  bottomNavigation: boolean;
  sideNavigation: boolean;
  floatingAction: boolean;
  backBehavior?: "pop-stack" | "dismiss-modal" | "close-sheet";
  route: string;
}

export interface VisualPrototypeSpec {
  id: string;
  name: string;
  purpose: string;
  category: PrototypeCategory;
  mode: PrototypeMode;
  layout: PrototypeNavigationSpec;
  navigation: {
    pattern: "stack" | "modal" | "sheet" | "tab";
    parentScreenId?: string;
    relatedScreenIds: string[];
  };
  componentsUsed: string[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  motion: MotionDuration;
  transitionBehavior: PrototypeTransitionBehavior;
  accessibility: PrototypeAccessibilityRules;
  responsive: PrototypeResponsiveBehavior;
  designTokens: SemanticColorTokenPath[];
}

export interface VisualFlowStep {
  screenId: string;
  label: string;
  transitionStageText?: string;
  modeTransition?: "need-to-action" | "action-to-need";
}

export interface VisualFlowSpec {
  id: string;
  name: string;
  purpose: string;
  steps: VisualFlowStep[];
}

export const DEFAULT_PROTOTYPE_ACCESSIBILITY: PrototypeAccessibilityRules = {
  minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
  requiresLabels: true,
  supportsKeyboardNavigation: true,
  supportsScreenReader: true,
  reducedMotionFallback: true,
  landmarkRegions: NAVIGATION_ACCESSIBILITY_SPEC.screenReader.landmarkRegions,
};

export function buildPrototypeSpec(input: Omit<VisualPrototypeSpec, "accessibility"> & {
  accessibility?: Partial<PrototypeAccessibilityRules>;
}): VisualPrototypeSpec {
  return {
    ...input,
    accessibility: { ...DEFAULT_PROTOTYPE_ACCESSIBILITY, ...input.accessibility },
  };
}

export const OFFICIAL_TRANSITION_SPEC = {
  brandLine: "an act...",
  stageTexts: ["Preparing...", "Matching...", "Building Contract...", "Securing...", "Action Ready."] as const,
  forward: "need-to-action" as const,
  reverse: "action-to-need" as const,
  progressVariant: "terminal" as const,
};
