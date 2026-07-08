import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import { AppError } from "../../../shared/errors/index.js";
import type { ChatScreenId, ChatRuntimeScreenView } from "../domain/chat-screen.js";
import {
  CHAT_EXPERIENCE_FLOW,
  CHAT_EXPERIENCE_VERSION,
  CHAT_SCREEN_PROTOTYPE_MAP,
  isChatScreenId,
} from "../domain/chat-screen.js";
import { createChatSessionState, type ChatSessionState } from "../domain/chat-state.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import {
  navigateToScreen,
  navigateBack,
  navigateBottomNav,
  navigateToConversation,
} from "./chat-navigation.js";
import { resolveChatSessionContext, syncConversationActivation } from "./chat-session.js";
import { validateMessageDraft } from "./chat-validator.js";
import { buildChatHomeScreen } from "../presentation/chat-home.js";
import { buildConversationListScreen } from "../presentation/conversation-list.js";
import { buildConversationScreen } from "../presentation/conversation-screen.js";
import { buildConversationInfoScreen } from "../presentation/conversation-info.js";
import { buildEmptyChatScreen } from "../presentation/empty-chat.js";
import { ChatRepository, createChatRepository } from "../infrastructure/chat-repository.js";
import { validateChatExperience } from "../validation/chat-experience-validator.js";

export type ChatAction =
  | { type: "navigate"; targetScreen: ChatScreenId }
  | { type: "back" }
  | { type: "bottom-nav"; itemId: string }
  | { type: "open-conversation"; conversationId: string }
  | { type: "open-info" }
  | { type: "send-message"; body?: string }
  | { type: "update-draft"; body: string }
  | { type: "return-action-home" }
  | { type: "return-contract" }
  | { type: "archive-conversation" }
  | { type: "complete-conversation" };

export class ChatExperienceService {
  private readonly repository: ChatRepository;
  private readonly sessions = new Map<string, ChatSessionState>();

  constructor(deps?: { repository?: ChatRepository }) {
    this.repository = deps?.repository ?? createChatRepository();
  }

  enterFromContract(
    authContext: AuthContext,
    input?: {
      generated_at?: string;
      contract_id?: string;
      action_id?: string;
      request_id?: string;
      title?: string;
    }
  ) {
    requireAuth(authContext);
    const generatedAt = input?.generated_at ?? new Date().toISOString();
    const conv = this.repository.createConversation(authContext.userId, {
      title: input?.title ?? "Contract Coordination Chat",
      context: {
        type: "contract",
        requestId: input?.request_id,
        contractId: input?.contract_id ?? "contract-001",
        actionId: input?.action_id,
        contractStatus: "confirmed",
        actionStatus: "ready",
      },
      createdAt: generatedAt,
    });
    syncConversationActivation(this.repository, authContext.userId, conv.id);
    const session = createChatSessionState(authContext.userId, generatedAt);
    session.activeConversationId = conv.id;
    session.currentScreen = "conversation-screen";
    session.navigation = navigateToConversation(session.navigation, conv.id);
    this.sessions.set(authContext.userId, session);
    return this.toExperienceView(session);
  }

  getExperience(authContext: AuthContext, input?: { generated_at?: string; reduced_motion?: boolean }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.toExperienceView(session, input?.reduced_motion);
  }

  getScreen(
    authContext: AuthContext,
    screenId: ChatScreenId,
    input?: { generated_at?: string; reduced_motion?: boolean }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    return this.buildScreenForSession(session, screenId, input?.reduced_motion);
  }

  getHome(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "chat-home", input?.generated_at);
  }

  getConversationList(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "conversation-list", input?.generated_at);
  }

  getConversation(
    authContext: AuthContext,
    conversationId: string,
    input?: { generated_at?: string }
  ) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    const conv = this.repository.getConversation(authContext.userId, conversationId);
    if (!conv) {
      throw new AppError({
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: `Unknown conversation: ${conversationId}`,
        code: "NOT_FOUND",
      });
    }
    session.activeConversationId = conversationId;
    session.currentScreen = "conversation-screen";
    session.navigation = navigateToConversation(session.navigation, conversationId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, "conversation-screen");
  }

  getConversationInfo(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "conversation-info", input?.generated_at);
  }

  getEmpty(authContext: AuthContext, input?: { generated_at?: string }) {
    return this.navigateTo(authContext, "empty-chat", input?.generated_at);
  }

  sendMessage(
    authContext: AuthContext,
    input: { body: string; generated_at?: string }
  ) {
    requireAuth(authContext);
    const draftCheck = validateMessageDraft(input.body);
    if (!draftCheck.valid) {
      throw new AppError({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: draftCheck.error ?? "Invalid message",
        code: "VALIDATION_ERROR",
      });
    }
    const session = this.getOrCreateSession(authContext.userId, input.generated_at);
    const conversationId = session.activeConversationId;
    if (!conversationId) {
      throw new AppError({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "No active conversation",
        code: "VALIDATION_ERROR",
      });
    }
    const sentAt = input.generated_at ?? new Date().toISOString();
    const message = this.repository.appendLocalMessage(authContext.userId, conversationId, {
      senderId: authContext.userId,
      senderRole: "customer",
      senderName: "Customer",
      body: input.body,
      sentAt,
    });
    if (!message) {
      throw new AppError({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "Cannot send message in current conversation state",
        code: "VALIDATION_ERROR",
      });
    }
    session.draftMessage = "";
    this.sessions.set(authContext.userId, session);
    return {
      message,
      local_only: true,
      backend: false,
      screen: this.buildScreenForSession(session, "conversation-screen"),
    };
  }

  completeConversation(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.activeConversationId) {
      throw new AppError({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "No active conversation",
        code: "VALIDATION_ERROR",
      });
    }
    this.repository.updateConversationState(authContext.userId, session.activeConversationId, "completed");
    this.sessions.set(authContext.userId, session);
    return {
      state: "completed" as const,
      screen: this.buildScreenForSession(session, "conversation-screen"),
    };
  }

  archiveConversation(authContext: AuthContext, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);
    if (!session.activeConversationId) {
      throw new AppError({
        type: "about:blank",
        title: "Validation Error",
        status: 400,
        detail: "No active conversation",
        code: "VALIDATION_ERROR",
      });
    }
    this.repository.archiveConversation(authContext.userId, session.activeConversationId);
    session.currentScreen = "chat-home";
    session.navigation = navigateToScreen(session.navigation, "chat-home");
    this.sessions.set(authContext.userId, session);
    return {
      state: "archived" as const,
      screen: this.buildScreenForSession(session, "chat-home"),
    };
  }

  dispatchAction(authContext: AuthContext, action: ChatAction, input?: { generated_at?: string }) {
    requireAuth(authContext);
    const session = this.getOrCreateSession(authContext.userId, input?.generated_at);

    switch (action.type) {
      case "navigate":
        session.currentScreen = action.targetScreen;
        session.navigation = navigateToScreen(session.navigation, action.targetScreen);
        break;
      case "back":
        session.navigation = navigateBack(session.navigation);
        session.currentScreen = (session.navigation.stack.at(-1)?.screenId as ChatScreenId) ?? "chat-home";
        break;
      case "bottom-nav": {
        const result = navigateBottomNav(session.navigation, action.itemId);
        session.navigation = result.navigation;
        session.currentScreen = result.screenId;
        break;
      }
      case "open-conversation":
        return this.getConversation(authContext, action.conversationId, input);
      case "open-info":
        session.currentScreen = "conversation-info";
        session.navigation = navigateToScreen(session.navigation, "conversation-info");
        break;
      case "update-draft":
        session.draftMessage = action.body;
        break;
      case "send-message":
        return this.sendMessage(authContext, {
          body: action.body ?? session.draftMessage,
          generated_at: input?.generated_at,
        });
      case "return-action-home":
        return { return_route: "/action/home", current_screen: session.currentScreen };
      case "return-contract":
        return { return_route: "/contract/home", current_screen: session.currentScreen };
      case "complete-conversation":
        return this.completeConversation(authContext, input);
      case "archive-conversation":
        return this.archiveConversation(authContext, input);
    }

    this.sessions.set(authContext.userId, session);
    return { screen: this.buildScreenForSession(session, session.currentScreen) };
  }

  getFlow() {
    return {
      version: CHAT_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      flow: CHAT_EXPERIENCE_FLOW,
      prototype_map: CHAT_SCREEN_PROTOTYPE_MAP,
      lifecycle: [
        "Need Request",
        "Contract",
        "Conversation Created",
        "Messages",
        "Action",
        "Completion",
        "Conversation Archived",
      ],
    };
  }

  validateRuntime() {
    return validateChatExperience();
  }

  private navigateTo(authContext: AuthContext, screenId: ChatScreenId, generatedAt?: string) {
    const session = this.getOrCreateSession(authContext.userId, generatedAt);
    session.currentScreen = screenId;
    session.navigation = navigateToScreen(session.navigation, screenId);
    this.sessions.set(authContext.userId, session);
    return this.buildScreenForSession(session, screenId);
  }

  private getOrCreateSession(userId: string, generatedAt?: string): ChatSessionState {
    const at = generatedAt ?? new Date().toISOString();
    const existing = this.sessions.get(userId);
    if (existing) {
      if (generatedAt) existing.generatedAt = generatedAt;
      return existing;
    }
    const session = createChatSessionState(userId, at);
    this.repository.getConversations(userId);
    this.sessions.set(userId, session);
    return session;
  }

  private buildScreenForSession(
    session: ChatSessionState,
    screenId: ChatScreenId,
    _reducedMotion = false
  ): ChatRuntimeScreenView {
    const ctx = resolveChatSessionContext(this.repository, session);

    switch (screenId) {
      case "chat-home":
        return buildChatHomeScreen(ctx.conversations, session.navigation, session.generatedAt);
      case "conversation-list":
        return buildConversationListScreen(
          this.repository.getConversations(session.userId),
          session.navigation,
          session.generatedAt
        );
      case "conversation-screen":
        if (!ctx.activeConversation) {
          return buildChatHomeScreen(ctx.conversations, session.navigation, session.generatedAt);
        }
        return buildConversationScreen(
          ctx.activeConversation,
          ctx.messages,
          session.draftMessage,
          session.navigation,
          session.generatedAt
        );
      case "conversation-info":
        if (!ctx.activeConversation) {
          return buildChatHomeScreen(ctx.conversations, session.navigation, session.generatedAt);
        }
        return buildConversationInfoScreen(ctx.activeConversation, session.navigation, session.generatedAt);
      case "empty-chat":
        return buildEmptyChatScreen(session.navigation, session.generatedAt);
      default:
        if (!isChatScreenId(screenId)) throw new Error(`Unknown screen: ${screenId}`);
        return buildChatHomeScreen(ctx.conversations, session.navigation, session.generatedAt);
    }
  }

  private toExperienceView(session: ChatSessionState, reducedMotion?: boolean) {
    const ctx = resolveChatSessionContext(this.repository, session);
    return {
      version: CHAT_EXPERIENCE_VERSION,
      need_experience_version: NEED_EXPERIENCE_VERSION,
      action_experience_version: ACTION_EXPERIENCE_VERSION,
      contract_experience_version: CONTRACT_EXPERIENCE_VERSION,
      current_screen: session.currentScreen,
      active_conversation_id: session.activeConversationId,
      screen: this.buildScreenForSession(session, session.currentScreen, reducedMotion),
      navigation: session.navigation,
      conversations: ctx.conversations,
      message_count: ctx.messages.length,
      draft_message: session.draftMessage,
      flow: CHAT_EXPERIENCE_FLOW,
      generated_at: session.generatedAt,
      runtime_experience: true,
      local_only: true,
      realtime: false,
    };
  }
}

export interface ChatExperienceModule {
  chatExperience: ChatExperienceService;
}

export function createChatExperienceModule(deps?: { repository?: ChatRepository }): ChatExperienceModule {
  return { chatExperience: new ChatExperienceService(deps) };
}

export function createChatExperienceService(deps?: { repository?: ChatRepository }): ChatExperienceService {
  return new ChatExperienceService(deps);
}
