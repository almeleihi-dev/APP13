import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import type { AuthContext } from "../src/shared/auth/index.js";
import {
  CHAT_EXPERIENCE_VERSION,
  CHAT_SCREEN_IDS,
  CHAT_EXPERIENCE_FLOW,
  validateChatExperience,
  createAnActChatExperienceModule,
  createChatExperienceService,
  createChatRepository,
  buildChatHomeScreen,
  buildConversationScreen,
  buildEmptyChatScreen,
  canSendMessages,
  describeConversationState,
} from "../src/runtime-experience/chat/module.js";
import { NEED_EXPERIENCE_VERSION } from "../src/runtime-experience/need/module.js";
import { ACTION_EXPERIENCE_VERSION } from "../src/runtime-experience/action/module.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../src/runtime-experience/contract/module.js";
import { buildInitialNavigationState } from "../src/navigation-framework/module.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-chat-exp-001",
  sessionId: "session-chat-exp-001",
  roles: ["customer"],
  scopes: [],
  authenticated: true,
};

const FIXED_AT = "2026-06-20T18:00:00.000Z";

describe("CH3-X8 AN ACT Chat Experience", () => {
  describe("domain", () => {
    it("defines chat screen ids and conversation states", () => {
      assert.equal(CHAT_SCREEN_IDS.length, 5);
      assert.ok(CHAT_EXPERIENCE_FLOW.some((s) => s.screenId === "chat-home"));
      assert.ok(CHAT_EXPERIENCE_FLOW.some((s) => s.screenId === "conversation-screen"));
      assert.equal(canSendMessages("active"), true);
      assert.equal(canSendMessages("archived"), false);
      assert.ok(describeConversationState("draft").includes("Draft"));
    });
  });

  describe("presentation", () => {
    it("builds chat home with required sections", () => {
      const repository = createChatRepository();
      const conversations = repository.getConversations(USER_AUTH.userId);
      const screen = buildChatHomeScreen(
        conversations,
        buildInitialNavigationState("/chat/home"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "chat-home");
      assert.equal(screen.layoutId, "action-layout");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("active-conversations"));
      assert.ok(sectionIds.includes("unread-placeholder"));
      assert.ok(sectionIds.includes("bottom-navigation"));
    });

    it("builds conversation screen with messages and input", () => {
      const repository = createChatRepository();
      const conv = repository.getConversations(USER_AUTH.userId)[0]!;
      const messages = repository.getMessages(conv.id);
      const screen = buildConversationScreen(
        conv,
        messages,
        "",
        buildInitialNavigationState("/chat/conversation"),
        FIXED_AT
      );
      assert.equal(screen.screenId, "conversation-screen");
      const sectionIds = screen.sections.map((s) => s.id);
      assert.ok(sectionIds.includes("messages"));
      assert.ok(sectionIds.includes("message-input"));
      assert.ok(sectionIds.includes("attachment-placeholder"));
      assert.ok(sectionIds.includes("scroll-state"));
    });

    it("uses core UI components without custom styling", () => {
      const screen = buildEmptyChatScreen(buildInitialNavigationState("/chat/empty"), FIXED_AT);
      for (const section of screen.sections) {
        for (const component of section.components) {
          assert.ok(component.componentId.startsWith("core-ui-"));
        }
      }
    });
  });

  describe("service", () => {
    const service = createChatExperienceService({ repository: createChatRepository() });

    it("enters chat experience from contract", () => {
      const experience = service.enterFromContract(USER_AUTH, {
        generated_at: FIXED_AT,
        contract_id: "contract-chat-001",
        action_id: "action-chat-001",
        title: "Panel Upgrade Chat",
      });
      assert.equal(experience.version, CHAT_EXPERIENCE_VERSION);
      assert.equal(experience.need_experience_version, NEED_EXPERIENCE_VERSION);
      assert.equal(experience.action_experience_version, ACTION_EXPERIENCE_VERSION);
      assert.equal(experience.contract_experience_version, CONTRACT_EXPERIENCE_VERSION);
      assert.equal(experience.current_screen, "conversation-screen");
      assert.equal(experience.runtime_experience, true);
      assert.equal(experience.local_only, true);
      assert.equal(experience.realtime, false);
    });

    it("supports conversation navigation and local messaging", () => {
      service.enterFromContract(USER_AUTH, { generated_at: FIXED_AT });
      const home = service.getHome(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(home.screenId, "chat-home");
      const list = service.getConversationList(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(list.screenId, "conversation-list");
      const sent = service.sendMessage(USER_AUTH, {
        body: "On my way.",
        generated_at: FIXED_AT,
      });
      assert.equal(sent.local_only, true);
      assert.equal(sent.backend, false);
      assert.equal(sent.message.body, "On my way.");
    });

    it("supports completion and archive lifecycle", () => {
      service.enterFromContract(USER_AUTH, { generated_at: FIXED_AT });
      const completed = service.completeConversation(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(completed.state, "completed");
      const archived = service.archiveConversation(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(archived.state, "archived");
      assert.equal(archived.screen.screenId, "chat-home");
    });

    it("supports back and bottom navigation", () => {
      service.getConversationList(USER_AUTH, { generated_at: FIXED_AT });
      const back = service.dispatchAction(USER_AUTH, { type: "back" }, { generated_at: FIXED_AT }) as {
        screen: { screenId: string };
      };
      assert.ok(back.screen);
      const nav = service.dispatchAction(
        USER_AUTH,
        { type: "bottom-nav", itemId: "conversations" },
        { generated_at: FIXED_AT }
      ) as { screen: { screenId: string } };
      assert.equal(nav.screen.screenId, "conversation-list");
    });

    it("returns handoff routes for action and contract", () => {
      const actionHome = service.dispatchAction(USER_AUTH, { type: "return-action-home" }) as {
        return_route: string;
      };
      assert.equal(actionHome.return_route, "/action/home");
      const contract = service.dispatchAction(USER_AUTH, { type: "return-contract" }) as {
        return_route: string;
      };
      assert.equal(contract.return_route, "/contract/home");
    });
  });

  describe("validation", () => {
    it("passes full chat experience runtime validation", () => {
      const result = validateChatExperience();
      assert.equal(result.valid, true, result.errors.join("; "));
      assert.equal(result.errors.length, 0);
      assert.equal(result.checked.screens, 5);
      assert.equal(result.checked.conversationStates, true);
      assert.equal(result.checked.needExperienceLink, true);
      assert.equal(result.checked.actionExperienceLink, true);
      assert.equal(result.checked.contractExperienceLink, true);
    });

    it("module factory exposes validate and service", () => {
      const mod = createAnActChatExperienceModule();
      assert.equal(mod.version, CHAT_EXPERIENCE_VERSION);
      assert.equal(mod.validate().valid, true);
      assert.ok(mod.chatExperience.getFlow().flow.length >= 4);
      assert.ok(mod.chatExperience.getFlow().lifecycle.includes("Conversation Archived"));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH3-X8", async () => {
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");
      assert.match(packageSource, /verify:ch3-x8/);
      assert.match(packageSource, /test:ch3-x8-chat-experience/);
    });

    it("registers chat experience routes module", async () => {
      const routesSource = await readFile(path.join(ROOT_DIR, "src/api/routes/chat-experience.ts"), "utf8");
      assert.match(routesSource, /\/chat-experience/);
      assert.match(routesSource, /\/chat-experience\/enter/);
      assert.match(routesSource, /\/chat-experience\/message/);
      assert.match(routesSource, /\/chat-experience\/archive/);
    });
  });
});
