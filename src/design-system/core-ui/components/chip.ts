import {
  DEFAULT_ACCESSIBILITY,
  DEFAULT_RESPONSIVE,
  type CoreUiComponentDefinition,
} from "../foundation/component-schema.js";

export const CHIP_COMPONENT: CoreUiComponentDefinition = {
  id: "core-ui-chip",
  name: "Chip",
  purpose: "Compact filter or tag chip for search and list filtering.",
  category: "input",
  variants: [
    {
      id: "default",
      name: "Default",
      colors: {
        background: "surface.secondary",
        text: "text.secondary",
        border: "border.subtle",
        accent: "accent.primary",
      },
    },
  ],
  visualStates: [{ id: "default" }, { id: "hover" }, { id: "focused" }, { id: "pressed" }],
  interactionStates: [{ id: "default" }, { id: "pressed" }],
  accessibility: { ...DEFAULT_ACCESSIBILITY, minimumTouchTargetPx: 32, supportsKeyboardActivation: true },
  designTokens: ["surface.secondary", "text.secondary", "border.subtle", "accent.primary"],
  spacing: { paddingX: "space-12", paddingY: "space-4", minHeight: 32 },
  typography: { primary: "caption" },
  radius: "pill",
  elevation: "none",
  motion: { duration: "fast", properties: ["background-color", "border-color"] },
  responsive: DEFAULT_RESPONSIVE,
};
