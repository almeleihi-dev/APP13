import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiPredictiveForecastExperienceRoutes } from "../src/api/routes/ai-predictive-forecast-experience.js";
import {
  AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_FIXED_TIMESTAMP,
  PREDICTIVE_FORECAST_SCENARIO_IDS,
  PREDICTIVE_FORECAST_SCENARIO_TO_CANONICAL,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiPredictiveForecastExperienceModule,
  createPredictiveForecastContextBuilder,
  createFutureScenariosBuilder,
  createAiPredictiveForecastExperienceValidator,
} from "../src/ai-predictive-forecast-experience/module.js";
import { createAiStrategicIntelligenceExperienceModule } from "../src/ai-strategic-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x16",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x16-user-session",
};

describe("CH5-X16 AI Predictive Forecast Experience", () => {
  describe("domain (unit)", () => {
    it("provides predictive forecast scenarios aligned with X15 strategic intelligence", () => {
      assert.equal(PREDICTIVE_FORECAST_SCENARIO_IDS.length, 5);
      for (const scenarioId of PREDICTIVE_FORECAST_SCENARIO_IDS) {
        assert.ok(
          PREDICTIVE_FORECAST_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN.length, 38);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X15");
      assert.ok(
        AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN.includes("ai_predictive_forecast_experience")
      );
    });

    it("builds predictive forecast context from strategic intelligence output deterministically", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const strategic = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createPredictiveForecastContextBuilder();

      const first = builder.build(strategic);
      const second = builder.build(strategic);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^predictive-forecast-context-strategic-intelligence-/);
    });

    it("generates future scenarios from strategic intelligence output deterministically", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const strategic = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const scenarios = createFutureScenariosBuilder().build(strategic);
      assert.equal(scenarios.scenarios.length, 4);
      assert.ok(scenarios.summary.includes("future scenarios"));
    });

    it("generates predictive confidence from strategic intelligence output", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const output = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.predictiveConfidence.level));
      assert.ok(output.predictiveConfidence.score >= 40);
    });

    it("validates predictive forecast outputs for all scenarios", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const validator = createAiPredictiveForecastExperienceValidator();

      for (const scenarioId of PREDICTIVE_FORECAST_SCENARIO_IDS) {
        const output = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.strategicIntelligenceOutputId.startsWith("strategic-intelligence-"));
        assert.equal(output.futureScenarios.scenarios.length, 4);
        assert.equal(output.trendAnalysis.trends.length, 3);
        assert.equal(output.forecast.steps.length, 4);
        assert.equal(output.riskForecast.items.length, 3);
        assert.equal(output.opportunityForecast.opportunities.length, 3);
        assert.ok(output.probabilityModel.score >= 40);
        assert.ok(output.predictiveExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid predictive forecast for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Predictive Forecast Experience home for authenticated users", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const home = aiPredictiveForecastExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X15");
      assert.ok(home.predictive_forecast_chain.includes("ai_predictive_forecast_experience"));
      assert.ok(home.predictive_forecast_views.includes("Prediction Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      assert.throws(
        () => aiPredictiveForecastExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic predictive forecast outputs for the same scenario", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const first = aiPredictiveForecastExperience.getFutureScenarios(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiPredictiveForecastExperience.getFutureScenarios(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links predictive forecast output to AI Strategic Intelligence Experience", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const output = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.strategicIntelligenceOutputId,
        /^strategic-intelligence-decision-intelligence-/
      );
      assert.match(
        output.decisionIntelligenceOutputId,
        /^decision-intelligence-orchestration-/
      );
      assert.match(output.outputId, /^predictive-forecast-strategic-intelligence-/);
    });

    it("includes human-readable predictive forecast explanation", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const explanation = aiPredictiveForecastExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /predictive forecast|future scenarios|forecast steps/i
      );
      assert.ok(explanation.explanation.scenariosSummary.length > 0);
      assert.ok(explanation.predictive_confidence.score >= 40);
    });

    it("delegates upstream only through AI Strategic Intelligence Experience", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const output = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationPredictiveForecast.soleUpstream,
        "CH5-X15 AI Strategic Intelligence Experience"
      );
      assert.equal(output.delegationPredictiveForecast.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X16", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiPredictiveForecastExperienceModule/);
      assert.match(indexSource, /aiPredictiveForecastExperience/);
      assert.match(serverSource, /registerAiPredictiveForecastExperienceRoutes/);
      assert.match(serverSource, /aiPredictiveForecastExperience/);
      assert.match(packageSource, /verify:ch5-x16/);
      assert.match(packageSource, /test:ch5-x16-ai-predictive-forecast-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Predictive Forecast Experience routes behind auth middleware", async () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiPredictiveForecastExperienceRoutes(app, aiPredictiveForecastExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/prediction-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const scenarios = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/future-scenarios?scenario_id=cleaning_an_apartment",
      });
      assert.equal(scenarios.statusCode, 200);
      const scenariosBody = scenarios.json() as { view: { scenarios: unknown[] } };
      assert.equal(scenariosBody.view.scenarios.length, 4);

      const trends = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/trend-analysis?scenario_id=fixing_small_home_issue",
      });
      assert.equal(trends.statusCode, 200);
      const trendsBody = trends.json() as { view: { trends: unknown[] } };
      assert.equal(trendsBody.view.trends.length, 3);

      const forecast = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/forecast?scenario_id=moving_a_room",
      });
      assert.equal(forecast.statusCode, 200);
      const forecastBody = forecast.json() as { view: { steps: unknown[] } };
      assert.equal(forecastBody.view.steps.length, 4);

      const risk = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/risk-forecast?scenario_id=moving_a_room",
      });
      assert.equal(risk.statusCode, 200);
      const riskBody = risk.json() as { view: { items: unknown[] } };
      assert.equal(riskBody.view.items.length, 3);

      const opportunity = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/opportunity-forecast?scenario_id=moving_a_room",
      });
      assert.equal(opportunity.statusCode, 200);

      const probability = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/probability-model?scenario_id=moving_a_room",
      });
      assert.equal(probability.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; forecastStepCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_PREDICTIVE_FORECAST_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.forecastStepCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-predictive-forecast-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
