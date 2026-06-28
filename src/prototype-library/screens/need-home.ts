import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

const NEED_TOKENS = ["background.primary", "text.primary", "surface.secondary", "accent.primary", "border.subtle"] as const;

export const NEED_HOME_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-need-home",
  name: "Need Home",
  purpose: "Primary Need Mode landing — reading-focused discovery and search entry.",
  category: "need",
  mode: "need",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    route: "/need/home",
  },
  navigation: { pattern: "tab", relatedScreenIds: ["prototype-search", "prototype-timeline", "prototype-profile"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-bottom-navigation", "core-ui-search", "core-ui-card"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-16", gap: "space-12" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 2, showsBottomNav: true },
    expanded: { columns: 3, showsSideNav: true },
  },
  designTokens: [...NEED_TOKENS],
});

export const OPPORTUNITY_LIST_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-opportunity-list",
  name: "Opportunity List",
  purpose: "Browse matched opportunities in Need Mode before initiating action.",
  category: "need",
  mode: "need",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/need/opportunities",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-need-home", relatedScreenIds: ["prototype-request", "prototype-search"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-card", "core-ui-badge", "core-ui-chip"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-12", gap: "space-12" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 2, showsBottomNav: true },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: [...NEED_TOKENS],
});
