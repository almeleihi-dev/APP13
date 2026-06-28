import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const LIVE_FRAME_TIERS = ["bronze", "silver", "gold", "platinum", "diamond"] as const;
export type LiveFrameTier = (typeof LIVE_FRAME_TIERS)[number];

const TIER_ACCENT: Record<LiveFrameTier, "accent.primary" | "accent.secondary" | "accent.highlight" | "status.warning" | "border.subtle"> = {
  bronze: "status.warning",
  silver: "border.subtle",
  gold: "status.warning",
  platinum: "accent.highlight",
  diamond: "accent.primary",
};

export const LIVE_FRAME_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-live-frame",
  name: "Live Frame",
  purpose: "Professional live frame indicator with tier-based accent ring.",
  category: "identity",
  variants: LIVE_FRAME_TIERS.map((tier) => ({
    id: tier,
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    colors: {
      background: "surface.elevated",
      text: "text.primary",
      border: TIER_ACCENT[tier],
      accent: TIER_ACCENT[tier],
    },
  })),
  visualStates: [{ id: "default" }, { id: "hover", motion: "slow" }, { id: "focused", elevation: "medium" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "img", requiresLabel: true },
  designTokens: ["surface.elevated", "accent.primary", "accent.highlight", "status.warning"],
  spacing: { paddingX: "space-16", paddingY: "space-12", minHeight: 64 },
  typography: { primary: "title", secondary: "caption" },
  radius: "circle",
  elevation: "medium",
  motion: { duration: "slow", properties: ["box-shadow", "border-color"] },
  responsive: DEFAULT_RESPONSIVE,
};
