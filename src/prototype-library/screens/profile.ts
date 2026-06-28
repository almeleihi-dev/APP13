import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const PROFILE_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-profile",
  name: "Profile",
  purpose: "Professional profile with avatar, live frame, and badges.",
  category: "shared",
  mode: "shared",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    route: "/shared/profile",
  },
  navigation: { pattern: "tab", relatedScreenIds: ["prototype-need-home", "prototype-timeline", "prototype-analytics"] },
  componentsUsed: [
    "core-ui-navigation-bar",
    "core-ui-avatar",
    "core-ui-live-frame",
    "core-ui-badge",
    "core-ui-bottom-navigation",
    "core-ui-card",
  ],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-16", gap: "space-16" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 1, showsBottomNav: true },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.elevated", "accent.primary", "border.subtle"],
});
