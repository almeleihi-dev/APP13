import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const CARD_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-card",
  name: "Standard Card",
  purpose: "General content container with defined elevation and surface tokens.",
  category: "surface",
  variants: [
    {
      id: "standard",
      name: "Standard",
      colors: { background: "surface.primary", text: "text.primary", border: "border.subtle" },
    },
    {
      id: "elevated",
      name: "Elevated",
      colors: { background: "surface.elevated", text: "text.primary", border: "border.subtle", accent: "accent.primary" },
    },
  ],
  visualStates: [{ id: "default" }, { id: "hover", elevation: "high" }, { id: "focused", elevation: "medium" }],
  interactionStates: [{ id: "default" }, { id: "pressed", elevation: "low" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, supportsKeyboardActivation: false, ariaRole: "group" },
  designTokens: ["surface.primary", "surface.elevated", "text.primary", "border.subtle"],
  spacing: { paddingX: "space-16", paddingY: "space-16", gap: "space-12", minHeight: 0 },
  typography: { primary: "body", secondary: "caption" },
  radius: "large",
  elevation: "medium",
  motion: { duration: "normal", properties: ["box-shadow", "transform"] },
  responsive: DEFAULT_RESPONSIVE,
};
