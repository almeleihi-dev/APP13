import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const EMPTY_STATE_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-empty-state",
  name: "Empty State",
  purpose: "Empty state pattern for lists and search results with guided next action.",
  category: "need",
  mode: "need",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    route: "/need/empty",
  },
  navigation: { pattern: "stack", relatedScreenIds: ["prototype-search", "prototype-opportunity-list", "prototype-need-home"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-button", "core-ui-card", "core-ui-search"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-24", contentPaddingY: "space-32", gap: "space-16" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 1, showsBottomNav: true },
    expanded: { columns: 1, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.secondary", "surface.muted", "accent.primary", "border.subtle"],
});
