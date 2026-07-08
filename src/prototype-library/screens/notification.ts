import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const NOTIFICATION_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-notification",
  name: "Notifications",
  purpose: "Notification center with toast and list patterns.",
  category: "shared",
  mode: "shared",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: true,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/shared/notifications",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-need-home", relatedScreenIds: ["prototype-profile", "prototype-chat"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-card", "core-ui-toast", "core-ui-badge", "core-ui-bottom-navigation"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-12", gap: "space-8" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: true },
    regular: { columns: 1, showsBottomNav: true },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.primary", "accent.primary", "status.info"],
});
