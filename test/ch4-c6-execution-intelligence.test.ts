import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExecutionIntelligenceRoutes } from "../src/api/routes/execution-intelligence.js";
import {
  EXECUTION_INTELLIGENCE_SCHEMA_VERSION,
  EXECUTION_SCENARIO_IDS,
  EXECUTION_SCENARIO_TO_CANONICAL,
  createExecutionIntelligenceEngineModule,
  createExecutionRoadmapBuilder,
  createExecutionSequencingBuilder,
  createExecutionCheckpointBuilder,
  createExecutionConfidenceBuilder,
  createExecutionIntelligenceValidator,
} from "../src/execution-intelligence/module.js";
import { createContractIntelligenceEngineModule } from "../src/contract-intelligence/module.js";
import { createActionPlanBuilder } from "../src/action-planning/module.js";
import { getCanonicalActionById } from "../src/action-ontology/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c6",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c6-user-session",
};

describe("CH4-C6 execution intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides execution scenarios aligned with C1 through C5", () => {
      assert.equal(EXECUTION_SCENARIO_IDS.length, 5);
      for (const scenarioId of EXECUTION_SCENARIO_IDS) {
        assert.ok(EXECUTION_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds execution roadmap from plan stages deterministically", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.move.room_contents");
      const plan = builder.build({ scenarioId: "moving_a_room" }, canonical!);
      const roadmapBuilder = createExecutionRoadmapBuilder();

      const first = roadmapBuilder.build(plan);
      const second = roadmapBuilder.build(plan);
      assert.deepEqual(first.phases, second.phases);
      assert.equal(first.phases.length, plan.stages.length);
      assert.equal(first.totalMinHours, plan.timeline.minHours);
    });

    it("builds task sequencing with dependency links", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.clean.apartment_full");
      const plan = builder.build({ scenarioId: "cleaning_an_apartment" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;

      const sequencingBuilder = createExecutionSequencingBuilder();
      const { taskSequencing } = sequencingBuilder.build(plan, contract);
      assert.equal(taskSequencing.length, plan.tasks.length);
      assert.ok(taskSequencing.every((t) => t.sequenceOrder > 0));
    });

    it("generates verification, quality, and escrow checkpoints", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.deliver.document_secure");
      const plan = builder.build({ scenarioId: "delivering_a_document" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;

      const checkpointBuilder = createExecutionCheckpointBuilder();
      const checkpoints = checkpointBuilder.build(plan, contract);
      assert.ok(checkpoints.stageEvidence.length >= 1);
      assert.ok(checkpoints.qualityCheckpoints.length >= 1);
      assert.equal(checkpoints.escrowReleaseCheckpoints.length, contract.milestones.length);
    });

    it("generates execution confidence from contract and plan inputs", () => {
      const builder = createActionPlanBuilder();
      const canonical = getCanonicalActionById("act.maint.fix_minor_issue");
      const plan = builder.build({ scenarioId: "fixing_small_home_issue" }, canonical!);
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).recommendation;

      const confidenceBuilder = createExecutionConfidenceBuilder();
      const confidence = confidenceBuilder.build({ plan, contract, checkpointCount: 8 });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.ok(confidence.score >= 40);
      assert.equal(confidence.contractConfidenceScore, contract.confidence.score);
    });

    it("validates execution guidance for all scenarios", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const validator = createExecutionIntelligenceValidator();

      for (const scenarioId of EXECUTION_SCENARIO_IDS) {
        const roadmap = executionIntelligenceEngine.getRoadmap(USER_AUTH, { scenario_id: scenarioId });
        assert.equal(roadmap.read_only, true);
        assert.ok(roadmap.execution_roadmap.phases.length >= 1);

        const sequencing = executionIntelligenceEngine.getSequencing(USER_AUTH, { scenario_id: scenarioId });
        assert.ok(sequencing.task_sequencing.length >= 5);

        const acceptance = executionIntelligenceEngine.getAcceptance(USER_AUTH, { scenario_id: scenarioId });
        assert.ok(acceptance.acceptance_workflow.length >= 2);
        assert.ok(acceptance.exception_handling.length >= 4);

        const explanation = executionIntelligenceEngine.getExplanation(USER_AUTH, { scenario_id: scenarioId });
        const guidance = {
          guidanceId: roadmap.guidance_id,
          contractRecommendationId: `contract-${scenarioId}`,
          planId: roadmap.guidance_id.replace("execution-", "plan-"),
          canonicalActionId: EXECUTION_SCENARIO_TO_CANONICAL[scenarioId],
          scenarioId,
          goal: roadmap.execution_roadmap.goal,
          executionRoadmap: roadmap.execution_roadmap,
          orderedMilestones: roadmap.ordered_milestones,
          taskSequencing: sequencing.task_sequencing,
          responsibilityMatrix: sequencing.responsibility_matrix,
          stageEvidence: executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId }).stage_evidence,
          verificationCheckpoints: executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId }).verification_checkpoints,
          qualityCheckpoints: executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId }).quality_checkpoints,
          escrowReleaseCheckpoints: executionIntelligenceEngine.getCheckpoints(USER_AUTH, { scenario_id: scenarioId }).escrow_release_checkpoints,
          acceptanceWorkflow: acceptance.acceptance_workflow,
          exceptionHandling: acceptance.exception_handling,
          recoveryRecommendations: acceptance.recovery_recommendations,
          progressModel: acceptance.progress_model,
          confidence: explanation.confidence,
          explanation: explanation.explanation,
          readOnly: true as const,
        };

        const report = validator.validateGuidance(guidance);
        assert.equal(report.valid, true, `invalid execution guidance for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns execution intelligence home for authenticated users", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const home = executionIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.execution_chain.includes("contract_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      assert.throws(
        () => executionIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic execution guidance for the same scenario", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const first = executionIntelligenceEngine.getSequencing(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = executionIntelligenceEngine.getSequencing(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.task_sequencing, second.task_sequencing);
    });

    it("links execution guidance to contract recommendation", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const { contractIntelligenceEngine } = createContractIntelligenceEngineModule();
      const contract = contractIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;
      const summary = executionIntelligenceEngine.getSummary(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.equal(summary.summary.schemaVersion, EXECUTION_INTELLIGENCE_SCHEMA_VERSION);
      assert.ok(summary.summary.checkpointCount >= 1);
      assert.equal(contract.recommendationId.startsWith("contract-"), true);
    });

    it("includes human-readable execution explanation", () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const explanation = executionIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /execution/i);
      assert.ok(explanation.explanation.sequencingRationale.length > 0);
      assert.ok(explanation.explanation.exceptionSummary.length > 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C6", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createExecutionIntelligenceEngineModule/);
      assert.match(indexSource, /executionIntelligenceEngine/);
      assert.match(serverSource, /registerExecutionIntelligenceRoutes/);
      assert.match(serverSource, /executionIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c6/);
      assert.match(packageSource, /test:ch4-c6-execution-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers execution intelligence routes behind auth middleware", async () => {
      const { executionIntelligenceEngine } = createExecutionIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExecutionIntelligenceRoutes(app, executionIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/execution-intelligence" });
      assert.equal(home.statusCode, 200);

      const roadmap = await app.inject({
        method: "GET",
        url: "/execution-intelligence/roadmap?scenario_id=moving_a_room",
      });
      assert.equal(roadmap.statusCode, 200);
      const roadmapBody = roadmap.json() as {
        execution_roadmap: { phases: unknown[]; goal: string };
      };
      assert.ok(roadmapBody.execution_roadmap.phases.length >= 1);
      assert.match(roadmapBody.execution_roadmap.goal, /Move/i);

      const sequencing = await app.inject({
        method: "GET",
        url: "/execution-intelligence/sequencing?scenario_id=cleaning_an_apartment",
      });
      assert.equal(sequencing.statusCode, 200);

      const checkpoints = await app.inject({
        method: "GET",
        url: "/execution-intelligence/checkpoints?scenario_id=fixing_small_home_issue",
      });
      assert.equal(checkpoints.statusCode, 200);

      const acceptance = await app.inject({
        method: "GET",
        url: "/execution-intelligence/acceptance?scenario_id=delivering_a_document",
      });
      assert.equal(acceptance.statusCode, 200);

      const validate = await app.inject({ method: "GET", url: "/execution-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
