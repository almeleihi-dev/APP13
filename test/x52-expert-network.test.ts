import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerExpertNetworkRoutes } from "../src/api/routes/expert-network.js";
import {
  EXPERT_NETWORK_SCHEMA_VERSION,
  buildExpertNetworkContext,
  buildExpertNetworkSummary,
  buildExpertProfile,
  buildExpertRecommendations,
  createExpertNetworkModule,
  validateExpertNetwork,
} from "../src/expert-network/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x52",
  roles: ["provider"],
  tier: "T1",
  status: "active",
  sessionId: "x52-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x52",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x52-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";
const MARIA_ID = "expert://maria-santos";

describe("X52 expert network engine", () => {
  describe("domain (unit)", () => {
    it("builds expert network context with seed experts", () => {
      const context = buildExpertNetworkContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.userId, USER_AUTH.userId);
      assert.ok(context.experts.length >= 7);
      assert.ok(context.missingSkills.length > 0);
    });

    it("builds multi-role expert profiles deterministically", () => {
      const context = buildExpertNetworkContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const maria = context.experts.find((e) => e.expertId === MARIA_ID);
      assert.ok(maria);

      const first = buildExpertProfile(maria!);
      const second = buildExpertProfile(maria!);

      assert.deepEqual(first.roles.map((r) => r.role), second.roles.map((r) => r.role));
      assert.ok(first.roles.length >= 2);
      assert.ok(first.capabilities.length >= 3);
      assert.ok(first.experienceBalance.balanceScore > 0);
      assert.ok(first.visibility.channels.some((c) => c.visible));
    });

    it("generates explainable expert recommendations", () => {
      const context = buildExpertNetworkContext({
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
      assert.ok(first.some((rec) => rec.role === "trainer" || rec.role === "mentor"));
      assert.ok(first.every((rec) => rec.explanation.reasons.length >= 3));
    });

    it("builds expert network summary with impact metrics", () => {
      const context = buildExpertNetworkContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const summary = buildExpertNetworkSummary(context);

      assert.equal(summary.schemaVersion, EXPERT_NETWORK_SCHEMA_VERSION);
      assert.ok(summary.expertCount >= 7);
      assert.ok(summary.totalLearnersTrained > 0);
      assert.ok(summary.topExperts.length >= 3);
      assert.equal(summary.readOnly, true);
    });

    it("validates expert network context", () => {
      const context = buildExpertNetworkContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateExpertNetwork(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.networkReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns expert network data for authenticated users", () => {
      const { expertNetwork } = createExpertNetworkModule();
      const overview = expertNetwork.getOverview(USER_AUTH);
      assert.equal(overview.user_id, USER_AUTH.userId);
      assert.equal(overview.read_only, true);
      assert.ok(overview.expert_count >= 7);

      const experts = expertNetwork.listExperts(USER_AUTH);
      assert.ok(experts.count >= 7);

      const expert = expertNetwork.getExpert(USER_AUTH, encodeURIComponent(MARIA_ID));
      assert.ok(expert);
      assert.equal(expert!.expert_id, MARIA_ID);
      assert.ok(expert!.roles.length >= 2);

      const roles = expertNetwork.getRoles(USER_AUTH);
      assert.ok(roles.total_assignments > 0);

      const impact = expertNetwork.getImpact(USER_AUTH);
      assert.ok(impact.aggregate.total_learners_trained > 0);
    });

    it("refreshes network without mutating platform state", () => {
      const { expertNetwork } = createExpertNetworkModule();
      const refreshed = expertNetwork.refresh(USER_AUTH, { generated_at: FIXED_AT });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { expertNetwork } = createExpertNetworkModule();
      expertNetwork.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => expertNetwork.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = expertNetwork.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_experts >= 7);
      assert.ok(stats.total_roles_assigned > 0);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X52", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createExpertNetworkModule/);
      assert.match(serverSource, /registerExpertNetworkRoutes/);
      assert.match(packageSource, /verify:x52/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers expert network routes", async () => {
      const { expertNetwork } = createExpertNetworkModule();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerExpertNetworkRoutes(app, expertNetwork);

      const overview = await app.inject({ method: "GET", url: "/expert-network" });
      assert.equal(overview.statusCode, 200);

      const experts = await app.inject({ method: "GET", url: "/expert-network/experts" });
      assert.equal(experts.statusCode, 200);

      const detail = await app.inject({
        method: "GET",
        url: `/expert-network/experts/${encodeURIComponent(MARIA_ID)}`,
      });
      assert.equal(detail.statusCode, 200);

      const recommendations = await app.inject({
        method: "GET",
        url: "/expert-network/recommendations",
      });
      assert.equal(recommendations.statusCode, 200);

      const refresh = await app.inject({
        method: "POST",
        url: "/expert-network/refresh",
        payload: { generated_at: FIXED_AT },
      });
      assert.equal(refresh.statusCode, 200);

      await app.close();
    });
  });
});
