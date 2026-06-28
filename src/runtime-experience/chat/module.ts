export {
  CHAT_EXPERIENCE_VERSION,
  CHAT_SCREEN_IDS,
  CHAT_SCREEN_PROTOTYPE_MAP,
  CHAT_SCREEN_ROUTES,
  CHAT_EXPERIENCE_FLOW,
  isChatScreenId,
  type ChatScreenId,
  type ChatRuntimeScreenView,
  type ChatScreenSection,
  type RuntimeComponentInstance,
} from "./domain/chat-screen.js";

export {
  buildDefaultConversation,
  describeConversationState,
  canSendMessages,
  type ConversationState,
  type ConversationSummary,
  type ConversationContext,
  type ConversationParticipant,
} from "./domain/conversation.js";

export {
  buildMessage,
  buildDefaultMessages,
  buildDraftMessage,
  type ChatMessage,
  type MessageSenderRole,
  type DeliveryPlaceholderStatus,
} from "./domain/chat-message.js";

export {
  resolveChatLayoutBinding,
  buildChatScreenContext,
  resolveChatThemeColors,
} from "./domain/chat-layout.js";

export {
  createChatSessionState,
  type ChatSessionState,
  type ChatExperienceSnapshot,
} from "./domain/chat-state.js";

export {
  ChatExperienceService,
  createChatExperienceModule,
  createChatExperienceService,
  type ChatExperienceModule,
  type ChatAction,
} from "./application/chat-experience-service.js";

export {
  CHAT_NAV_ITEMS,
  buildChatNavigationView,
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToConversation,
  buildNavigationAccessibility,
} from "./application/chat-navigation.js";

export {
  resolveChatSessionContext,
  syncConversationActivation,
  type ChatSessionContext,
} from "./application/chat-session.js";

export {
  validateChatSession,
  validateMessageDraft,
  type ChatSessionValidation,
} from "./application/chat-validator.js";

export { buildChatHomeScreen } from "./presentation/chat-home.js";
export { buildConversationListScreen } from "./presentation/conversation-list.js";
export { buildConversationScreen } from "./presentation/conversation-screen.js";
export { buildMessageInputSection } from "./presentation/message-input.js";
export { buildAttachmentPlaceholderSection } from "./presentation/attachment-placeholder.js";
export { buildConversationInfoScreen } from "./presentation/conversation-info.js";
export { buildEmptyChatScreen } from "./presentation/empty-chat.js";
export { buildRuntimeScreenView, buildComponentInstance } from "./presentation/screen-builder.js";

export {
  ChatRepository,
  createChatRepository,
  chatRepository,
} from "./infrastructure/chat-repository.js";

export {
  validateChatExperience,
  type ChatExperienceValidationResult,
} from "./validation/chat-experience-validator.js";

import { validateChatExperience } from "./validation/chat-experience-validator.js";
import { CHAT_EXPERIENCE_VERSION } from "./domain/chat-screen.js";
import { ChatExperienceService, createChatExperienceService } from "./application/chat-experience-service.js";

export interface AnActChatExperienceModule {
  version: typeof CHAT_EXPERIENCE_VERSION;
  chatExperience: ChatExperienceService;
  validate: typeof validateChatExperience;
}

export function createAnActChatExperienceModule(): AnActChatExperienceModule {
  const chatExperience = createChatExperienceService();
  return {
    version: CHAT_EXPERIENCE_VERSION,
    chatExperience,
    validate: validateChatExperience,
  };
}

export const CHAT_EXPERIENCE_PHILOSOPHY = {
  name: "AN ACT Chat Experience",
  version: CHAT_EXPERIENCE_VERSION,
  principles: [
    "Action-centric chat tied to requests, contracts, or active actions",
    "Local display only — no realtime messaging, websockets, or notifications",
    "Consumes CH3-X1 through CH3-X7 foundations",
    "No AI assistant, no file uploads, no business logic",
    "Official runtime chat experience for AN ACT coordination",
  ],
} as const;
