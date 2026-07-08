import type { ComponentSpec } from "./buttons.js";

export const CHIP_SPEC: ComponentSpec = {
  id: "chip",
  name: "Chip",
  description: "Compact filter or tag chip with pill radius.",
  minHeight: 32,
  paddingX: "space-12",
  paddingY: "space-4",
  radius: "pill",
  typography: "caption",
  elevation: "none",
  motion: "fast",
  colors: {
    background: "surface.secondary",
    text: "text.secondary",
    border: "border.subtle",
    accent: "accent.primary",
  },
};

export const CHIP_SPECS = {
  default: CHIP_SPEC,
} as const;
