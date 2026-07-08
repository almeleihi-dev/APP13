import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const BOTTOM_NAVIGATION_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-bottom-navigation",
  name: "Bottom Navigation",
  purpose: "Primary mobile navigation bar with elevated surface.",
  category: "navigation",
  variants: [
    {
      id: "bottom",
      name: "Bottom Navigation",
      colors: { background: "surface.elevated", text: "text.secondary", border: "border.subtle", accent: "accent.primary" },
    },
  ],
  visualStates: [{ id: "default" }, { id: "hover" }, { id: "focused" }, { id: "pressed" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "navigation" },
  designTokens: ["surface.elevated", "text.secondary", "accent.primary"],
  spacing: { paddingX: "space-16", paddingY: "space-8", gap: "space-16", minHeight: 64 },
  typography: { primary: "caption" },
  radius: "medium",
  elevation: "high",
  motion: { duration: "fast", properties: ["color", "background-color"] },
  responsive: DEFAULT_RESPONSIVE,
};
