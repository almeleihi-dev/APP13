import { buildPrototypeSpec, OFFICIAL_TRANSITION_SPEC } from "../foundation/prototype-schema.js";

export const TRANSITION_PROTOTYPE = buildPrototypeSpec({
  id: "prototype-transition",
  name: "Transition",
  purpose: "Official an act... mode transition screen bridging Need and Action.",
  category: "system",
  mode: "transition",
  layout: {
    layoutId: "transition-layout",
    topNavigation: false,
    bottomNavigation: false,
    sideNavigation: false,
    floatingAction: false,
    route: "/system/transition",
  },
  navigation: { pattern: "stack", relatedScreenIds: ["prototype-request", "prototype-action-home", "prototype-loading"] },
  componentsUsed: ["core-ui-loading", "core-ui-progress"],
  typography: { header: "terminal", body: "terminal" },
  spacing: { contentPaddingX: "space-24", contentPaddingY: "space-32", gap: "space-16" },
  motion: "extraSlow",
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
    expanded: { columns: 1, showsSideNav: false },
  },
  designTokens: ["transition.start", "transition.mid", "transition.end", "accent.primary", "surface.muted", "text.primary"],
});
