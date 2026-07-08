import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerTrustIntelligenceRoutes } from "../src/api/routes/trust-intelligence.js";
import {
  TRUST_INTELLIGENCE_SCHEMA_VERSION,
  TRUST_SCENARIO_IDS,
  TRUST_SCENARIO_TO_CANONICAL,
  createTrustIntelligenceEngineModule,
  createTrustReadinessBuilder,
  createTrustScoreBuilder,
  createEvidenceCompletenessBuilder,
  createTrustConfidenceBuilder,
  createTrustIntelligenceValidator,
  createVerificationConfidenceBuilder,
} from "../src/trust-intelligence/module.js";
import { createOutcomeIntelligenceEngineModule } from "../src/outcome-intelligence/module.js";
import { createExecutionIntelligenceEngineModule } from "../src/execution-intelligence/module.js";
import { createContractIntelligenceEngineModule } from "../src/contract-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c8",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c8-user-session",
};

function buildExecutionGuidance(scenarioId: (typeof TRUST_SCENARIO_IDS)[number]) {
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

describe("CH4-C8 trust intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides trust scenarios aligned with C1 through C7", () => {
      assert.equal(TRUST_SCENARIO_IDS.length, 5);
      for (const scenarioId of TRUST_SCENARIO_IDS) {
        assert.ok(TRUST_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds trust readiness from outcome and execution deterministically", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).evaluation;
      const execution = buildExecutionGuidance("moving_a_room");
      const builder = createTrustReadinessBuilder();

      const first = builder.build(evaluation, execution);
      const second = builder.build(evaluation, execution);
      assert.deepEqual(first, second);
      assert.ok(["not_ready", "conditional", "ready", "strong"].includes(first.level));
      assert.ok(first.score >= 0);
    });

    it("builds trust score with traceable factors", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).evaluation;
      const execution = buildExecutionGuidance("cleaning_an_apartment");
      const readiness = createTrustReadinessBuilder().build(evaluation, execution);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;

      const score = createTrustScoreBuilder().build({
        evaluation,
        execution,
        contract,
        readiness,
      });
      assert.ok(score.recommendedScore >= 0);
      assert.equal(score.factors.length, 5);
      assert.match(score.readOnlyNote, /no trust mutations/i);
    });

    it("assesses evidence completeness from outcome evaluation", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).evaluation;
      const completeness = createEvidenceCompletenessBuilder().build(evaluation);
      assert.ok(completeness.score >= 0);
      assert.ok(completeness.summary.length > 0);
    });

    it("generates trust confidence from upstream scores", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).evaluation;
      const execution = buildExecutionGuidance("fixing_small_home_issue");
      const readiness = createTrustReadinessBuilder().build(evaluation, execution);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).recommendation;
      const score = createTrustScoreBuilder().build({ evaluation, execution, contract, readiness });
      const verification = createVerificationConfidenceBuilder().build(execution);
      const confidence = createTrustConfidenceBuilder().build({
        evaluation,
        readiness,
        trustScore: score,
        verificationConfidence: verification,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.outcomeConfidenceScore, evaluation.confidence.score);
    });

    it("validates trust recommendations for all scenarios", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const validator = createTrustIntelligenceValidator();

      for (const scenarioId of TRUST_SCENARIO_IDS) {
        const recommendation = trustIntelligenceEngine.getRecommendation(USER_AUTH, {
          scenario_id: scenarioId,
        }).recommendation;
        assert.equal(recommendation.readOnly, true);
        assert.ok(recommendation.outcomeEvaluationId.startsWith("outcome-"));
        assert.ok(recommendation.trustScoreRecommendation.factors.length >= 5);
        assert.ok(recommendation.explanation.summary.length > 0);

        const report = validator.validateRecommendation(recommendation);
        assert.equal(report.valid, true, `invalid trust for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns trust intelligence home for authenticated users", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const home = trustIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.trust_chain.includes("outcome_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      assert.throws(
        () => trustIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic trust recommendations for the same scenario", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const first = trustIntelligenceEngine.getScore(USER_AUTH, { scenario_id: "moving_a_room" });
      const second = trustIntelligenceEngine.getScore(USER_AUTH, { scenario_id: "moving_a_room" });
      assert.deepEqual(first.trust_score_recommendation, second.trust_score_recommendation);
    });

    it("links trust recommendation to outcome evaluation", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const recommendation = trustIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;
      assert.match(recommendation.outcomeEvaluationId, /^outcome-/);
      assert.match(recommendation.executionGuidanceId, /^execution-/);
    });

    it("includes human-readable trust explanation", () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const explanation = trustIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /trust/i);
      assert.ok(explanation.explanation.readinessRationale.length > 0);
      assert.ok(explanation.trust_confidence.score >= 40);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C8", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createTrustIntelligenceEngineModule/);
      assert.match(indexSource, /trustIntelligenceEngine/);
      assert.match(serverSource, /registerTrustIntelligenceRoutes/);
      assert.match(serverSource, /trustIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c8/);
      assert.match(packageSource, /test:ch4-c8-trust-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers trust intelligence routes behind auth middleware", async () => {
      const { trustIntelligenceEngine } = createTrustIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerTrustIntelligenceRoutes(app, trustIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/trust-intelligence" });
      assert.equal(home.statusCode, 200);

      const recommendation = await app.inject({
        method: "GET",
        url: "/trust-intelligence/recommendation?scenario_id=moving_a_room",
      });
      assert.equal(recommendation.statusCode, 200);
      const recBody = recommendation.json() as {
        recommendation: { readOnly: boolean; trustReadiness: { level: string }; goal: string };
      };
      assert.equal(recBody.recommendation.readOnly, true);
      assert.ok(recBody.recommendation.trustReadiness.level);
      assert.match(recBody.recommendation.goal, /Move/i);

      const readiness = await app.inject({
        method: "GET",
        url: "/trust-intelligence/readiness?scenario_id=cleaning_an_apartment",
      });
      assert.equal(readiness.statusCode, 200);

      const score = await app.inject({
        method: "GET",
        url: "/trust-intelligence/score?scenario_id=fixing_small_home_issue",
      });
      assert.equal(score.statusCode, 200);

      const reputation = await app.inject({
        method: "GET",
        url: "/trust-intelligence/reputation?scenario_id=delivering_a_document",
      });
      assert.equal(reputation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/trust-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, TRUST_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/trust-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
