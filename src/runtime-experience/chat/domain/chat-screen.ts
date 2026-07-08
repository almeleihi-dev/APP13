import type { SemanticColorTokenPath } from "../../../design-system/foundation/colors.js";
import type { SpacingTokenName } from "../../../design-system/foundation/spacing.js";
import type { TypographyStyle } from "../../../design-system/foundation/typography.js";

export const CHAT_EXPERIENCE_VERSION = "an-act-chat-experience-v1" as const;

export const CHAT_SCREEN_IDS = [
  "chat-home",
  "conversation-list",
  "conversation-screen",
  "conversation-info",
  "empty-chat",
] as const;

export type ChatScreenId = (typeof CHAT_SCREEN_IDS)[number];

export const CHAT_SCREEN_PROTOTYPE_MAP: Record<ChatScreenId, string> = {
  "chat-home": "prototype-chat",
  "conversation-list": "prototype-chat",
  "conversation-screen": "prototype-chat",
  "conversation-info": "prototype-chat",
  "empty-chat": "prototype-empty-state",
};

export const CHAT_SCREEN_ROUTES: Record<ChatScreenId, string> = {
  "chat-home": "/chat/home",
  "conversation-list": "/chat/conversations",
  "conversation-screen": "/chat/conversation",
  "conversation-info": "/chat/conversation/info",
  "empty-chat": "/chat/empty",
};

export interface RuntimeComponentInstance {
  id: string;
  componentId: string;
  variant?: string;
  props: Record<string, unknown>;
  accessibility?: {
    label?: string;
    role?: string;
    tabIndex?: number;
    describedBy?: string;
  };
}

export interface ChatScreenSection {
  id: string;
  label: string;
  purpose: string;
  components: RuntimeComponentInstance[];
}

export interface ChatScreenNavigationView {
  pattern: "stack" | "tab" | "modal" | "sheet";
  canGoBack: boolean;
  backRoute?: string;
  bottomNavigationVisible: boolean;
  activeNavId?: string;
  stackDepth: number;
  nextRoute?: string;
  returnToActionHomeRoute: string;
  returnToContractRoute: string;
}

export interface ChatScreenAccessibilityView {
  minimumTouchTargetPx: number;
  supportsKeyboardNavigation: boolean;
  supportsScreenReader: boolean;
  reducedMotion: boolean;
  focusRegion: string;
  landmarkRegions: readonly string[];
}

export interface ChatRuntimeScreenView {
  screenId: ChatScreenId;
  prototypeId: string;
  route: string;
  mode: "action" | "shared";
  layoutId: string;
  designTokens: SemanticColorTokenPath[];
  typography: { header: TypographyStyle; body: TypographyStyle };
  spacing: { contentPaddingX: SpacingTokenName; contentPaddingY: SpacingTokenName; gap: SpacingTokenName };
  regions: string[];
  sections: ChatScreenSection[];
  navigation: ChatScreenNavigationView;
  accessibility: ChatScreenAccessibilityView;
  generatedAt: string;
}

export interface ChatExperienceFlowStep {
  screenId: ChatScreenId;
  route: string;
  label: string;
}

export const CHAT_EXPERIENCE_FLOW: ChatExperienceFlowStep[] = [
  { screenId: "chat-home", route: CHAT_SCREEN_ROUTES["chat-home"], label: "Chat Home" },
  { screenId: "conversation-list", route: CHAT_SCREEN_ROUTES["conversation-list"], label: "Conversation List" },
  { screenId: "conversation-screen", route: CHAT_SCREEN_ROUTES["conversation-screen"], label: "Conversation" },
  { screenId: "conversation-info", route: CHAT_SCREEN_ROUTES["conversation-info"], label: "Conversation Info" },
];

export function isChatScreenId(value: string): value is ChatScreenId {
  return CHAT_SCREEN_IDS.includes(value as ChatScreenId);
}
