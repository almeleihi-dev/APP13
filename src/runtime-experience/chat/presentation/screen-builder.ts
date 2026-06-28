import type { ChatRuntimeScreenView, ChatScreenSection } from "../domain/chat-screen.js";
import { CHAT_SCREEN_PROTOTYPE_MAP, CHAT_SCREEN_ROUTES } from "../domain/chat-screen.js";
import { resolveChatLayoutBinding } from "../domain/chat-layout.js";
import type { NavigationState } from "../../../navigation-framework/navigation/navigation-state.js";
import { buildChatNavigationView, buildNavigationAccessibility } from "../application/chat-navigation.js";
import { getPrototype } from "../../../prototype-library/registry/prototype-registry.js";
import type { ChatScreenId } from "../domain/chat-screen.js";

export interface BuildChatScreenViewInput {
  screenId: ChatScreenId;
  sections: ChatScreenSection[];
  navigation: NavigationState;
  generatedAt: string;
  reducedMotion?: boolean;
}

export function buildRuntimeScreenView(input: BuildChatScreenViewInput): ChatRuntimeScreenView {
  const layout = resolveChatLayoutBinding(input.screenId);
  const prototype = getPrototype(CHAT_SCREEN_PROTOTYPE_MAP[input.screenId]);
  if (!prototype) {
    throw new Error(`Missing prototype for screen: ${input.screenId}`);
  }
  const navView = buildChatNavigationView(input.navigation, input.screenId);
  const accessibility = buildNavigationAccessibility();

  return {
    screenId: input.screenId,
    prototypeId: CHAT_SCREEN_PROTOTYPE_MAP[input.screenId],
    route: CHAT_SCREEN_ROUTES[input.screenId],
    mode: layout.mode,
    layoutId: layout.layoutId,
    designTokens: [...prototype.designTokens],
    typography: prototype.typography,
    spacing: prototype.spacing,
    regions: [...layout.regions],
    sections: input.sections,
    navigation: navView,
    accessibility: {
      ...accessibility,
      reducedMotion: input.reducedMotion ?? accessibility.reducedMotion,
    },
    generatedAt: input.generatedAt,
  };
}

export function buildComponentInstance(input: {
  id: string;
  componentId: string;
  variant?: string;
  props: Record<string, unknown>;
  label?: string;
  role?: string;
}): import("../domain/chat-screen.js").RuntimeComponentInstance {
  return {
    id: input.id,
    componentId: input.componentId,
    variant: input.variant,
    props: input.props,
    accessibility: {
      label: input.label,
      role: input.role,
      tabIndex: 0,
    },
  };
}
