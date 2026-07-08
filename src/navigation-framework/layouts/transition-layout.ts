import { OFFICIAL_TRANSITION_SCREEN } from "../../design-system/core-ui/components/loading.js";
import { buildScreenRegions, type ScreenLayoutSpec } from "../foundation/screen-schema.js";

export const TRANSITION_LAYOUT: ScreenLayoutSpec = {
  id: "transition-layout",
  name: "Transition Layout",
  mode: "transition",
  purpose: "Official an act... mode transition screen with progress and background interpolation.",
  backgroundToken: "transition.start",
  typographyToken: "text.primary",
  regions: buildScreenRegions({
    topNavigation: { required: false },
    screenHeader: { required: false },
    bottomNavigation: { required: false },
    floatingActionArea: { required: false },
    transitionLayer: { required: true },
  }),
  spacing: {
    contentPaddingX: "space-24",
    contentPaddingY: "space-32",
    regionGap: "space-16",
  },
  typography: { header: "terminal", body: "terminal" },
  elevation: "none",
  motion: "extraSlow",
  focusOrientation: "mode transition",
};

export const TRANSITION_LAYOUT_SPEC = {
  layout: TRANSITION_LAYOUT,
  official: OFFICIAL_TRANSITION_SCREEN,
  brandLine: OFFICIAL_TRANSITION_SCREEN.brandLine,
  stageTexts: OFFICIAL_TRANSITION_SCREEN.stageTexts,
  backgroundInterpolation: OFFICIAL_TRANSITION_SCREEN.backgroundInterpolation,
  progressBar: OFFICIAL_TRANSITION_SCREEN.progressBar,
};
