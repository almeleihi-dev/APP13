import { buildPrototypeSpec, OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";

export const REQUEST_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-request",
  name: "Request Creation",
  purpose: "Create a professional request before transitioning to Action Mode.",
  category: "need",
  mode: "need",
  layout: {
    layoutId: "need-layout",
    topNavigation: true,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: false,
    backBehavior: "pop-stack",
    route: "/need/request/create",
  },
  navigation: { pattern: "stack", parentScreenId: "prototype-opportunity-list", relatedScreenIds: ["prototype-transition", "prototype-contract"] },
  componentsUsed: ["core-ui-navigation-bar", "core-ui-input", "core-ui-button", "core-ui-card", "core-ui-chip"],
  typography: { header: "title", body: "body" },
  spacing: { contentPaddingX: "space-16", contentPaddingY: "space-16", gap: "space-16" },
  motion: "normal",
  transitionBehavior: {
    usesOfficialTransition: true,
    direction: OFFICIAL_TRANSITION_SPEC.forward,
    brandLine: OFFICIAL_TRANSITION_SPEC.brandLine,
    stageTexts: OFFICIAL_TRANSITION_SPEC.stageTexts,
    progressVariant: OFFICIAL_TRANSITION_SPEC.progressVariant,
  },
  responsive: {
    compact: { columns: 1, showsBottomNav: false },
    regular: { columns: 1, showsBottomNav: false },
    expanded: { columns: 2, showsSideNav: true },
  },
  designTokens: ["background.primary", "text.primary", "surface.primary", "accent.primary", "border.focus"],
});
