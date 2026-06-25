import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerTeamBuilderRoutes } from "../src/api/routes/team-builder.js";
import { createMarketplaceCompilationRepository } from "../src/marketplace-compilation/infrastructure/marketplace-compilation-repository.js";
import {
  TEAM_BUILDER_SCHEMA_VERSION,
  buildTeamBuilderContext,
  buildTeamRecommendation,
  buildTeamSummary,
  createTeamBuilderModule,
  validateTeamBuilderContext,
} from "../src/team-builder/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const USER_AUTH: AuthContext = {
  userId: "user-x53",
  roles: ["customer"],
  tier: "T2",
  status: "active",
  sessionId: "x53-user-session",
};

const ADMIN_AUTH: AuthContext = {
  userId: "admin-x53",
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x53-admin-session",
};

const FIXED_AT = "2026-06-20T12:00:00.000Z";

function getSampleListingId(): string {
  const repo = createMarketplaceCompilationRepository();
  const listings = repo.listListings().map((entry) => entry.listing);
  listings.sort((left, right) => left.id.localeCompare(right.id));
  assert.ok(listings.length > 0);
  return listings[0]!.id;
}

describe("X53 team builder engine", () => {
  describe("domain (unit)", () => {
    it("builds team context from marketplace listing and expert network", () => {
      const listingId = getSampleListingId();
      const context = buildTeamBuilderContext({
        authContext: USER_AUTH,
        listingId,
        generatedAt: FIXED_AT,
      });

      assert.equal(context.userId, USER_AUTH.userId);
      assert.equal(context.listing.id, listingId);
      assert.ok(context.candidatePool.length >= 7);
      assert.ok(context.requiredSkills.length >= 0);
    });

    it("generates deterministic team recommendations", () => {
      const listingId = getSampleListingId();
      const context = buildTeamBuilderContext({
        authContext: USER_AUTH,
        listingId,
        generatedAt: FIXED_AT,
      });

      const first = buildTeamRecommendation(context);
      const second = buildTeamRecommendation(context);

      assert.deepEqual(
        first.members.map((member) => member.memberId),
        second.members.map((member) => member.memberId)
      );
      assert.ok(first.members.length >= 2);
      assert.ok(first.teamLeader.isTeamLeader);
      assert.ok(first.completionConfidence > 0);
      assert.ok(first.explanation.reasons.length >= 4);
    });

    it("builds explainable readiness and coverage scores", () => {
      const listingId = getSampleListingId();
      const context = buildTeamBuilderContext({
        authContext: USER_AUTH,
        listingId,
        generatedAt: FIXED_AT,
      });
      const recommendation = buildTeamRecommendation(context);

      assert.ok(recommendation.coverageScore >= 0 && recommendation.coverageScore <= 100);
      assert.ok(recommendation.readinessScore >= 0 && recommendation.readinessScore <= 100);
      assert.ok(recommendation.compatibility.score >= 0);
      assert.ok(recommendation.strengths.length > 0);
      assert.equal(recommendation.readOnly, true);
    });

    it("builds team summary with best team headline", () => {
      const listingId = getSampleListingId();
      const context = buildTeamBuilderContext({
        authContext: USER_AUTH,
        listingId,
        generatedAt: FIXED_AT,
      });
      const summary = buildTeamSummary(context);

      assert.equal(summary.schemaVersion, TEAM_BUILDER_SCHEMA_VERSION);
      assert.match(summary.headline, /Best team found/i);
      assert.ok(summary.memberCount >= 2);
      assert.equal(summary.readOnly, true);
    });

    it("validates team builder context", () => {
      const context = buildTeamBuilderContext({
        authContext: USER_AUTH,
        generatedAt: FIXED_AT,
      });
      const validation = validateTeamBuilderContext(context);
      assert.equal(validation.valid, true);
      assert.equal(validation.teamReady, true);
    });
  });

  describe("service (unit)", () => {
    it("returns team recommendations for authenticated users", () => {
      const { teamBuilder } = createTeamBuilderModule();
      const listingId = getSampleListingId();

      const overview = teamBuilder.getOverview(USER_AUTH, listingId);
      assert.equal(overview.user_id, USER_AUTH.userId);
      assert.equal(overview.read_only, true);
      assert.ok(overview.member_count >= 2);
      assert.match(overview.headline, /Best team found/i);

      const members = teamBuilder.getMembers(USER_AUTH, listingId);
      assert.ok(members.count >= 2);
      assert.ok(members.team_leader.is_team_leader);

      const coverage = teamBuilder.getCoverage(USER_AUTH, listingId);
      assert.ok(coverage.coverage.coverage_score >= 0);

      const risks = teamBuilder.getRisks(USER_AUTH, listingId);
      assert.ok(risks.count > 0);
    });

    it("refreshes team profile without mutating platform state", () => {
      const { teamBuilder } = createTeamBuilderModule();
      const listingId = getSampleListingId();
      const refreshed = teamBuilder.refresh(USER_AUTH, {
        listing_id: listingId,
        generated_at: FIXED_AT,
      });
      assert.equal(refreshed.refreshed, true);
      assert.equal(refreshed.read_only, true);
      assert.equal(refreshed.validation.valid, true);
    });

    it("restricts statistics to platform_admin", () => {
      const { teamBuilder } = createTeamBuilderModule();
      teamBuilder.refresh(USER_AUTH, { generated_at: FIXED_AT });

      assert.throws(
        () => teamBuilder.getStatistics(USER_AUTH),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const stats = teamBuilder.getStatistics(ADMIN_AUTH);
      assert.ok(stats.total_profiles >= 1);
    });
  });

  describe("wiring", () => {
    it("loads workspace wiring for X53", async () => {
      const [indexSource, serverSource, packageSource] = await Promise.all([
        readFile(path.join(ROOT_DIR, "src/index.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "src/api/server.ts"), "utf8"),
        readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
      ]);

      assert.match(indexSource, /createTeamBuilderModule/);
      assert.match(serverSource, /registerTeamBuilderRoutes/);
      assert.match(packageSource, /verify:x53/);
    });
  });

  describe("route layer (smoke)", () => {
    it("registers team builder routes", async () => {
      const { teamBuilder } = createTeamBuilderModule();
      const listingId = getSampleListingId();
      const app = Fastify();
      app.addHook("preHandler", async (request) => {
        request.authContext = USER_AUTH;
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerTeamBuilderRoutes(app, teamBuilder);

      const overview = await app.inject({
        method: "GET",
        url: `/team-builder?listing_id=${encodeURIComponent(listingId)}`,
      });
      assert.equal(overview.statusCode, 200);

      const recommendations = await app.inject({
        method: "GET",
        url: `/team-builder/recommendations?listing_id=${encodeURIComponent(listingId)}`,
      });
      assert.equal(recommendations.statusCode, 200);

      const refresh = await app.inject({
        method: "POST",
        url: "/team-builder/refresh",
        payload: { listing_id: listingId, generated_at: FIXED_AT },
      });
      assert.equal(refresh.statusCode, 200);

      await app.close();
    });
  });
});
