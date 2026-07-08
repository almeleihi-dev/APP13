import type { AnActMode } from "../../design-system/foundation/transitions.js";
import { NEED_MODE_THEME } from "../../design-system/themes/need-mode.js";
import { ACTION_MODE_THEME } from "../../design-system/themes/action-mode.js";
import type { SemanticColorTokens } from "../../design-system/foundation/colors.js";

export interface ScreenContext {
  mode: AnActMode;
  colors: SemanticColorTokens;
  reducedMotion: boolean;
  keyboardNavigation: boolean;
  screenReaderEnabled: boolean;
}

export function buildScreenContext(input?: {
  mode?: AnActMode;
  reducedMotion?: boolean;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
}): ScreenContext {
  const mode = input?.mode ?? "need";
  return {
    mode,
    colors: mode === "need" ? NEED_MODE_THEME.colors : ACTION_MODE_THEME.colors,
    reducedMotion: input?.reducedMotion ?? false,
    keyboardNavigation: input?.keyboardNavigation ?? true,
    screenReaderEnabled: input?.screenReaderEnabled ?? true,
  };
}
