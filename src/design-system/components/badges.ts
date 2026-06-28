import type { ComponentSpec } from "./buttons.js";

export const PROFESSIONAL_BADGE_SPEC: ComponentSpec = {
  id: "badge-professional",
  name: "Professional Badge",
  description: "Compact professional status badge.",
  minHeight: 24,
  paddingX: "space-8",
  paddingY: "space-4",
  radius: "pill",
  typography: "label",
  elevation: "none",
  motion: "fast",
  colors: {
    background: "surface.muted",
    text: "text.secondary",
    border: "border.subtle",
    accent: "accent.primary",
  },
};

export const STATUS_BADGE_SPECS = {
  professional: PROFESSIONAL_BADGE_SPEC,
} as const;

export const BADGE_SPECS = STATUS_BADGE_SPECS;
