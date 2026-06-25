import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLearnByActionRoutes } from "../src/api/routes/learn-by-action.js";
import {
  LEARN_BY_ACTION_SCHEMA_VERSION,
  buildExpertRecommendations,
  buildLearningContext,
  buildLearningImpact,
  buildLearningOpportunities,
  buildLearningProfile,
  createLearnByActionModule,
  validateLearningContext,
} from "../src/learn-by-action/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x51",
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "x51-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x51",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x51-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

describe("X51 learn by action engine", () => {
  describe("domain (unit)", () => {
    it("builds learning context from develop me gaps and expert profiles", () => {
      const context = buildLearningContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.userId, USER_AUTH.userId);
      assert.ok(context.experts.length >= 5);
      assert.ok(context.missingSkills.length > 0);
      assert.ok(context.marketplaceListings.length > 0);
    });

    it("generates explainable expert recommendations deterministically", () => {
      const context = buildLearningContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      const first = buildExpertRecommendations(context);
      const second = buildExpertRecommendations(context);

      assert.deepEqual(
        first.map((rec) => rec.recommendationId),
        second.map((rec) => rec.recommendationId)
      );
      assert.ok(first.length > 0);
      assert.ok(first.every((rec) => rec.explanation.reasons.length >= 3));
      assert.ok(first.every((rec) => rec.estimatedCostCents > 0));
    });

    it("builds learning opportunities with impact metrics", () => {
      const context = buildLearningContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const experts = buildExpertRecommendations(context);
      const opportunities = buildLearningOpportunities(context, experts);
      const impact = buildLearningImpact(context, opportunities);

      assert.ok(opportunities.length > 0);
      assert.ok(impact.skillsGained.length > 0);
      assert.ok(impact.readinessIncrease > 0);
      assert.ok(impact.incomeIncreaseCents > 0);
      assert.ok(impact.explanation.reasons.length >= 4);
    });

    it("builds full learning profile with best and nearest expert", () => {
      const context = buildLearningContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const profile = buildLearningProfile(context);

      assert.equal(profile.schemaVersion, LEARN_BY_ACTION_SCHEMA_VERSION);
      assert.ok(profile.bestExpert);
      assert.ok(profile.nearestExpert);
      assert.match(profile.headline, /best expert/i);
      assert.ok(profile.opportunities.length > 0);
      assert.equal(profile.readOnly, true);
    });

    it("validates learning context", () => {
      const context = buildLearningContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateLearningContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.guidanceReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns personalized learning guidance for authenticated users", () => {
      const { learnByAction } = createLearnByActionModule();
      const overview = learnByAction.getOverview(USER_AUTH);
      assert.equal(overview.user_id, USER_AUTH.userId);
      assert.equal(overview.read_only, true);
      assert.ok(overview.best_expert);

      const experts = learnByAction.getExperts(USER_AUTH);
      assert.ok(experts.count > 0);
      assert.ok(experts.best_expert);

      const nearby = learnByAction.getNearby(USER_AUTH);
      assert.ok(nearby.nearest_expert);
      assert.ok(nearby.nearby_experts.length > 0);

      const impact = learnByAction.getImpact(USER_AUTH);
      assert.ok(impact.readiness_increase > 0);
    });

    it("refreshes learning profile without mutating platform state", () => {
      const { learnByAction } = createLearnByActionModule();
      const refreshed = learnByAction.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
      assert.ok(refreshed.profile.opportunity_count > 0);
    });

    it("restricts statistics to platform_admin", () => {
      const { learnByAction } = createLearnByActionModule();
      learnByAction.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => learnByAction.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = learnByAction.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_profiles >= 1);
      assert.ok(stats.total_recommendations > 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X51", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createLearnByActionModule/);
      assert.match(serverSource, /registerLearnByActionRoutes/);
      assert.match(packageSource, /verify:x51/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers learn by action routes", async () => {
      const { learnByAction } = createLearnByActionModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLearnByActionRoutes(app, learnByAction);

      const overview = await app.inject({ method: "GET", url: "/learn-by-action" });
      assert.equal(overview.statusCode, 200);

      const experts = await app.inject({ method: "GET", url: "/learn-by-action/experts" });
      assert.equal(experts.statusCode, 200);

      const nearby = await app.inject({ method: "GET", url: "/learn-by-action/nearby" });
      assert.equal(nearby.statusCode, 200);

      const impact = await app.inject({ method: "GET", url: "/learn-by-action/impact" });
      assert.equal(impact.statusCode, 200);

      const refresh = await app.inject({
        method: "POST",
        url: "/learn-by-action/refresh",
        payload: { generated_at: FIXED_AT },
      });
      assert.equal(refresh.statusCode, 200);

      await app.close();
    });
  });
});
