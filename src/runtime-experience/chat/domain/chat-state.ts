import type { ChatScreenId } from "./chat-screen.js";
import type { ConversationSummary } from "./conversation.js";
import type { ChatMessage } from "./chat-message.js";
import {
  buildInitialNavigationState,
  type NavigationState,
} from "../../../navigation-framework/navigation/navigation-state.js";

export interface ChatSessionState {
  userId: string;
  currentScreen: ChatScreenId;
  activeConversationId?: string;
  navigation: NavigationState;
  draftMessage: string;
  generatedAt: string;
}

export function createChatSessionState(userId: string, generatedAt: string): ChatSessionState {
  return {
    userId,
    currentScreen: "chat-home",
    navigation: buildInitialNavigationState("/chat/home"),
    draftMessage: "",
    generatedAt,
  };
}

export interface ChatExperienceSnapshot {
  session: ChatSessionState;
  conversations: ConversationSummary[];
  messages: ChatMessage[];
}
