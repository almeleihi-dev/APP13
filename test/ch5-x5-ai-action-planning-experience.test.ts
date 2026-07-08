import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiActionPlanningExperienceRoutes } from "../src/api/routes/ai-action-planning-experience.js";
import {
  AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
  AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP,
  ACTION_PLANNING_SCENARIO_IDS,
  ACTION_PLANNING_SCENARIO_TO_CANONICAL,
  AI_ACTION_PLANNING_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiActionPlanningExperienceModule,
  createActionPlanningContextBuilder,
  createActionPlanBuilder,
  createAiActionPlanningExperienceValidator,
} from "../src/ai-action-planning-experience/module.js";
import { createAiDecisionSupportExperienceModule } from "../src/ai-decision-support-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x5",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x5-user-session",
};

describe("CH5-X5 AI Action Planning Experience", () => {
  describe("domain (unit)", () => {
    it("provides action planning scenarios aligned with X4 decision support", () => {
      assert.equal(ACTION_PLANNING_SCENARIO_IDS.length, 5);
      for (const scenarioId of ACTION_PLANNING_SCENARIO_IDS) {
        assert.ok(
          ACTION_PLANNING_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_ACTION_PLANNING_EXPERIENCE_CHAIN.length, 27);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X4");
      assert.ok(AI_ACTION_PLANNING_EXPERIENCE_CHAIN.includes("ai_action_planning_experience"));
    });

    it("builds action planning context from decision support output deterministically", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const decisionSupport = aiDecisionSupportExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createActionPlanningContextBuilder();

      const first = builder.build(decisionSupport);
      const second = builder.build(decisionSupport);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^planning-context-decision-support-/);
    });

    it("generates action plan from decision support output deterministically", () => {
      const { aiDecisionSupportExperience } = createAiDecisionSupportExperienceModule();
      const decisionSupport = aiDecisionSupportExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const plan = createActionPlanBuilder().build(decisionSupport);
      assert.equal(plan.taskCount, 4);
      assert.equal(plan.readOnly, true);
      assert.ok(plan.summary.includes("action plan"));
    });

    it("generates action planning confidence from decision support output", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const output = aiActionPlanningExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.actionPlanningConfidence.level));
      assert.ok(output.actionPlanningConfidence.score >= 40);
    });

    it("validates action planning outputs for all scenarios", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const validator = createAiActionPlanningExperienceValidator();

      for (const scenarioId of ACTION_PLANNING_SCENARIO_IDS) {
        const output = aiActionPlanningExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.decisionSupportOutputId.startsWith("decision-support-"));
        assert.equal(output.prioritizedTasks.tasks.length, 4);
        assert.equal(output.milestones.milestones.length, 3);
        assert.ok(output.actionPlan.recommendedAction.length > 0);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid action planning for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Action Planning Experience home for authenticated users", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const home = aiActionPlanningExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X4");
      assert.ok(home.action_planning_chain.includes("ai_action_planning_experience"));
      assert.ok(home.action_planning_views.includes("Action Plan"));
    });

    it("rejects unauthenticated access", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      assert.throws(
        () => aiActionPlanningExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic action planning outputs for the same scenario", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const first = aiActionPlanningExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiActionPlanningExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.action_planning_context, second.action_planning_context);
    });

    it("links action planning output to AI Decision Support Experience", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const output = aiActionPlanningExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.decisionSupportOutputId, /^decision-support-guidance-/);
      assert.match(output.guidanceOutputId, /^guidance-/);
      assert.match(output.outputId, /^action-planning-decision-support-/);
    });

    it("includes human-readable action planning explanation", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const explanation = aiActionPlanningExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /action planning|tasks|milestones/i);
      assert.ok(explanation.explanation.planSummary.length > 0);
      assert.ok(explanation.action_planning_confidence.score >= 40);
    });

    it("delegates upstream only through AI Decision Support Experience", () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const delegation = aiActionPlanningExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X4 AI Decision Support Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X5", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiActionPlanningExperienceModule/);
      assert.match(indexSource, /aiActionPlanningExperience/);
      assert.match(serverSource, /registerAiActionPlanningExperienceRoutes/);
      assert.match(serverSource, /aiActionPlanningExperience/);
      assert.match(packageSource, /verify:ch5-x5/);
      assert.match(packageSource, /test:ch5-x5-ai-action-planning-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Action Planning Experience routes behind auth middleware", async () => {
      const { aiActionPlanningExperience } = createAiActionPlanningExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiActionPlanningExperienceRoutes(app, aiActionPlanningExperience);

      const home = await app.inject({ method: "GET", url: "/ai-action-planning-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        action_planning_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.action_planning_context.experienceMode, "read_only");
      assert.match(contextBody.action_planning_context.contextId, /^planning-context-decision-support-/);

      const plan = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/plan?scenario_id=cleaning_an_apartment",
      });
      assert.equal(plan.statusCode, 200);
      const planBody = plan.json() as { view: { taskCount: number } };
      assert.equal(planBody.view.taskCount, 4);

      const tasks = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/tasks?scenario_id=fixing_small_home_issue",
      });
      assert.equal(tasks.statusCode, 200);
      const tasksBody = tasks.json() as { view: { tasks: unknown[] } };
      assert.equal(tasksBody.view.tasks.length, 4);

      const milestones = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/milestones?scenario_id=moving_a_room",
      });
      assert.equal(milestones.statusCode, 200);
      const milestonesBody = milestones.json() as { view: { milestones: unknown[] } };
      assert.equal(milestonesBody.view.milestones.length, 3);

      const timeline = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/timeline?scenario_id=moving_a_room",
      });
      assert.equal(timeline.statusCode, 200);

      const dependencies = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/dependencies?scenario_id=moving_a_room",
      });
      assert.equal(dependencies.statusCode, 200);

      const checklist = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/checklist?scenario_id=moving_a_room",
      });
      assert.equal(checklist.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; taskCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.taskCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-action-planning-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
