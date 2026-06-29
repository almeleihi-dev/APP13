import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiPredictiveIntelligenceExperienceRoutes } from "../src/api/routes/ai-predictive-intelligence-experience.js";
import {
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  PREDICTIVE_INTELLIGENCE_SCENARIO_IDS,
  PREDICTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiPredictiveIntelligenceExperienceModule,
  createPredictionContextBuilder,
  createOutcomePredictionsBuilder,
  createAiPredictiveIntelligenceExperienceValidator,
} from "../src/ai-predictive-intelligence-experience/module.js";
import { createAiRecommendationIntelligenceExperienceModule } from "../src/ai-recommendation-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x11",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x11-user-session",
};

describe("CH5-X11 AI Predictive Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides predictive intelligence scenarios aligned with X10 recommendation intelligence", () => {
      assert.equal(PREDICTIVE_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of PREDICTIVE_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          PREDICTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN.length, 33);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X10");
      assert.ok(
        AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN.includes("ai_predictive_intelligence_experience")
      );
    });

    it("builds prediction context from recommendation intelligence output deterministically", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const recommendations = aiRecommendationIntelligenceExperience.buildOutputForValidation(
        USER_AUTH,
        { scenario_id: "moving_a_room" }
      );
      const builder = createPredictionContextBuilder();

      const first = builder.build(recommendations);
      const second = builder.build(recommendations);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^prediction-context-recommendation-intelligence-/);
    });

    it("generates outcome predictions from recommendation intelligence output deterministically", () => {
      const { aiRecommendationIntelligenceExperience } =
        createAiRecommendationIntelligenceExperienceModule();
      const recommendations = aiRecommendationIntelligenceExperience.buildOutputForValidation(
        USER_AUTH,
        { scenario_id: "cleaning_an_apartment" }
      );
      const outcomes = createOutcomePredictionsBuilder().build(recommendations);
      assert.equal(outcomes.predictions.length, 4);
      assert.ok(outcomes.summary.includes("outcome predictions"));
    });

    it("generates prediction confidence from recommendation intelligence output", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const output = aiPredictiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.predictionConfidence.level));
      assert.ok(output.predictionConfidence.score >= 40);
    });

    it("validates predictive intelligence outputs for all scenarios", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const validator = createAiPredictiveIntelligenceExperienceValidator();

      for (const scenarioId of PREDICTIVE_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiPredictiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.recommendationIntelligenceOutputId.startsWith("recommendation-intelligence-"));
        assert.equal(output.outcomePredictions.predictions.length, 4);
        assert.equal(output.futureScenarios.scenarios.length, 3);
        assert.equal(output.earlyWarningSignals.signals.length, 3);
        assert.ok(output.successProbability.score >= 40);
        assert.ok(output.predictionExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid predictive intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Predictive Intelligence Experience home for authenticated users", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const home = aiPredictiveIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X10");
      assert.ok(
        home.predictive_intelligence_chain.includes("ai_predictive_intelligence_experience")
      );
      assert.ok(home.predictive_intelligence_views.includes("Outcome Predictions"));
    });

    it("rejects unauthenticated access", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      assert.throws(
        () => aiPredictiveIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic predictive intelligence outputs for the same scenario", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const first = aiPredictiveIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiPredictiveIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.prediction_context, second.prediction_context);
    });

    it("links predictive intelligence output to AI Recommendation Intelligence Experience", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const output = aiPredictiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.recommendationIntelligenceOutputId,
        /^recommendation-intelligence-insight-generation-/
      );
      assert.match(output.insightGenerationOutputId, /^insight-generation-adaptive-coaching-/);
      assert.match(output.outputId, /^predictive-intelligence-recommendation-intelligence-/);
    });

    it("includes human-readable predictive intelligence explanation", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const explanation = aiPredictiveIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /predictive intelligence|outcome predictions|confidence/i
      );
      assert.ok(explanation.explanation.probabilitySummary.length > 0);
      assert.ok(explanation.prediction_confidence.score >= 40);
    });

    it("delegates upstream only through AI Recommendation Intelligence Experience", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const delegation = aiPredictiveIntelligenceExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X10 AI Recommendation Intelligence Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X11", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiPredictiveIntelligenceExperienceModule/);
      assert.match(indexSource, /aiPredictiveIntelligenceExperience/);
      assert.match(serverSource, /registerAiPredictiveIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiPredictiveIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x11/);
      assert.match(packageSource, /test:ch5-x11-ai-predictive-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Predictive Intelligence Experience routes behind auth middleware", async () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiPredictiveIntelligenceExperienceRoutes(
        app,
        aiPredictiveIntelligenceExperience
      );

      const home = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience",
      });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        prediction_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.prediction_context.experienceMode, "read_only");
      assert.match(
        contextBody.prediction_context.contextId,
        /^prediction-context-recommendation-intelligence-/
      );

      const outcomes = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/outcomes?scenario_id=cleaning_an_apartment",
      });
      assert.equal(outcomes.statusCode, 200);
      const outcomesBody = outcomes.json() as { view: { predictions: unknown[] } };
      assert.equal(outcomesBody.view.predictions.length, 4);

      const probability = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/probability?scenario_id=fixing_small_home_issue",
      });
      assert.equal(probability.statusCode, 200);
      const probBody = probability.json() as { view: { score: number; readOnly: boolean } };
      assert.equal(probBody.view.readOnly, true);
      assert.ok(probBody.view.score >= 40);

      const scenarios = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/scenarios?scenario_id=moving_a_room",
      });
      assert.equal(scenarios.statusCode, 200);
      const scenariosBody = scenarios.json() as { view: { scenarios: unknown[] } };
      assert.equal(scenariosBody.view.scenarios.length, 3);

      const warnings = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/warnings?scenario_id=moving_a_room",
      });
      assert.equal(warnings.statusCode, 200);
      const warningsBody = warnings.json() as { view: { signals: unknown[] } };
      assert.equal(warningsBody.view.signals.length, 3);

      const opportunities = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/opportunities?scenario_id=moving_a_room",
      });
      assert.equal(opportunities.statusCode, 200);
      const oppBody = opportunities.json() as { view: { opportunities: unknown[] } };
      assert.equal(oppBody.view.opportunities.length, 3);

      const risks = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/risks?scenario_id=moving_a_room",
      });
      assert.equal(risks.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; outcomePredictionCount: number };
      };
      assert.equal(
        summaryBody.summary.schemaVersion,
        AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION
      );
      assert.equal(
        summaryBody.summary.generatedAt,
        AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP
      );
      assert.equal(summaryBody.summary.outcomePredictionCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-predictive-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
