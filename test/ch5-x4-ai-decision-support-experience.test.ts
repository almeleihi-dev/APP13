import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiDecisionSupportExperienceRoutes } from "../src/api/routes/ai-decision-support-experience.js";
import {
  AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION,
  AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP,
  DECISION_SUPPORT_SCENARIO_IDS,
  DECISION_SUPPORT_SCENARIO_TO_CANONICAL,
  AI_DECISION_SUPPORT_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiDecisionSupportExperienceModule,
  createDecisionSupportContextBuilder,
  createDecisionOptionsBuilder,
  createAiDecisionSupportExperienceValidator,
} from "../src/ai-decision-support-experience/module.js";
import { createAiGuidanceExperienceModule } from "../src/ai-guidance-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x4",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x4-user-session",
};

describe("CH5-X4 AI Decision Support Experience", () => {
  describe("domain (unit)", () => {
    it("provides decision support scenarios aligned with X3 guidance", () => {
      assert.equal(DECISION_SUPPORT_SCENARIO_IDS.length, 5);
      for (const scenarioId of DECISION_SUPPORT_SCENARIO_IDS) {
        assert.ok(
          DECISION_SUPPORT_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_DECISION_SUPPORT_EXPERIENCE_CHAIN.length, 26);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X3");
      assert.ok(AI_DECISION_SUPPORT_EXPERIENCE_CHAIN.includes("ai_decision_support_experience"));
    });

    it("builds decision support context from guidance output deterministically", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const guidance = aiGuidanceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createDecisionSupportContextBuilder();

      const first = builder.build(guidance);
      const second = builder.build(guidance);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.guidanceOutputId, /^guidance-/);
    });

    it("generates decision options from guidance output deterministically", () => {
      const { aiGuidanceExperience } = createAiGuidanceExperienceModule();
      const guidance = aiGuidanceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const options = createDecisionOptionsBuilder().build(guidance);
      assert.equal(options.optionCount, 4);
      assert.equal(options.options.length, 4);
      assert.ok(options.summary.includes("decision options"));
    });

    it("generates decision support confidence from guidance output", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const output = aiDecisionSupportExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.decisionSupportConfidence.level));
      assert.ok(output.decisionSupportConfidence.score >= 40);
    });

    it("validates decision support outputs for all scenarios", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const validator = createAiDecisionSupportExperienceValidator();

      for (const scenarioId of DECISION_SUPPORT_SCENARIO_IDS) {
        const output = aiDecisionSupportExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.guidanceOutputId.startsWith("guidance-"));
        assert.equal(output.decisionOptions.options.length, 4);
        assert.ok(output.decisionRecommendation.recommendedAction.length > 0);
        assert.ok(output.explanation.analysisSummary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid decision support for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Decision Support Experience home for authenticated users", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const home = aiDecisionSupportExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X3");
      assert.ok(home.decision_support_chain.includes("ai_decision_support_experience"));
      assert.ok(home.decision_support_views.includes("Decision Options"));
    });

    it("rejects unauthenticated access", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      assert.throws(
        () => aiDecisionSupportExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic decision support outputs for the same scenario", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const first = aiDecisionSupportExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiDecisionSupportExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.decision_support_context, second.decision_support_context);
    });

    it("links decision support output to AI Guidance Experience", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const output = aiDecisionSupportExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.guidanceOutputId, /^guidance-/);
      assert.match(output.conversationOutputId, /^conversation-/);
      assert.match(output.outputId, /^decision-support-guidance-/);
    });

    it("includes human-readable decision support explanation", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const explanation = aiDecisionSupportExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /decision support|options|confidence/i);
      assert.ok(explanation.explanation.optionsSummary.length > 0);
      assert.ok(explanation.decision_support_confidence.score >= 40);
    });

    it("delegates upstream only through AI Guidance Experience", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const delegation = aiDecisionSupportExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X3 AI Guidance Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X4", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiDecisionSupportExperienceModule/);
      assert.match(indexSource, /aiDecisionSupportExperience/);
      assert.match(serverSource, /registerAiDecisionSupportExperienceRoutes/);
      assert.match(serverSource, /aiDecisionSupportExperience/);
      assert.match(packageSource, /verify:ch5-x4/);
      assert.match(packageSource, /test:ch5-x4-ai-decision-support-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Decision Support Experience routes behind auth middleware", async () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiDecisionSupportExperienceRoutes(app, aiDecisionSupportExperience);

      const home = await app.inject({ method: "GET", url: "/ai-decision-support-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        decision_support_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.decision_support_context.experienceMode, "read_only");
      assert.match(
        contextBody.decision_support_context.contextId,
        /^decision-context-guidance-/
      );

      const options = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/options?scenario_id=cleaning_an_apartment",
      });
      assert.equal(options.statusCode, 200);
      const optionsBody = options.json() as { view: { options: unknown[] } };
      assert.equal(optionsBody.view.options.length, 4);

      const analysis = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/analysis?scenario_id=fixing_small_home_issue",
      });
      assert.equal(analysis.statusCode, 200);

      const recommendation = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/recommendation?scenario_id=moving_a_room",
      });
      assert.equal(recommendation.statusCode, 200);
      const recBody = recommendation.json() as { view: { recommendedAction: string } };
      assert.ok(recBody.view.recommendedAction.length > 0);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; optionCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_DECISION_SUPPORT_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_DECISION_SUPPORT_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.optionCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-decision-support-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
