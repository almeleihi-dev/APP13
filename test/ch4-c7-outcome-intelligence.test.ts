import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerOutcomeIntelligenceRoutes } from "../src/api/routes/outcome-intelligence.js";
import {
  OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
  OUTCOME_SCENARIO_IDS,
  OUTCOME_SCENARIO_TO_CANONICAL,
  createOutcomeIntelligenceEngineModule,
  createExpectedOutcomesBuilder,
  createCompletionOutcomeModelBuilder,
  createVarianceAnalyzer,
  createOutcomeConfidenceBuilder,
  createOutcomeIntelligenceValidator,
} from "../src/outcome-intelligence/module.js";
import { createExecutionIntelligenceEngineModule } from "../src/execution-intelligence/module.js";
import { createContractIntelligenceEngineModule } from "../src/contract-intelligence/module.js";
import { createActionPlanBuilder } from "../src/action-planning/module.js";
import { getCanonicalActionById } from "../src/action-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c7",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c7-user-session",
};

function buildExecutionGuidance(scenarioId: (typeof OUTCOME_SCENARIO_IDS)[number]) {
  const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
  const roadmap = executionIntelligenceEngine.getRoadmap(USER_AUTH, { scenario_id: scenarioId });
  const sequencing = executionIntelligenceEngine.getSequencing(USER_AUTH, { scenario_id: scenarioId });
  const checkpoints = executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId });
  const acceptance = executionIntelligenceEngine.getAcceptance(USER_AUTH, { scenario_id: scenarioId });
  const explanation = executionIntelligenceEngine.getExplanation(USER_AUTH, { scenario_id: scenarioId });
  const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
  const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, { scenario_id: scenarioId }).recommendation;

  return {
    guidanceId: roadmap.guidance_id,
    contractRecommendationId: contract.recommendationId,
    planId: contract.planId,
    canonicalActionId: contract.canonicalActionId,
    scenarioId: contract.scenarioId,
    goal: contract.goal,
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

describe("CH4-C7 outcome intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides outcome scenarios aligned with C1 through C6", () => {
      assert.equal(OUTCOME_SCENARIO_IDS.length, 5);
      for (const scenarioId of OUTCOME_SCENARIO_IDS) {
        assert.ok(OUTCOME_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds expected outcomes from plan and contract deterministically", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.move.room_contents");
      const plan = builder.build({ scenarioId: "moving_a_room" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;

      const outcomesBuilder = createExpectedOutcomesBuilder();
      const first = outcomesBuilder.build(plan, contract, canonical!);
      const second = outcomesBuilder.build(plan, contract, canonical!);
      assert.deepEqual(first, second);
      assert.ok(first.some((o) => o.source === "goal"));
      assert.ok(first.length >= 3);
    });

    it("builds completion outcome model from execution guidance", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;
      const execution = buildExecutionGuidance("cleaning_an_apartment");

      const modelBuilder = createCompletionOutcomeModelBuilder();
      const model = modelBuilder.build({ plan, contract, execution });
      assert.ok(model.projectedCompletionPercent >= 0);
      assert.ok(model.totalCriteriaCount >= 1);
      assert.ok(["not_ready", "partially_ready", "ready_for_acceptance", "fully_ready"].includes(model.readinessState));
    });

    it("generates variance analysis with expected vs actual-ready factors", () => {
      const execution = buildExecutionGuidance("delivering_a_document");
      const modelBuilder = createCompletionOutcomeModelBuilder();
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.deliver.document_secure");
      const plan = builder.build({ scenarioId: "delivering_a_document" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;
      const model = modelBuilder.build({ plan, contract, execution });

      const analyzer = createVarianceAnalyzer();
      const variance = analyzer.build({ planId: plan.planId, completionModel: model, execution });
      assert.equal(variance.expectedCompletionPercent, 100);
      assert.ok(variance.factors.length >= 4);
      assert.ok(["under", "on_target", "over"].includes(variance.varianceDirection));
    });

    it("generates outcome confidence from execution and quality inputs", () => {
      const execution = buildExecutionGuidance("fixing_small_home_issue");
      const confidenceBuilder = createOutcomeConfidenceBuilder();
      const confidence = confidenceBuilder.build({
        execution,
        qualityAssessment: {
          assessmentId: "q1",
          level: "strong",
          score: 75,
          dimensions: [],
          summary: "test",
        },
        expectedOutcomeCount: 6,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.ok(confidence.score >= 40);
      assert.equal(confidence.executionConfidenceScore, execution.confidence.score);
    });

    it("validates outcome evaluations for all scenarios", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const validator = createOutcomeIntelligenceValidator();

      for (const scenarioId of OUTCOME_SCENARIO_IDS) {
        const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
          scenario_id: scenarioId,
        }).evaluation;
        assert.equal(evaluation.readOnly, true);
        assert.ok(evaluation.executionGuidanceId.startsWith("execution-"));
        assert.ok(evaluation.expectedOutcomes.length >= 1);
        assert.ok(evaluation.explanation.summary.length > 0);

        const report = validator.validateEvaluation(evaluation);
        assert.equal(report.valid, true, `invalid outcome for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns outcome intelligence home for authenticated users", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const home = outcomeIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.outcome_chain.includes("execution_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      assert.throws(
        () => outcomeIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic evaluations for the same scenario", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const first = outcomeIntelligenceEngine.getCompletion(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = outcomeIntelligenceEngine.getCompletion(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(
        first.completion_outcome_model,
        second.completion_outcome_model
      );
    });

    it("links outcome evaluation to execution guidance", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).evaluation;
      assert.match(evaluation.executionGuidanceId, /^execution-/);
      assert.match(evaluation.contractRecommendationId, /^contract-/);
    });

    it("includes lessons learned and future optimizations in explanation", () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const explanation = outcomeIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.ok(explanation.lessons_learned.length >= 1);
      assert.ok(explanation.future_optimizations.length >= 1);
      assert.match(explanation.explanation.summary, /outcome/i);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C7", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createOutcomeIntelligenceEngineModule/);
      assert.match(indexSource, /outcomeIntelligenceEngine/);
      assert.match(serverSource, /registerOutcomeIntelligenceRoutes/);
      assert.match(serverSource, /outcomeIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c7/);
      assert.match(packageSource, /test:ch4-c7-outcome-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers outcome intelligence routes behind auth middleware", async () => {
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerOutcomeIntelligenceRoutes(app, outcomeIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/outcome-intelligence" });
      assert.equal(home.statusCode, 200);

      const evaluation = await app.inject({
        method: "GET",
        url: "/outcome-intelligence/evaluation?scenario_id=moving_a_room",
      });
      assert.equal(evaluation.statusCode, 200);
      const evalBody = evaluation.json() as {
        evaluation: { readOnly: boolean; expectedOutcomes: unknown[]; goal: string };
      };
      assert.equal(evalBody.evaluation.readOnly, true);
      assert.ok(evalBody.evaluation.expectedOutcomes.length >= 1);
      assert.match(evalBody.evaluation.goal, /Move/i);

      const expected = await app.inject({
        method: "GET",
        url: "/outcome-intelligence/expected?scenario_id=cleaning_an_apartment",
      });
      assert.equal(expected.statusCode, 200);

      const completion = await app.inject({
        method: "GET",
        url: "/outcome-intelligence/completion?scenario_id=fixing_small_home_issue",
      });
      assert.equal(completion.statusCode, 200);

      const variance = await app.inject({
        method: "GET",
        url: "/outcome-intelligence/variance?scenario_id=delivering_a_document",
      });
      assert.equal(variance.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/outcome-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, OUTCOME_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/outcome-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
