import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerEvolutionIntelligenceRoutes } from "../src/api/routes/evolution-intelligence.js";
import {
  EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
  EVOLUTION_SCENARIO_IDS,
  EVOLUTION_SCENARIO_TO_CANONICAL,
  createEvolutionIntelligenceEngineModule,
  createCapabilityEvolutionsBuilder,
  createEvolutionaryPlanningCyclesBuilder,
  createEvolutionConfidenceBuilder,
  createEvolutionIntelligenceValidator,
} from "../src/evolution-intelligence/module.js";
import { createOptimizationIntelligenceEngineModule } from "../src/optimization-intelligence/module.js";
import { createStrategyIntelligenceEngineModule } from "../src/strategy-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c16",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c16-user-session",
};

describe("CH4-C16 evolution intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides evolution scenarios aligned with C1 through C15", () => {
      assert.equal(EVOLUTION_SCENARIO_IDS.length, 5);
      for (const scenarioId of EVOLUTION_SCENARIO_IDS) {
        assert.ok(EVOLUTION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds capability evolutions from optimization output deterministically", () => {
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const { strategyIntelligenceEngine } = createStrategyIntelligenceEngineModule();
      const optimization = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const strategy = strategyIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createCapabilityEvolutionsBuilder();

      const first = builder.build(optimization, strategy);
      const second = builder.build(optimization, strategy);
      assert.deepEqual(first, second);
      assert.ok(first.length >= 2);
    });

    it("defines evolutionary planning cycles deterministically", () => {
      const cycles = createEvolutionaryPlanningCyclesBuilder().build();
      assert.equal(cycles.length, 4);
      assert.deepEqual(
        cycles.map((c) => c.phase),
        ["assess", "envision", "evolve", "integrate"]
      );
    });

    it("generates evolution confidence from optimization and capability counts", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const output = evolutionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const { optimizationIntelligenceEngine } = createOptimizationIntelligenceEngineModule();
      const optimization = optimizationIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const confidence = createEvolutionConfidenceBuilder().build({
        optimization,
        capabilityCount: output.capabilityEvolutions.length,
        transformationCount: output.strategicTransformations.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.optimizationConfidenceScore, optimization.optimizationConfidence.score);
    });

    it("validates evolution outputs for all scenarios", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const validator = createEvolutionIntelligenceValidator();

      for (const scenarioId of EVOLUTION_SCENARIO_IDS) {
        const output = evolutionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.optimizationOutputId.startsWith("optimization-"));
        assert.equal(output.evolutionaryPlanningCycles.length, 4);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid evolution for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns evolution intelligence home for authenticated users", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const home = evolutionIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.evolution_chain.includes("evolution_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      assert.throws(
        () => evolutionIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic evolution outputs for the same scenario", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const first = evolutionIntelligenceEngine.getCapability(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = evolutionIntelligenceEngine.getCapability(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.capability_evolutions, second.capability_evolutions);
      assert.deepEqual(first.maturity_progressions, second.maturity_progressions);
    });

    it("links evolution output to optimization intelligence", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const output = evolutionIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.optimizationOutputId, /^optimization-/);
      assert.match(output.learningOutputId, /^learning-/);
      assert.match(output.strategyOutputId, /^strategy-/);
    });

    it("includes human-readable evolution explanation", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const explanation = evolutionIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /evolution/i);
      assert.ok(explanation.explanation.capabilitySummary.length > 0);
      assert.ok(explanation.evolution_confidence.score >= 35);
    });

    it("delegates upstream only through optimization intelligence repository", () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const planning = evolutionIntelligenceEngine.getPlanning(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(planning.read_only, true);
      assert.equal(planning.evolutionary_planning_cycles.length, 4);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C16", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createEvolutionIntelligenceEngineModule/);
      assert.match(indexSource, /evolutionIntelligenceEngine/);
      assert.match(serverSource, /registerEvolutionIntelligenceRoutes/);
      assert.match(serverSource, /evolutionIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c16/);
      assert.match(packageSource, /test:ch4-c16-evolution-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers evolution intelligence routes behind auth middleware", async () => {
      const { evolutionIntelligenceEngine } = createEvolutionIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerEvolutionIntelligenceRoutes(app, evolutionIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/evolution-intelligence" });
      assert.equal(home.statusCode, 200);

      const capability = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/capability?scenario_id=moving_a_room",
      });
      assert.equal(capability.statusCode, 200);
      const capabilityBody = capability.json() as {
        capability_evolutions: Array<{ capabilityId: string }>;
        read_only: boolean;
      };
      assert.equal(capabilityBody.read_only, true);
      assert.ok(capabilityBody.capability_evolutions.length > 0);

      const transformation = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/transformation?scenario_id=cleaning_an_apartment",
      });
      assert.equal(transformation.statusCode, 200);

      const resilience = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/resilience?scenario_id=fixing_small_home_issue",
      });
      assert.equal(resilience.statusCode, 200);

      const planning = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/planning?scenario_id=delivering_a_document",
      });
      assert.equal(planning.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/evolution-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, EVOLUTION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/evolution-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
