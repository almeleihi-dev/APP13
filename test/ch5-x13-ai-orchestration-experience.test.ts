import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiOrchestrationExperienceRoutes } from "../src/api/routes/ai-orchestration-experience.js";
import {
  AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
  AI_ORCHESTRATION_EXPERIENCE_FIXED_TIMESTAMP,
  ORCHESTRATION_SCENARIO_IDS,
  ORCHESTRATION_SCENARIO_TO_CANONICAL,
  AI_ORCHESTRATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiOrchestrationExperienceModule,
  createOrchestrationContextBuilder,
  createIntelligencePipelineBuilder,
  createAiOrchestrationExperienceValidator,
} from "../src/ai-orchestration-experience/module.js";
import { createAiExecutiveIntelligenceExperienceModule } from "../src/ai-executive-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x13",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x13-user-session",
};

describe("CH5-X13 AI Orchestration Experience", () => {
  describe("domain (unit)", () => {
    it("provides orchestration scenarios aligned with X12 executive intelligence", () => {
      assert.equal(ORCHESTRATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of ORCHESTRATION_SCENARIO_IDS) {
        assert.ok(
          ORCHESTRATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_ORCHESTRATION_EXPERIENCE_CHAIN.length, 35);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X12");
      assert.ok(AI_ORCHESTRATION_EXPERIENCE_CHAIN.includes("ai_orchestration_experience"));
    });

    it("builds orchestration context from executive intelligence output deterministically", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const executive = aiExecutiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createOrchestrationContextBuilder();

      const first = builder.build(executive);
      const second = builder.build(executive);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^orchestration-context-executive-intelligence-/);
    });

    it("generates intelligence pipeline from executive intelligence output deterministically", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const executive = aiExecutiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const pipeline = createIntelligencePipelineBuilder().build(executive);
      assert.equal(pipeline.stages.length, 12);
      assert.ok(pipeline.summary.includes("pipeline stages"));
    });

    it("generates orchestration confidence from executive intelligence output", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const output = aiOrchestrationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.orchestrationConfidence.level));
      assert.ok(output.orchestrationConfidence.score >= 40);
    });

    it("validates orchestration outputs for all scenarios", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const validator = createAiOrchestrationExperienceValidator();

      for (const scenarioId of ORCHESTRATION_SCENARIO_IDS) {
        const output = aiOrchestrationExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.executiveIntelligenceOutputId.startsWith("executive-intelligence-"));
        assert.equal(output.intelligencePipeline.stages.length, 12);
        assert.equal(output.moduleCoordination.modules.length, 7);
        assert.equal(output.dependencyGraph.nodes.length, 12);
        assert.equal(output.executionFlow.steps.length, 4);
        assert.equal(output.synchronizationStatus.items.length, 3);
        assert.ok(output.orchestrationExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid orchestration for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Orchestration Experience home for authenticated users", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const home = aiOrchestrationExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X12");
      assert.ok(home.orchestration_chain.includes("ai_orchestration_experience"));
      assert.ok(home.orchestration_views.includes("Orchestration Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      assert.throws(
        () => aiOrchestrationExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic orchestration outputs for the same scenario", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const first = aiOrchestrationExperience.getIntelligencePipeline(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiOrchestrationExperience.getIntelligencePipeline(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links orchestration output to AI Executive Intelligence Experience", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const output = aiOrchestrationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.executiveIntelligenceOutputId,
        /^executive-intelligence-predictive-intelligence-/
      );
      assert.match(
        output.predictiveIntelligenceOutputId,
        /^predictive-intelligence-recommendation-intelligence-/
      );
      assert.match(output.outputId, /^orchestration-executive-intelligence-/);
    });

    it("includes human-readable orchestration explanation", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const explanation = aiOrchestrationExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /orchestration|pipeline stages|health/i
      );
      assert.ok(explanation.explanation.pipelineSummary.length > 0);
      assert.ok(explanation.orchestration_confidence.score >= 40);
    });

    it("delegates upstream only through AI Executive Intelligence Experience", () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const delegation = aiOrchestrationExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X12 AI Executive Intelligence Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X13", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiOrchestrationExperienceModule/);
      assert.match(indexSource, /aiOrchestrationExperience/);
      assert.match(serverSource, /registerAiOrchestrationExperienceRoutes/);
      assert.match(serverSource, /aiOrchestrationExperience/);
      assert.match(packageSource, /verify:ch5-x13/);
      assert.match(packageSource, /test:ch5-x13-ai-orchestration-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Orchestration Experience routes behind auth middleware", async () => {
      const { aiOrchestrationExperience } = createAiOrchestrationExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiOrchestrationExperienceRoutes(app, aiOrchestrationExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience",
      });
      assert.equal(home.statusCode, 200);

      const pipeline = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/pipeline?scenario_id=moving_a_room",
      });
      assert.equal(pipeline.statusCode, 200);
      const pipelineBody = pipeline.json() as { view: { stages: unknown[] }; read_only: boolean };
      assert.equal(pipelineBody.read_only, true);
      assert.equal(pipelineBody.view.stages.length, 12);

      const coordination = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/coordination?scenario_id=cleaning_an_apartment",
      });
      assert.equal(coordination.statusCode, 200);
      const coordBody = coordination.json() as { view: { modules: unknown[] } };
      assert.equal(coordBody.view.modules.length, 7);

      const dependencies = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/dependencies?scenario_id=fixing_small_home_issue",
      });
      assert.equal(dependencies.statusCode, 200);
      const depBody = dependencies.json() as { view: { nodes: unknown[]; edges: unknown[] } };
      assert.equal(depBody.view.nodes.length, 12);
      assert.equal(depBody.view.edges.length, 11);

      const executionFlow = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/execution-flow?scenario_id=moving_a_room",
      });
      assert.equal(executionFlow.statusCode, 200);
      const flowBody = executionFlow.json() as { view: { steps: unknown[] } };
      assert.equal(flowBody.view.steps.length, 4);

      const synchronization = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/synchronization?scenario_id=moving_a_room",
      });
      assert.equal(synchronization.statusCode, 200);
      const syncBody = synchronization.json() as { view: { items: unknown[] } };
      assert.equal(syncBody.view.items.length, 3);

      const health = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/health?scenario_id=moving_a_room",
      });
      assert.equal(health.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; pipelineStageCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_ORCHESTRATION_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.pipelineStageCount, 12);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-orchestration-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
