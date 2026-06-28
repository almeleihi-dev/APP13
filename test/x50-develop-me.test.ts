import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerDevelopMeRoutes } from "../src/api/routes/develop-me.js";
import {
  DEVELOP_ME_SCHEMA_VERSION,
  buildDevelopmentContext,
  buildDevelopmentProfile,
  buildDevelopmentRoadmap,
  buildGapRadar,
  buildReadinessScore,
  createDevelopMeModule,
  validateDevelopmentContext,
} from "../src/develop-me/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import { readModuleWiringSource, readRouteWiringSource } from "./helpers/wiring-source.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x50",
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "x50-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x50",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x50-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

describe("X50 develop me engine", () => {
  describe("domain (unit)", () => {
    it("builds development context from auth and marketplace demand", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.userId, USER_AUTH.userId);
      assert.ok(context.marketplaceListings.length > 0);
      assert.ok(context.missingSkills.length > 0);
      assert.ok(context.missingCertifications.length > 0);
    });

    it("generates gap radar with explainable gaps", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const radar = buildGapRadar(context);

      assert.ok(radar.totalGaps >= 4);
      assert.ok(radar.gaps.some((gap) => gap.category === "skills"));
      assert.ok(radar.gaps.some((gap) => gap.category === "licenses"));
      assert.ok(radar.summary.length > 0);
    });

    it("calculates explainable readiness score deterministically", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      const first = buildReadinessScore(context);
      const second = buildReadinessScore(context);

      assert.equal(first.score, second.score);
      assert.ok(first.factors.length >= 7);
      assert.ok(first.explanation.reasons.length >= 7);
      assert.ok(first.score >= 0 && first.score <= 100);
    });

    it("builds ordered development roadmap with next action", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const roadmap = buildDevelopmentRoadmap(context);

      assert.ok(roadmap.totalSteps >= 4);
      assert.ok(roadmap.nextDevelopmentAction);
      assert.equal(roadmap.steps[0]!.stepNumber, 1);
      assert.match(roadmap.steps[0]!.title, /Certificate|Safety/i);
    });

    it("builds full development profile", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const profile = buildDevelopmentProfile(context);

      assert.equal(profile.schemaVersion, DEVELOP_ME_SCHEMA_VERSION);
      assert.ok(profile.gapRadar.totalGaps > 0);
      assert.ok(profile.marketRadar.signals.length > 0);
      assert.ok(profile.incomeRadar.expectedGrowthPercent > 0);
      assert.ok(profile.opportunityRadar.count > 0);
      assert.ok(profile.roadmap.steps.length >= 4);
      assert.equal(profile.readOnly, true);
    });

    it("validates development context", () => {
      const context = buildDevelopmentContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateDevelopmentContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.guidanceReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns personalized development guidance for authenticated users", () => {
      const { developMe } = createDevelopMeModule();
      const overview = developMe.getOverview(USER_AUTH);
      assert.equal(overview.user_id, USER_AUTH.userId);
      assert.equal(overview.read_only, true);
      assert.ok(overview.readiness_score >= 0);

      const readiness = developMe.getReadiness(USER_AUTH);
      assert.ok(readiness.explanation.reasons.length >= 7);

      const roadmap = developMe.getRoadmap(USER_AUTH);
      assert.ok(roadmap.total_steps >= 4);
      assert.ok(roadmap.next_development_action);
    });

    it("refreshes roadmap without mutating platform state", () => {
      const { developMe } = createDevelopMeModule();
      const refreshed = developMe.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
      assert.ok(refreshed.profile.roadmap_steps >= 4);
    });

    it("restricts statistics to platform_admin", () => {
      const { developMe } = createDevelopMeModule();
      developMe.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => developMe.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = developMe.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_profiles >= 1);
      assert.ok(stats.average_readiness_score >= 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X50", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readModuleWiringSource(),
        readRouteWiringSource(),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createDevelopMeModule/);
      assert.match(serverSource, /registerDevelopMeRoutes/);
      assert.match(packageSource, /verify:x50/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers develop me routes", async () => {
      const { developMe } = createDevelopMeModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerDevelopMeRoutes(app, developMe);

      const overview = await app.inject({ method: "GET", url: "/develop-me" });
      assert.equal(overview.statusCode, 200);

      const gapRadar = await app.inject({ method: "GET", url: "/develop-me/gap-radar" });
      assert.equal(gapRadar.statusCode, 200);
      const gapBody = gapRadar.json() as { total_gaps: number };
      assert.ok(gapBody.total_gaps >= 4);

      const roadmap = await app.inject({ method: "GET", url: "/develop-me/roadmap" });
      assert.equal(roadmap.statusCode, 200);

      const refresh = await app.inject({
        method: "POST",
        url: "/develop-me/refresh",
        payload: { generated_at: FIXED_AT },
      });
      assert.equal(refresh.statusCode, 200);

      await app.close();
    });
  });
});
