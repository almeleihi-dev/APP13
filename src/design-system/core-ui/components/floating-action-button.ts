import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const FLOATING_ACTION_BUTTON_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-floating-action-button",
  name: "Floating Action Button",
  purpose: "Primary floating action for mode transitions and key actions.",
  category: "navigation",
  variants: [
    {
      id: "fab",
      name: "FAB",
      colors: { background: "interactive.default", text: "text.inverse", border: "interactive.default", accent: "accent.highlight" },
    },
  ],
  visualStates: [{ id: "default" }, { id: "hover", elevation: "highest" }, { id: "pressed", elevation: "high" }, { id: "focused" }, { id: "disabled" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }, { id: "loading" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, ariaRole: "button" },
  designTokens: ["interactive.default", "interactive.hover", "text.inverse", "accent.highlight"],
  spacing: { paddingX: "space-16", paddingY: "space-16", minHeight: 56, minWidth: 56 },
  typography: { primary: "label" },
  radius: "circle",
  elevation: "highest",
  motion: { duration: "normal", properties: ["box-shadow", "transform"] },
  responsive: DEFAULT_RESPONSIVE,
};
