import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const ERROR_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-error",
  name: "Error",
  purpose: "Error state with recovery actions and clear messaging.",
  category: "system",
  mode: "system",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/system/error",
  },
  navigation: { pattern: "stack", relatedScreenIds: ["prototype-need-home", "prototype-loading"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-button", "core-ui-card", "core-ui-dialog"],
  typography: { header: "heading", body: "body" },
  spacing: { contentPaddingX: "space-24", contentPaddingY: "space-32", gap: "space-16" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 1, showsSideNav: false },
  },
  designTokens: ["background.primary", "text.primary", "status.error", "surface.primary", "accent.primary"],
});
