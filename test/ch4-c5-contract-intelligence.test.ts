import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerContractIntelligenceRoutes } from "../src/api/routes/contract-intelligence.js";
import {
  CONTRACT_INTELLIGENCE_SCHEMA_VERSION,
  CONTRACT_SCENARIO_IDS,
  CONTRACT_SCENARIO_TO_CANONICAL,
  createContractIntelligenceEngineModule,
  createContractMilestoneBuilder,
  createContractClauseBuilder,
  createContractConfidenceBuilder,
  createContractIntelligenceValidator,
  getCategoryContractProfile,
} from "../src/contract-intelligence/module.js";
import { createActionPlanBuilder } from "../src/action-planning/module.js";
import { getCanonicalActionById } from "../src/action-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c5",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c5-user-session",
};

describe("CH4-C5 contract intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides contract scenarios aligned with C1/C2/C3/C4", () => {
      assert.equal(CONTRACT_SCENARIO_IDS.length, 5);
      for (const scenarioId of CONTRACT_SCENARIO_IDS) {
        assert.ok(CONTRACT_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("maps categories to deterministic contract profiles", () => {
      const moving = getCategoryContractProfile("moving");
      const professional = getCategoryContractProfile("professional_service_request");
      assert.equal(moving.contractType, "service_agreement_fixed_price");
      assert.equal(professional.paymentStructure, "deferred_matching");
      assert.equal(professional.escrowMode, "none");
    });

    it("builds milestones from plan stages deterministically", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.move.room_contents");
      const plan = builder.build({ scenarioId: "moving_a_room" }, canonical!);
      const milestoneBuilder = createContractMilestoneBuilder();

      const first = milestoneBuilder.build(plan);
      const second = milestoneBuilder.build(plan);
      assert.deepEqual(first.milestones, second.milestones);
      assert.equal(first.milestones.length, plan.stages.length);
      assert.ok(first.acceptanceCriteria.length >= 1);
    });

    it("generates risk, cancellation, and warranty clauses from canonical action", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.maint.fix_minor_issue");
      const plan = builder.build({ scenarioId: "fixing_small_home_issue" }, canonical!);
      const clauseBuilder = createContractClauseBuilder();
      const clauses = clauseBuilder.build({ plan, canonicalAction: canonical!, category: plan.category });

      assert.ok(clauses.riskClauses.length >= 1);
      assert.equal(clauses.cancellationClauses.length, 2);
      assert.ok(clauses.warrantySuggestions.length >= 1);
    });

    it("generates contract confidence from plan and pricing inputs", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);
      const confidenceBuilder = createContractConfidenceBuilder();
      const confidence = confidenceBuilder.build({
        plan,
        pricingConfidenceScore: 75,
        milestoneCount: plan.stages.length,
        evidenceCount: 4,
      });

      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.ok(confidence.score >= 40);
      assert.equal(confidence.pricingConfidenceScore, 75);
    });

    it("validates contract recommendations for all scenarios", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const validator = createContractIntelligenceValidator();

      for (const scenarioId of CONTRACT_SCENARIO_IDS) {
        const recommendation = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
          scenario_id: scenarioId,
        }).recommendation;
        assert.equal(recommendation.readOnly, true);
        assert.ok(recommendation.pricingRecommendationId.startsWith("pricing-"));
        assert.ok(recommendation.parties.length >= 3);
        assert.ok(recommendation.milestones.length >= 1);
        assert.ok(recommendation.explanation.summary.length > 0);

        const report = validator.validateRecommendation(recommendation);
        assert.equal(report.valid, true, `invalid contract for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns contract intelligence home for authenticated users", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const home = contractIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.contract_chain.includes("dynamic_pricing"));
    });

    it("rejects unauthenticated access", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      assert.throws(
        () => contractIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic recommendations for the same scenario", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const first = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      const second = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.deepEqual(
        first.recommendation.paymentRecommendation,
        second.recommendation.paymentRecommendation
      );
      assert.deepEqual(first.recommendation.milestones, second.recommendation.milestones);
    });

    it("links payment recommendation to C4 pricing output", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const recommendation = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      assert.match(recommendation.pricingRecommendationId, /^pricing-/);
      assert.ok(recommendation.paymentRecommendation.recommendedAmountMax >=
        recommendation.paymentRecommendation.recommendedAmountMin);
      assert.match(recommendation.paymentRecommendation.readOnlyNote, /no payment execution/i);
    });

    it("returns professional scenario with deferred payment structure", () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const recommendation = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      }).recommendation;
      assert.equal(recommendation.contractType, "scope_definition_agreement");
      assert.equal(recommendation.paymentRecommendation.structure, "deferred_matching");
      assert.equal(recommendation.escrowRecommendation.mode, "none");
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C5", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createContractIntelligenceEngineModule/);
      assert.match(indexSource, /contractIntelligenceEngine/);
      assert.match(serverSource, /registerContractIntelligenceRoutes/);
      assert.match(serverSource, /contractIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c5/);
      assert.match(packageSource, /test:ch4-c5-contract-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers contract intelligence routes behind auth middleware", async () => {
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerContractIntelligenceRoutes(app, contractIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/contract-intelligence" });
      assert.equal(home.statusCode, 200);

      const recommendation = await app.inject({
        method: "GET",
        url: "/contract-intelligence/recommendation?scenario_id=moving_a_room",
      });
      assert.equal(recommendation.statusCode, 200);
      const recBody = recommendation.json() as {
        recommendation: { contractType: string; readOnly: boolean; parties: unknown[] };
      };
      assert.equal(recBody.recommendation.contractType, "service_agreement_fixed_price");
      assert.equal(recBody.recommendation.readOnly, true);
      assert.ok(recBody.recommendation.parties.length >= 3);

      const structure = await app.inject({
        method: "GET",
        url: "/contract-intelligence/structure?scenario_id=cleaning_an_apartment",
      });
      assert.equal(structure.statusCode, 200);

      const milestones = await app.inject({
        method: "GET",
        url: "/contract-intelligence/milestones?scenario_id=fixing_small_home_issue",
      });
      assert.equal(milestones.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/contract-intelligence/explanation?scenario_id=delivering_a_document",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/contract-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, CONTRACT_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/contract-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
