import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiProgressIntelligenceExperienceRoutes } from "../src/api/routes/ai-progress-intelligence-experience.js";
import {
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  PROGRESS_INTELLIGENCE_SCENARIO_IDS,
  PROGRESS_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiProgressIntelligenceExperienceModule,
  createProgressContextBuilder,
  createProgressOverviewBuilder,
  createAiProgressIntelligenceExperienceValidator,
} from "../src/ai-progress-intelligence-experience/module.js";
import { createAiExecutionCompanionExperienceModule } from "../src/ai-execution-companion-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x7",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x7-user-session",
};

describe("CH5-X7 AI Progress Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides progress intelligence scenarios aligned with X6 execution companion", () => {
      assert.equal(PROGRESS_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of PROGRESS_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          PROGRESS_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN.length, 29);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X6");
      assert.ok(AI_PROGRESS_INTELLIGENCE_EXPERIENCE_CHAIN.includes("ai_progress_intelligence_experience"));
    });

    it("builds progress context from execution companion output deterministically", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const companion = aiExecutionCompanionExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createProgressContextBuilder();

      const first = builder.build(companion);
      const second = builder.build(companion);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^progress-context-execution-companion-/);
    });

    it("generates progress overview from execution companion output deterministically", () => {
      const { aiExecutionCompanionExperience } = createAiExecutionCompanionExperienceModule();
      const companion = aiExecutionCompanionExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const overview = createProgressOverviewBuilder().build(companion);
      assert.equal(overview.totalSteps, 4);
      assert.equal(overview.percentComplete, 0);
      assert.equal(overview.readOnly, true);
      assert.ok(overview.summary.includes("progress overview"));
    });

    it("generates progress intelligence confidence from execution companion output", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const output = aiProgressIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.progressIntelligenceConfidence.level));
      assert.ok(output.progressIntelligenceConfidence.score >= 40);
    });

    it("validates progress intelligence outputs for all scenarios", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const validator = createAiProgressIntelligenceExperienceValidator();

      for (const scenarioId of PROGRESS_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiProgressIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.executionCompanionOutputId.startsWith("execution-companion-"));
        assert.equal(output.remainingActivities.activities.length, 4);
        assert.equal(output.progressMetrics.metrics.length, 4);
        assert.equal(output.riskIndicators.indicators.length, 3);
        assert.ok(output.progressOverview.currentStepTitle.length > 0);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid progress intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Progress Intelligence Experience home for authenticated users", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const home = aiProgressIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X6");
      assert.ok(home.progress_intelligence_chain.includes("ai_progress_intelligence_experience"));
      assert.ok(home.progress_intelligence_views.includes("Progress Overview"));
    });

    it("rejects unauthenticated access", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      assert.throws(
        () => aiProgressIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic progress intelligence outputs for the same scenario", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const first = aiProgressIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiProgressIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.progress_context, second.progress_context);
    });

    it("links progress intelligence output to AI Execution Companion Experience", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const output = aiProgressIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.executionCompanionOutputId, /^execution-companion-action-planning-/);
      assert.match(output.actionPlanningOutputId, /^action-planning-decision-support-/);
      assert.match(output.outputId, /^progress-intelligence-execution-companion-/);
    });

    it("includes human-readable progress intelligence explanation", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const explanation = aiProgressIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /progress intelligence|steps|confidence/i);
      assert.ok(explanation.explanation.overviewSummary.length > 0);
      assert.ok(explanation.progress_intelligence_confidence.score >= 40);
    });

    it("delegates upstream only through AI Execution Companion Experience", () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const delegation = aiProgressIntelligenceExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X6 AI Execution Companion Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X7", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiProgressIntelligenceExperienceModule/);
      assert.match(indexSource, /aiProgressIntelligenceExperience/);
      assert.match(serverSource, /registerAiProgressIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiProgressIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x7/);
      assert.match(packageSource, /test:ch5-x7-ai-progress-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Progress Intelligence Experience routes behind auth middleware", async () => {
      const { aiProgressIntelligenceExperience } = createAiProgressIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiProgressIntelligenceExperienceRoutes(app, aiProgressIntelligenceExperience);

      const home = await app.inject({ method: "GET", url: "/ai-progress-intelligence-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        progress_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.progress_context.experienceMode, "read_only");
      assert.match(
        contextBody.progress_context.contextId,
        /^progress-context-execution-companion-/
      );

      const overview = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/overview?scenario_id=cleaning_an_apartment",
      });
      assert.equal(overview.statusCode, 200);
      const overviewBody = overview.json() as { view: { totalSteps: number; percentComplete: number } };
      assert.equal(overviewBody.view.totalSteps, 4);
      assert.equal(overviewBody.view.percentComplete, 0);

      const completed = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/completed?scenario_id=fixing_small_home_issue",
      });
      assert.equal(completed.statusCode, 200);
      const completedBody = completed.json() as { view: { activities: unknown[] } };
      assert.equal(completedBody.view.activities.length, 0);

      const remaining = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/remaining?scenario_id=moving_a_room",
      });
      assert.equal(remaining.statusCode, 200);
      const remainingBody = remaining.json() as { view: { activities: unknown[] } };
      assert.equal(remainingBody.view.activities.length, 4);

      const metrics = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/metrics?scenario_id=moving_a_room",
      });
      assert.equal(metrics.statusCode, 200);

      const timeline = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/timeline?scenario_id=moving_a_room",
      });
      assert.equal(timeline.statusCode, 200);

      const risks = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/risks?scenario_id=moving_a_room",
      });
      assert.equal(risks.statusCode, 200);
      const risksBody = risks.json() as { view: { indicators: unknown[] } };
      assert.equal(risksBody.view.indicators.length, 3);

      const nextActions = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/next-actions?scenario_id=moving_a_room",
      });
      assert.equal(nextActions.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; totalSteps: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_PROGRESS_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.totalSteps, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-progress-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
