import { CARD_COMPONENT } from "./card.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";

export const ANALYTICS_CARD_COMPONENT: CoreUiComponentDefinition = {
  ...CARD_COMPONENT,
  id: "core-ui-analytics-card",
  name: "Analytics Card",
  purpose: "Metric and analytics summary card.",
  variants: [
    {
      id: "analytics",
      name: "Analytics",
      colors: { background: "surface.secondary", text: "text.primary", border: "border.subtle", accent: "accent.highlight" },
    },
  ],
  spacing: { paddingX: "space-20", paddingY: "space-16", gap: "space-12", minHeight: 96 },
  typography: { primary: "title", secondary: "caption" },
  elevation: "medium",
};
