import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const TIMELINE_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-timeline",
  name: "Timeline",
  purpose: "Professional timeline visualization using timeline cards.",
  category: "shared",
  mode: "shared",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    route: "/shared/timeline",
  },
  navigation: { pattern: "tab", relatedScreenIds: ["prototype-need-home", "prototype-analytics", "prototype-profile"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-timeline-card", "core-ui-bottom-navigation", "core-ui-badge"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-16", gap: "space-12" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 1, showsBottomNav: true },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.primary", "accent.primary", "border.default"],
});
