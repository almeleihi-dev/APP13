import { buildPrototypeSpec } from "../foundation/prototype-schema.js";

export const LOADING_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-loading",
  name: "Loading",
  purpose: "Inline and full-screen loading states with linear progress.",
  category: "system",
  mode: "system",
  layout: {
    layoutId: "need-layout",
    topNavigation: false,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: false,
    route: "/system/loading",
  },
  navigation: { pattern: "stack", relatedScreenIds: ["prototype-transition", "prototype-search"] },
  componentsUsed: ["core-ui-progress", "core-ui-loading"],
  typography: { header: "body", body: "caption" },
  spacing: { contentPaddingX: "space-24", contentPaddingY: "space-24", gap: "space-12" },
  motion: "normal",
  transitionBehavior: { usesOfficialTransition: false, progressVariant: "linear" },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 1, showsSideNav: false },
  },
  designTokens: ["surface.muted", "accent.primary", "text.secondary", "background.primary"],
});
