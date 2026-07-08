import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAiInsightGenerationExperienceRoutes } from "../src/api/routes/ai-insight-generation-experience.js";
import {
  AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION,
  AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP,
  INSIGHT_GENERATION_SCENARIO_IDS,
  INSIGHT_GENERATION_SCENARIO_TO_CANONICAL,
  AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
  createAiInsightGenerationExperienceModule,
  createInsightContextBuilder,
  createGeneratedInsightsBuilder,
  createAiInsightGenerationExperienceValidator,
} from "../src/ai-insight-generation-experience/module.js";
import { createAiAdaptiveCoachingExperienceModule } from "../src/ai-adaptive-coaching-experience/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch5-x9",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch5-x9-user-session",
};

describe("CH5-X9 AI Insight Generation Experience", () => {
  describe("domain (unit)", () => {
    it("provides insight generation scenarios aligned with X8 adaptive coaching", () => {
      assert.equal(INSIGHT_GENERATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of INSIGHT_GENERATION_SCENARIO_IDS) {
        assert.ok(
          INSIGHT_GENERATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
      assert.equal(AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN.length, 31);
      assert.equal(UPSTREAM_MODULE_ID, "CH5-X8");
      assert.ok(AI_INSIGHT_GENERATION_EXPERIENCE_CHAIN.includes("ai_insight_generation_experience"));
    });

    it("builds insight context from adaptive coaching output deterministically", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const coaching = aiAdaptiveCoachingExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const builder = createInsightContextBuilder();

      const first = builder.build(coaching);
      const second = builder.build(coaching);
      assert.deepEqual(first, second);
      assert.equal(first.experienceMode, "read_only");
      assert.match(first.contextId, /^insight-context-adaptive-coaching-/);
    });

    it("generates insights from adaptive coaching output deterministically", () => {
      const { aiAdaptiveCoachingExperience } = createAiAdaptiveCoachingExperienceModule();
      const coaching = aiAdaptiveCoachingExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      const generated = createGeneratedInsightsBuilder().build(coaching);
      assert.equal(generated.insights.length, 4);
      assert.ok(generated.summary.includes("generated insights"));
    });

    it("generates insight generation confidence from adaptive coaching output", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const output = aiInsightGenerationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      assert.ok(["low", "medium", "high"].includes(output.insightGenerationConfidence.level));
      assert.ok(output.insightGenerationConfidence.score >= 40);
    });

    it("validates insight generation outputs for all scenarios", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const validator = createAiInsightGenerationExperienceValidator();

      for (const scenarioId of INSIGHT_GENERATION_SCENARIO_IDS) {
        const output = aiInsightGenerationExperience.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.adaptiveCoachingOutputId.startsWith("adaptive-coaching-"));
        assert.equal(output.generatedInsights.insights.length, 4);
        assert.equal(output.patternDetection.patterns.length, 4);
        assert.equal(output.strategicInsights.insights.length, 3);
        assert.ok(output.keyFindings.findings.length > 0);
        assert.ok(output.insightExplanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid insight generation for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns AI Insight Generation Experience home for authenticated users", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const home = aiInsightGenerationExperience.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.equal(home.upstream_module, "CH5-X8");
      assert.ok(home.insight_generation_chain.includes("ai_insight_generation_experience"));
      assert.ok(home.insight_generation_views.includes("Generated Insights"));
    });

    it("rejects unauthenticated access", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      assert.throws(
        () => aiInsightGenerationExperience.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic insight generation outputs for the same scenario", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const first = aiInsightGenerationExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = aiInsightGenerationExperience.getContext(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.insight_context, second.insight_context);
    });

    it("links insight generation output to AI Adaptive Coaching Experience", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const output = aiInsightGenerationExperience.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.adaptiveCoachingOutputId, /^adaptive-coaching-progress-intelligence-/);
      assert.match(output.progressIntelligenceOutputId, /^progress-intelligence-execution-companion-/);
      assert.match(output.outputId, /^insight-generation-adaptive-coaching-/);
    });

    it("includes human-readable insight generation explanation", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const explanation = aiInsightGenerationExperience.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /insight generation|insights|confidence/i);
      assert.ok(explanation.explanation.findingsSummary.length > 0);
      assert.ok(explanation.insight_generation_confidence.score >= 40);
    });

    it("delegates upstream only through AI Adaptive Coaching Experience", () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const delegation = aiInsightGenerationExperience.getDelegation(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(delegation.read_only, true);
      const view = delegation.view as { soleUpstream: string; noDuplicatedLogic: boolean };
      assert.equal(view.soleUpstream, "CH5-X8 AI Adaptive Coaching Experience");
      assert.equal(view.noDuplicatedLogic, true);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH5-X9", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createAiInsightGenerationExperienceModule/);
      assert.match(indexSource, /aiInsightGenerationExperience/);
      assert.match(serverSource, /registerAiInsightGenerationExperienceRoutes/);
      assert.match(serverSource, /aiInsightGenerationExperience/);
      assert.match(packageSource, /verify:ch5-x9/);
      assert.match(packageSource, /test:ch5-x9-ai-insight-generation-experience/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers AI Insight Generation Experience routes behind auth middleware", async () => {
      const { aiInsightGenerationExperience } = createAiInsightGenerationExperienceModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAiInsightGenerationExperienceRoutes(app, aiInsightGenerationExperience);

      const home = await app.inject({ method: "GET", url: "/ai-insight-generation-experience" });
      assert.equal(home.statusCode, 200);

      const context = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/context?scenario_id=moving_a_room",
      });
      assert.equal(context.statusCode, 200);
      const contextBody = context.json() as {
        insight_context: { contextId: string; experienceMode: string };
        read_only: boolean;
      };
      assert.equal(contextBody.read_only, true);
      assert.equal(contextBody.insight_context.experienceMode, "read_only");
      assert.match(contextBody.insight_context.contextId, /^insight-context-adaptive-coaching-/);

      const insights = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/insights?scenario_id=cleaning_an_apartment",
      });
      assert.equal(insights.statusCode, 200);
      const insightsBody = insights.json() as { view: { insights: unknown[] } };
      assert.equal(insightsBody.view.insights.length, 4);

      const patterns = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/patterns?scenario_id=fixing_small_home_issue",
      });
      assert.equal(patterns.statusCode, 200);
      const patternsBody = patterns.json() as { view: { patterns: unknown[] } };
      assert.equal(patternsBody.view.patterns.length, 4);

      const findings = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/findings?scenario_id=moving_a_room",
      });
      assert.equal(findings.statusCode, 200);

      const opportunities = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/opportunities?scenario_id=moving_a_room",
      });
      assert.equal(opportunities.statusCode, 200);
      const oppBody = opportunities.json() as { view: { opportunities: unknown[] } };
      assert.equal(oppBody.view.opportunities.length, 3);

      const risks = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/risks?scenario_id=moving_a_room",
      });
      assert.equal(risks.statusCode, 200);

      const strategic = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/strategic?scenario_id=moving_a_room",
      });
      assert.equal(strategic.statusCode, 200);
      const strategicBody = strategic.json() as { view: { insights: unknown[] } };
      assert.equal(strategicBody.view.insights.length, 3);

      const readiness = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/readiness?scenario_id=moving_a_room",
      });
      assert.equal(readiness.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as {
        summary: { schemaVersion: string; generatedAt: string; generatedInsightCount: number };
      };
      assert.equal(summaryBody.summary.schemaVersion, AI_INSIGHT_GENERATION_EXPERIENCE_SCHEMA_VERSION);
      assert.equal(summaryBody.summary.generatedAt, AI_INSIGHT_GENERATION_EXPERIENCE_FIXED_TIMESTAMP);
      assert.equal(summaryBody.summary.generatedInsightCount, 4);

      const validate = await app.inject({
        method: "GET",
        url: "/ai-insight-generation-experience/validate",
      });
      assert.equal(validate.statusCode, 200);
      const validation = validate.json() as { validation: { valid: boolean } };
      assert.equal(validation.validation.valid, true);

      await app.close();
    });
  });
});
