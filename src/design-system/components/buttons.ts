import type { SemanticColorTokenPath } from "../foundation/colors.js";
import type { RadiusToken } from "../foundation/radius.js";
import type { SpacingTokenName } from "../foundation/spacing.js";
import type { TypographyStyle } from "../foundation/typography.js";
import type { ElevationLevel } from "../foundation/elevation.js";
import type { MotionDuration } from "../foundation/motion.js";

export interface ComponentColorSpec {
  background: SemanticColorTokenPath;
  text: SemanticColorTokenPath;
  border?: SemanticColorTokenPath;
  accent?: SemanticColorTokenPath;
}

export interface ComponentSpec {
  id: string;
  name: string;
  description: string;
  minHeight: number;
  paddingX: SpacingTokenName;
  paddingY: SpacingTokenName;
  radius: RadiusToken;
  typography: TypographyStyle;
  elevation: ElevationLevel;
  motion: MotionDuration;
  colors: ComponentColorSpec;
}

export const PRIMARY_BUTTON_SPEC: ComponentSpec = {
  id: "button-primary",
  name: "Primary Button",
  description: "Primary call-to-action — accent fill with inverse text.",
  minHeight: 48,
  paddingX: "space-24",
  paddingY: "space-12",
  radius: "medium",
  typography: "body",
  elevation: "low",
  motion: "fast",
  colors: {
    background: "interactive.default",
    text: "text.inverse",
    border: "interactive.default",
  },
};

export const SECONDARY_BUTTON_SPEC: ComponentSpec = {
  id: "button-secondary",
  name: "Secondary Button",
  description: "Secondary action — surface fill with accent border.",
  minHeight: 48,
  paddingX: "space-24",
  paddingY: "space-12",
  radius: "medium",
  typography: "body",
  elevation: "none",
  motion: "fast",
  colors: {
    background: "surface.primary",
    text: "text.primary",
    border: "border.default",
    accent: "accent.primary",
  },
};

export const GHOST_BUTTON_SPEC: ComponentSpec = {
  id: "button-ghost",
  name: "Ghost Button",
  description: "Tertiary action — transparent with accent text.",
  minHeight: 44,
  paddingX: "space-16",
  paddingY: "space-8",
  radius: "medium",
  typography: "body",
  elevation: "none",
  motion: "fast",
  colors: {
    background: "background.primary",
    text: "accent.primary",
    border: "border.subtle",
  },
};

export const BUTTON_SPECS = {
  primary: PRIMARY_BUTTON_SPEC,
  secondary: SECONDARY_BUTTON_SPEC,
  ghost: GHOST_BUTTON_SPEC,
} as const;
