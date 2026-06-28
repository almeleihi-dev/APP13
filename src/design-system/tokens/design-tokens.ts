import {
  SEMANTIC_COLOR_GROUPS,
  SEMANTIC_COLOR_TOKEN_PATHS,
  type SemanticColorTokens,
} from "../foundation/colors.js";
import { TYPOGRAPHY_STYLES, TYPOGRAPHY_TOKENS } from "../foundation/typography.js";
import { SPACING_SCALE, SPACING_TOKENS } from "../foundation/spacing.js";
import { RADIUS_TOKENS } from "../foundation/radius.js";
import { ELEVATION_LEVELS, ELEVATION_TOKENS } from "../foundation/elevation.js";
import { SHADOW_TOKENS } from "../foundation/shadows.js";
import { MOTION_DURATIONS, MOTION_EASING, MOTION_TOKENS } from "../foundation/motion.js";
import { ICON_NAMES, ICON_SIZES } from "../foundation/icons.js";
import { NEED_MODE_THEME } from "../themes/need-mode.js";
import { ACTION_MODE_THEME } from "../themes/action-mode.js";
import { AN_ACT_TRANSITION_FLOW } from "../foundation/transitions.js";
import { BUTTON_SPECS } from "../components/buttons.js";
import { INPUT_SPECS } from "../components/inputs.js";
import { CARD_SPECS } from "../components/cards.js";
import { BADGE_SPECS } from "../components/badges.js";
import { PROGRESS_SPECS } from "../components/progress.js";
import { NAVIGATION_SPECS } from "../components/navigation.js";
import { LIVE_FRAME_SPECS } from "../components/live-frame.js";
import { AVATAR_SPECS } from "../components/avatar.js";
import { CHIP_SPECS } from "../components/chips.js";
import { TIMELINE_SPECS } from "../components/timeline.js";

export const AN_ACT_DESIGN_SYSTEM_VERSION = "an-act-design-system-v1" as const;

export interface DesignTokens {
  version: typeof AN_ACT_DESIGN_SYSTEM_VERSION;
  colors: {
    semanticGroups: typeof SEMANTIC_COLOR_GROUPS;
    semanticPaths: typeof SEMANTIC_COLOR_TOKEN_PATHS;
    themes: {
      need: SemanticColorTokens;
      action: SemanticColorTokens;
    };
  };
  typography: typeof TYPOGRAPHY_TOKENS;
  spacing: typeof SPACING_TOKENS;
  radius: typeof RADIUS_TOKENS;
  elevation: typeof ELEVATION_TOKENS;
  shadows: typeof SHADOW_TOKENS;
  motion: {
    durations: typeof MOTION_DURATIONS;
    easing: typeof MOTION_EASING;
    tokens: typeof MOTION_TOKENS;
  };
  icons: {
    names: typeof ICON_NAMES;
    sizes: typeof ICON_SIZES;
  };
  transitions: typeof AN_ACT_TRANSITION_FLOW;
  components: {
    buttons: typeof BUTTON_SPECS;
    inputs: typeof INPUT_SPECS;
    cards: typeof CARD_SPECS;
    badges: typeof BADGE_SPECS;
    progress: typeof PROGRESS_SPECS;
    navigation: typeof NAVIGATION_SPECS;
    liveFrame: typeof LIVE_FRAME_SPECS;
    avatar: typeof AVATAR_SPECS;
    chips: typeof CHIP_SPECS;
    timeline: typeof TIMELINE_SPECS;
  };
}

export const DESIGN_TOKENS: DesignTokens = {
  version: AN_ACT_DESIGN_SYSTEM_VERSION,
  colors: {
    semanticGroups: SEMANTIC_COLOR_GROUPS,
    semanticPaths: SEMANTIC_COLOR_TOKEN_PATHS,
    themes: {
      need: NEED_MODE_THEME.colors,
      action: ACTION_MODE_THEME.colors,
    },
  },
  typography: TYPOGRAPHY_TOKENS,
  spacing: SPACING_TOKENS,
  radius: RADIUS_TOKENS,
  elevation: ELEVATION_TOKENS,
  shadows: SHADOW_TOKENS,
  motion: {
    durations: MOTION_DURATIONS,
    easing: MOTION_EASING,
    tokens: MOTION_TOKENS,
  },
  icons: {
    names: ICON_NAMES,
    sizes: ICON_SIZES,
  },
  transitions: AN_ACT_TRANSITION_FLOW,
  components: {
    buttons: BUTTON_SPECS,
    inputs: INPUT_SPECS,
    cards: CARD_SPECS,
    badges: BADGE_SPECS,
    progress: PROGRESS_SPECS,
    navigation: NAVIGATION_SPECS,
    liveFrame: LIVE_FRAME_SPECS,
    avatar: AVATAR_SPECS,
    chips: CHIP_SPECS,
    timeline: TIMELINE_SPECS,
  },
};

export function getDesignTokens(): DesignTokens {
  return DESIGN_TOKENS;
}

export {
  TYPOGRAPHY_STYLES,
  SPACING_SCALE,
  RADIUS_TOKENS,
  ELEVATION_LEVELS,
  MOTION_DURATIONS,
  ICON_NAMES,
};
