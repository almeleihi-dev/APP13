import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const NAVIGATION_BAR_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-navigation-bar",
  name: "Top Navigation",
  purpose: "Top navigation bar for screen context and primary actions.",
  category: "navigation",
  variants: [
    {
      id: "top",
      name: "Top Navigation",
      colors: { background: "background.primary", text: "text.primary", border: "border.subtle", accent: "accent.primary" },
    },
  ],
  visualStates: [{ id: "default" }, { id: "focused" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "navigation" },
  designTokens: ["background.primary", "text.primary", "border.subtle", "accent.primary"],
  spacing: { paddingX: "space-16", paddingY: "space-12", gap: "space-12", minHeight: 56 },
  typography: { primary: "title", secondary: "caption" },
  radius: "medium",
  elevation: "low",
  motion: { duration: "fast", properties: ["background-color"] },
  responsive: DEFAULT_RESPONSIVE,
};

export const SIDE_NAVIGATION_COMPONENT: CoreUiComponentDefinition = {
  ...NAVIGATION_BAR_COMPONENT,
  id: "core-ui-side-navigation",
  name: "Side Navigation",
  purpose: "Side navigation rail for expanded layouts and desktop surfaces.",
  variants: [
    {
      id: "side",
      name: "Side Navigation",
      colors: { background: "surface.primary", text: "text.primary", border: "border.default", accent: "accent.primary" },
    },
  ],
  spacing: { paddingX: "space-16", paddingY: "space-24", gap: "space-8", minHeight: 0, minWidth: 240 },
  elevation: "medium",
};
