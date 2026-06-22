import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProviderRoutes } from "../src/api/routes/providers.js";
import {
  TrustEventTypes,
  createTrustModule,
} from "../src/trust/module.js";
import {
  buildAvailabilitySummary,
  buildCompletionSummary,
  buildDisputeSummary,
  buildProviderPublicProfile,
  buildRatingSummary,
  mergeOfferedActions,
  toProviderPublicProfileView,
} from "../src/provider-experience/domain/provider-profile.js";
import {
  createProviderExperienceModule,
  createProviderProfileService,
} from "../src/provider-experience/application/provider-profile-service.js";
import { createActionIntelligenceService } from "../src/action-intelligence/application/action-intelligence-service.js";
import { toTrustProfileView } from "../src/trust/domain/trust-profile-view.js";
import { buildTrustProfile } from "../src/trust/domain/trust-profile.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  seedPartyUsers,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { resetS3TrustData } from "./helpers/s3-trust-harness.js";
import { TEST_AUTH_CONTEXT } from "./helpers/experience-server-integration.js";

const FIXED_TIME = new Date("2026-06-19T20:00:00.000Z");

async function buildProviderProfileTestServer(
  providerProfile: ReturnType<typeof createProviderExperienceModule>["providerProfile"]
) {
  const app = Fastify({ logger: false });
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = TEST_AUTH_CONTEXT;
  });
  app.addHook("preHandler", requireAuthMiddleware);
  app.setErrorHandler(errorHandler);
  await registerProviderRoutes(app, providerProfile);
  return app;
}

let db: DbPool | undefined;
let postgresReady = false;

describe("S6 Provider Public Profile Experience", () => {
  describe("projection layer (unit)", () => {
    it("merges offered actions by highest confidence", () => {
      const merged = mergeOfferedActions([
        { actionCode: "technology.code", actionName: "Software Development", confidence: 70 },
        { actionCode: "technology.code", actionName: "Software Development", confidence: 90 },
        { actionCode: "technology.test", actionName: "Testing", confidence: 80 },
      ]);

      assert.equal(merged.length, 2);
      assert.equal(merged[0]?.actionCode, "technology.code");
      assert.equal(merged[0]?.confidence, 90);
    });

    it("builds public-safe dispute and rating summaries", () => {
      const dispute = buildDisputeSummary({
        completedContracts: 4,
        cancelledContracts: 0,
        completionRate: 1,
        averageRating: 4.8,
        evaluationCount: 3,
        issuesRaised: 1,
        issuesResolved: 1,
        activeIssues: 0,
      });
      const rating = buildRatingSummary({
        completedContracts: 4,
        cancelledContracts: 0,
        completionRate: 1,
        averageRating: 4.8,
        evaluationCount: 3,
        issuesRaised: 0,
        issuesResolved: 0,
        activeIssues: 0,
      });

      assert.match(dispute.summary, /resolved dispute/i);
      assert.equal(dispute.summary.includes("contract"), false);
      assert.match(rating.summary, /4.8/);
    });

    it("derives availability from active contract workload", () => {
      const available = buildAvailabilitySummary({
        activeContracts: 0,
        providerStatus: "active",
      });
      const limited = buildAvailabilitySummary({
        activeContracts: 6,
        providerStatus: "active",
      });

      assert.equal(available.availableNow, true);
      assert.equal(available.statusLabel, "Available now");
      assert.equal(limited.availableNow, false);
      assert.equal(limited.statusLabel, "Limited availability");
    });

    it("projects a provider public profile view with S5 trust fields", () => {
      const trustProfile = buildTrustProfile({
        providerId: "provider-1",
        userId: "user-1",
        displayName: "Alpha Provider",
        verificationTier: "T2",
        events: [],
        generatedAt: FIXED_TIME,
      });

      const profile = buildProviderPublicProfile({
        identity: {
          providerId: "provider-1",
          userId: "user-1",
          displayName: "Alpha Provider",
          businessName: "Alpha LLC",
          bio: "Software delivery specialist",
          primaryTrade: "software engineer",
          slug: "alpha-provider",
          status: "active",
          verificationTier: "T2",
        },
        offeredActions: [
          { actionCode: "technology.code", actionName: "Software Development", confidence: 88 },
        ],
        trust: toTrustProfileView(trustProfile),
        metrics: {
          completedContracts: 0,
          cancelledContracts: 0,
          completionRate: 0,
          averageRating: 3,
          evaluationCount: 0,
          issuesRaised: 0,
          issuesResolved: 0,
          activeIssues: 0,
        },
        availability: {
          activeContracts: 0,
          providerStatus: "active",
        },
        generatedAt: FIXED_TIME,
      });

      const view = toProviderPublicProfileView(profile);
      assert.equal(view.user_id, "user-1");
      assert.equal(view.live_frame.tier, trustProfile.liveFrame.tier);
      assert.equal(view.badge.tier, trustProfile.badge.tier);
      assert.equal(view.offered_actions.length, 1);
      assert.equal(view.completion_summary.summary.includes("No completed"), true);
    });

    it("builds completion summary from contract metrics", () => {
      const summary = buildCompletionSummary({
        completedContracts: 5,
        cancelledContracts: 1,
        completionRate: 5 / 6,
        averageRating: 4.5,
        evaluationCount: 4,
        issuesRaised: 0,
        issuesResolved: 0,
        activeIssues: 0,
      });

      assert.match(summary.summary, /5 completed contracts/);
      assert.equal(summary.completionRate, 0.833);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("builds a public profile from identity and S5 trust data", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { trust, trustScore } = createTrustModule(db);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000401",
        idempotencyKey: "s6-contract-completed",
      });

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
        sourceEntityType: "evaluation",
        sourceEntityId: "00000000-0000-4000-8000-000000000402",
        payload: { rating: 5 },
        idempotencyKey: "s6-evaluation-submitted",
      });

      const providerProfile = createProviderProfileService({
        db,
        trustScore,
        actionIntelligence: createActionIntelligenceService(),
      });

      const profile = await providerProfile.getPublicProfileByUserId(parties.providerUserId);
      assert.ok(profile);
      assert.equal(profile.provider_id, parties.providerId);
      assert.equal(profile.user_id, parties.providerUserId);
      assert.equal(profile.completion_summary.completed_contracts, 1);
      assert.equal(profile.rating_summary.evaluation_count, 1);
      assert.ok(profile.live_frame.tier);
      assert.ok(profile.badge.badge_id);
    });

    it("exposes GET /providers/:userId/profile", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { providerProfile } = createProviderExperienceModule(db);
      const app = await buildProviderProfileTestServer(providerProfile);

      const response = await app.inject({
        method: "GET",
        url: `/providers/${parties.providerUserId}/profile`,
      });

      assert.equal(response.statusCode, 200);
      assert.equal(response.json().provider_id, parties.providerId);
      assert.ok(Array.isArray(response.json().offered_actions));
      assert.ok(response.json().availability.status_label);

      await app.close();
    });

    it("returns 404 for non-provider users", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      const { providerProfile } = createProviderExperienceModule(db);
      const app = await buildProviderProfileTestServer(providerProfile);

      const response = await app.inject({
        method: "GET",
        url: "/providers/00000000-0000-4000-8000-000000000999/profile",
      });

      assert.equal(response.statusCode, 404);
      await app.close();
    });
  });
});
