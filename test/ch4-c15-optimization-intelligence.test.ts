import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOptimizationIntelligenceRoutes } from "../src/api/routes/optimization-intelligence.js";
import {
  OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
  OPTIMIZATION_SCENARIO_IDS,
  OPTIMIZATION_SCENARIO_TO_CANONICAL,
  createOptimizationIntelligenceEngineModule,
  createOptimizationRecommendationsBuilder,
  createSystemRefinementCyclesBuilder,
  createOptimizationConfidenceBuilder,
  createOptimizationIntelligenceValidator,
} from "../src/optimization-intelligence/module.js";
import { createLearningIntelligenceEngineModule } from "../src/learning-intelligence/module.js";
import { createStrategyIntelligenceEngineModule } from "../src/strategy-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c15",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c15-user-session",
};

describe("CH4-C15 optimization intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides optimization scenarios aligned with C1 through C14", () => {
      assert.equal(OPTIMIZATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of OPTIMIZATION_SCENARIO_IDS) {
        assert.ok(OPTIMIZATION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds optimization recommendations from learning output deterministically", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const learning = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const strategy = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createOptimizationRecommendationsBuilder();

      const first = builder.build(learning, strategy);
      const second = builder.build(learning, strategy);
      assert.deepEqual(first, second);
      assert.ok(first.length >= 2);
    });

    it("defines system refinement cycles deterministically", () => {
      const cycles = createSystemRefinementCyclesBuilder().build();
      assert.equal(cycles.length, 4);
      assert.deepEqual(
        cycles.map((c) => c.phase),
        ["measure", "identify", "optimize", "sustain"]
      );
    });

    it("generates optimization confidence from learning and recommendation counts", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const output = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const learning = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const confidence = createOptimizationConfidenceBuilder().build({
        learning,
        recommendationCount: output.optimizationRecommendations.length,
        bottleneckCount: output.bottleneckAnalyses.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.learningConfidenceScore, learning.learningConfidence.score);
    });

    it("validates optimization outputs for all scenarios", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const validator = createOptimizationIntelligenceValidator();

      for (const scenarioId of OPTIMIZATION_SCENARIO_IDS) {
        const output = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.learningOutputId.startsWith("learning-"));
        assert.equal(output.systemRefinementCycles.length, 4);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid optimization for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns optimization intelligence home for authenticated users", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const home = optimizationIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.optimization_chain.includes("optimization_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      assert.throws(
        () => optimizationIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic optimization outputs for the same scenario", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const first = optimizationIntelligenceEngine.getEfficiency(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = optimizationIntelligenceEngine.getEfficiency(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.efficiency_improvements, second.efficiency_improvements);
      assert.deepEqual(first.resource_optimizations, second.resource_optimizations);
    });

    it("links optimization output to learning intelligence", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const output = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.learningOutputId, /^learning-/);
      assert.match(output.strategyOutputId, /^strategy-/);
      assert.match(output.predictionOutputId, /^prediction-/);
    });

    it("includes human-readable optimization explanation", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const explanation = optimizationIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /optimization/i);
      assert.ok(explanation.explanation.efficiencySummary.length > 0);
      assert.ok(explanation.optimization_confidence.score >= 35);
    });

    it("delegates upstream only through learning intelligence repository", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const refinement = optimizationIntelligenceEngine.getRefinement(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(refinement.read_only, true);
      assert.equal(refinement.system_refinement_cycles.length, 4);
      assert.ok(Array.isArray(refinement.workflow_optimizations));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C15", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createOptimizationIntelligenceEngineModule/);
      assert.match(indexSource, /optimizationIntelligenceEngine/);
      assert.match(serverSource, /registerOptimizationIntelligenceRoutes/);
      assert.match(serverSource, /optimizationIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c15/);
      assert.match(packageSource, /test:ch4-c15-optimization-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers optimization intelligence routes behind auth middleware", async () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOptimizationIntelligenceRoutes(app, optimizationIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/optimization-intelligence" });
      assert.equal(home.statusCode, 200);

      const efficiency = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/efficiency?scenario_id=moving_a_room",
      });
      assert.equal(efficiency.statusCode, 200);
      const efficiencyBody = efficiency.json() as {
        efficiency_improvements: Array<{ improvementId: string }>;
        read_only: boolean;
      };
      assert.equal(efficiencyBody.read_only, true);
      assert.ok(efficiencyBody.efficiency_improvements.length > 0);

      const bottlenecks = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/bottlenecks?scenario_id=cleaning_an_apartment",
      });
      assert.equal(bottlenecks.statusCode, 200);

      const performance = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/performance?scenario_id=fixing_small_home_issue",
      });
      assert.equal(performance.statusCode, 200);

      const refinement = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/refinement?scenario_id=delivering_a_document",
      });
      assert.equal(refinement.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/optimization-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/optimization-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
