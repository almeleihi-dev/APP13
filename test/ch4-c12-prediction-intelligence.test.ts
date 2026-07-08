import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerPredictionIntelligenceRoutes } from "../src/api/routes/prediction-intelligence.js";
import {
  PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
  PREDICTION_SCENARIO_IDS,
  PREDICTION_SCENARIO_TO_CANONICAL,
  createPredictionIntelligenceEngineModule,
  createSuccessProbabilityProjectionBuilder,
  createScenarioComparisonBuilder,
  createPredictionConfidenceBuilder,
  createPredictionIntelligenceValidator,
} from "../src/prediction-intelligence/module.js";
import { createInsightIntelligenceEngineModule } from "../src/insight-intelligence/module.js";
import { createRecommendationIntelligenceEngineModule } from "../src/recommendation-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c12",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c12-user-session",
};

describe("CH4-C12 prediction intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides prediction scenarios aligned with C1 through C11", () => {
      assert.equal(PREDICTION_SCENARIO_IDS.length, 5);
      for (const scenarioId of PREDICTION_SCENARIO_IDS) {
        assert.ok(PREDICTION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds success probability projections from insight output deterministically", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const insight = insightIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const recommendation = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      const builder = createSuccessProbabilityProjectionBuilder();

      const first = builder.build(insight, recommendation);
      const second = builder.build(insight, recommendation);
      assert.deepEqual(first, second);
      assert.ok(first.projectedScore >= 20);
      assert.equal(first.horizonDays, 30);
    });

    it("compares scenarios from projection and timeline signals", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const output = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const comparisons = createScenarioComparisonBuilder().build({
        successProjection: output.successProbabilityProjection,
        timeline: output.timelineForecast,
        riskForecast: output.riskEvolutionForecast,
        decision: { recommendedDecision: "proceed_with_conditions" } as never,
      });
      assert.equal(comparisons.length, 4);
      assert.ok(comparisons.some((s) => s.recommended));
    });

    it("generates prediction confidence from insight and success projection", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const output = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const insight = insightIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const confidence = createPredictionConfidenceBuilder().build({
        insight,
        successProjection: output.successProbabilityProjection,
        scenarioCount: output.scenarioComparisons.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.insightConfidenceScore, insight.insightConfidence.score);
    });

    it("validates prediction outputs for all scenarios", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const validator = createPredictionIntelligenceValidator();

      for (const scenarioId of PREDICTION_SCENARIO_IDS) {
        const output = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.insightOutputId.startsWith("insight-"));
        assert.ok(output.whatIfAnalysis.length >= 3);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid prediction for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns prediction intelligence home for authenticated users", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const home = predictionIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.prediction_chain.includes("prediction_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      assert.throws(
        () => predictionIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic prediction outputs for the same scenario", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const first = predictionIntelligenceEngine.getPredictions(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = predictionIntelligenceEngine.getPredictions(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(
        first.success_probability_projection,
        second.success_probability_projection
      );
      assert.deepEqual(first.outcome_projection, second.outcome_projection);
    });

    it("links prediction output to insight intelligence", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const output = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.insightOutputId, /^insight-/);
      assert.match(output.recommendationOutputId, /^recommendation-/);
      assert.match(output.decisionRecommendationId, /^decision-/);
    });

    it("includes human-readable prediction explanation", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const explanation = predictionIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /predict/i);
      assert.ok(explanation.explanation.timelineSummary.length > 0);
      assert.ok(explanation.prediction_confidence.score >= 35);
    });

    it("delegates upstream only through insight intelligence repository", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const forecasts = predictionIntelligenceEngine.getForecasts(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(forecasts.read_only, true);
      assert.ok(forecasts.timeline_forecast.maxHours >= forecasts.timeline_forecast.minHours);
      assert.ok(Array.isArray(forecasts.opportunity_forecasts));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C12", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createPredictionIntelligenceEngineModule/);
      assert.match(indexSource, /predictionIntelligenceEngine/);
      assert.match(serverSource, /registerPredictionIntelligenceRoutes/);
      assert.match(serverSource, /predictionIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c12/);
      assert.match(packageSource, /test:ch4-c12-prediction-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers prediction intelligence routes behind auth middleware", async () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerPredictionIntelligenceRoutes(app, predictionIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/prediction-intelligence" });
      assert.equal(home.statusCode, 200);

      const predictions = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/predictions?scenario_id=moving_a_room",
      });
      assert.equal(predictions.statusCode, 200);
      const predBody = predictions.json() as {
        success_probability_projection: { projectedScore: number };
        read_only: boolean;
      };
      assert.equal(predBody.read_only, true);
      assert.ok(predBody.success_probability_projection.projectedScore >= 20);

      const scenarios = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/scenarios?scenario_id=cleaning_an_apartment",
      });
      assert.equal(scenarios.statusCode, 200);

      const forecasts = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/forecasts?scenario_id=fixing_small_home_issue",
      });
      assert.equal(forecasts.statusCode, 200);

      const whatIf = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/what-if?scenario_id=delivering_a_document",
      });
      assert.equal(whatIf.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/prediction-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, PREDICTION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/prediction-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
