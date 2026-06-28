import type { ComponentSpec } from "./buttons.js";

export const TEXT_INPUT_SPEC: ComponentSpec = {
  id: "input-text",
  name: "Text Input",
  description: "Standard text input with focus ring using semantic border tokens.",
  minHeight: 48,
  paddingX: "space-16",
  paddingY: "space-12",
  radius: "medium",
  typography: "body",
  elevation: "none",
  motion: "fast",
  colors: {
    background: "surface.primary",
    text: "text.primary",
    border: "border.default",
    accent: "border.focus",
  },
};

export const SEARCH_INPUT_SPEC: ComponentSpec = {
  id: "input-search",
  name: "Search Input",
  description: "Search field with elevated surface and accent focus.",
  minHeight: 44,
  paddingX: "space-16",
  paddingY: "space-8",
  radius: "pill",
  typography: "body",
  elevation: "low",
  motion: "fast",
  colors: {
    background: "surface.secondary",
    text: "text.primary",
    border: "border.subtle",
    accent: "accent.primary",
  },
};

export const INPUT_SPECS = {
  text: TEXT_INPUT_SPEC,
  search: SEARCH_INPUT_SPEC,
} as const;
