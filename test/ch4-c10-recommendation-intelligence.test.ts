import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerRecommendationIntelligenceRoutes } from "../src/api/routes/recommendation-intelligence.js";
import {
  RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
  RECOMMENDATION_SCENARIO_IDS,
  RECOMMENDATION_SCENARIO_TO_CANONICAL,
  ACTION_PRIORITY_LEVELS,
  createRecommendationIntelligenceEngineModule,
  createPrioritizedRecommendationsBuilder,
  createRecommendationScoreBuilder,
  createRecommendationConfidenceBuilder,
  createRecommendationIntelligenceValidator,
} from "../src/recommendation-intelligence/module.js";
import { createDecisionIntelligenceEngineModule } from "../src/decision-intelligence/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-ch4-c10",
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "ch4-c10-user-session",
};

describe("CH4-C10 recommendation intelligence engine", () => {
  describe("domain (unit)", () => {
    it("provides recommendation scenarios aligned with C1 through C9", () => {
      assert.equal(RECOMMENDATION_SCENARIO_IDS.length, 5);
      for (const scenarioId of RECOMMENDATION_SCENARIO_IDS) {
        assert.ok(
          RECOMMENDATION_SCENARIO_TO_CANONICAL[scenarioId],
          `missing canonical for ${scenarioId}`
        );
      }
    });

    it("builds prioritized recommendations from decision output deterministically", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const decision = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "moving_a_room",
      }).recommendation;
      const builder = createPrioritizedRecommendationsBuilder();

      const first = builder.build(decision);
      const second = builder.build(decision);
      assert.deepEqual(first, second);
      assert.ok(first.length > 0);
      assert.equal(first[0].rank, 1);
      assert.ok(first[0].recommendationScore >= 0);
    });

    it("computes recommendation score from prioritized items and decision confidence", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const decision = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      }).recommendation;
      const prioritized = createPrioritizedRecommendationsBuilder().build(decision);
      const score = createRecommendationScoreBuilder().build(prioritized, decision);
      assert.ok(score >= 30);
      assert.ok(score <= 100);
    });

    it("generates recommendation confidence from upstream decision scores", () => {
      const { decisionIntelligenceEngine } = createDecisionIntelligenceEngineModule();
      const decision = decisionIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "fixing_small_home_issue",
      }).recommendation;
      const prioritized = createPrioritizedRecommendationsBuilder().build(decision);
      const score = createRecommendationScoreBuilder().build(prioritized, decision);
      const confidence = createRecommendationConfidenceBuilder().build({
        decision,
        recommendationScore: score,
        prioritizedCount: prioritized.length,
      });
      assert.ok(["low", "medium", "high"].includes(confidence.level));
      assert.equal(confidence.decisionConfidenceScore, decision.decisionConfidence.score);
    });

    it("validates recommendation outputs for all scenarios", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const validator = createRecommendationIntelligenceValidator();

      for (const scenarioId of RECOMMENDATION_SCENARIO_IDS) {
        const output = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
          scenario_id: scenarioId,
        }).recommendation;
        assert.equal(output.readOnly, true);
        assert.ok(output.decisionRecommendationId.startsWith("decision-"));
        assert.ok(output.prioritizedRecommendations.length > 0);
        assert.ok(output.explanation.summary.length > 0);
        assert.ok(ACTION_PRIORITY_LEVELS.includes(output.actionPriority));

        const report = validator.validateOutput(output);
        assert.equal(report.valid, true, `invalid recommendation for ${scenarioId}`);
      }
    });
  });

  describe("service (unit)", () => {
    it("returns recommendation intelligence home for authenticated users", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const home = recommendationIntelligenceEngine.getHome(USER_AUTH);
      assert.equal(home.read_only, true);
      assert.equal(home.scenario_count, 5);
      assert.ok(home.recommendation_chain.includes("recommendation_intelligence"));
    });

    it("rejects unauthenticated access", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      assert.throws(
        () => recommendationIntelligenceEngine.getHome(null as never),
        (error: unknown) => error instanceof AppError
      );
    });

    it("returns deterministic recommendation outputs for the same scenario", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const first = recommendationIntelligenceEngine.getPrioritized(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      const second = recommendationIntelligenceEngine.getPrioritized(USER_AUTH, {
        scenario_id: "moving_a_room",
      });
      assert.deepEqual(first.prioritized_recommendations, second.prioritized_recommendations);
      assert.equal(first.recommendation_score, second.recommendation_score);
    });

    it("links recommendation output to decision intelligence", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const output = recommendationIntelligenceEngine.getRecommendation(USER_AUTH, {
        scenario_id: "delivering_a_document",
      }).recommendation;
      assert.match(output.decisionRecommendationId, /^decision-/);
      assert.match(output.trustRecommendationId, /^trust-/);
      assert.match(output.outcomeEvaluationId, /^outcome-/);
    });

    it("includes human-readable recommendation explanation", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const explanation = recommendationIntelligenceEngine.getExplanation(USER_AUTH, {
        scenario_id: "cleaning_an_apartment",
      });
      assert.match(explanation.explanation.summary, /recommendation/i);
      assert.ok(explanation.explanation.prioritySummary.length > 0);
      assert.ok(explanation.explanation.roadmapSummary.length > 0);
    });

    it("delegates upstream only through decision intelligence repository", () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const outcomes = recommendationIntelligenceEngine.getOutcomes(USER_AUTH, {
        scenario_id: "preparing_professional_service_request",
      });
      assert.equal(outcomes.read_only, true);
      assert.ok(outcomes.success_probability.score >= 0);
      assert.ok(Array.isArray(outcomes.expected_benefits));
      assert.ok(Array.isArray(outcomes.expected_trade_offs));
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for CH4-C10", async () => {
      const indexSource = await readModuleWiringSource();
      const serverSource = await readRouteWiringSource();
      const packageSource = await readFile(path.join(ROOT_DIR, "package.json"), "utf8");

      assert.match(indexSource, /createRecommendationIntelligenceEngineModule/);
      assert.match(indexSource, /recommendationIntelligenceEngine/);
      assert.match(serverSource, /registerRecommendationIntelligenceRoutes/);
      assert.match(serverSource, /recommendationIntelligenceEngine/);
      assert.match(packageSource, /verify:ch4-c10/);
      assert.match(packageSource, /test:ch4-c10-recommendation-intelligence/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers recommendation intelligence routes behind auth middleware", async () => {
      const { recommendationIntelligenceEngine } = createRecommendationIntelligenceEngineModule();
      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerRecommendationIntelligenceRoutes(app, recommendationIntelligenceEngine);

      const home = await app.inject({ method: "GET", url: "/recommendation-intelligence" });
      assert.equal(home.statusCode, 200);

      const recommendation = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/recommendation?scenario_id=moving_a_room",
      });
      assert.equal(recommendation.statusCode, 200);
      const recBody = recommendation.json() as {
        recommendation: { readOnly: boolean; recommendationScore: number; goal: string };
      };
      assert.equal(recBody.recommendation.readOnly, true);
      assert.ok(recBody.recommendation.recommendationScore >= 0);
      assert.match(recBody.recommendation.goal, /Move/i);

      const prioritized = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/prioritized?scenario_id=cleaning_an_apartment",
      });
      assert.equal(prioritized.statusCode, 200);

      const roadmap = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/roadmap?scenario_id=fixing_small_home_issue",
      });
      assert.equal(roadmap.statusCode, 200);

      const outcomes = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/outcomes?scenario_id=delivering_a_document",
      });
      assert.equal(outcomes.statusCode, 200);

      const fallbacks = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/fallbacks?scenario_id=moving_a_room",
      });
      assert.equal(fallbacks.statusCode, 200);

      const explanation = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/explanation?scenario_id=moving_a_room",
      });
      assert.equal(explanation.statusCode, 200);

      const summary = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/summary?scenario_id=moving_a_room",
      });
      assert.equal(summary.statusCode, 200);
      const summaryBody = summary.json() as { summary: { schemaVersion: string } };
      assert.equal(summaryBody.summary.schemaVersion, RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION);

      const validate = await app.inject({
        method: "GET",
        url: "/recommendation-intelligence/validate",
      });
      assert.equal(validate.statusCode, 200);
      const report = validate.json() as { validation: { valid: boolean } };
      assert.equal(report.validation.valid, true);

      await app.close();
    });
  });
});
