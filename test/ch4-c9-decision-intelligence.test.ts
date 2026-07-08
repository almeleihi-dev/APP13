import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerDecisionIntelligenceRoutes } from "../src/api/routes/decision-intelligence.js";
import {
  DECISION_INTELLIGENCE_SCHEMA_VERSION,
  DECISION_SCENARIO_IDS,
  DECISION_SCENARIO_TO_CANONICAL,
  DECISION_TYPES,
  createDecisionIntelligenceEngineModule,
  createDecisionReadinessBuilder,
  createDecisionTypeResolver,
  createDecisionFactorsBuilder,
  createDecisionConfidenceBuilder,
  createDecisionIntelligenceValidator,
} from "../src/decision-intelligence/module.js";
import { createTrustIntelligenceEngineModule } from "../src/trust-intelligence/module.js";
import { createOutcomeIntelligenceEngineModule } from "../src/outcome-intelligence/module.js";
import { createExecutionIntelligenceEngineModule } from "../src/execution-intelligence/module.js";
import type { DecisionScenarioId } from "../src/decision-intelligence/domain/decision-intelligence-schema.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c9",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c9-user-session",
};

function buildExecutionGuidance(scenarioId: DecisionScenarioId) {
  const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
  const roadmap = executionIntelligenceEngine.getRoadmap(USER_AUTH, { scenario_id: scenarioId });
  const sequencing = executionIntelligenceEngine.getSequencing(USER_AUTH, { scenario_id: scenarioId });
  const checkpoints = executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId });
  const acceptance = executionIntelligenceEngine.getAcceptance(USER_AUTH, { scenario_id: scenarioId });
  const explanation = executionIntelligenceEngine.getExplanation(USER_AUTH, { scenario_id: scenarioId });
  const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
  const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, { scenario_id: scenarioId }).evaluation;

  return {
    guidanceId: roadmap.guidance_id,
    contractRecommendationId: evaluation.contractRecommendationId,
    planId: evaluation.planId,
    canonicalActionId: evaluation.canonicalActionId,
    scenarioId: evaluation.scenarioId,
    goal: evaluation.goal,
    executionRoadmap: roadmap.execution_roadmap,
    orderedMilestones: roadmap.ordered_milestones,
    taskSequencing: sequencing.task_sequencing,
    responsibilityMatrix: sequencing.responsibility_matrix,
    stageEvidence: checkpoints.stage_evidence,
    verificationCheckpoints: checkpoints.verification_checkpoints,
    qualityCheckpoints: checkpoints.quality_checkpoints,
    escrowReleaseCheckpoints: checkpoints.escrow_release_checkpoints,
    acceptanceWorkflow: acceptance.acceptance_workflow,
    exceptionHandling: acceptance.exception_handling,
    recoveryRecommendations: acceptance.recovery_recommendations,
    progressModel: acceptance.progress_model,
    confidence: explanation.confidence,
    explanation: explanation.explanation,
    readOnly: true as const,
  };
}

describe("CH4-C9 decision intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides decision scenarios aligned with C1 through C8", () => {
      assert.equal(DECISION_SCENARIO_IDS.length, 5);
      for (const scenarioId of DECISION_SCENARIO_IDS) {
        assert.ok(DECISION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds decision readiness from trust and outcome deterministically", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const trust = trustIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).evaluation;
      const builder = createDecisionReadinessBuilder();

      const first = builder.build(trust, evaluation);
      const second = builder.build(trust, evaluation);
      assert.deepEqual(first, second);
      assert.ok(["not_ready", "conditional", "ready", "strong"].includes(first.level));
      assert.ok(first.score >= 0);
    });

    it("resolves decision type from readiness and blocking factors", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const trust = trustIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).evaluation;
      const execution = buildExecutionGuidance("cleaning_an_apartment");
      const readiness = createDecisionReadinessBuilder().build(trust, evaluation);
      const { blocking } = createDecisionFactorsBuilder().build(trust, evaluation, execution);

      const resolved = createDecisionTypeResolver().resolve({
        readiness,
        trust,
        evaluation,
        blockingCount: blocking.length,
      });
      assert.ok(DECISION_TYPES.includes(resolved.decision));
      assert.ok(resolved.rationale.length > 0);
    });

    it("generates decision confidence from upstream scores", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const trust = trustIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).recommendation;
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).evaluation;
      const execution = buildExecutionGuidance("fixing_small_home_issue");
      const readiness = createDecisionReadinessBuilder().build(trust, evaluation);
      const { blocking, supporting } = createDecisionFactorsBuilder().build(
        trust,
        evaluation,
        execution
      );
      const confidence = createDecisionConfidenceBuilder().build({
        trust,
        readiness,
        blockingCount: blocking.length,
        supportingCount: supporting.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.trustConfidenceScore, trust.trustConfidence.score);
    });

    it("validates decision recommendations for all scenarios", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const validator = createDecisionIntelligenceValidator();

      for (const scenarioId of DECISION_SCENARIO_IDS) {
        const recommendation = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
          scenario_id: scenarioId,
        }).recommendation;
        assert.equal(recommendation.readOnly, true);
        assert.ok(recommendation.trustRecommendationId.startsWith("trust-"));
        assert.ok(recommendation.explanation.summary.length > 0);
        assert.ok(DECISION_TYPES.includes(recommendation.recommendedDecision));

        const report = validator.validateRecommendation(recommendation);
        assert.equal(report.valid, true, `invalid decision for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns decision intelligence home for authenticated users", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const home = decisionIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.decision_chain.includes("decision_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      assert.throws(
        () => decisionIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic decision recommendations for the same scenario", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const first = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.recommendation, second.recommendation);
    });

    it("links decision recommendation to trust intelligence", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const recommendation = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;
      assert.match(recommendation.trustRecommendationId, /^trust-/);
      assert.match(recommendation.outcomeEvaluationId, /^outcome-/);
      assert.match(recommendation.executionGuidanceId, /^execution-/);
    });

    it("includes human-readable decision explanation", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const explanation = decisionIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /decision/i);
      assert.ok(explanation.explanation.rationaleSummary.length > 0);
      assert.ok(explanation.explanation.alternativeSummary.length > 0);
    });

    it("delegates upstream only through trust intelligence repository", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const factors = decisionIntelligenceEngine.getFactors(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(factors.read_only, true);
      assert.ok(Array.isArray(factors.blocking_factors));
      assert.ok(Array.isArray(factors.supporting_factors));
      assert.ok(factors.decision_rationale.length > 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C9", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createDecisionIntelligenceEngineModule/);
      assert.match(indexSource, /decisionIntelligenceEngine/);
      assert.match(serverSource, /registerDecisionIntelligenceRoutes/);
      assert.match(serverSource, /decisionIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c9/);
      assert.match(packageSource, /test:ch4-c9-decision-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers decision intelligence routes behind auth middleware", async () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerDecisionIntelligenceRoutes(app, decisionIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/decision-intelligence" });
      assert.equal(home.statusCode, 200);

      const recommendation = await app.inject({
        method: "GET",
        url: "/decision-intelligence/recommendation?scenario_id=moving_a_room",
      });
      assert.equal(recommendation.statusCode, 200);
      const recBody = recommendation.json() as {
        recommendation: {
          readOnly: boolean;
          recommendedDecision: string;
          goal: string;
        };
      };
      assert.equal(recBody.recommendation.readOnly, true);
      assert.ok(DECISION_TYPES.includes(recBody.recommendation.recommendedDecision as never));
      assert.match(recBody.recommendation.goal, /Move/i);

      const readiness = await app.inject({
        method: "GET",
        url: "/decision-intelligence/readiness?scenario_id=cleaning_an_apartment",
      });
      assert.equal(readiness.statusCode, 200);

      const factors = await app.inject({
        method: "GET",
        url: "/decision-intelligence/factors?scenario_id=fixing_small_home_issue",
      });
      assert.equal(factors.statusCode, 200);

      const alternatives = await app.inject({
        method: "GET",
        url: "/decision-intelligence/alternatives?scenario_id=delivering_a_document",
      });
      assert.equal(alternatives.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/decision-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/decision-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, DECISION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/decision-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
