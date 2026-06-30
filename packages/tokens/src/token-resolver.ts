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

export function resolveShadow(name: string, payload?: AnActTokensPayload): string {
  const tokens = payload ?? loadTokensPayload();
  const value = tokens.shadows[name];
  if (!value) {
    throw new Error(`Unknown shadow token: ${name}`);
  }
  return value;
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
