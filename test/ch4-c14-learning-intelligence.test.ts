import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLearningIntelligenceRoutes } from "../src/api/routes/learning-intelligence.js";
import {
  LEARNING_INTELLIGENCE_SCHEMA_VERSION,
  LEARNING_SCENARIO_IDS,
  LEARNING_SCENARIO_TO_CANONICAL,
  createLearningIntelligenceEngineModule,
  createLearningInsightsBuilder,
  createContinuousImprovementCyclesBuilder,
  createLearningConfidenceBuilder,
  createLearningIntelligenceValidator,
} from "../src/learning-intelligence/module.js";
import { createStrategyIntelligenceEngineModule } from "../src/strategy-intelligence/module.js";
import { createPredictionIntelligenceEngineModule } from "../src/prediction-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c14",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c14-user-session",
};

describe("CH4-C14 learning intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides learning scenarios aligned with C1 through C13", () => {
      assert.equal(LEARNING_SCENARIO_IDS.length, 5);
      for (const scenarioId of LEARNING_SCENARIO_IDS) {
        assert.ok(LEARNING_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds learning insights from strategy output deterministically", () => {
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();
      const strategy = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const prediction = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createLearningInsightsBuilder();

      const first = builder.build(strategy, prediction);
      const second = builder.build(strategy, prediction);
      assert.deepEqual(first, second);
      assert.ok(first.length >= 2);
    });

    it("defines continuous improvement cycles deterministically", () => {
      const cycles = createContinuousImprovementCyclesBuilder().build();
      assert.equal(cycles.length, 4);
      assert.deepEqual(
        cycles.map((c) => c.phase),
        ["observe", "analyze", "adapt", "validate"]
      );
    });

    it("generates learning confidence from strategy and insight counts", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const output = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const strategy = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const confidence = createLearningConfidenceBuilder().build({
        strategy,
        insightCount: output.learningInsights.length,
        gapCount: output.knowledgeGaps.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.strategicConfidenceScore, strategy.strategicConfidence.score);
    });

    it("validates learning outputs for all scenarios", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const validator = createLearningIntelligenceValidator();

      for (const scenarioId of LEARNING_SCENARIO_IDS) {
        const output = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.strategyOutputId.startsWith("strategy-"));
        assert.equal(output.continuousImprovementCycles.length, 4);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid learning for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns learning intelligence home for authenticated users", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const home = learningIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.learning_chain.includes("learning_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      assert.throws(
        () => learningIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic learning outputs for the same scenario", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const first = learningIntelligenceEngine.getLearning(USER_AUTH, { scenario_id: "moving_a_room" });
      const second = learningIntelligenceEngine.getLearning(USER_AUTH, { scenario_id: "moving_a_room" });
      assert.deepEqual(first.learning_insights, second.learning_insights);
      assert.deepEqual(first.lessons_learned, second.lessons_learned);
    });

    it("links learning output to strategy intelligence", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const output = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.strategyOutputId, /^strategy-/);
      assert.match(output.predictionOutputId, /^prediction-/);
      assert.match(output.insightOutputId, /^insight-/);
    });

    it("includes human-readable learning explanation", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const explanation = learningIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /learning/i);
      assert.ok(explanation.explanation.adaptationSummary.length > 0);
      assert.ok(explanation.learning_confidence.score >= 35);
    });

    it("delegates upstream only through strategy intelligence repository", () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const improvement = learningIntelligenceEngine.getImprovement(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(improvement.read_only, true);
      assert.equal(improvement.continuous_improvement_cycles.length, 4);
      assert.ok(Array.isArray(improvement.feedback_loops));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C14", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createLearningIntelligenceEngineModule/);
      assert.match(indexSource, /learningIntelligenceEngine/);
      assert.match(serverSource, /registerLearningIntelligenceRoutes/);
      assert.match(serverSource, /learningIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c14/);
      assert.match(packageSource, /test:ch4-c14-learning-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers learning intelligence routes behind auth middleware", async () => {
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLearningIntelligenceRoutes(app, learningIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/learning-intelligence" });
      assert.equal(home.statusCode, 200);

      const learning = await app.inject({
        method: "GET",
        url: "/learning-intelligence/learning?scenario_id=moving_a_room",
      });
      assert.equal(learning.statusCode, 200);
      const learningBody = learning.json() as {
        learning_insights: Array<{ insightId: string }>;
        read_only: boolean;
      };
      assert.equal(learningBody.read_only, true);
      assert.ok(learningBody.learning_insights.length > 0);

      const adaptation = await app.inject({
        method: "GET",
        url: "/learning-intelligence/adaptation?scenario_id=cleaning_an_apartment",
      });
      assert.equal(adaptation.statusCode, 200);

      const improvement = await app.inject({
        method: "GET",
        url: "/learning-intelligence/improvement?scenario_id=fixing_small_home_issue",
      });
      assert.equal(improvement.statusCode, 200);

      const patterns = await app.inject({
        method: "GET",
        url: "/learning-intelligence/patterns?scenario_id=delivering_a_document",
      });
      assert.equal(patterns.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/learning-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/learning-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, LEARNING_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/learning-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
