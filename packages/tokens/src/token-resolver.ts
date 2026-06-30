import type { AnActTokensPayload, SemanticColorTokenPath } from "./types.js";
import { loadTokensPayload } from "./load-tokens.js";

export function resolveSemanticColor(
  themeColors: Record<SemanticColorTokenPath, string>,
  path: SemanticColorTokenPath
): string {
  const value = themeColors[path];
  if (!value) {
    throw new Error(`Unknown semantic color token: ${path}`);
  }
  return value;
}

export function resolveColor(
  mode: "need" | "action" | "transition",
  path: SemanticColorTokenPath,
  payload?: AnActTokensPayload
): string {
  const tokens = payload ?? loadTokensPayload();
  const themeKey = mode === "action" ? "action" : "need";
  return resolveSemanticColor(tokens.colors.themes[themeKey], path);
}

export function resolveSpacing(
  name: string,
  payload?: AnActTokensPayload
): string {
  const tokens = payload ?? loadTokensPayload();
  const value = tokens.spacing[name];
  if (!value) {
    throw new Error(`Unknown spacing token: ${name}`);
  }
  return value;
}

export function resolveTypography(
  styleName: string,
  payload?: AnActTokensPayload
): import("./types.js").TypographyStyle {
  const tokens = payload ?? loadTokensPayload();
  const style = tokens.typography.styles[styleName];
  if (!style) {
    throw new Error(`Unknown typography style: ${styleName}`);
  }
  return style;
}

export function resolveRadius(name: string, payload?: AnActTokensPayload): string {
  const tokens = payload ?? loadTokensPayload();
  const value = tokens.radius[name];
  if (!value) {
    throw new Error(`Unknown radius token: ${name}`);
  }
  return value;
}

export interface ShadowDefinition {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export function formatShadowCss(def: ShadowDefinition, mode: "need" | "action" = "need"): string {
  let { offsetX, offsetY, blur, spread, color } = def;
  if (mode === "action" && blur > 0) {
    blur = Math.round(blur * 1.4);
    color = "rgba(0, 0, 0, 0.32)";
  }
  return `${offsetX}px ${offsetY}px ${blur}px ${spread}px ${color}`;
}

export function resolveShadowCss(
  name: string,
  mode: "need" | "action" = "need",
  payload?: AnActTokensPayload
): string {
  const tokens = payload ?? loadTokensPayload();
  const value = tokens.shadows[name] as unknown as ShadowDefinition | string | undefined;
  if (!value) {
    throw new Error(`Unknown shadow token: ${name}`);
  }
  if (typeof value === "string") {
    return value;
  }
  return formatShadowCss(value, mode);
}

/** @deprecated Use resolveShadowCss — kept for compatibility */
export function resolveShadow(name: string, payload?: AnActTokensPayload): string {
  return resolveShadowCss(name, "need", payload);
}

export function resolveElevationCss(
  level: string,
  mode: "need" | "action" = "need",
  payload?: AnActTokensPayload
): string {
  const tokens = payload ?? loadTokensPayload();
  const entry = tokens.elevation[level] as { shadowToken?: string } | string | undefined;
  if (!entry || typeof entry === "string") {
    return "none";
  }
  if (!entry.shadowToken) {
    return "none";
  }
  return resolveShadowCss(entry.shadowToken, mode, payload);
}

export function resolveMotion(
  tokenName: string,
  payload?: AnActTokensPayload
): { duration: string; easing: string } {
  const tokens = payload ?? loadTokensPayload();
  const value = tokens.motion.tokens[tokenName];
  if (!value) {
    throw new Error(`Unknown motion token: ${tokenName}`);
  }
  return value;
}
