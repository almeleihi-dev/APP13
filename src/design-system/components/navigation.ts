import type { ComponentSpec } from "./buttons.js";

export const BOTTOM_NAVIGATION_SPEC: ComponentSpec = {
  id: "navigation-bottom",
  name: "Bottom Navigation",
  description: "Primary mobile navigation bar with elevated surface.",
  minHeight: 64,
  paddingX: "space-16",
  paddingY: "space-8",
  radius: "medium",
  typography: "caption",
  elevation: "high",
  motion: "fast",
  colors: {
    background: "surface.elevated",
    text: "text.secondary",
    border: "border.subtle",
    accent: "accent.primary",
  },
};

export const FLOATING_ACTION_BUTTON_SPEC: ComponentSpec = {
  id: "navigation-fab",
  name: "Floating Action Button",
  description: "Primary floating action for mode transitions and key actions.",
  minHeight: 56,
  paddingX: "space-16",
  paddingY: "space-16",
  radius: "circle",
  typography: "label",
  elevation: "highest",
  motion: "normal",
  colors: {
    background: "interactive.default",
    text: "text.inverse",
    border: "interactive.default",
    accent: "accent.highlight",
  },
};

export const NAVIGATION_BAR_SPEC: ComponentSpec = {
  id: "navigation-bar",
  name: "Navigation",
  description: "Top navigation bar for screen context and actions.",
  minHeight: 56,
  paddingX: "space-16",
  paddingY: "space-12",
  radius: "medium",
  typography: "title",
  elevation: "low",
  motion: "fast",
  colors: {
    background: "background.primary",
    text: "text.primary",
    border: "border.subtle",
    accent: "accent.primary",
  },
};

export const NAVIGATION_SPECS = {
  bar: NAVIGATION_BAR_SPEC,
  bottom: BOTTOM_NAVIGATION_SPEC,
  fab: FLOATING_ACTION_BUTTON_SPEC,
} as const;
