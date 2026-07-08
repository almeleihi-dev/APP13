import {
  DEFAULT_ACCESSIBILITY,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const AVATAR_VARIANTS = ["image", "initials", "status", "live-frame-overlay"] as const;
export type AvatarVariant = (typeof AVATAR_VARIANTS)[number];

export const AVATAR_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-avatar",
  name: "Avatar",
  purpose: "Professional avatar supporting image, initials, status, and live frame overlay.",
  category: "identity",
  variants: AVATAR_VARIANTS.map((variant) => ({
    id: variant,
    name: variant.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    colors: {
      background: "surface.secondary",
      text: "text.primary",
      border: variant === "live-frame-overlay" ? "accent.primary" : "border.subtle",
      accent: "accent.primary",
    },
  })),
  visualStates: [{ id: "default" }, { id: "hover" }, { id: "focused" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "img", requiresLabel: true },
  designTokens: ["surface.secondary", "text.primary", "border.subtle", "accent.primary"],
  spacing: { paddingX: "space-4", paddingY: "space-4", minHeight: 40, minWidth: 40 },
  typography: { primary: "caption" },
  radius: "circle",
  elevation: "low",
  motion: { duration: "fast", properties: ["box-shadow"] },
  responsive: {
    compact: { minHeight: 32 },
    regular: { minHeight: 40 },
    expanded: { minHeight: 56 },
  },
};
