import { MODAL_COMPONENT } from "../../design-system/core-ui/components/modal.js";
import { SHEET_COMPONENT } from "../../design-system/core-ui/components/sheet.js";
import { DIALOG_COMPONENT } from "../../design-system/core-ui/components/dialog.js";
import { buildScreenRegions, type ScreenLayoutSpec } from "../foundation/screen-schema.js";

export const MODAL_LAYOUT: ScreenLayoutSpec = {
  id: "modal-layout",
  name: "Modal Layout",
  mode: "modal",
  purpose: "Centered modal overlay layout blocking bottom navigation.",
  backgroundToken: "overlay.scrim",
  typographyToken: "text.primary",
  regions: buildScreenRegions({
    topNavigation: { required: false },
    screenHeader: { required: true },
    bottomNavigation: { required: false },
    floatingActionArea: { required: false },
    transitionLayer: { required: false },
  }),
  spacing: {
    contentPaddingX: "space-24",
    contentPaddingY: "space-24",
    regionGap: "space-16",
  },
  typography: { header: "title", body: "body" },
  elevation: "highest",
  motion: "normal",
  focusOrientation: "focused task",
};

export const MODAL_BEHAVIOR = {
  component: MODAL_COMPONENT,
  blocksBottomNavigation: true,
  blocksSideNavigation: false,
  dismissOnEscape: true,
  dismissOnScrimTap: false,
  trapsFocus: true,
} as const;

export const BOTTOM_SHEET_BEHAVIOR = {
  component: SHEET_COMPONENT,
  blocksBottomNavigation: true,
  dismissOnEscape: true,
  dismissOnSwipeDown: true,
  trapsFocus: true,
  snapPoints: ["half", "full"] as const,
} as const;

export const DIALOG_BEHAVIOR = {
  component: DIALOG_COMPONENT,
  blocksBottomNavigation: true,
  dismissOnEscape: true,
  requiresExplicitConfirmation: true,
  trapsFocus: true,
} as const;

export const OVERLAY_BEHAVIOR = {
  blocksBottomNavigation: false,
  dismissOnEscape: true,
  trapsFocus: false,
} as const;
