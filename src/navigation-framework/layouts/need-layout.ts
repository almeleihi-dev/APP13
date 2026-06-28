import { buildScreenRegions, type ScreenLayoutSpec } from "../foundation/screen-schema.js";

export const NEED_LAYOUT: ScreenLayoutSpec = {
  id: "need-layout",
  name: "Need Mode Layout",
  mode: "need",
  purpose: "Reading-focused, search-oriented layout with white background and black typography.",
  backgroundToken: "background.primary",
  typographyToken: "text.primary",
  regions: buildScreenRegions({
    bottomNavigation: { required: false },
    floatingActionArea: { required: false },
    transitionLayer: { required: false },
  }),
  spacing: {
    contentPaddingX: "space-16",
    contentPaddingY: "space-16",
    regionGap: "space-12",
  },
  typography: { header: "heading", body: "body" },
  elevation: "none",
  motion: "normal",
  focusOrientation: "reading and search discovery",
};

export const NEED_LAYOUT_TOKENS = [
  "background.primary",
  "text.primary",
  "surface.secondary",
  "accent.primary",
  "border.subtle",
] as const;
