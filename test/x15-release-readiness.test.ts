import { describe, it } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerReleaseReadinessRoutes } from "../src/api/routes/release-readiness.js";
import { createReleaseReadinessCenterModule } from "../src/experience/release-readiness/module.js";
import {
  buildLaunchBlockers,
  buildLaunchReadinessScore,
  buildLaunchStrengths,
  buildLaunchWarnings,
  buildReadinessArea,
  buildReleaseReadinessCenter,
  buildReleaseReadinessCenterSnapshot,
  deriveRecommendedActions,
  evaluateReadinessProbe,
  LAUNCH_READINESS_AREA_SPECS,
  toReleaseReadinessCenterView,
  type ReadinessSources,
} from "../src/experience/release-readiness/domain/release-readiness.js";
import { ReleaseReadinessCenterRepository } from "../src/experience/release-readiness/infrastructure/release-readiness-repository.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";

const FIXED_TIME = new Date("2026-06-19T20:00:00.000Z");

function buildHealthySources(): ReadinessSources {
  const indexSource = [
    "createHomeExperienceModule",
    "createNotificationsModule",
    "createContractEngineService",
    "createContractJourneyModule",
    "createEscrowService",
    "createEscrowPaymentExperienceModule",
    "createExecutionService",
    "createIssueService",
    "createTrustModule",
    "createTrustReputationExperienceModule",
    "createConversionModule",
    "createDiscoveryMatchingModule",
    "createProfessionalPassportModule",
    "createProfessionalSealsModule",
    "createLiveFrameExperienceModule",
    "createLiveTrustFrameModule",
    "createProviderCommandCenterModule",
    "createCustomerCommandCenterModule",
    "createPlatformControlTowerModule",
    "createReleaseReadinessCenterModule",
  ].join("\n");

  const serverSource = [
    "registerHomeRoutes",
    "registerNotificationRoutes",
    "registerContractRoutes",
    "registerContractJourneyRoutes",
    "registerEscrowPaymentRoutes",
    "registerEvidenceRoutes",
    "registerExecutionExperienceRoutes",
    "registerEvidenceReadRoutes",
    "registerIssueRoutes",
    "registerDisputesReadRoutes",
    "registerTrustReputationExperienceRoutes",
    "registerConversionRoutes",
    "registerDiscoveryMatchingRoutes",
    "registerProfessionalPassportRoutes",
    "registerLiveFrameRoutes",
    "registerLiveTrustFrameRoutes",
    "registerProviderCommandCenterRoutes",
    "registerCustomerCommandCenterRoutes",
    "registerPlatformControlTowerRoutes",
    "registerReleaseReadinessRoutes",
    "registerSecurityAuthRoutes",
    "requireAuthMiddleware",
    "createAuthenticateMiddleware",
    "registerAdminConsoleRoutes",
  ].join("\n");

  const packageSource = '"build"\n"lint:imports"\n"verify:x11"\n"verify:x12"\n"verify:x13"\n"verify:x15"';

  return {
    indexSource,
    serverSource,
    packageSource,
    existingPaths: new Set([
      "docs/experience/X1-Unified-Home-Experience.md",
      "docs/experience/X3-Contract-Journey-Experience.md",
      "docs/experience/X6-Escrow-Payment-Experience.md",
      "docs/experience/X7-Trust-Reputation-Experience.md",
      "docs/experience/X8-Discovery-Matching-Experience.md",
      "docs/experience/X9-Professional-Passport-Experience.md",
      "docs/experience/X10-Live-Trust-Frame-Experience.md",
      "docs/experience/X11-Provider-Command-Center.md",
      "docs/experience/X12-Customer-Command-Center.md",
      "docs/experience/X13-Platform-Control-Tower.md",
      "docs/experience/X15-Release-Readiness-Center.md",
      "docs/release/RC1-Readiness-Report.md",
      "docs/release/RC1-Architecture-Summary.md",
      "docs/release/RC1-Operational-Checklist.md",
      ".dependency-cruiser.cjs",
    ]),
  };
}

function buildBlockedSources(): ReadinessSources {
  return {
    indexSource: "createHomeExperienceModule",
    serverSource: "registerHomeRoutes",
    packageSource: '"build"',
    existingPaths: new Set<string>(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x15-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x15-customer-session",
});

describe("X15 Release Readiness Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("evaluates readiness probes deterministically", () => {
      const sources = buildHealthySources();
      const probe = LAUNCH_READINESS_AREA_SPECS[0]!.probes[0]!;
      const result = evaluateReadinessProbe(sources, probe);
      assert.equal(result.status, "pass");
      assert.match(result.message, /verified$/);
    });

    it("marks blocking probes as fail when missing", () => {
      const result = evaluateReadinessProbe(buildBlockedSources(), {
        id: "contract-engine",
        name: "Contract engine",
        source: "index",
        target: "createContractEngineService",
        blocking: true,
      });
      assert.equal(result.status, "fail");
      assert.equal(result.blocking, true);
    });

    it("builds readiness areas with scores and status", () => {
      const spec = LAUNCH_READINESS_AREA_SPECS.find((entry) => entry.areaCode === "trust")!;
      const checks = spec.probes.map((probe) => evaluateReadinessProbe(buildHealthySources(), probe));
      const area = buildReadinessArea(spec, checks);
      assert.equal(area.areaCode, "trust");
      assert.equal(area.score, 100);
      assert.equal(area.status, "ready");
    });

    it("computes overall launch readiness score across sixteen areas", () => {
      const snapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildHealthySources(),
        generatedAt: FIXED_TIME,
      });
      const score = buildLaunchReadinessScore(snapshot.areas);
      assert.equal(snapshot.areas.length, 16);
      assert.equal(score.score, 100);
      assert.equal(score.status, "ready");
      assert.equal(score.readyAreas, 16);
    });

    it("identifies launch blockers from blocking probe failures", () => {
      const snapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildBlockedSources(),
        generatedAt: FIXED_TIME,
      });
      const blockers = buildLaunchBlockers(snapshot.areas);
      assert.ok(blockers.length > 0);
      assert.ok(blockers.some((blocker) => blocker.areaCode === "contracts"));
    });

    it("identifies launch warnings from non-blocking gaps", () => {
      const sources = buildHealthySources();
      sources.existingPaths.delete("docs/experience/X15-Release-Readiness-Center.md");
      const snapshot = buildReleaseReadinessCenterSnapshot({ sources, generatedAt: FIXED_TIME });
      const warnings = buildLaunchWarnings(snapshot.areas);
      assert.ok(warnings.some((warning) => warning.code === "x15-doc"));
    });

    it("identifies launch strengths for ready high-score areas", () => {
      const snapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildHealthySources(),
        generatedAt: FIXED_TIME,
      });
      const strengths = buildLaunchStrengths(snapshot.areas);
      assert.ok(strengths.length >= 10);
      assert.ok(strengths.every((strength) => strength.score >= 95));
    });

    it("derives recommended actions from blockers and warnings", () => {
      const snapshot = buildReleaseReadinessCenterSnapshot({
        sources: buildBlockedSources(),
        generatedAt: FIXED_TIME,
      });
      const actions = deriveRecommendedActions({
        blockers: snapshot.blockers,
        warnings: snapshot.warnings,
        score: snapshot.score,
      });
      assert.ok(actions.some((action) => action.priority === "critical"));
      assert.ok(actions.some((action) => action.action.includes("Do not launch")));
    });

    it("composes full release readiness center deterministically", () => {
      const center = buildReleaseReadinessCenter({
        snapshot: buildReleaseReadinessCenterSnapshot({
          sources: buildHealthySources(),
          generatedAt: FIXED_TIME,
        }),
      });
      assert.equal(center.score.score, 100);
      assert.equal(center.areas.length, 16);
      assert.equal(center.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("serializes release readiness center view with snake_case fields", () => {
      const view = toReleaseReadinessCenterView(
        buildReleaseReadinessCenter({
          snapshot: buildReleaseReadinessCenterSnapshot({
            sources: buildHealthySources(),
            generatedAt: FIXED_TIME,
          }),
        })
      );
      assert.equal(view.score.score, 100);
      assert.equal(view.areas.length, 16);
      assert.ok(Array.isArray(view.blockers));
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
    });
  });

  describe("integration", () => {
    it("analyzes the workspace and serves release readiness routes for admins", async () => {
      const repository = new ReleaseReadinessCenterRepository(process.cwd());
      const { releaseReadinessCenter } = createReleaseReadinessCenterModule({ repository });

      const view = await releaseReadinessCenter.getReleaseReadinessCenter(ADMIN_AUTH("admin-x15"));
      assert.equal(view.areas.length, 16);
      assert.ok(view.score.score >= 80);
      assert.ok(view.strengths.length > 0);

      await assert.rejects(
        () => releaseReadinessCenter.getReleaseReadinessCenter(CUSTOMER_AUTH("customer-x15")),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-x15");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerReleaseReadinessRoutes(app, releaseReadinessCenter);

      for (const path of [
        "/release-readiness",
        "/release-readiness/score",
        "/release-readiness/areas",
        "/release-readiness/blockers",
        "/release-readiness/warnings",
        "/release-readiness/actions",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });

    it("returns score, areas, blockers, warnings, and actions sections", async () => {
      const { releaseReadinessCenter } = createReleaseReadinessCenterModule({
        rootDir: process.cwd(),
      });

      const score = await releaseReadinessCenter.getLaunchReadinessScore(ADMIN_AUTH("admin-x15"));
      assert.ok(score.score >= 0);

      const areas = await releaseReadinessCenter.getReadinessAreas(ADMIN_AUTH("admin-x15"));
      assert.equal(areas.length, 16);

      const blockers = await releaseReadinessCenter.getLaunchBlockers(ADMIN_AUTH("admin-x15"));
      assert.ok(Array.isArray(blockers));

      const warnings = await releaseReadinessCenter.getLaunchWarnings(ADMIN_AUTH("admin-x15"));
      assert.ok(Array.isArray(warnings));

      const actions = await releaseReadinessCenter.getRecommendedActions(ADMIN_AUTH("admin-x15"));
      assert.ok(actions.length > 0);
    });
  });
});
