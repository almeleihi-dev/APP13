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

export type ExperienceMode = "need" | "action" | "transition";

export type ThemeId = "need-mode" | "action-mode";

export interface TypographyStyle {
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: string;
  letterSpacing?: string;
}

export interface TypographyTokens {
  fontFamily: { sans: string; mono: string };
  styles: Record<string, TypographyStyle>;
}

export interface SpacingTokens {
  [key: string]: string;
}

export type SpacingTokenName = keyof SpacingTokens & string;

export interface RadiusTokens {
  [key: string]: string;
}

export interface ElevationTokens {
  [key: string]: string;
}

export interface ShadowTokens {
  [key: string]: string;
}

export interface MotionDurationTokens {
  [key: string]: string;
}

export interface MotionEasingTokens {
  [key: string]: string;
}

export interface MotionTokenSet {
  durations: MotionDurationTokens;
  easing: MotionEasingTokens;
  tokens: Record<string, { duration: string; easing: string }>;
}

export interface TransitionFlowStep {
  id: string;
  label: string;
  durationMs: number;
}

export interface AccessibilityRules {
  minimumTouchTargetPx: number;
  minimumContrastRatioNormalText: number;
  minimumContrastRatioLargeText: number;
  focusRingWidthPx: number;
  focusRingOffsetPx: number;
  keyboardNavigationRequired: boolean;
  reducedMotionRespected: boolean;
}

export interface AnActTokensPayload {
  version: string;
  generated_at: string;
  source: string;
  colors: {
    semanticGroups: readonly string[];
    semanticPaths: readonly string[];
    themes: {
      need: Record<SemanticColorTokenPath, string>;
      action: Record<SemanticColorTokenPath, string>;
    };
  };
  typography: TypographyTokens;
  spacing: SpacingTokens;
  radius: RadiusTokens;
  elevation: ElevationTokens;
  shadows: ShadowTokens;
  motion: MotionTokenSet;
  transitions: TransitionFlowStep[];
  accessibility: AccessibilityRules;
}

export interface ResolvedTheme {
  id: ThemeId;
  mode: ExperienceMode;
  colors: Record<SemanticColorTokenPath, string>;
}

export type LiveFrameUiTier = "diamond" | "platinum" | "gold" | "silver" | "bronze";

export interface LiveFramePresentation {
  uiTier: LiveFrameUiTier;
  accentToken: SemanticColorTokenPath;
  accentColor: string;
  label: string;
}
