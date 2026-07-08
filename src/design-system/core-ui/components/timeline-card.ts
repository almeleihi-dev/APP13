import { CARD_COMPONENT } from "./card.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";

export const TIMELINE_CARD_COMPONENT: CoreUiComponentDefinition = {
  ...CARD_COMPONENT,
  id: "core-ui-timeline-card",
  name: "Timeline Card",
  purpose: "Chronological event card for professional timeline experiences.",
  variants: [
    {
      id: "timeline",
      name: "Timeline",
      colors: { background: "surface.primary", text: "text.primary", border: "border.default", accent: "accent.primary" },
    },
  ],
  spacing: { paddingX: "space-16", paddingY: "space-12", gap: "space-8", minHeight: 72 },
  radius: "medium",
  elevation: "low",
};
