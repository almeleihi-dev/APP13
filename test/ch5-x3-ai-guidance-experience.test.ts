import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiGuidanceExperienceRoutes } from "../src/api/routes/ai-guidance-experience.js";
import {
  AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION,
  AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP,
  GUIDANCE_SCENARIO_IDS,
  GUIDANCE_SCENARIO_TO_CANONICAL,
  AI_GUIDANCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiGuidanceExperienceModule,
  createGuidanceContextBuilder,
  createGuidancePlanBuilder,
  createAiGuidanceExperienceValidator,
} from "../src/ai-guidance-experience/module.js";
import { createAiConversationExperienceModule } from "../src/ai-conversation-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x3",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x3-user-session",
};

describe("CH5-X3 AI Guidance Experience", () => {
  describe("domain (unit)", () => {
    it("provides guidance scenarios aligned with X2 conversation", () => {
      assert.equal(GUIDANCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of GUIDANCE_SCENARIO_IDS) {
        assert.ok(
          GUIDANCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_GUIDANCE_EXPERIENCE_CHAIN.length, 25);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X2");
      assert.ok(AI_GUIDANCE_EXPERIENCE_CHAIN.includes("ai_guidance_experience"));
    });

    it("builds guidance context from conversation output deterministically", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const conversation = aiConversationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createGuidanceContextBuilder();

      const first = builder.build(conversation);
      const second = builder.build(conversation);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.conversationOutputId, /^conversation-/);
    });

    it("generates guidance plan from conversation output deterministically", () => {
      const { aiConversationExperience } = createAiConversationExperienceModule();
      const conversation = aiConversationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const plan = createGuidancePlanBuilder().build(conversation);
      assert.equal(plan.readOnly, true);
      assert.equal(plan.stepCount, 4);
      assert.match(plan.title, /AI Guidance Plan/i);
    });

    it("generates guidance confidence from conversation output", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const output = aiGuidanceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.guidanceConfidence.level));
      assert.ok(output.guidanceConfidence.score >= 40);
    });

    it("validates guidance outputs for all scenarios", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const validator = createAiGuidanceExperienceValidator();

      for (const scenarioId of GUIDANCE_SCENARIO_IDS) {
        const output = aiGuidanceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.conversationOutputId.startsWith("conversation-"));
        assert.equal(output.guidanceSteps.steps.length, 4);
        assert.equal(output.guidanceRecommendations.recommendations.length, 3);
        assert.ok(output.explanation.planSummary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid guidance for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Guidance Experience home for authenticated users", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const home = aiGuidanceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X2");
      assert.ok(home.guidance_chain.includes("ai_guidance_experience"));
      assert.ok(home.guidance_views.includes("Guidance Steps"));
    });

    it("rejects unauthenticated access", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      assert.throws(
        () => aiGuidanceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic guidance outputs for the same scenario", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const first = aiGuidanceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiGuidanceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.guidance_context, second.guidance_context);
    });

    it("links guidance output to AI Conversation Experience", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const output = aiGuidanceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.conversationOutputId, /^conversation-/);
      assert.match(output.foundationOutputId, /^ai-foundation-/);
      assert.match(output.outputId, /^guidance-conversation-/);
    });

    it("includes human-readable guidance explanation", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const explanation = aiGuidanceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /guidance|steps|confidence/i);
      assert.ok(explanation.explanation.contextSummary.length > 0);
      assert.ok(explanation.guidance_confidence.score >= 40);
    });

    it("delegates upstream only through AI Conversation Experience", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const delegation = aiGuidanceExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X2 AI Conversation Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X3", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiGuidanceExperienceModule/);
      assert.match(indexSource, /aiGuidanceExperience/);
      assert.match(serverSource, /registerAiGuidanceExperienceRoutes/);
      assert.match(serverSource, /aiGuidanceExperience/);
      assert.match(packageSource, /verify:ch5-x3/);
      assert.match(packageSource, /test:ch5-x3-ai-guidance-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Guidance Experience routes behind auth middleware", async () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiGuidanceExperienceRoutes(app, aiGuidanceExperience);

      const home = await app.inject({ method: "GET", url: "/ai-guidance-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        guidance_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.guidance_context.experienceMode, "read_only");
      assert.match(contextBody.guidance_context.contextId, /^guidance-context-conversation-/);

      const plan = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/plan?scenario_id=cleaning_an_apartment",
      });
      assert.equal(plan.statusCode, 200);

      const steps = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/steps?scenario_id=fixing_small_home_issue",
      });
      assert.equal(steps.statusCode, 200);
      const stepsBody = steps.json() as { view: { steps: unknown[] } };
      assert.equal(stepsBody.view.steps.length, 4);

      const recommendations = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/recommendations?scenario_id=moving_a_room",
      });
      assert.equal(recommendations.statusCode, 200);
      const recBody = recommendations.json() as { view: { recommendations: unknown[] } };
      assert.equal(recBody.view.recommendations.length, 3);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: {
          schemaVersion: string;
          generatedAt: string;
          stepCount: number;
          recommendationCount: number;
        };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_GUIDANCE_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_GUIDANCE_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.stepCount, 4);
      assert.equal(summaryBody.summary.recommendationCount, 3);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-guidance-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
