/**
 * AN ACT semantic color tokens.
 * Components must reference these names — never raw hex values.
 */
export const SEMANTIC_COLOR_GROUPS = [
  "background",
  "surface",
  "text",
  "accent",
  "border",
  "status",
  "interactive",
  "overlay",
  "transition",
] as const;

export type SemanticColorGroup = (typeof SEMANTIC_COLOR_GROUPS)[number];

export interface SemanticColorTokens {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  surface: {
    primary: string;
    secondary: string;
    elevated: string;
    muted: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
  };
  accent: {
    primary: string;
    secondary: string;
    highlight: string;
  };
  border: {
    default: string;
    subtle: string;
    focus: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  interactive: {
    default: string;
    hover: string;
    pressed: string;
    disabled: string;
  };
  overlay: {
    scrim: string;
    backdrop: string;
  };
  transition: {
    start: string;
    mid: string;
    end: string;
  };
}

export const SEMANTIC_COLOR_TOKEN_PATHS = [
  "background.primary",
  "background.secondary",
  "background.tertiary",
  "background.inverse",
  "surface.primary",
  "surface.secondary",
  "surface.elevated",
  "surface.muted",
  "text.primary",
  "text.secondary",
  "text.tertiary",
  "text.inverse",
  "text.disabled",
  "accent.primary",
  "accent.secondary",
  "accent.highlight",
  "border.default",
  "border.subtle",
  "border.focus",
  "status.success",
  "status.warning",
  "status.error",
  "status.info",
  "interactive.default",
  "interactive.hover",
  "interactive.pressed",
  "interactive.disabled",
  "overlay.scrim",
  "overlay.backdrop",
  "transition.start",
  "transition.mid",
  "transition.end",
] as const;

export type SemanticColorTokenPath = (typeof SEMANTIC_COLOR_TOKEN_PATHS)[number];

export function resolveSemanticColor(
  tokens: SemanticColorTokens,
  path: SemanticColorTokenPath
): string {
  const [group, key] = path.split(".") as [SemanticColorGroup, string];
  const groupTokens = tokens[group] as Record<string, string>;
  const value = groupTokens[key];
  if (!value) {
    throw new Error(`Unknown semantic color token: ${path}`);
  }
  return value;
}
