import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const CHAT_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-chat",
  name: "Chat",
  purpose: "Shared messaging between need and action contexts.",
  category: "shared",
  mode: "shared",
  layout: {
    layoutId: "action-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/shared/chat",
  },
  navigation: { pattern: "stack", relatedScreenIds: ["prototype-contract", "prototype-active-action", "prototype-profile"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-input", "core-ui-avatar", "core-ui-button", "core-ui-card"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-12", gap: "space-8" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 2, showsSideNav: false },
  },
  designTokens: ["background.primary", "text.primary", "surface.primary", "accent.primary", "border.subtle"],
});
