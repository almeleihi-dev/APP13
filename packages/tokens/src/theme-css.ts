import { SEMANTIC_COLOR_TOKEN_PATHS, resolveColor, type ExperienceMode } from "@an-act/tokens";

export function buildThemeCssVariables(mode: ExperienceMode): Record<string, string> {
  const vars: Record<string, string> = {
    "--an-act-mode": mode === "action" ? "action" : "need",
  };
  for (const path of SEMANTIC_COLOR_TOKEN_PATHS) {
    const cssKey = `--an-act-color-${path.replace(/\./g, "-")}`;
    vars[cssKey] = resolveColor(mode, path);
  }
  return vars;
}

export const AN_ACT_TRANSITION_DURATION_MS = 640;
