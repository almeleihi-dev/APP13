import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiRecommendationIntelligenceExperienceRoutes } from "../src/api/routes/ai-recommendation-intelligence-experience.js";
import {
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  RECOMMENDATION_INTELLIGENCE_SCENARIO_IDS,
  RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiRecommendationIntelligenceExperienceModule,
  createRecommendationContextBuilder,
  createPersonalizedRecommendationsBuilder,
  createAiRecommendationIntelligenceExperienceValidator,
} from "../src/ai-recommendation-intelligence-experience/module.js";
import { createAiInsightGenerationExperienceModule } from "../src/ai-insight-generation-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x10",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x10-user-session",
};

describe("CH5-X10 AI Recommendation Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides recommendation intelligence scenarios aligned with X9 insight generation", () => {
      assert.equal(RECOMMENDATION_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of RECOMMENDATION_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN.length, 32);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X9");
      assert.ok(
        AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN.includes(
          "ai_recommendation_intelligence_experience"
        )
      );
    });

    it("builds recommendation context from insight generation output deterministically", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const insights = aiInsightGenerationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createRecommendationContextBuilder();

      const first = builder.build(insights);
      const second = builder.build(insights);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^recommendation-context-insight-generation-/);
    });

    it("generates personalized recommendations from insight generation output deterministically", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const insights = aiInsightGenerationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const personalized = createPersonalizedRecommendationsBuilder().build(insights);
      assert.equal(personalized.recommendations.length, 4);
      assert.ok(personalized.summary.includes("personalized recommendations"));
    });

    it("generates recommendation confidence from insight generation output", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const output = aiRecommendationIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.recommendationConfidence.level));
      assert.ok(output.recommendationConfidence.score >= 40);
    });

    it("validates recommendation intelligence outputs for all scenarios", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const validator = createAiRecommendationIntelligenceExperienceValidator();

      for (const scenarioId of RECOMMENDATION_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiRecommendationIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.insightGenerationOutputId.startsWith("insight-generation-"));
        assert.equal(output.personalizedRecommendations.recommendations.length, 4);
        assert.equal(output.priorityRecommendations.recommendations.length, 4);
        assert.equal(output.strategicRecommendations.recommendations.length, 3);
        assert.ok(output.recommendationExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid recommendation intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Recommendation Intelligence Experience home for authenticated users", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const home = aiRecommendationIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X9");
      assert.ok(
        home.recommendation_intelligence_chain.includes("ai_recommendation_intelligence_experience")
      );
      assert.ok(home.recommendation_intelligence_views.includes("Personalized Recommendations"));
    });

    it("rejects unauthenticated access", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      assert.throws(
        () => aiRecommendationIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic recommendation intelligence outputs for the same scenario", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const first = aiRecommendationIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiRecommendationIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.recommendation_context, second.recommendation_context);
    });

    it("links recommendation intelligence output to AI Insight Generation Experience", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const output = aiRecommendationIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.insightGenerationOutputId, /^insight-generation-adaptive-coaching-/);
      assert.match(output.adaptiveCoachingOutputId, /^adaptive-coaching-progress-intelligence-/);
      assert.match(output.outputId, /^recommendation-intelligence-insight-generation-/);
    });

    it("includes human-readable recommendation intelligence explanation", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const explanation = aiRecommendationIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /recommendation intelligence|personalized|confidence/i
      );
      assert.ok(explanation.explanation.prioritySummary.length > 0);
      assert.ok(explanation.recommendation_confidence.score >= 40);
    });

    it("delegates upstream only through AI Insight Generation Experience", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const delegation = aiRecommendationIntelligenceExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X9 AI Insight Generation Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X10", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiRecommendationIntelligenceExperienceModule/);
      assert.match(indexSource, /aiRecommendationIntelligenceExperience/);
      assert.match(serverSource, /registerAiRecommendationIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiRecommendationIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x10/);
      assert.match(packageSource, /test:ch5-x10-ai-recommendation-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Recommendation Intelligence Experience routes behind auth middleware", async () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiRecommendationIntelligenceExperienceRoutes(
        app,
        aiRecommendationIntelligenceExperience
      );

      const home = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience",
      });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        recommendation_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.recommendation_context.experienceMode, "read_only");
      assert.match(
        contextBody.recommendation_context.contextId,
        /^recommendation-context-insight-generation-/
      );

      const personalized = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/personalized?scenario_id=cleaning_an_apartment",
      });
      assert.equal(personalized.statusCode, 200);
      const personalizedBody = personalized.json() as { view: { recommendations: unknown[] } };
      assert.equal(personalizedBody.view.recommendations.length, 4);

      const priority = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/priority?scenario_id=fixing_small_home_issue",
      });
      assert.equal(priority.statusCode, 200);
      const priorityBody = priority.json() as { view: { recommendations: unknown[] } };
      assert.equal(priorityBody.view.recommendations.length, 4);

      const opportunities = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/opportunities?scenario_id=moving_a_room",
      });
      assert.equal(opportunities.statusCode, 200);
      const oppBody = opportunities.json() as { view: { recommendations: unknown[] } };
      assert.equal(oppBody.view.recommendations.length, 3);

      const mitigation = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/mitigation?scenario_id=moving_a_room",
      });
      assert.equal(mitigation.statusCode, 200);
      const mitBody = mitigation.json() as { view: { recommendations: unknown[] } };
      assert.equal(mitBody.view.recommendations.length, 3);

      const strategic = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/strategic?scenario_id=moving_a_room",
      });
      assert.equal(strategic.statusCode, 200);
      const strategicBody = strategic.json() as { view: { recommendations: unknown[] } };
      assert.equal(strategicBody.view.recommendations.length, 3);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; personalizedCount: number };
      };
      assert.equal(
        summaryBody.summary.schemaVersion,
        AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION
      );
      assert.equal(
        summaryBody.summary.generatedAt,
        AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP
      );
      assert.equal(summaryBody.summary.personalizedCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-recommendation-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
