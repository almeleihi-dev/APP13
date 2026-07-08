import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiExecutiveAdvisoryExperienceRoutes } from "../src/api/routes/ai-executive-advisory-experience.js";
import {
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_FIXED_TIMESTAMP,
  EXECUTIVE_ADVISORY_SCENARIO_IDS,
  EXECUTIVE_ADVISORY_SCENARIO_TO_CANONICAL,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiExecutiveAdvisoryExperienceModule,
  createAdvisoryContextBuilder,
  createAdvisoryRecommendationsBuilder,
  createAiExecutiveAdvisoryExperienceValidator,
} from "../src/ai-executive-advisory-experience/module.js";
import { createAiPredictiveForecastExperienceModule } from "../src/ai-predictive-forecast-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x17",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x17-user-session",
};

describe("CH5-X17 AI Executive Advisory Experience", () => {
  describe("domain (unit)", () => {
    it("provides executive advisory scenarios aligned with X16 predictive forecast", () => {
      assert.equal(EXECUTIVE_ADVISORY_SCENARIO_IDS.length, 5);
      for (const scenarioId of EXECUTIVE_ADVISORY_SCENARIO_IDS) {
        assert.ok(
          EXECUTIVE_ADVISORY_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN.length, 39);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X16");
      assert.ok(
        AI_EXECUTIVE_ADVISORY_EXPERIENCE_CHAIN.includes("ai_executive_advisory_experience")
      );
    });

    it("builds advisory context from predictive forecast output deterministically", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const forecast = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createAdvisoryContextBuilder();

      const first = builder.build(forecast);
      const second = builder.build(forecast);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^advisory-context-predictive-forecast-/);
    });

    it("generates advisory recommendations from predictive forecast output deterministically", () => {
      const { aiPredictiveForecastExperience } = createAiPredictiveForecastExperienceModule();
      const forecast = aiPredictiveForecastExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const recommendations = createAdvisoryRecommendationsBuilder().build(forecast);
      assert.equal(recommendations.recommendations.length, 4);
      assert.ok(recommendations.summary.includes("advisory recommendations"));
    });

    it("generates advisory confidence from predictive forecast output", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const output = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.advisoryConfidence.level));
      assert.ok(output.advisoryConfidence.score >= 40);
    });

    it("validates executive advisory outputs for all scenarios", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const validator = createAiExecutiveAdvisoryExperienceValidator();

      for (const scenarioId of EXECUTIVE_ADVISORY_SCENARIO_IDS) {
        const output = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.predictiveForecastOutputId.startsWith("predictive-forecast-"));
        assert.equal(output.advisoryRecommendations.recommendations.length, 4);
        assert.equal(output.priorityActions.actions.length, 3);
        assert.equal(output.actionPlan.items.length, 4);
        assert.equal(output.riskAdvisory.items.length, 3);
        assert.equal(output.opportunityAdvisory.opportunities.length, 3);
        assert.ok(output.advisoryExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid executive advisory for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Executive Advisory Experience home for authenticated users", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const home = aiExecutiveAdvisoryExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X16");
      assert.ok(home.executive_advisory_chain.includes("ai_executive_advisory_experience"));
      assert.ok(home.executive_advisory_views.includes("Advisory Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      assert.throws(
        () => aiExecutiveAdvisoryExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic executive advisory outputs for the same scenario", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const first = aiExecutiveAdvisoryExperience.getRecommendations(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiExecutiveAdvisoryExperience.getRecommendations(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links executive advisory output to AI Predictive Forecast Experience", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const output = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.predictiveForecastOutputId,
        /^predictive-forecast-strategic-intelligence-/
      );
      assert.match(
        output.strategicIntelligenceOutputId,
        /^strategic-intelligence-decision-intelligence-/
      );
      assert.match(output.outputId, /^executive-advisory-predictive-forecast-/);
    });

    it("includes human-readable executive advisory explanation", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const explanation = aiExecutiveAdvisoryExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /executive advisory|recommendations|action items/i
      );
      assert.ok(explanation.explanation.briefingSummary.length > 0);
      assert.ok(explanation.advisory_confidence.score >= 40);
    });

    it("delegates upstream only through AI Predictive Forecast Experience", () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const output = aiExecutiveAdvisoryExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationExecutiveAdvisory.soleUpstream,
        "CH5-X16 AI Predictive Forecast Experience"
      );
      assert.equal(output.delegationExecutiveAdvisory.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X17", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiExecutiveAdvisoryExperienceModule/);
      assert.match(indexSource, /aiExecutiveAdvisoryExperience/);
      assert.match(serverSource, /registerAiExecutiveAdvisoryExperienceRoutes/);
      assert.match(serverSource, /aiExecutiveAdvisoryExperience/);
      assert.match(packageSource, /verify:ch5-x17/);
      assert.match(packageSource, /test:ch5-x17-ai-executive-advisory-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Executive Advisory Experience routes behind auth middleware", async () => {
      const { aiExecutiveAdvisoryExperience } = createAiExecutiveAdvisoryExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiExecutiveAdvisoryExperienceRoutes(app, aiExecutiveAdvisoryExperience);

      const home = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/advisory-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const briefing = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/executive-briefing?scenario_id=cleaning_an_apartment",
      });
      assert.equal(briefing.statusCode, 200);

      const recommendations = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/recommendations?scenario_id=fixing_small_home_issue",
      });
      assert.equal(recommendations.statusCode, 200);
      const recBody = recommendations.json() as { view: { recommendations: unknown[] } };
      assert.equal(recBody.view.recommendations.length, 4);

      const actionPlan = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/action-plan?scenario_id=moving_a_room",
      });
      assert.equal(actionPlan.statusCode, 200);
      const planBody = actionPlan.json() as { view: { items: unknown[] } };
      assert.equal(planBody.view.items.length, 4);

      const priority = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/priority-actions?scenario_id=moving_a_room",
      });
      assert.equal(priority.statusCode, 200);
      const priorityBody = priority.json() as { view: { actions: unknown[] } };
      assert.equal(priorityBody.view.actions.length, 3);

      const risk = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/risk-advisory?scenario_id=moving_a_room",
      });
      assert.equal(risk.statusCode, 200);
      const riskBody = risk.json() as { view: { items: unknown[] } };
      assert.equal(riskBody.view.items.length, 3);

      const opportunity = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/opportunity-advisory?scenario_id=moving_a_room",
      });
      assert.equal(opportunity.statusCode, 200);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; actionPlanCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_EXECUTIVE_ADVISORY_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.actionPlanCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-executive-advisory-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
