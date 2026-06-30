import type { ExperienceMode, ResolvedTheme, ThemeId } from "./types.js";
import { loadTokensPayload } from "./load-tokens.js";

export function modeToThemeId(mode: ExperienceMode): ThemeId {
  return mode === "action" ? "action-mode" : "need-mode";
}

export function resolveTheme(mode: ExperienceMode): ResolvedTheme {
  const payload = loadTokensPayload();
  const id = modeToThemeId(mode);
  const themeKey = mode === "action" ? "action" : "need";
  return {
    id,
    mode: mode === "action" ? "action" : mode === "transition" ? "transition" : "need",
    colors: payload.colors.themes[themeKey],
  };
}

export function resolveThemeColors(mode: ExperienceMode): ResolvedTheme["colors"] {
  return resolveTheme(mode).colors;
}
