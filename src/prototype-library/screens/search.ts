import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const SEARCH_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-search",
  name: "Search",
  purpose: "Search-oriented discovery screen with pill search and result cards.",
  category: "need",
  mode: "need",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/need/search",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-need-home", relatedScreenIds: ["prototype-opportunity-list", "prototype-request"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-search", "core-ui-card", "core-ui-chip", "core-ui-bottom-navigation"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-12", gap: "space-12" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 2, showsBottomNav: true },
    expanded: { columns: 3, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.secondary", "accent.primary", "border.subtle"],
});
