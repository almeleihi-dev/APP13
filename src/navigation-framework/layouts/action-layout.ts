import { buildScreenRegions, type ScreenLayoutSpec } from "../foundation/screen-schema.js";

export const ACTION_LAYOUT: ScreenLayoutSpec = {
  id: "action-layout",
  name: "Action Mode Layout",
  mode: "action",
  purpose: "Execution-focused, contract-oriented layout with black background and white typography.",
  backgroundToken: "background.primary",
  typographyToken: "text.primary",
  regions: buildScreenRegions({
    floatingActionArea: { required: true },
    bottomNavigation: { required: false },
    transitionLayer: { required: false },
  }),
  spacing: {
    contentPaddingX: "space-20",
    contentPaddingY: "space-16",
    regionGap: "space-16",
  },
  typography: { header: "title", body: "body" },
  elevation: "low",
  motion: "fast",
  focusOrientation: "execution and contract workflows",
};

export const ACTION_LAYOUT_TOKENS = [
  "background.primary",
  "text.primary",
  "surface.elevated",
  "accent.highlight",
  "interactive.default",
] as const;
