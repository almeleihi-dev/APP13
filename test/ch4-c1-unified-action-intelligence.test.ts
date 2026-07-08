import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerActionIntelligenceRoutes } from "../src/api/routes/action-intelligence.js";
import {
  SCENARIO_IDS,
  UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION,
  createActionDecomposer,
  createActionIntentClassifier,
  createActionIntelligenceValidator,
  createUnifiedActionIntelligenceModule,
  getScenarioSeed,
  listScenarioSeeds,
} from "../src/unified-action-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c1",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c1-user-session",
};

describe("CH4-C1 unified action intelligence engine", () => {
  describe("domain (unit)", () => {
    it("defines five deterministic sample scenarios", () => {
      assert.equal(listScenarioSeeds().length, 5);
      for (const scenarioId of SCENARIO_IDS) {
        const seed = getScenarioSeed(scenarioId);
        assert.ok(seed.steps.length >= 4);
        assert.ok(seed.resources.length >= 2);
        assert.ok(seed.skills.length >= 2);
        assert.ok(seed.riskSignals.length >= 1);
      }
    });

    it("classifies natural language intent deterministically", () => {
      const classifier = createActionIntentClassifier();
      const moving = classifier.classify({
        rawText: "I need to move furniture from the guest room",
      });
      const cleaning = classifier.classify({
        rawText: "Please deep clean my apartment before guests arrive",
      });
      assert.equal(moving.scenarioId, "moving_a_room");
      assert.equal(cleaning.scenarioId, "cleaning_an_apartment");
    });

    it("decomposes moving a room into executable steps", () => {
      const seed = getScenarioSeed("moving_a_room");
      const decomposition = createActionDecomposer().decompose(seed);
      assert.equal(decomposition.goal.label, "Move a room's contents safely");
      assert.equal(decomposition.category, "moving");
      assert.ok(decomposition.steps.some((step) => step.title.includes("Move items")));
      assert.ok(decomposition.resources.some((resource) => resource.type === "tool"));
      assert.ok(decomposition.skills.some((skill) => skill.name.includes("handling")));
      assert.ok(decomposition.timeBand.minHours <= decomposition.timeBand.maxHours);
      assert.ok(decomposition.executionPath.phases.length >= 3);
    });

    it("validates complete decomposition with high completeness score", () => {
      const seed = getScenarioSeed("delivering_a_document");
      const decomposition = createActionDecomposer().decompose(seed);
      const report = createActionIntelligenceValidator().validateDecomposition(decomposition);
      assert.equal(report.valid, true);
      assert.ok(report.completenessScore >= 80);
    });

    it("builds intelligence summary with full chain", () => {
      const seed = getScenarioSeed("preparing_professional_service_request");
      const decomposition = createActionDecomposer().decompose(seed);
      const summary = createActionIntelligenceValidator().buildSummary(decomposition);
      assert.equal(summary.schemaVersion, UNIFIED_ACTION_INTELLIGENCE_SCHEMA_VERSION);
      assert.equal(summary.readOnly, true);
      assert.equal(summary.actionCategory, "professional_request");
      assert.ok(summary.intelligenceChain.includes("trust"));
      assert.ok(summary.intelligenceChain.includes("price"));
    });
  });

  describe("service (unit)", () => {
    it("returns home catalog for authenticated users", () => {
      const { unifiedActionIntelligence } = createUnifiedActionIntelligenceModule();
      const home = unifiedActionIntelligence.getHome(USER_AUTH);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.read_only, true);
      assert.ok(home.intelligence_chain.length >= 9);
    });

    it("rejects unauthenticated access", () => {
      const { unifiedActionIntelligence } = createUnifiedActionIntelligenceModule();
      assert.throws(
        () => unifiedActionIntelligence.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns full decomposition output for each sample scenario", () => {
      const { unifiedActionIntelligence } = createUnifiedActionIntelligenceModule();
      for (const scenarioId of SCENARIO_IDS) {
        const decomposition = unifiedActionIntelligence.getDecomposition(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(decomposition.scenario_id, scenarioId);
        assert.ok(decomposition.detected_goal.length > 0);
        assert.ok(decomposition.steps.length >= 4);
        assert.ok(decomposition.skills.length >= 2);
        assert.ok(decomposition.resources.length >= 2);
        assert.ok(decomposition.time_band.min_hours <= decomposition.time_band.max_hours);

        const risks = unifiedActionIntelligence.getRisks(USER_AUTH, { scenario_id: scenarioId });
        assert.ok(risks.risk_count >= 1);

        const path = unifiedActionIntelligence.getExecutionPath(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.ok(path.phases.length >= 3);
        assert.equal(path.read_only, true);

        const summary = unifiedActionIntelligence.getSummary(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(summary.read_only, true);
        assert.equal(summary.summary.scenarioId, scenarioId);
      }
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C1", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createUnifiedActionIntelligenceModule/);
      assert.match(indexSource, /unifiedActionIntelligence/);
      assert.match(serverSource, /registerActionIntelligenceRoutes/);
      assert.match(serverSource, /unifiedActionIntelligence/);
      assert.match(packageSource, /verify:ch4-c1/);
      assert.match(packageSource, /test:ch4-c1-unified-action-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers action intelligence routes behind auth middleware", async () => {
      const { unifiedActionIntelligence } = createUnifiedActionIntelligenceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerActionIntelligenceRoutes(app, unifiedActionIntelligence);

      const home = await app.inject({ method: "GET", url: "/action-intelligence" });
      assert.equal(home.statusCode, 200);

      const decomposition = await app.inject({
        method: "GET",
        url: "/action-intelligence/decomposition?scenario_id=fixing_small_home_issue",
      });
      assert.equal(decomposition.statusCode, 200);
      const body = decomposition.json() as { action_category: string; steps: unknown[] };
      assert.equal(body.action_category, "maintenance");
      assert.ok(body.steps.length >= 4);

      const summary = await app.inject({
        method: "GET",
        url: "/action-intelligence/summary?intent=deliver%20signed%20contract%20downtown",
      });
      assert.equal(summary.statusCode, 200);

      const validate = await app.inject({
        method: "GET",
        url: "/action-intelligence/validate?scenario_id=cleaning_an_apartment",
      });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { valid: boolean };
      assert.equal(report.valid, true);

      await app.close();
    });
  });
});
