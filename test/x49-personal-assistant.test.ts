import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerPersonalAssistantRoutes } from "../src/api/routes/personal-assistant.js";
import {
  PERSONAL_ASSISTANT_SCHEMA_VERSION,
  buildAssistantContext,
  buildAssistantProfile,
  buildAssistantRecommendations,
  createPersonalAssistantModule,
  validateAssistantContext,
} from "../src/personal-assistant/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x49",
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "x49-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x49",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x49-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

describe("X49 personal assistant engine", () => {
  describe("domain (unit)", () => {
    it("builds assistant context from auth and marketplace listings", () => {
      const context = buildAssistantContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.userId, USER_AUTH.userId);
      assert.ok(context.marketplaceListings.length > 0);
      assert.ok(context.missingLicenses.length > 0);
    });

    it("generates explainable recommendations deterministically", () => {
      const context = buildAssistantContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      const first = buildAssistantRecommendations(context);
      const second = buildAssistantRecommendations(context);

      assert.deepEqual(
        first.map((rec) => rec.recommendationId),
        second.map((rec) => rec.recommendationId)
      );
      assert.ok(first.length >= 5);
      assert.ok(first.every((rec) => rec.explanation.reasons.length >= 2));
      assert.ok(first.every((rec) => rec.readOnly === true));
    });

    it("builds a full assistant profile with cards and progress", () => {
      const context = buildAssistantContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const profile = buildAssistantProfile(context);

      assert.equal(profile.schemaVersion, PERSONAL_ASSISTANT_SCHEMA_VERSION);
      assert.ok(profile.todaysBestAction);
      assert.ok(profile.cards.length >= profile.recommendations.length);
      assert.ok(profile.opportunities.length > 0);
      assert.equal(profile.readOnly, true);
      assert.match(profile.headline, /Today you can earn more|active action/i);
    });

    it("validates assistant context", () => {
      const context = buildAssistantContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateAssistantContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.guidanceReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns personalized guidance for authenticated users", () => {
      const { personalAssistant } = createPersonalAssistantModule();
      const profile = personalAssistant.getProfile(USER_AUTH);
      assert.equal(profile.user_id, USER_AUTH.userId);
      assert.equal(profile.read_only, true);
      assert.ok(profile.recommendation_count >= 5);

      const today = personalAssistant.getToday(USER_AUTH);
      assert.ok(today.todays_best_action);
      assert.equal(today.read_only, true);

      const recommendations = personalAssistant.getRecommendations(USER_AUTH);
      assert.equal(recommendations.explainable, true);
      assert.equal(recommendations.read_only, true);
      assert.ok(recommendations.recommendations[0]!.explanation.reasons.length >= 2);
    });

    it("refreshes guidance without mutating platform state", () => {
      const { personalAssistant } = createPersonalAssistantModule();
      const refreshed = personalAssistant.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
      assert.ok(refreshed.profile.recommendation_count >= 5);
    });

    it("restricts statistics to platform_admin", () => {
      const { personalAssistant } = createPersonalAssistantModule();
      personalAssistant.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => personalAssistant.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = personalAssistant.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_profiles >= 1);
      assert.ok(stats.total_recommendations_generated >= 5);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X49", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createPersonalAssistantModule/);
      assert.match(serverSource, /registerPersonalAssistantRoutes/);
      assert.match(packageSource, /verify:x49/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers personal assistant routes", async () => {
      const { personalAssistant } = createPersonalAssistantModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerPersonalAssistantRoutes(app, personalAssistant);

      const profile = await app.inject({ method: "GET", url: "/personal-assistant" });
      assert.equal(profile.statusCode, 200);

      const today = await app.inject({ method: "GET", url: "/personal-assistant/today" });
      assert.equal(today.statusCode, 200);

      const cards = await app.inject({ method: "GET", url: "/personal-assistant/cards" });
      assert.equal(cards.statusCode, 200);
      const cardsBody = cards.json() as { count: number };
      assert.ok(cardsBody.count >= 5);

      const refresh = await app.inject({
        method: "POST",
        url: "/personal-assistant/refresh",
        payload: { generated_at: FIXED_AT },
      });
      assert.equal(refresh.statusCode, 200);

      await app.close();
    });
  });
});
