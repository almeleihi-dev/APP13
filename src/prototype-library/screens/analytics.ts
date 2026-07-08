import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const ANALYTICS_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-analytics",
  name: "Analytics",
  purpose: "Professional analytics dashboard with metric cards.",
  category: "shared",
  mode: "shared",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    route: "/shared/analytics",
  },
  navigation: { pattern: "tab", relatedScreenIds: ["prototype-timeline", "prototype-profile"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-analytics-card", "core-ui-bottom-navigation", "core-ui-progress"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-16", gap: "space-16" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 2, showsBottomNav: true },
    expanded: { columns: 3, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.secondary", "accent.highlight", "border.subtle"],
});
