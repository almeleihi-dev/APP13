import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const BADGE_VARIANTS = ["verified", "licensed", "certified", "government", "elite"] as const;
export type ProfessionalBadgeVariant = (typeof BADGE_VARIANTS)[number];

export const BADGE_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-badge",
  name: "Professional Badge",
  purpose: "Compact professional credential and status badge.",
  category: "identity",
  variants: BADGE_VARIANTS.map((variant) => ({
    id: variant,
    name: variant.charAt(0).toUpperCase() + variant.slice(1),
    colors: {
      background: "surface.muted",
      text: "text.secondary",
      border: "border.subtle",
      accent: variant === "elite" ? "accent.highlight" : "accent.primary",
    },
  })),
  visualStates: [{ id: "default" }, { id: "hover" }, { id: "focused" }],
  interactionStates: [{ id: "default" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, minimumTouchTargetPx: 32, supportsKeyboardActivation: false, ariaRole: "status" },
  designTokens: ["surface.muted", "text.secondary", "accent.primary", "accent.highlight"],
  spacing: { paddingX: "space-8", paddingY: "space-4", minHeight: 24 },
  typography: { primary: "label" },
  radius: "pill",
  elevation: "none",
  motion: { duration: "fast", properties: ["opacity"] },
  responsive: DEFAULT_RESPONSIVE,
};
