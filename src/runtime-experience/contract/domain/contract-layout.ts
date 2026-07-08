import { ACTION_LAYOUT, ACTION_LAYOUT_TOKENS } from "../../../navigation-framework/layouts/action-layout.js";
import { TRANSITION_LAYOUT, TRANSITION_LAYOUT_SPEC } from "../../../navigation-framework/layouts/transition-layout.js";
import { buildScreenContext, type ScreenContext } from "../../../navigation-framework/foundation/screen-context.js";
import { ACTION_MODE_THEME } from "../../../design-system/themes/action-mode.js";
import type { ContractScreenId } from "./contract-screen.js";

export interface ContractLayoutBinding {
  layoutId: string;
  mode: "action" | "transition";
  backgroundToken: string;
  typographyToken: string;
  spacing: typeof ACTION_LAYOUT.spacing;
  typography: typeof ACTION_LAYOUT.typography;
  designTokens: readonly string[];
  regions: readonly string[];
}

export function resolveContractLayoutBinding(screenId: ContractScreenId): ContractLayoutBinding {
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

export function buildContractScreenContext(input?: {
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

export function resolveContractThemeColors() {
  return ACTION_MODE_THEME.colors;
}
