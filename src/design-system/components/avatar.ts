import type { ComponentSpec } from "./buttons.js";
import type { IconSize } from "../foundation/icons.js";

export interface AvatarSpec extends ComponentSpec {
  sizes: Record<"sm" | "md" | "lg", number>;
  iconSize: IconSize;
}

export const AVATAR_SPEC: AvatarSpec = {
  id: "avatar",
  name: "Avatar",
  description: "Professional avatar with circle radius and surface fallback.",
  minHeight: 40,
  paddingX: "space-4",
  paddingY: "space-4",
  radius: "circle",
  typography: "caption",
  elevation: "low",
  motion: "fast",
  colors: {
    background: "surface.secondary",
    text: "text.primary",
    border: "border.subtle",
    accent: "accent.primary",
  },
  sizes: { sm: 32, md: 40, lg: 56 },
  iconSize: "md",
};

export const AVATAR_SPECS = {
  default: AVATAR_SPEC,
} as const;
