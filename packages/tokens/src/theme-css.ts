import {
  resolveColor,
  resolveElevationCss,
  resolveRadius,
  resolveSpacing,
  resolveTypography,
} from "./token-resolver.js";
import { SEMANTIC_COLOR_TOKEN_PATHS, type ExperienceMode } from "./types.js";
import { loadTokensPayload } from "./load-tokens.js";
import { AN_ACT_TRANSITION_DURATION_MS } from "./brand.js";

export { AN_ACT_TRANSITION_DURATION_MS };

export function buildThemeCssVariables(mode: ExperienceMode): Record<string, string> {
  const resolvedMode = mode === "action" ? "action" : "need";
  const tokens = loadTokensPayload();
  const vars: Record<string, string> = {
    "--an-act-mode": resolvedMode,
    "--an-act-transition-duration": `${AN_ACT_TRANSITION_DURATION_MS}ms`,
    "--an-act-motion-emphasized-easing": tokens.motion.easing.emphasized,
    "--an-act-motion-decelerate-easing": tokens.motion.easing.decelerate,
    "--an-act-focus-ring-width": `${tokens.accessibility.focusRingWidthPx}px`,
    "--an-act-focus-ring-offset": `${tokens.accessibility.focusRingOffsetPx}px`,
    "--an-act-touch-target-min": `${tokens.accessibility.minimumTouchTargetPx}px`,
  };

  for (const path of SEMANTIC_COLOR_TOKEN_PATHS) {
    vars[`--an-act-color-${path.replace(/\./g, "-")}`] = resolveColor(resolvedMode, path);
  }

  for (const [name, style] of Object.entries(tokens.typography.styles)) {
    vars[`--an-act-typography-${name}-font-family`] = style.fontFamily;
    vars[`--an-act-typography-${name}-font-size`] = style.fontSize;
    vars[`--an-act-typography-${name}-font-weight`] = String(style.fontWeight);
    vars[`--an-act-typography-${name}-line-height`] = style.lineHeight;
    if (style.letterSpacing) {
      vars[`--an-act-typography-${name}-letter-spacing`] = style.letterSpacing;
    }
  }

  vars["--an-act-font-sans"] = tokens.typography.fontFamily.sans;
  vars["--an-act-font-mono"] = tokens.typography.fontFamily.mono;

  for (const [name, value] of Object.entries(tokens.spacing)) {
    vars[`--an-act-spacing-${name}`] = value;
  }

  for (const name of ["small", "medium", "large", "extraLarge", "pill"]) {
    vars[`--an-act-radius-${name}`] = resolveRadius(name);
  }

  for (const level of ["none", "low", "medium", "high", "highest"]) {
    vars[`--an-act-elevation-${level}`] = resolveElevationCss(level, resolvedMode);
  }

  vars["--an-act-button-min-height"] = resolveSpacing("space-48");
  vars["--an-act-screen-padding"] = resolveSpacing("space-16");
  vars["--an-act-section-gap"] = resolveSpacing("space-12");
  vars["--an-act-screen-gap"] = resolveSpacing("space-16");

  return vars;
}

export function typographyCss(styleName: string): Record<string, string | number> {
  const style = resolveTypography(styleName);
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    ...(style.letterSpacing ? { letterSpacing: style.letterSpacing } : {}),
  };
}
