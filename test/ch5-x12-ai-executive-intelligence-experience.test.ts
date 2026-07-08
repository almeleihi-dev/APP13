import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiExecutiveIntelligenceExperienceRoutes } from "../src/api/routes/ai-executive-intelligence-experience.js";
import {
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  EXECUTIVE_INTELLIGENCE_SCENARIO_IDS,
  EXECUTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiExecutiveIntelligenceExperienceModule,
  createExecutiveContextBuilder,
  createCriticalDecisionsBuilder,
  createAiExecutiveIntelligenceExperienceValidator,
} from "../src/ai-executive-intelligence-experience/module.js";
import { createAiPredictiveIntelligenceExperienceModule } from "../src/ai-predictive-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x12",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x12-user-session",
};

describe("CH5-X12 AI Executive Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides executive intelligence scenarios aligned with X11 predictive intelligence", () => {
      assert.equal(EXECUTIVE_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of EXECUTIVE_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          EXECUTIVE_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN.length, 34);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X11");
      assert.ok(
        AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_CHAIN.includes("ai_executive_intelligence_experience")
      );
    });

    it("builds executive context from predictive intelligence output deterministically", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const predictive = aiPredictiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createExecutiveContextBuilder();

      const first = builder.build(predictive);
      const second = builder.build(predictive);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^executive-context-predictive-intelligence-/);
    });

    it("generates critical decisions from predictive intelligence output deterministically", () => {
      const { aiPredictiveIntelligenceExperience } =
        createAiPredictiveIntelligenceExperienceModule();
      const predictive = aiPredictiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const decisions = createCriticalDecisionsBuilder().build(predictive);
      assert.equal(decisions.decisions.length, 4);
      assert.ok(decisions.summary.includes("critical decisions"));
    });

    it("generates executive confidence from predictive intelligence output", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const output = aiExecutiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.executiveConfidence.level));
      assert.ok(output.executiveConfidence.score >= 40);
    });

    it("validates executive intelligence outputs for all scenarios", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const validator = createAiExecutiveIntelligenceExperienceValidator();

      for (const scenarioId of EXECUTIVE_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiExecutiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.predictiveIntelligenceOutputId.startsWith("predictive-intelligence-"));
        assert.equal(output.strategicPriorities.priorities.length, 3);
        assert.equal(output.criticalDecisions.decisions.length, 4);
        assert.equal(output.executiveAlerts.alerts.length, 3);
        assert.ok(output.executiveDashboard.successProbabilityScore >= 40);
        assert.ok(output.executiveExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid executive intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Executive Intelligence Experience home for authenticated users", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const home = aiExecutiveIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X11");
      assert.ok(
        home.executive_intelligence_chain.includes("ai_executive_intelligence_experience")
      );
      assert.ok(home.executive_intelligence_views.includes("Executive Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      assert.throws(
        () => aiExecutiveIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic executive intelligence outputs for the same scenario", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const first = aiExecutiveIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiExecutiveIntelligenceExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.executive_context, second.executive_context);
    });

    it("links executive intelligence output to AI Predictive Intelligence Experience", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const output = aiExecutiveIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.predictiveIntelligenceOutputId,
        /^predictive-intelligence-recommendation-intelligence-/
      );
      assert.match(
        output.recommendationIntelligenceOutputId,
        /^recommendation-intelligence-insight-generation-/
      );
      assert.match(output.outputId, /^executive-intelligence-predictive-intelligence-/);
    });

    it("includes human-readable executive intelligence explanation", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const explanation = aiExecutiveIntelligenceExperience.getExecutiveExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /executive intelligence|strategic priorities|success probability/i
      );
      assert.ok(explanation.explanation.dashboardSummary.length > 0);
      assert.ok(explanation.executive_confidence.score >= 40);
    });

    it("delegates upstream only through AI Predictive Intelligence Experience", () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const delegation = aiExecutiveIntelligenceExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X11 AI Predictive Intelligence Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X12", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiExecutiveIntelligenceExperienceModule/);
      assert.match(indexSource, /aiExecutiveIntelligenceExperience/);
      assert.match(serverSource, /registerAiExecutiveIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiExecutiveIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x12/);
      assert.match(packageSource, /test:ch5-x12-ai-executive-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Executive Intelligence Experience routes behind auth middleware", async () => {
      const { aiExecutiveIntelligenceExperience } =
        createAiExecutiveIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiExecutiveIntelligenceExperienceRoutes(
        app,
        aiExecutiveIntelligenceExperience
      );

      const home = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience",
      });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        executive_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.executive_context.experienceMode, "read_only");
      assert.match(
        contextBody.executive_context.contextId,
        /^executive-context-predictive-intelligence-/
      );

      const executiveSummary = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/executive-summary?scenario_id=cleaning_an_apartment",
      });
      assert.equal(executiveSummary.statusCode, 200);
      const execSummaryBody = executiveSummary.json() as { view: { readOnly: boolean } };
      assert.equal(execSummaryBody.view.readOnly, true);

      const priorities = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/priorities?scenario_id=fixing_small_home_issue",
      });
      assert.equal(priorities.statusCode, 200);
      const prioritiesBody = priorities.json() as { view: { priorities: unknown[] } };
      assert.equal(prioritiesBody.view.priorities.length, 3);

      const decisions = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/decisions?scenario_id=moving_a_room",
      });
      assert.equal(decisions.statusCode, 200);
      const decisionsBody = decisions.json() as { view: { decisions: unknown[] } };
      assert.equal(decisionsBody.view.decisions.length, 4);

      const alerts = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/alerts?scenario_id=moving_a_room",
      });
      assert.equal(alerts.statusCode, 200);
      const alertsBody = alerts.json() as { view: { alerts: unknown[] } };
      assert.equal(alertsBody.view.alerts.length, 3);

      const opportunities = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/opportunities?scenario_id=moving_a_room",
      });
      assert.equal(opportunities.statusCode, 200);
      const oppBody = opportunities.json() as { view: { opportunities: unknown[] } };
      assert.equal(oppBody.view.opportunities.length, 3);

      const risks = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/risks?scenario_id=moving_a_room",
      });
      assert.equal(risks.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; decisionCount: number };
      };
      assert.equal(
        summaryBody.summary.schemaVersion,
        AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION
      );
      assert.equal(
        summaryBody.summary.generatedAt,
        AI_EXECUTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP
      );
      assert.equal(summaryBody.summary.decisionCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-executive-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
