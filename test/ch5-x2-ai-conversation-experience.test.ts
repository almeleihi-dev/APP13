import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiConversationExperienceRoutes } from "../src/api/routes/ai-conversation-experience.js";
import {
  AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION,
  AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP,
  CONVERSATION_SCENARIO_IDS,
  CONVERSATION_SCENARIO_TO_CANONICAL,
  AI_CONVERSATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiConversationExperienceModule,
  createConversationContextBuilder,
  createConversationThreadBuilder,
  createAiConversationExperienceValidator,
} from "../src/ai-conversation-experience/module.js";
import { createAiExperienceFoundationModule } from "../src/ai-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x2",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x2-user-session",
};

describe("CH5-X2 AI Conversation Experience", () => {
  describe("domain (unit)", () => {
    it("provides conversation scenarios aligned with X1 foundation", () => {
      assert.equal(CONVERSATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of CONVERSATION_SCENARIO_IDS) {
        assert.ok(
          CONVERSATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_CONVERSATION_EXPERIENCE_CHAIN.length, 24);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X1");
      assert.ok(AI_CONVERSATION_EXPERIENCE_CHAIN.includes("ai_conversation_experience"));
    });

    it("builds conversation context from foundation output deterministically", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const foundation = aiExperienceFoundation.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createConversationContextBuilder();

      const first = builder.build(foundation);
      const second = builder.build(foundation);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.foundationOutputId, /^ai-foundation-/);
    });

    it("generates conversation thread from foundation output deterministically", () => {
      const { aiExperienceFoundation } = createAiExperienceFoundationModule();
      const foundation = aiExperienceFoundation.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const thread = createConversationThreadBuilder().build(foundation);
      assert.equal(thread.readOnly, true);
      assert.equal(thread.messageCount, 4);
      assert.match(thread.title, /AI Conversation/i);
    });

    it("generates conversation confidence from foundation output", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const output = aiConversationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.conversationConfidence.level));
      assert.ok(output.conversationConfidence.score >= 40);
    });

    it("validates conversation outputs for all scenarios", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const validator = createAiConversationExperienceValidator();

      for (const scenarioId of CONVERSATION_SCENARIO_IDS) {
        const output = aiConversationExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.foundationOutputId.startsWith("ai-foundation-"));
        assert.equal(output.conversationMessages.messages.length, 4);
        assert.ok(output.explanation.threadSummary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid conversation for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Conversation Experience home for authenticated users", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const home = aiConversationExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X1");
      assert.ok(home.conversation_chain.includes("ai_conversation_experience"));
      assert.ok(home.conversation_views.includes("Conversation Messages"));
    });

    it("rejects unauthenticated access", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      assert.throws(
        () => aiConversationExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic conversation outputs for the same scenario", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const first = aiConversationExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiConversationExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.conversation_context, second.conversation_context);
    });

    it("links conversation output to AI Experience foundation", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const output = aiConversationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.foundationOutputId, /^ai-foundation-/);
      assert.match(output.closureOutputId, /^closure-/);
      assert.match(output.outputId, /^conversation-ai-foundation-/);
    });

    it("includes human-readable conversation explanation", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const explanation = aiConversationExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /conversation|messages|confidence/i);
      assert.ok(explanation.explanation.contextSummary.length > 0);
      assert.ok(explanation.conversation_confidence.score >= 40);
    });

    it("delegates upstream only through AI Experience foundation", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const delegation = aiConversationExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X1 AI Experience Foundation");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X2", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiConversationExperienceModule/);
      assert.match(indexSource, /aiConversationExperience/);
      assert.match(serverSource, /registerAiConversationExperienceRoutes/);
      assert.match(serverSource, /aiConversationExperience/);
      assert.match(packageSource, /verify:ch5-x2/);
      assert.match(packageSource, /test:ch5-x2-ai-conversation-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Conversation Experience routes behind auth middleware", async () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiConversationExperienceRoutes(app, aiConversationExperience);

      const home = await app.inject({ method: "GET", url: "/ai-conversation-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        conversation_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.conversation_context.experienceMode, "read_only");
      assert.match(contextBody.conversation_context.contextId, /^conversation-context-ai-foundation-/);

      const thread = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/thread?scenario_id=cleaning_an_apartment",
      });
      assert.equal(thread.statusCode, 200);

      const messages = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/messages?scenario_id=fixing_small_home_issue",
      });
      assert.equal(messages.statusCode, 200);
      const messagesBody = messages.json() as { view: { messages: unknown[] } };
      assert.equal(messagesBody.view.messages.length, 4);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; messageCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_CONVERSATION_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_CONVERSATION_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.messageCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-conversation-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
