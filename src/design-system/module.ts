export {
  SEMANTIC_COLOR_GROUPS,
  SEMANTIC_COLOR_TOKEN_PATHS,
  resolveSemanticColor,
  type SemanticColorTokens,
  type SemanticColorTokenPath,
} from "./foundation/colors.js";

export {
  TYPOGRAPHY_STYLES,
  TYPOGRAPHY_TOKENS,
  TERMINAL_TYPOGRAPHY_USAGE,
  type TypographyStyle,
} from "./foundation/typography.js";

export { SPACING_SCALE, SPACING_TOKENS, type SpacingToken, type SpacingTokenName } from "./foundation/spacing.js";
export { RADIUS_TOKENS, type RadiusToken } from "./foundation/radius.js";
export { ELEVATION_LEVELS, ELEVATION_TOKENS, resolveElevation, type ElevationLevel } from "./foundation/elevation.js";
export { SHADOW_TOKENS, shadowTokenToCss, elevationToShadow } from "./foundation/shadows.js";
export { MOTION_DURATIONS, MOTION_EASING, MOTION_TOKENS, resolveMotionToken, motionToCss } from "./foundation/motion.js";
export { ICON_NAMES, ICON_SIZES, resolveIconSize, type IconName, type IconSize } from "./foundation/icons.js";
export {
  AN_ACT_TRANSITION_FLOW,
  NEED_TO_ACTION_TRANSITION,
  ACTION_TO_NEED_TRANSITION,
  resolveTransitionSpec,
  interpolateTransitionBackground,
  type AnActMode,
  type TransitionDirection,
} from "./foundation/transitions.js";

export { NEED_MODE_THEME, NEED_MODE_COLORS } from "./themes/need-mode.js";
export { ACTION_MODE_THEME, ACTION_MODE_COLORS } from "./themes/action-mode.js";

export { BUTTON_SPECS, PRIMARY_BUTTON_SPEC, SECONDARY_BUTTON_SPEC, GHOST_BUTTON_SPEC } from "./components/buttons.js";
export { INPUT_SPECS, TEXT_INPUT_SPEC, SEARCH_INPUT_SPEC } from "./components/inputs.js";
export {
  CARD_SPECS,
  BASE_CARD_SPEC,
  TIMELINE_CARD_SPEC,
  ACHIEVEMENT_CARD_SPEC,
  ANALYTICS_CARD_SPEC,
} from "./components/cards.js";
export { BADGE_SPECS, PROFESSIONAL_BADGE_SPEC } from "./components/badges.js";
export { PROGRESS_SPECS, TERMINAL_PROGRESS_SPEC, LINEAR_PROGRESS_SPEC } from "./components/progress.js";
export { NAVIGATION_SPECS, BOTTOM_NAVIGATION_SPEC, FLOATING_ACTION_BUTTON_SPEC } from "./components/navigation.js";
export { LIVE_FRAME_SPECS, LIVE_FRAME_SPEC } from "./components/live-frame.js";
export { AVATAR_SPECS, AVATAR_SPEC } from "./components/avatar.js";
export { CHIP_COMPONENT } from "./core-ui/components/chip.js";
export { CHIP_SPECS, CHIP_SPEC } from "./components/chips.js";
export { TIMELINE_SPECS } from "./components/timeline.js";

export {
  AN_ACT_DESIGN_SYSTEM_VERSION,
  DESIGN_TOKENS,
  getDesignTokens,
} from "./tokens/design-tokens.js";

export {
  ACCESSIBILITY_RULES,
  ACCESSIBILITY_SPEC,
  DESIGN_SYSTEM_PHILOSOPHY,
  validateDesignSystem,
  getDesignSystemDocumentation,
  type DesignSystemValidationResult,
  type AccessibilitySpec,
} from "./documentation/design-system.js";

import {
  validateDesignSystem,
  getDesignSystemDocumentation,
} from "./documentation/design-system.js";
import { getDesignTokens } from "./tokens/design-tokens.js";

export interface AnActDesignSystemModule {
  validate: typeof validateDesignSystem;
  getTokens: typeof getDesignTokens;
  getDocumentation: typeof getDesignSystemDocumentation;
}

export function createAnActDesignSystemModule(): AnActDesignSystemModule {
  return {
    validate: validateDesignSystem,
    getTokens: getDesignTokens,
    getDocumentation: getDesignSystemDocumentation,
  };
}

export {
  createAnActCoreUiModule,
  validateAllCoreUiComponents,
  CORE_UI_COMPONENT_REGISTRY,
  CORE_UI_SCHEMA_VERSION,
  OFFICIAL_TRANSITION_SCREEN,
  type AnActCoreUiModule,
  type CoreUiComponentDefinition,
} from "./core-ui/module.js";
