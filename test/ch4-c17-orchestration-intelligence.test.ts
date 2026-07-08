import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOrchestrationIntelligenceRoutes } from "../src/api/routes/orchestration-intelligence.js";
import {
  ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
  ORCHESTRATION_SCENARIO_IDS,
  ORCHESTRATION_SCENARIO_TO_CANONICAL,
  ORCHESTRATION_CHAIN,
  createOrchestrationIntelligenceEngineModule,
  createChainTraceBuilder,
  createOrchestrationConfidenceBuilder,
  createOrchestrationIntelligenceValidator,
} from "../src/orchestration-intelligence/module.js";
import { createEvolutionIntelligenceEngineModule } from "../src/evolution-intelligence/module.js";
import { createStrategyIntelligenceEngineModule } from "../src/strategy-intelligence/module.js";
import { createOptimizationIntelligenceEngineModule } from "../src/optimization-intelligence/module.js";
import { createLearningIntelligenceEngineModule } from "../src/learning-intelligence/module.js";
import { createPredictionIntelligenceEngineModule } from "../src/prediction-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c17",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c17-user-session",
};

describe("CH4-C17 orchestration intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides orchestration scenarios aligned with C1 through C16", () => {
      assert.equal(ORCHESTRATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of ORCHESTRATION_SCENARIO_IDS) {
        assert.ok(ORCHESTRATION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
      assert.equal(ORCHESTRATION_CHAIN.length, 17);
      assert.ok(ORCHESTRATION_CHAIN.includes("orchestration_intelligence"));
    });

    it("builds chain trace from evolution output deterministically", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const { learningIntelligenceEngine } = createLearningIntelligenceEngineModule();
      const { predictionIntelligenceEngine } = createPredictionIntelligenceEngineModule();

      const evolution = evolutionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const strategy = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const optimization = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const learning = learningIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const prediction = predictionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });

      const builder = createChainTraceBuilder();
      const first = builder.build(evolution, strategy, learning, optimization, prediction);
      const second = builder.build(evolution, strategy, learning, optimization, prediction);
      assert.deepEqual(first, second);
      assert.equal(first.length, 16);
      assert.equal(first[0]!.engineKey, "intent");
      assert.equal(first[15]!.engineKey, "evolution_intelligence");
    });

    it("generates orchestration confidence from evolution and readiness", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const output = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const evolution = evolutionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });

      const confidence = createOrchestrationConfidenceBuilder().build({
        evolution,
        readiness: output.orchestrationReadiness,
        chainLayerCount: output.chainTrace.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.evolutionConfidenceScore, evolution.evolutionConfidence.score);
    });

    it("produces cross-engine coordination for adjacent chain layers", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const output = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.equal(output.crossEngineCoordination.length, 15);
      assert.match(output.crossEngineCoordination[0]!.coordinationId, /^coord\./);
    });

    it("validates orchestration outputs for all scenarios", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const validator = createOrchestrationIntelligenceValidator();

      for (const scenarioId of ORCHESTRATION_SCENARIO_IDS) {
        const output = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.evolutionOutputId.startsWith("evolution-"));
        assert.equal(output.chainTrace.length, 16);
        assert.equal(output.orchestrationLayers.length, 16);
        assert.ok(output.explanation.chainSummary.includes("orchestration_intelligence"));

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid orchestration for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns orchestration intelligence home for authenticated users", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const home = orchestrationIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.orchestration_chain.includes("orchestration_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      assert.throws(
        () => orchestrationIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic orchestration outputs for the same scenario", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const first = orchestrationIntelligenceEngine.getChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = orchestrationIntelligenceEngine.getChain(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.chain_trace, second.chain_trace);
      assert.deepEqual(first.orchestration_layers, second.orchestration_layers);
    });

    it("links orchestration output to evolution intelligence and full chain", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const output = orchestrationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.evolutionOutputId, /^evolution-/);
      assert.match(output.optimizationOutputId, /^optimization-/);
      assert.match(output.learningOutputId, /^learning-/);
      assert.match(output.strategyOutputId, /^strategy-/);
      assert.match(output.predictionOutputId, /^prediction-/);
    });

    it("includes human-readable orchestration explanation with chain traceability", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const explanation = orchestrationIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /orchestrat/i);
      assert.ok(explanation.explanation.chainSummary.includes("evolution_intelligence"));
      assert.ok(explanation.orchestration_confidence.score >= 35);
    });

    it("delegates upstream only through evolution intelligence repository", () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const unified = orchestrationIntelligenceEngine.getUnified(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(unified.read_only, true);
      assert.equal(unified.unified_intelligence_snapshots.length, 5);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C17", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createOrchestrationIntelligenceEngineModule/);
      assert.match(indexSource, /orchestrationIntelligenceEngine/);
      assert.match(serverSource, /registerOrchestrationIntelligenceRoutes/);
      assert.match(serverSource, /orchestrationIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c17/);
      assert.match(packageSource, /test:ch4-c17-orchestration-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers orchestration intelligence routes behind auth middleware", async () => {
      const { orchestrationIntelligenceEngine } = createOrchestrationIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOrchestrationIntelligenceRoutes(app, orchestrationIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/orchestration-intelligence" });
      assert.equal(home.statusCode, 200);

      const chain = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/chain?scenario_id=moving_a_room",
      });
      assert.equal(chain.statusCode, 200);
      const chainBody = chain.json() as {
        chain_trace: Array<{ engineKey: string }>;
        read_only: boolean;
      };
      assert.equal(chainBody.read_only, true);
      assert.equal(chainBody.chain_trace.length, 16);

      const coordination = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/coordination?scenario_id=cleaning_an_apartment",
      });
      assert.equal(coordination.statusCode, 200);

      const unified = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/unified?scenario_id=fixing_small_home_issue",
      });
      assert.equal(unified.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/readiness?scenario_id=delivering_a_document",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/orchestration-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/orchestration-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
