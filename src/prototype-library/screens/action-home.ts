import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

const ACTION_TOKENS = ["background.primary", "text.primary", "surface.elevated", "accent.highlight", "interactive.default"] as const;

export const ACTION_HOME_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-action-home",
  name: "Action Home",
  purpose: "Primary Action Mode dashboard — execution-focused contract and action overview.",
  category: "action",
  mode: "action",
  layout: {
    layoutId: "action-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: true,
    route: "/action/home",
  },
  navigation: { pattern: "tab", relatedScreenIds: ["prototype-contract", "prototype-chat", "prototype-success"] },
  componentsUsed: [
    "core-ui-navigation-bar",
    "core-ui-floating-action-button",
    "core-ui-contract-card",
    "core-ui-card",
    "core-ui-badge",
  ],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-20", contentPaddingY: "space-16", gap: "space-16" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 2, showsBottomNav: false },
    expanded: { columns: 3, showsSideNav: true },
  },
  designTokens: [...ACTION_TOKENS],
});

export const ACTIVE_ACTION_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-active-action",
  name: "Active Action",
  purpose: "In-progress action execution view with milestones and status.",
  category: "action",
  mode: "action",
  layout: {
    layoutId: "action-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: true,
    backBehavior: "pop-stack",
    route: "/action/active",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-action-home", relatedScreenIds: ["prototype-contract", "prototype-chat"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-progress", "core-ui-card", "core-ui-badge", "core-ui-floating-action-button"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-20", contentPaddingY: "space-16", gap: "space-16" },
  motion: "fast",
  transitionBehavior: { usesOfficialTransition: false },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: [...ACTION_TOKENS],
});
