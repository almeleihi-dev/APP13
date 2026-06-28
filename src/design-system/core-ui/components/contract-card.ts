import { CARD_COMPONENT } from "./card.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";

export const CONTRACT_CARD_COMPONENT: CoreUiComponentDefinition = {
  ...CARD_COMPONENT,
  id: "core-ui-contract-card",
  name: "Contract Card",
  purpose: "Contract summary card for marketplace and execution flows.",
  variants: [
    {
      id: "contract",
      name: "Contract",
      colors: { background: "surface.primary", text: "text.primary", border: "border.default", accent: "accent.secondary" },
    },
  ],
  spacing: { paddingX: "space-20", paddingY: "space-16", gap: "space-12", minHeight: 96 },
  typography: { primary: "title", secondary: "body" },
  elevation: "medium",
};

export const RECOMMENDATION_CARD_COMPONENT: CoreUiComponentDefinition = {
  ...CARD_COMPONENT,
  id: "core-ui-recommendation-card",
  name: "Recommendation Card",
  purpose: "Experience recommendation card — read-only, user-controlled.",
  variants: [
    {
      id: "recommendation",
      name: "Recommendation",
      colors: { background: "surface.secondary", text: "text.primary", border: "border.subtle", accent: "accent.primary" },
    },
  ],
  spacing: { paddingX: "space-16", paddingY: "space-16", gap: "space-8", minHeight: 80 },
  elevation: "low",
};
