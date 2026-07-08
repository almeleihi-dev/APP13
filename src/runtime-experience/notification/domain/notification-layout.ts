import { NEED_LAYOUT, NEED_LAYOUT_TOKENS } from "../../../navigation-framework/layouts/need-layout.js";
import { buildScreenContext, type ScreenContext } from "../../../navigation-framework/foundation/screen-context.js";
import { NEED_MODE_THEME } from "../../../design-system/themes/need-mode.js";
import type { NotificationScreenId } from "./notification-screen.js";

export interface NotificationLayoutBinding {
  layoutId: string;
  mode: "need" | "shared";
  backgroundToken: string;
  typographyToken: string;
  spacing: typeof NEED_LAYOUT.spacing;
  typography: typeof NEED_LAYOUT.typography;
  designTokens: readonly string[];
  regions: readonly string[];
}

export function resolveNotificationLayoutBinding(_screenId: NotificationScreenId): NotificationLayoutBinding {
  return {
    layoutId: NEED_LAYOUT.id,
    mode: "shared",
    backgroundToken: NEED_LAYOUT.backgroundToken,
    typographyToken: NEED_LAYOUT.typographyToken,
    spacing: NEED_LAYOUT.spacing,
    typography: NEED_LAYOUT.typography,
    designTokens: NEED_LAYOUT_TOKENS,
    regions: NEED_LAYOUT.regions.map((r) => r.id),
  };
}

export function buildNotificationScreenContext(input?: {
  reducedMotion?: boolean;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
}): ScreenContext {
  return buildScreenContext({
    mode: "need",
    reducedMotion: input?.reducedMotion ?? false,
    keyboardNavigation: input?.keyboardNavigation ?? true,
    screenReaderEnabled: input?.screenReaderEnabled ?? true,
  });
}

export function resolveNotificationThemeColors() {
  return NEED_MODE_THEME.colors;
}
