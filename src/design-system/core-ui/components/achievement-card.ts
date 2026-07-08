import { CARD_COMPONENT } from "./card.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";

export const ACHIEVEMENT_CARD_COMPONENT: CoreUiComponentDefinition = {
  ...CARD_COMPONENT,
  id: "core-ui-achievement-card",
  name: "Achievement Card",
  purpose: "Achievement milestone card with status accent.",
  variants: [
    {
      id: "achievement",
      name: "Achievement",
      colors: { background: "surface.elevated", text: "text.primary", border: "border.subtle", accent: "status.success" },
    },
  ],
  spacing: { paddingX: "space-20", paddingY: "space-16", gap: "space-12", minHeight: 88 },
  typography: { primary: "title", secondary: "caption" },
  elevation: "medium",
};
