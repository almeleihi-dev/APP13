import type { ComponentSpec } from "./buttons.js";
import type { SemanticColorTokenPath } from "../foundation/colors.js";
import type { RadiusToken } from "../foundation/radius.js";

export interface LiveFrameRingSpec {
  strokeWidth: number;
  radius: RadiusToken;
  glowColorToken: SemanticColorTokenPath;
}

export const LIVE_FRAME_SPEC: ComponentSpec & { ring: LiveFrameRingSpec } = {
  id: "live-frame",
  name: "Live Frame",
  description: "Professional live frame indicator with accent ring and elevated surface.",
  minHeight: 64,
  paddingX: "space-16",
  paddingY: "space-12",
  radius: "large",
  typography: "title",
  elevation: "medium",
  motion: "slow",
  colors: {
    background: "surface.elevated",
    text: "text.primary",
    border: "accent.primary",
    accent: "accent.highlight",
  },
  ring: {
    strokeWidth: 2,
    radius: "circle",
    glowColorToken: "accent.highlight",
  },
};

export const LIVE_FRAME_SPECS = {
  default: LIVE_FRAME_SPEC,
} as const;
