import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiExecutionCompanionExperienceRoutes } from "../src/api/routes/ai-execution-companion-experience.js";
import {
  AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP,
  EXECUTION_COMPANION_SCENARIO_IDS,
  EXECUTION_COMPANION_SCENARIO_TO_CANONICAL,
  AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiExecutionCompanionExperienceModule,
  createExecutionContextBuilder,
  createCurrentStepBuilder,
  createAiExecutionCompanionExperienceValidator,
} from "../src/ai-execution-companion-experience/module.js";
import { createAiActionPlanningExperienceModule } from "../src/ai-action-planning-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x6",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x6-user-session",
};

describe("CH5-X6 AI Execution Companion Experience", () => {
  describe("domain (unit)", () => {
    it("provides execution companion scenarios aligned with X5 action planning", () => {
      assert.equal(EXECUTION_COMPANION_SCENARIO_IDS.length, 5);
      for (const scenarioId of EXECUTION_COMPANION_SCENARIO_IDS) {
        assert.ok(
          EXECUTION_COMPANION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN.length, 28);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X5");
      assert.ok(AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN.includes("ai_execution_companion_experience"));
    });

    it("builds execution context from action planning output deterministically", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const actionPlanning = aiActionPlanningExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createExecutionContextBuilder();

      const first = builder.build(actionPlanning);
      const second = builder.build(actionPlanning);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^execution-context-action-planning-/);
    });

    it("generates current step from action planning output deterministically", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const actionPlanning = aiActionPlanningExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const step = createCurrentStepBuilder().build(actionPlanning);
      assert.equal(step.sequence, 1);
      assert.equal(step.readOnly, true);
      assert.ok(step.summary.includes("step 1"));
    });

    it("generates execution companion confidence from action planning output", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const output = aiExecutionCompanionExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.executionCompanionConfidence.level));
      assert.ok(output.executionCompanionConfidence.score >= 40);
    });

    it("validates execution companion outputs for all scenarios", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const validator = createAiExecutionCompanionExperienceValidator();

      for (const scenarioId of EXECUTION_COMPANION_SCENARIO_IDS) {
        const output = aiExecutionCompanionExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.actionPlanningOutputId.startsWith("action-planning-"));
        assert.equal(output.nextActions.actions.length, 4);
        assert.equal(output.executionProgress.totalSteps, 4);
        assert.ok(output.currentStep.title.length > 0);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid execution companion for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Execution Companion Experience home for authenticated users", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const home = aiExecutionCompanionExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X5");
      assert.ok(home.execution_companion_chain.includes("ai_execution_companion_experience"));
      assert.ok(home.execution_companion_views.includes("Current Step"));
    });

    it("rejects unauthenticated access", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      assert.throws(
        () => aiExecutionCompanionExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic execution companion outputs for the same scenario", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const first = aiExecutionCompanionExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiExecutionCompanionExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.execution_context, second.execution_context);
    });

    it("links execution companion output to AI Action Planning Experience", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const output = aiExecutionCompanionExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.actionPlanningOutputId, /^action-planning-decision-support-/);
      assert.match(output.decisionSupportOutputId, /^decision-support-guidance-/);
      assert.match(output.outputId, /^execution-companion-action-planning-/);
    });

    it("includes human-readable execution companion explanation", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const explanation = aiExecutionCompanionExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /execution companion|steps|confidence/i);
      assert.ok(explanation.explanation.progressSummary.length > 0);
      assert.ok(explanation.execution_companion_confidence.score >= 40);
    });

    it("delegates upstream only through AI Action Planning Experience", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const delegation = aiExecutionCompanionExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X5 AI Action Planning Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X6", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiExecutionCompanionExperienceModule/);
      assert.match(indexSource, /aiExecutionCompanionExperience/);
      assert.match(serverSource, /registerAiExecutionCompanionExperienceRoutes/);
      assert.match(serverSource, /aiExecutionCompanionExperience/);
      assert.match(packageSource, /verify:ch5-x6/);
      assert.match(packageSource, /test:ch5-x6-ai-execution-companion-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Execution Companion Experience routes behind auth middleware", async () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiExecutionCompanionExperienceRoutes(app, aiExecutionCompanionExperience);

      const home = await app.inject({ method: "GET", url: "/ai-execution-companion-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        execution_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.execution_context.experienceMode, "read_only");
      assert.match(
        contextBody.execution_context.contextId,
        /^execution-context-action-planning-/
      );

      const currentStep = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/current-step?scenario_id=cleaning_an_apartment",
      });
      assert.equal(currentStep.statusCode, 200);
      const stepBody = currentStep.json() as { view: { sequence: number } };
      assert.equal(stepBody.view.sequence, 1);

      const progress = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/progress?scenario_id=fixing_small_home_issue",
      });
      assert.equal(progress.statusCode, 200);
      const progressBody = progress.json() as { view: { totalSteps: number; percentComplete: number } };
      assert.equal(progressBody.view.totalSteps, 4);
      assert.equal(progressBody.view.percentComplete, 0);

      const checklist = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/checklist?scenario_id=moving_a_room",
      });
      assert.equal(checklist.statusCode, 200);

      const nextActions = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/next-actions?scenario_id=moving_a_room",
      });
      assert.equal(nextActions.statusCode, 200);
      const nextBody = nextActions.json() as { view: { actions: unknown[] } };
      assert.equal(nextBody.view.actions.length, 4);

      const timeline = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/timeline?scenario_id=moving_a_room",
      });
      assert.equal(timeline.statusCode, 200);

      const forecast = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/forecast?scenario_id=moving_a_room",
      });
      assert.equal(forecast.statusCode, 200);

      const guidance = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/guidance?scenario_id=moving_a_room",
      });
      assert.equal(guidance.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; totalSteps: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.totalSteps, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-execution-companion-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
