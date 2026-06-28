import { ACTION_LAYOUT, ACTION_LAYOUT_TOKENS } from "../../../navigation-framework/layouts/action-layout.js";
import { buildScreenContext, type ScreenContext } from "../../../navigation-framework/foundation/screen-context.js";
import { ACTION_MODE_THEME } from "../../../design-system/themes/action-mode.js";
import type { ChatScreenId } from "./chat-screen.js";

export interface ChatLayoutBinding {
  layoutId: string;
  mode: "action" | "shared";
  backgroundToken: string;
  typographyToken: string;
  spacing: typeof ACTION_LAYOUT.spacing;
  typography: typeof ACTION_LAYOUT.typography;
  designTokens: readonly string[];
  regions: readonly string[];
}

export function resolveChatLayoutBinding(_screenId: ChatScreenId): ChatLayoutBinding {
  return {
    layoutId: ACTION_LAYOUT.id,
    mode: "shared",
    backgroundToken: ACTION_LAYOUT.backgroundToken,
    typographyToken: ACTION_LAYOUT.typographyToken,
    spacing: ACTION_LAYOUT.spacing,
    typography: ACTION_LAYOUT.typography,
    designTokens: ACTION_LAYOUT_TOKENS,
    regions: ACTION_LAYOUT.regions.map((r) => r.id),
  };
}

export function buildChatScreenContext(input?: {
  reducedMotion?: boolean;
  keyboardNavigation?: boolean;
  screenReaderEnabled?: boolean;
}): ScreenContext {
  return buildScreenContext({
    mode: "action",
    reducedMotion: input?.reducedMotion ?? false,
    keyboardNavigation: input?.keyboardNavigation ?? true,
    screenReaderEnabled: input?.screenReaderEnabled ?? true,
  });
}

export function resolveChatThemeColors() {
  return ACTION_MODE_THEME.colors;
}
