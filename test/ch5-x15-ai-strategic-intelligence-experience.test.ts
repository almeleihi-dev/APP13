import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiStrategicIntelligenceExperienceRoutes } from "../src/api/routes/ai-strategic-intelligence-experience.js";
import {
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  STRATEGIC_INTELLIGENCE_SCENARIO_IDS,
  STRATEGIC_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiStrategicIntelligenceExperienceModule,
  createStrategicContextBuilder,
  createStrategicGoalsBuilder,
  createAiStrategicIntelligenceExperienceValidator,
} from "../src/ai-strategic-intelligence-experience/module.js";
import { createAiDecisionIntelligenceExperienceModule } from "../src/ai-decision-intelligence-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x15",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x15-user-session",
};

describe("CH5-X15 AI Strategic Intelligence Experience", () => {
  describe("domain (unit)", () => {
    it("provides strategic intelligence scenarios aligned with X14 decision intelligence", () => {
      assert.equal(STRATEGIC_INTELLIGENCE_SCENARIO_IDS.length, 5);
      for (const scenarioId of STRATEGIC_INTELLIGENCE_SCENARIO_IDS) {
        assert.ok(
          STRATEGIC_INTELLIGENCE_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN.length, 37);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X14");
      assert.ok(
        AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_CHAIN.includes("ai_strategic_intelligence_experience")
      );
    });

    it("builds strategic context from decision intelligence output deterministically", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const decision = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createStrategicContextBuilder();

      const first = builder.build(decision);
      const second = builder.build(decision);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^strategic-context-decision-intelligence-/);
    });

    it("generates strategic goals from decision intelligence output deterministically", () => {
      const { aiDecisionIntelligenceExperience } =
        createAiDecisionIntelligenceExperienceModule();
      const decision = aiDecisionIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const goals = createStrategicGoalsBuilder().build(decision);
      assert.equal(goals.goals.length, 3);
      assert.ok(goals.summary.includes("strategic goals"));
    });

    it("generates strategic confidence from decision intelligence output", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const output = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.strategicConfidence.level));
      assert.ok(output.strategicConfidence.score >= 40);
    });

    it("validates strategic intelligence outputs for all scenarios", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const validator = createAiStrategicIntelligenceExperienceValidator();

      for (const scenarioId of STRATEGIC_INTELLIGENCE_SCENARIO_IDS) {
        const output = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.decisionIntelligenceOutputId.startsWith("decision-intelligence-"));
        assert.equal(output.strategicGoals.goals.length, 3);
        assert.equal(output.strategicScenarios.scenarios.length, 4);
        assert.equal(output.strategicPriorities.priorities.length, 3);
        assert.equal(output.executionRoadmap.steps.length, 4);
        assert.equal(output.riskLandscape.items.length, 3);
        assert.equal(output.opportunityLandscape.opportunities.length, 3);
        assert.ok(output.strategicExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid strategic intelligence for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Strategic Intelligence Experience home for authenticated users", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const home = aiStrategicIntelligenceExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X14");
      assert.ok(
        home.strategic_intelligence_chain.includes("ai_strategic_intelligence_experience")
      );
      assert.ok(home.strategic_intelligence_views.includes("Strategy Dashboard"));
    });

    it("rejects unauthenticated access", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      assert.throws(
        () => aiStrategicIntelligenceExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic strategic intelligence outputs for the same scenario", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const first = aiStrategicIntelligenceExperience.getStrategicGoals(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiStrategicIntelligenceExperience.getStrategicGoals(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.view, second.view);
    });

    it("links strategic intelligence output to AI Decision Intelligence Experience", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const output = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(
        output.decisionIntelligenceOutputId,
        /^decision-intelligence-orchestration-/
      );
      assert.match(
        output.orchestrationOutputId,
        /^orchestration-executive-intelligence-/
      );
      assert.match(output.outputId, /^strategic-intelligence-decision-intelligence-/);
    });

    it("includes human-readable strategic intelligence explanation", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const explanation = aiStrategicIntelligenceExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(
        explanation.explanation.summary,
        /strategic intelligence|goals|roadmap/i
      );
      assert.ok(explanation.explanation.goalsSummary.length > 0);
      assert.ok(explanation.strategic_confidence.score >= 40);
    });

    it("delegates upstream only through AI Decision Intelligence Experience", () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const output = aiStrategicIntelligenceExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(
        output.delegationStrategicIntelligence.soleUpstream,
        "CH5-X14 AI Decision Intelligence Experience"
      );
      assert.equal(output.delegationStrategicIntelligence.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X15", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiStrategicIntelligenceExperienceModule/);
      assert.match(indexSource, /aiStrategicIntelligenceExperience/);
      assert.match(serverSource, /registerAiStrategicIntelligenceExperienceRoutes/);
      assert.match(serverSource, /aiStrategicIntelligenceExperience/);
      assert.match(packageSource, /verify:ch5-x15/);
      assert.match(packageSource, /test:ch5-x15-ai-strategic-intelligence-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Strategic Intelligence Experience routes behind auth middleware", async () => {
      const { aiStrategicIntelligenceExperience } =
        createAiStrategicIntelligenceExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiStrategicIntelligenceExperienceRoutes(
        app,
        aiStrategicIntelligenceExperience
      );

      const home = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience",
      });
      assert.equal(home.statusCode, 200);

      const dashboard = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/strategy-dashboard?scenario_id=moving_a_room",
      });
      assert.equal(dashboard.statusCode, 200);
      const dashBody = dashboard.json() as { view: { readOnly: boolean }; read_only: boolean };
      assert.equal(dashBody.read_only, true);
      assert.equal(dashBody.view.readOnly, true);

      const goals = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/strategic-goals?scenario_id=cleaning_an_apartment",
      });
      assert.equal(goals.statusCode, 200);
      const goalsBody = goals.json() as { view: { goals: unknown[] } };
      assert.equal(goalsBody.view.goals.length, 3);

      const scenarios = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/strategic-scenarios?scenario_id=fixing_small_home_issue",
      });
      assert.equal(scenarios.statusCode, 200);
      const scenariosBody = scenarios.json() as { view: { scenarios: unknown[] } };
      assert.equal(scenariosBody.view.scenarios.length, 4);

      const priorities = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/priorities?scenario_id=moving_a_room",
      });
      assert.equal(priorities.statusCode, 200);
      const priBody = priorities.json() as { view: { priorities: unknown[] } };
      assert.equal(priBody.view.priorities.length, 3);

      const risk = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/risk-landscape?scenario_id=moving_a_room",
      });
      assert.equal(risk.statusCode, 200);
      const riskBody = risk.json() as { view: { items: unknown[] } };
      assert.equal(riskBody.view.items.length, 3);

      const opportunity = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/opportunity-landscape?scenario_id=moving_a_room",
      });
      assert.equal(opportunity.statusCode, 200);

      const roadmap = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/execution-roadmap?scenario_id=moving_a_room",
      });
      assert.equal(roadmap.statusCode, 200);
      const roadmapBody = roadmap.json() as { view: { steps: unknown[] } };
      assert.equal(roadmapBody.view.steps.length, 4);

      const confidence = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/confidence?scenario_id=moving_a_room",
      });
      assert.equal(confidence.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; roadmapStepCount: number };
      };
      assert.equal(
        summaryBody.summary.schemaVersion,
        AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION
      );
      assert.equal(
        summaryBody.summary.generatedAt,
        AI_STRATEGIC_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP
      );
      assert.equal(summaryBody.summary.roadmapStepCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-strategic-intelligence-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
