import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const CONTRACT_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-contract",
  name: "Contract",
  purpose: "Contract review and signing screen in Action Mode.",
  category: "action",
  mode: "action",
  layout: {
    layoutId: "action-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: true,
    backBehavior: "pop-stack",
    route: "/action/contract",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-action-home", relatedScreenIds: ["prototype-active-action", "prototype-success", "prototype-chat"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-contract-card", "core-ui-button", "core-ui-badge", "core-ui-progress"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-20", contentPaddingY: "space-16", gap: "space-16" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.elevated", "accent.highlight", "status.info"],
});
