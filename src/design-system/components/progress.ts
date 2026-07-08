import type { SemanticColorTokenPath } from "../foundation/colors.js";
import type { RadiusToken } from "../foundation/radius.js";
import type { TypographyStyle } from "../foundation/typography.js";
import type { MotionDuration } from "../foundation/motion.js";

export interface ProgressSpec {
  id: string;
  name: string;
  description: string;
  height: number;
  radius: RadiusToken;
  typography: TypographyStyle;
  motion: MotionDuration;
  trackColor: SemanticColorTokenPath;
  fillColor: SemanticColorTokenPath;
}

export const TERMINAL_PROGRESS_SPEC: ProgressSpec = {
  id: "progress-terminal",
  name: "Terminal Progress",
  description: "Progress bar for an act... transition screens.",
  height: 4,
  radius: "pill",
  typography: "terminal",
  motion: "extraSlow",
  trackColor: "surface.muted",
  fillColor: "accent.primary",
};

export const LINEAR_PROGRESS_SPEC: ProgressSpec = {
  id: "progress-linear",
  name: "Linear Progress",
  description: "Standard linear progress indicator.",
  height: 6,
  radius: "pill",
  typography: "caption",
  motion: "normal",
  trackColor: "surface.muted",
  fillColor: "accent.highlight",
};

export const PROGRESS_SPECS = {
  terminal: TERMINAL_PROGRESS_SPEC,
  linear: LINEAR_PROGRESS_SPEC,
} as const;
