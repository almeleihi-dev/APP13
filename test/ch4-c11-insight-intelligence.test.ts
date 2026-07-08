import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerInsightIntelligenceRoutes } from "../src/api/routes/insight-intelligence.js";
import {
  INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
  INSIGHT_SCENARIO_IDS,
  INSIGHT_SCENARIO_TO_CANONICAL,
  createInsightIntelligenceEngineModule,
  createStrategicInsightsBuilder,
  createPatternRecognitionBuilder,
  createInsightConfidenceBuilder,
  createInsightIntelligenceValidator,
} from "../src/insight-intelligence/module.js";
import { createRecommendationIntelligenceEngineModule } from "../src/recommendation-intelligence/module.js";
import { createDecisionIntelligenceEngineModule } from "../src/decision-intelligence/module.js";
import { createOutcomeIntelligenceEngineModule } from "../src/outcome-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c11",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c11-user-session",
};

describe("CH4-C11 insight intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides insight scenarios aligned with C1 through C10", () => {
      assert.equal(INSIGHT_SCENARIO_IDS.length, 5);
      for (const scenarioId of INSIGHT_SCENARIO_IDS) {
        assert.ok(INSIGHT_SCENARIO_TO_CANONICAL[scenarioId], `missing canonical for ${scenarioId}`);
      }
    });

    it("builds strategic insights from recommendation output deterministically", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const recommendation = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      const decision = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).evaluation;
      const builder = createStrategicInsightsBuilder();

      const first = builder.build(recommendation, decision, evaluation);
      const second = builder.build(recommendation, decision, evaluation);
      assert.deepEqual(first, second);
      assert.ok(first.length >= 3);
    });

    it("recognizes patterns from recommendation and decision signals", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const { outcomeIntelligenceEngine } = createOutcomeIntelligenceEngineModule();
      const recommendation = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;
      const decision = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;
      const evaluation = outcomeIntelligenceEngine.getEvaluation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).evaluation;

      const patterns = createPatternRecognitionBuilder().build(recommendation, decision, evaluation);
      assert.ok(patterns.length > 0);
      assert.ok(patterns.every((p) => p.confidence >= 0));
    });

    it("generates insight confidence from recommendation and consistency scores", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const output = insightIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      });
      const recommendation = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).recommendation;
      const confidence = createInsightConfidenceBuilder().build({
        recommendation,
        consistency: output.recommendationConsistencyAnalysis,
        patternCount: output.patternRecognitions.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.recommendationConfidenceScore, recommendation.recommendationConfidence.score);
    });

    it("validates insight outputs for all scenarios", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const validator = createInsightIntelligenceValidator();

      for (const scenarioId of INSIGHT_SCENARIO_IDS) {
        const output = insightIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
          scenario_id: scenarioId,
        });
        assert.equal(output.readOnly, true);
        assert.ok(output.recommendationOutputId.startsWith("recommendation-"));
        assert.ok(output.strategicInsights.length > 0);
        assert.ok(output.explanation.summary.length > 0);

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid insight for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns insight intelligence home for authenticated users", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const home = insightIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.insight_chain.includes("insight_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      assert.throws(
        () => insightIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic insight outputs for the same scenario", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const first = insightIntelligenceEngine.getInsights(USER_AUTH, { scenario_id: "moving_a_room" });
      const second = insightIntelligenceEngine.getInsights(USER_AUTH, { scenario_id: "moving_a_room" });
      assert.deepEqual(first.strategic_insights, second.strategic_insights);
      assert.deepEqual(
        first.recommendation_consistency_analysis,
        second.recommendation_consistency_analysis
      );
    });

    it("links insight output to recommendation intelligence", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const output = insightIntelligenceEngine.buildOutputForValidation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      });
      assert.match(output.recommendationOutputId, /^recommendation-/);
      assert.match(output.decisionRecommendationId, /^decision-/);
      assert.match(output.trustRecommendationId, /^trust-/);
    });

    it("includes human-readable insight explanation", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const explanation = insightIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /insight/i);
      assert.ok(explanation.explanation.strategicSummary.length > 0);
      assert.ok(explanation.insight_confidence.score >= 35);
    });

    it("delegates upstream only through recommendation intelligence repository", () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const risks = insightIntelligenceEngine.getRisks(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(risks.read_only, true);
      assert.ok(Array.isArray(risks.risk_insights));
      assert.ok(Array.isArray(risks.bottleneck_detections));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C11", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createInsightIntelligenceEngineModule/);
      assert.match(indexSource, /insightIntelligenceEngine/);
      assert.match(serverSource, /registerInsightIntelligenceRoutes/);
      assert.match(serverSource, /insightIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c11/);
      assert.match(packageSource, /test:ch4-c11-insight-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers insight intelligence routes behind auth middleware", async () => {
      const { insightIntelligenceEngine } = createInsightIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerInsightIntelligenceRoutes(app, insightIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/insight-intelligence" });
      assert.equal(home.statusCode, 200);

      const insights = await app.inject({
        method: "GET",
        url: "/insight-intelligence/insights?scenario_id=moving_a_room",
      });
      assert.equal(insights.statusCode, 200);
      const insightsBody = insights.json() as {
        strategic_insights: Array<{ insightId: string }>;
        read_only: boolean;
      };
      assert.equal(insightsBody.read_only, true);
      assert.ok(insightsBody.strategic_insights.length > 0);

      const patterns = await app.inject({
        method: "GET",
        url: "/insight-intelligence/patterns?scenario_id=cleaning_an_apartment",
      });
      assert.equal(patterns.statusCode, 200);

      const opportunities = await app.inject({
        method: "GET",
        url: "/insight-intelligence/opportunities?scenario_id=fixing_small_home_issue",
      });
      assert.equal(opportunities.statusCode, 200);

      const risks = await app.inject({
        method: "GET",
        url: "/insight-intelligence/risks?scenario_id=delivering_a_document",
      });
      assert.equal(risks.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/insight-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/insight-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, INSIGHT_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({ method: "GET", url: "/insight-intelligence/validate" });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
