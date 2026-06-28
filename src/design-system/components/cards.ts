import type { ComponentSpec } from "./buttons.js";

export const BASE_CARD_SPEC: ComponentSpec = {
  id: "card-base",
  name: "Card",
  description: "Standard content card with defined elevation and surface tokens.",
  minHeight: 0,
  paddingX: "space-16",
  paddingY: "space-16",
  radius: "large",
  typography: "body",
  elevation: "medium",
  motion: "normal",
  colors: {
    background: "surface.primary",
    text: "text.primary",
    border: "border.subtle",
  },
};

export const TIMELINE_CARD_SPEC: ComponentSpec = {
  id: "card-timeline",
  name: "Timeline Card",
  description: "Chronological event card for professional timeline experiences.",
  minHeight: 72,
  paddingX: "space-16",
  paddingY: "space-12",
  radius: "medium",
  typography: "body",
  elevation: "low",
  motion: "normal",
  colors: {
    background: "surface.primary",
    text: "text.primary",
    border: "border.default",
    accent: "accent.primary",
  },
};

export const ACHIEVEMENT_CARD_SPEC: ComponentSpec = {
  id: "card-achievement",
  name: "Achievement Card",
  description: "Achievement milestone card with status accent.",
  minHeight: 88,
  paddingX: "space-20",
  paddingY: "space-16",
  radius: "large",
  typography: "title",
  elevation: "medium",
  motion: "normal",
  colors: {
    background: "surface.elevated",
    text: "text.primary",
    border: "border.subtle",
    accent: "status.success",
  },
};

export const ANALYTICS_CARD_SPEC: ComponentSpec = {
  id: "card-analytics",
  name: "Analytics Card",
  description: "Metric and analytics summary card.",
  minHeight: 96,
  paddingX: "space-20",
  paddingY: "space-16",
  radius: "large",
  typography: "title",
  elevation: "medium",
  motion: "normal",
  colors: {
    background: "surface.secondary",
    text: "text.primary",
    border: "border.subtle",
    accent: "accent.highlight",
  },
};

export const CARD_SPECS = {
  base: BASE_CARD_SPEC,
  timeline: TIMELINE_CARD_SPEC,
  achievement: ACHIEVEMENT_CARD_SPEC,
  analytics: ANALYTICS_CARD_SPEC,
} as const;
