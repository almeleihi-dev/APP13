import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiAdaptiveCoachingExperienceRoutes } from "../src/api/routes/ai-adaptive-coaching-experience.js";
import {
  AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION,
  AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP,
  ADAPTIVE_COACHING_SCENARIO_IDS,
  ADAPTIVE_COACHING_SCENARIO_TO_CANONICAL,
  AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiAdaptiveCoachingExperienceModule,
  createCoachingContextBuilder,
  createAdaptiveGuidanceBuilder,
  createAiAdaptiveCoachingExperienceValidator,
} from "../src/ai-adaptive-coaching-experience/module.js";
import { createAiProgressIntelligenceExperienceModule } from "../src/ai-progress-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x8",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x8-user-session",
};

describe("CH5-X8 AI Adaptive Coaching Experience", () => {
  describe("domain (unit)", () => {
    it("provides adaptive coaching scenarios aligned with X7 progress intelligence", () => {
      assert.equal(ADAPTIVE_COACHING_SCENARIO_IDS.length, 5);
      for (const scenarioId of ADAPTIVE_COACHING_SCENARIO_IDS) {
        assert.ok(
          ADAPTIVE_COACHING_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN.length, 30);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X7");
      assert.ok(AI_ADAPTIVE_COACHING_EXPERIENCE_CHAIN.includes("ai_adaptive_coaching_experience"));
    });

    it("builds coaching context from progress intelligence output deterministically", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const progress = aiProgressIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createCoachingContextBuilder();

      const first = builder.build(progress);
      const second = builder.build(progress);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^coaching-context-progress-intelligence-/);
    });

    it("generates adaptive guidance from progress intelligence output deterministically", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const progress = aiProgressIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const guidance = createAdaptiveGuidanceBuilder().build(progress);
      assert.equal(guidance.readOnly, true);
      assert.ok(guidance.recommendedFocus.length > 0);
      assert.ok(guidance.summary.includes("adaptive guidance"));
    });

    it("generates adaptive coaching confidence from progress intelligence output", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const output = aiAdaptiveCoachingExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.adaptiveCoachingConfidence.level));
      assert.ok(output.adaptiveCoachingConfidence.score >= 40);
    });

    it("validates adaptive coaching outputs for all scenarios", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const validator = createAiAdaptiveCoachingExperienceValidator();

      for (const scenarioId of ADAPTIVE_COACHING_SCENARIO_IDS) {
        const output = aiAdaptiveCoachingExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.progressIntelligenceOutputId.startsWith("progress-intelligence-"));
        assert.equal(output.coachingInsights.insights.length, 4);
        assert.equal(output.improvementOpportunities.opportunities.length, 3);
        assert.equal(output.behavioralSuggestions.suggestions.length, 4);
        assert.ok(output.adaptiveGuidance.recommendedFocus.length > 0);
        assert.ok(output.coachingExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid adaptive coaching for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Adaptive Coaching Experience home for authenticated users", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const home = aiAdaptiveCoachingExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X7");
      assert.ok(home.adaptive_coaching_chain.includes("ai_adaptive_coaching_experience"));
      assert.ok(home.adaptive_coaching_views.includes("Adaptive Guidance"));
    });

    it("rejects unauthenticated access", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      assert.throws(
        () => aiAdaptiveCoachingExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic adaptive coaching outputs for the same scenario", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const first = aiAdaptiveCoachingExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiAdaptiveCoachingExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.coaching_context, second.coaching_context);
    });

    it("links adaptive coaching output to AI Progress Intelligence Experience", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const output = aiAdaptiveCoachingExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.progressIntelligenceOutputId, /^progress-intelligence-execution-companion-/);
      assert.match(output.executionCompanionOutputId, /^execution-companion-action-planning-/);
      assert.match(output.outputId, /^adaptive-coaching-progress-intelligence-/);
    });

    it("includes human-readable adaptive coaching explanation", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const explanation = aiAdaptiveCoachingExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /adaptive coaching|insights|confidence/i);
      assert.ok(explanation.explanation.guidanceSummary.length > 0);
      assert.ok(explanation.adaptive_coaching_confidence.score >= 40);
    });

    it("delegates upstream only through AI Progress Intelligence Experience", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const delegation = aiAdaptiveCoachingExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X7 AI Progress Intelligence Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X8", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiAdaptiveCoachingExperienceModule/);
      assert.match(indexSource, /aiAdaptiveCoachingExperience/);
      assert.match(serverSource, /registerAiAdaptiveCoachingExperienceRoutes/);
      assert.match(serverSource, /aiAdaptiveCoachingExperience/);
      assert.match(packageSource, /verify:ch5-x8/);
      assert.match(packageSource, /test:ch5-x8-ai-adaptive-coaching-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Adaptive Coaching Experience routes behind auth middleware", async () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiAdaptiveCoachingExperienceRoutes(app, aiAdaptiveCoachingExperience);

      const home = await app.inject({ method: "GET", url: "/ai-adaptive-coaching-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        coaching_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.coaching_context.experienceMode, "read_only");
      assert.match(
        contextBody.coaching_context.contextId,
        /^coaching-context-progress-intelligence-/
      );

      const guidance = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/guidance?scenario_id=cleaning_an_apartment",
      });
      assert.equal(guidance.statusCode, 200);
      const guidanceBody = guidance.json() as { view: { readOnly: boolean; recommendedFocus: string } };
      assert.equal(guidanceBody.view.readOnly, true);
      assert.ok(guidanceBody.view.recommendedFocus.length > 0);

      const insights = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/insights?scenario_id=fixing_small_home_issue",
      });
      assert.equal(insights.statusCode, 200);
      const insightsBody = insights.json() as { view: { insights: unknown[] } };
      assert.equal(insightsBody.view.insights.length, 4);

      const improvements = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/improvements?scenario_id=moving_a_room",
      });
      assert.equal(improvements.statusCode, 200);
      const improvementsBody = improvements.json() as { view: { opportunities: unknown[] } };
      assert.equal(improvementsBody.view.opportunities.length, 3);

      const motivation = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/motivation?scenario_id=moving_a_room",
      });
      assert.equal(motivation.statusCode, 200);

      const behavior = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/behavior?scenario_id=moving_a_room",
      });
      assert.equal(behavior.statusCode, 200);
      const behaviorBody = behavior.json() as { view: { suggestions: unknown[] } };
      assert.equal(behaviorBody.view.suggestions.length, 4);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; insightCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_ADAPTIVE_COACHING_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_ADAPTIVE_COACHING_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.insightCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-adaptive-coaching-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
