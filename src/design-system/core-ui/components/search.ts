import { INPUT_COMPONENT } from "./input.js";
import type { CoreUiComponentDefinition } from "../foundation/component-schema.js";

export const SEARCH_COMPONENT: CoreUiComponentDefinition = {
  ...INPUT_COMPONENT,
  id: "core-ui-search",
  name: "Search",
  purpose: "Search input with pill radius and elevated surface for discovery flows.",
  category: "input",
  variants: [
    {
      id: "search",
      name: "Search",
      colors: {
        background: "surface.secondary",
        text: "text.primary",
        border: "border.subtle",
        accent: "accent.primary",
      },
    },
  ],
  radius: "pill",
  elevation: "low",
  spacing: { paddingX: "space-16", paddingY: "space-8", minHeight: 44 },
};
