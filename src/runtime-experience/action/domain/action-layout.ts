import { ACTION_LAYOUT, ACTION_LAYOUT_TOKENS } from "../../../navigation-framework/layouts/action-layout.js";
import { TRANSITION_LAYOUT, TRANSITION_LAYOUT_SPEC } from "../../../navigation-framework/layouts/transition-layout.js";
import { buildScreenContext, type ScreenContext } from "../../../navigation-framework/foundation/screen-context.js";
import { ACTION_MODE_THEME } from "../../../design-system/themes/action-mode.js";
import type { ActionScreenId } from "./action-screen.js";

export interface ActionLayoutBinding {
  layoutId: string;
  mode: "action" | "transition";
  backgroundToken: string;
  typographyToken: string;
  spacing: typeof ACTION_LAYOUT.spacing;
  typography: typeof ACTION_LAYOUT.typography;
  designTokens: readonly string[];
  regions: readonly string[];
}

export function resolveActionLayoutBinding(screenId: ActionScreenId): ActionLayoutBinding {
  if (screenId === "transition") {
    return {
      layoutId: TRANSITION_LAYOUT.id,
      mode: "transition",
      backgroundToken: TRANSITION_LAYOUT.backgroundToken,
      typographyToken: TRANSITION_LAYOUT.typographyToken,
      spacing: TRANSITION_LAYOUT.spacing,
      typography: TRANSITION_LAYOUT.typography,
      designTokens: TRANSITION_LAYOUT_SPEC.backgroundInterpolation.reverse,
      regions: TRANSITION_LAYOUT.regions.map((r) => r.id),
    };
  }

  return {
    layoutId: ACTION_LAYOUT.id,
    mode: "action",
    backgroundToken: ACTION_LAYOUT.backgroundToken,
    typographyToken: ACTION_LAYOUT.typographyToken,
    spacing: ACTION_LAYOUT.spacing,
    typography: ACTION_LAYOUT.typography,
    designTokens: ACTION_LAYOUT_TOKENS,
    regions: ACTION_LAYOUT.regions.map((r) => r.id),
  };
}

export function buildActionScreenContext(input?: {
  reducedMotion?: boolean;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
}): ScreenContext {
  return buildScreenContext({
    mode: "action",
    reducedMotion: input?.reducedMotion ?? false,
    keyboardNavigation: input?.keyboardNavigation ?? true,
    screenReaderEnabled: input?.screenReaderEnabled ?? true,
  });
}

export function resolveActionThemeColors() {
  return ACTION_MODE_THEME.colors;
}
