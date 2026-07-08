import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiDecisionIntelligenceExperienceRoutes } from "../src/api/routes/ai-decision-intelligence-experience.js";
import {
  AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  DECISION_INTELLIGENCE_SCENARIO_IDS,
  DECISION_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiDecisionIntelligenceExperienceModule,
  createDecisionContextBuilder,
  createDecisionTreeBuilder,
  createAiDecisionIntelligenceExperienceValidator,
} from "../src/ai-decision-intelligence-experience/module.js";
import { createAiOrchestrationExperienceModule } from "../src/ai-orchestration-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x14",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x14-user-session",
};

describe("CH5-X14 AI Decision Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides decision intelligence scenarios aligned with X13 orchestration", () => {
      assert.equal(DECISION_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of DECISION_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          DECISION_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN.length, 36);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X13");
      assert.ok(
        AI_DECISION_INTELLIGENCE_EXPERIENCE_CHAIN.includes("ai_decision_intelligence_experience")
      );
    });

    it("builds decision context from orchestration output deterministically", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const orchestration = aiOrchestrationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createDecisionContextBuilder();

      const first = builder.build(orchestration);
      const second = builder.build(orchestration);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^decision-context-orchestration-/);
    });

    it("generates decision tree from orchestration output deterministically", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const orchestration = aiOrchestrationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const tree = createDecisionTreeBuilder().build(orchestration);
      assert.equal(tree.nodes.length, 5);
      assert.ok(tree.summary.includes("decision tree nodes"));
    });

    it("generates decision confidence from orchestration output", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const output = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.decisionConfidence.level));
      assert.ok(output.decisionConfidence.score >= 40);
    });

    it("validates decision intelligence outputs for all scenarios", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const validator = createAiDecisionIntelligenceExperienceValidator();

      for (const scenarioId of DECISION_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.orchestrationOutputId.startsWith("orchestration-"));
        assert.equal(output.decisionOptions.options.length, 3);
        assert.equal(output.decisionRecommendations.recommendations.length, 4);
        assert.equal(output.decisionTree.nodes.length, 5);
        assert.equal(output.riskAnalysis.factors.length, 3);
        assert.equal(output.opportunityAnalysis.opportunities.length, 3);
        assert.equal(output.priorityMatrix.items.length, 3);
        assert.ok(output.decisionExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid decision intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Decision Intelligence Experience home for authenticated users", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const home = aiDecisionIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X13");
      assert.ok(
        home.decision_intelligence_chain.includes("ai_decision_intelligence_experience")
      );
      assert.ok(home.decision_intelligence_views.includes("Decision Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      assert.throws(
        () => aiDecisionIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic decision intelligence outputs for the same scenario", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const first = aiDecisionIntelligenceExperience.getDecisionTree(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiDecisionIntelligenceExperience.getDecisionTree(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links decision intelligence output to AI Orchestration Experience", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const output = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.orchestrationOutputId, /^orchestration-executive-intelligence-/);
      assert.match(
        output.executiveIntelligenceOutputId,
        /^executive-intelligence-predictive-intelligence-/
      );
      assert.match(output.outputId, /^decision-intelligence-orchestration-/);
    });

    it("includes human-readable decision intelligence explanation", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const explanation = aiDecisionIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /decision intelligence|options|recommendations/i
      );
      assert.ok(explanation.explanation.treeSummary.length > 0);
      assert.ok(explanation.decision_confidence.score >= 40);
    });

    it("delegates upstream only through AI Orchestration Experience", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const output = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(output.delegationDecisionIntelligence.soleUpstream, "CH5-X13 AI Orchestration Experience");
      assert.equal(output.delegationDecisionIntelligence.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X14", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiDecisionIntelligenceExperienceModule/);
      assert.match(indexSource, /aiDecisionIntelligenceExperience/);
      assert.match(serverSource, /registerAiDecisionIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiDecisionIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x14/);
      assert.match(packageSource, /test:ch5-x14-ai-decision-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Decision Intelligence Experience routes behind auth middleware", async () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiDecisionIntelligenceExperienceRoutes(
        app,
        aiDecisionIntelligenceExperience
      );

      const home = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/decision-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const tree = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/decision-tree?scenario_id=cleaning_an_apartment",
      });
      assert.equal(tree.statusCode, 200);
      const treeBody = tree.json() as { view: { nodes: unknown[] } };
      assert.equal(treeBody.view.nodes.length, 5);

      const options = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/options?scenario_id=fixing_small_home_issue",
      });
      assert.equal(options.statusCode, 200);
      const optBody = options.json() as { view: { options: unknown[] } };
      assert.equal(optBody.view.options.length, 3);

      const recommendations = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/recommendations?scenario_id=moving_a_room",
      });
      assert.equal(recommendations.statusCode, 200);
      const recBody = recommendations.json() as { view: { recommendations: unknown[] } };
      assert.equal(recBody.view.recommendations.length, 4);

      const risk = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/risk-analysis?scenario_id=moving_a_room",
      });
      assert.equal(risk.statusCode, 200);
      const riskBody = risk.json() as { view: { factors: unknown[] } };
      assert.equal(riskBody.view.factors.length, 3);

      const opportunity = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/opportunity-analysis?scenario_id=moving_a_room",
      });
      assert.equal(opportunity.statusCode, 200);

      const matrix = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/priority-matrix?scenario_id=moving_a_room",
      });
      assert.equal(matrix.statusCode, 200);
      const matrixBody = matrix.json() as { view: { items: unknown[] } };
      assert.equal(matrixBody.view.items.length, 3);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; recommendationCount: number };
      };
      assert.equal(
        summaryBody.summary.schemaVersion,
        AI_DECISION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION
      );
      assert.equal(
        summaryBody.summary.generatedAt,
        AI_DECISION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP
      );
      assert.equal(summaryBody.summary.recommendationCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-decision-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
