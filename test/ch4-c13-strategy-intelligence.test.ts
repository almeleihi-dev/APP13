import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerStrategyIntelligenceRoutes } from "../src/api/routes/strategy-intelligence.js";
import {
  STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
  STRATEGY_SCENARIO_IDS,
  STRATEGY_SCENARIO_TO_CANONICAL,
  createStrategyIntelligenceEngineModule,
  createStrategicObjectivesBuilder,
  createScenarioPlanningBuilder,
  createStrategicConfidenceBuilder,
  createStrategyIntelligenceValidator,
} from "../src/strategy-intelligence/module.js";
import { createPredictionIntelligenceEngineModule } from "../src/prediction-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c13",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c13-user-session",
};

describe("CH4-C13 strategy intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides strategy scenarios aligned with C1 through C12", () => {
      assert.equal(STRATEGY_SCENARIO_IDS.length, 5);
      for (const scenarioId of STRATEGY_SCENARIO_IDS) {
        assert.ok(STRATEGY_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds strategic objectives from prediction output deterministically", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const prediction = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createStrategicObjectivesBuilder();

      const first = builder.build(prediction, prediction.goal);
      const second = builder.build(prediction, prediction.goal);
      assert.deepEqual(first, second);
      assert.equal(first.length, 3);
      assert.equal(first[0].priority, "critical");
    });

    it("plans scenarios from prediction comparisons", () => {
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const prediction = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const plans = createScenarioPlanningBuilder().build(prediction);
      assert.equal(plans.length, prediction.scenarioComparisons.length);
      assert.ok(plans.some((p) => p.strategicFit === "primary"));
    });

    it("generates strategic confidence from prediction and objectives", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const output = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const prediction = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const confidence = createStrategicConfidenceBuilder().build({
        prediction,
        objectiveCount: output.strategicObjectives.length,
        scenarioCount: output.scenarioPlans.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.predictionConfidenceScore, prediction.predictionConfidence.score);
    });

    it("validates strategy outputs for all scenarios", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const validator = createStrategyIntelligenceValidator();

      for (const scenarioId of STRATEGY_SCENARIO_IDS) {
        const output = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.predictionOutputId.startsWith("prediction-"));
        assert.ok(output.strategicObjectives.length > 0);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid strategy for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns strategy intelligence home for authenticated users", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const home = strategyIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.strategy_chain.includes("strategy_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      assert.throws(
        () => strategyIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic strategy outputs for the same scenario", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const first = strategyIntelligenceEngine.getStrategy(USER_AUTH, { scenario_id: "moving_a_room" });
      const second = strategyIntelligenceEngine.getStrategy(USER_AUTH, { scenario_id: "moving_a_room" });
      assert.deepEqual(first.strategic_objectives, second.strategic_objectives);
      assert.deepEqual(first.priority_optimizations, second.priority_optimizations);
    });

    it("links strategy output to prediction intelligence", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const output = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.predictionOutputId, /^prediction-/);
      assert.match(output.insightOutputId, /^insight-/);
      assert.match(output.recommendationOutputId, /^recommendation-/);
    });

    it("includes human-readable strategy explanation", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const explanation = strategyIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /strateg/i);
      assert.ok(explanation.explanation.objectiveSummary.length > 0);
      assert.ok(explanation.strategic_confidence.score >= 35);
    });

    it("delegates upstream only through prediction intelligence repository", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const opportunities = strategyIntelligenceEngine.getOpportunities(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(opportunities.read_only, true);
      assert.ok(Array.isArray(opportunities.strategic_opportunity_matrix));
      assert.ok(Array.isArray(opportunities.strategic_risk_mitigations));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C13", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createStrategyIntelligenceEngineModule/);
      assert.match(indexSource, /strategyIntelligenceEngine/);
      assert.match(serverSource, /registerStrategyIntelligenceRoutes/);
      assert.match(serverSource, /strategyIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c13/);
      assert.match(packageSource, /test:ch4-c13-strategy-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers strategy intelligence routes behind auth middleware", async () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerStrategyIntelligenceRoutes(app, strategyIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/strategy-intelligence" });
      assert.equal(home.statusCode, 200);

      const strategy = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/strategy?scenario_id=moving_a_room",
      });
      assert.equal(strategy.statusCode, 200);
      const strategyBody = strategy.json() as {
        strategic_objectives: Array<{ objectiveId: string }>;
        read_only: boolean;
      };
      assert.equal(strategyBody.read_only, true);
      assert.ok(strategyBody.strategic_objectives.length > 0);

      const roadmap = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/roadmap?scenario_id=cleaning_an_apartment",
      });
      assert.equal(roadmap.statusCode, 200);

      const scenarios = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/scenarios?scenario_id=fixing_small_home_issue",
      });
      assert.equal(scenarios.statusCode, 200);

      const opportunities = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/opportunities?scenario_id=delivering_a_document",
      });
      assert.equal(opportunities.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/strategy-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, STRATEGY_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/strategy-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
