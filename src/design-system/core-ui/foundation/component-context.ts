import type { AnActMode } from "../../foundation/transitions.js";
import { NEED_MODE_THEME } from "../../themes/need-mode.js";
import { ACTION_MODE_THEME } from "../../themes/action-mode.js";
import type { SemanticColorTokens } from "../../foundation/colors.js";

export interface CoreUiComponentContext {
  mode: AnActMode;
  colors: SemanticColorTokens;
  reducedMotion: boolean;
}

export function buildCoreUiComponentContext(input?: {
  mode?: AnActMode;
  reducedMotion?: boolean;
}): CoreUiComponentContext {
  const mode = input?.mode ?? "need";
  return {
    mode,
    colors: mode === "need" ? NEED_MODE_THEME.colors : ACTION_MODE_THEME.colors,
    reducedMotion: input?.reducedMotion ?? false,
  };
}

export function resolveModeColors(mode: AnActMode): SemanticColorTokens {
  return mode === "need" ? NEED_MODE_THEME.colors : ACTION_MODE_THEME.colors;
}
