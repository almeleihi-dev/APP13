import { NEED_LAYOUT, NEED_LAYOUT_TOKENS } from "../../../navigation-framework/layouts/need-layout.js";
import { TRANSITION_LAYOUT, TRANSITION_LAYOUT_SPEC } from "../../../navigation-framework/layouts/transition-layout.js";
import { buildScreenContext, type ScreenContext } from "../../../navigation-framework/foundation/screen-context.js";
import { NEED_MODE_THEME } from "../../../design-system/themes/need-mode.js";
import type { NeedScreenId } from "./need-screen.js";

export interface NeedLayoutBinding {
  layoutId: string;
  mode: "need" | "transition";
  backgroundToken: string;
  typographyToken: string;
  spacing: typeof NEED_LAYOUT.spacing;
  typography: typeof NEED_LAYOUT.typography;
  designTokens: readonly string[];
  regions: readonly string[];
}

export function resolveNeedLayoutBinding(screenId: NeedScreenId): NeedLayoutBinding {
  if (screenId === "transition") {
    return {
      layoutId: TRANSITION_LAYOUT.id,
      mode: "transition",
      backgroundToken: TRANSITION_LAYOUT.backgroundToken,
      typographyToken: TRANSITION_LAYOUT.typographyToken,
      spacing: TRANSITION_LAYOUT.spacing,
      typography: TRANSITION_LAYOUT.typography,
      designTokens: TRANSITION_LAYOUT_SPEC.backgroundInterpolation.forward,
      regions: TRANSITION_LAYOUT.regions.map((r) => r.id),
    };
  }

  return {
    layoutId: NEED_LAYOUT.id,
    mode: "need",
    backgroundToken: NEED_LAYOUT.backgroundToken,
    typographyToken: NEED_LAYOUT.typographyToken,
    spacing: NEED_LAYOUT.spacing,
    typography: NEED_LAYOUT.typography,
    designTokens: NEED_LAYOUT_TOKENS,
    regions: NEED_LAYOUT.regions.map((r) => r.id),
  };
}

export function buildNeedScreenContext(input?: {
  reducedMotion?: boolean;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
}): ScreenContext {
  return buildScreenContext({
    mode: "need",
    reducedMotion: input?.reducedMotion ?? false,
    keyboardNavigation: input?.keyboardNavigation ?? true,
    screenReaderEnabled: input?.screenReaderEnabled ?? true,
  });
}

export function resolveNeedThemeColors() {
  return NEED_MODE_THEME.colors;
}
