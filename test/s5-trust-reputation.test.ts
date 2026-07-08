import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerTrustReputationRoutes } from "../src/api/routes/trust.js";
import {
  S5_TRUST_SCORE_WEIGHTS,
  TrustEventTypes,
  buildTrustBreakdown,
  buildTrustHistory,
  buildTrustProfile,
  classifyTrustLiveFrame,
  createTrustModule,
  deriveS5TrustMetrics,
  scoreCustomerRating,
  scoreVerificationTier,
} from "../src/trust/module.js";
import type { TrustEvent } from "../src/trust/domain/trust-event.js";
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

function makeEvent(
  partial: Partial<TrustEvent> & Pick<TrustEvent, "eventType" | "id">
): TrustEvent {
  return {
    id: partial.id,
    providerId: partial.providerId ?? "provider-1",
    eventType: partial.eventType,
    sourceEntityType: partial.sourceEntityType ?? "contract",
    sourceEntityId: partial.sourceEntityId ?? partial.id,
    contractId: partial.contractId ?? "contract-1",
    payload: partial.payload ?? {},
    idempotencyKey: partial.idempotencyKey ?? `key-${partial.id}`,
    occurredAt: partial.occurredAt ?? FIXED_TIME,
    createdAt: partial.createdAt ?? FIXED_TIME,
  };
}

async function buildTrustReputationTestServer(trustScore: ReturnType<typeof createTrustModule>["trustScore"]) {
  const app = Fastify({ logger: false });
  app.decorateRequest("authContext", null);
  app.addHook("preHandler", async (request) => {
    request.authContext = TEST_AUTH_CONTEXT;
  });
  app.addHook("preHandler", requireAuthMiddleware);
  app.setErrorHandler(errorHandler);
  await registerTrustReputationRoutes(app, trustScore);
  return app;
}

let db: DbPool | undefined;
let postgresReady = false;

describe("S5 Trust & Reputation Experience", () => {
  describe("domain scoring (unit)", () => {
    it("uses APP13 S5 weights that sum to 100%", () => {
      const total =
        S5_TRUST_SCORE_WEIGHTS.verification +
        S5_TRUST_SCORE_WEIGHTS.customerRating +
        S5_TRUST_SCORE_WEIGHTS.completionRate +
        S5_TRUST_SCORE_WEIGHTS.cleanRecord;
      assert.ok(Math.abs(total - 1) < 0.0001);
    });

    it("maps verification tiers to S5 verification scores", () => {
      assert.equal(scoreVerificationTier("T0"), 20);
      assert.equal(scoreVerificationTier("T1"), 50);
      assert.equal(scoreVerificationTier("T4"), 100);
    });

    it("classifies S5 live frame tiers at required boundaries", () => {
      assert.equal(classifyTrustLiveFrame(100).tier, "PLATINUM_ELITE");
      assert.equal(classifyTrustLiveFrame(95).tier, "PLATINUM_ELITE");
      assert.equal(classifyTrustLiveFrame(94).tier, "EMERALD_PRO");
      assert.equal(classifyTrustLiveFrame(85).tier, "EMERALD_PRO");
      assert.equal(classifyTrustLiveFrame(84).tier, "SAPPHIRE_VERIFIED");
      assert.equal(classifyTrustLiveFrame(70).tier, "SAPPHIRE_VERIFIED");
      assert.equal(classifyTrustLiveFrame(69).tier, "STANDARD");
      assert.equal(classifyTrustLiveFrame(50).tier, "STANDARD");
      assert.equal(classifyTrustLiveFrame(49).tier, "RESTRICTED");
    });

    it("builds weighted trust breakdown from metrics", () => {
      const metrics = deriveS5TrustMetrics([], "T2");
      const breakdown = buildTrustBreakdown(metrics);

      assert.equal(breakdown.verificationScore, 70);
      assert.equal(breakdown.customerRatingScore, scoreCustomerRating(3));
      assert.equal(breakdown.weights.verification, 0.4);
      assert.equal(breakdown.weights.customerRating, 0.3);
      assert.equal(breakdown.weights.completionRate, 0.2);
      assert.equal(breakdown.weights.cleanRecord, 0.1);
      assert.equal(
        breakdown.totalScore,
        Math.round(
          breakdown.verificationScore * 0.4 +
            breakdown.customerRatingScore * 0.3 +
            breakdown.completionRateScore * 0.2 +
            breakdown.cleanRecordScore * 0.1
        )
      );
    });

    it("projects supported lifecycle events into trust history", () => {
      const events = [
        makeEvent({
          id: "e1",
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          occurredAt: new Date("2026-06-19T18:00:00.000Z"),
        }),
        makeEvent({
          id: "e2",
          eventType: TrustEventTypes.ISSUE_RAISED,
          sourceEntityType: "issue",
          occurredAt: new Date("2026-06-19T19:00:00.000Z"),
        }),
        makeEvent({
          id: "e3",
          eventType: TrustEventTypes.MILESTONE_ACCEPTED,
        }),
      ];

      const history = buildTrustHistory("provider-1", events);
      assert.equal(history.entries.length, 2);
      const eventTypes = history.entries.map((entry) => entry.eventType);
      assert.ok(eventTypes.includes(TrustEventTypes.CONTRACT_COMPLETED));
      assert.ok(eventTypes.includes(TrustEventTypes.ISSUE_RAISED));
    });

    it("builds a trust profile with badge and live frame", () => {
      const profile = buildTrustProfile({
        providerId: "provider-1",
        userId: "user-1",
        displayName: "Alpha Provider",
        verificationTier: "T3",
        events: [
          makeEvent({
            id: "completed-1",
            eventType: TrustEventTypes.CONTRACT_COMPLETED,
          }),
          makeEvent({
            id: "eval-1",
            eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
            payload: { rating: 5 },
          }),
        ],
        generatedAt: FIXED_TIME,
      });

      assert.equal(profile.displayName, "Alpha Provider");
      assert.equal(profile.badge.tier, profile.liveFrame.tier);
      assert.ok(profile.trustScore >= 70);
      assert.equal(profile.completedContracts, 1);
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

    it("persists S5 snapshot when supported trust events are recorded", async (t) => {
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
        sourceEntityId: "00000000-0000-4000-8000-000000000101",
        idempotencyKey: "s5-contract-completed",
      });

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
        sourceEntityType: "evaluation",
        sourceEntityId: "00000000-0000-4000-8000-000000000102",
        payload: { rating: 5 },
        idempotencyKey: "s5-evaluation-submitted",
      });

      const profile = await trustScore.getProfileByUserId(parties.providerUserId);
      assert.ok(profile);
      assert.equal(profile.user_id, parties.providerUserId);
      assert.equal(profile.completed_contracts, 1);
      assert.equal(profile.breakdown.weights.verification, 0.4);

      const snapshot = await db.query<{ dimension_scores: { s5?: { trust_score?: number } } }>(
        `
          SELECT dimension_scores
          FROM trust.trust_scores
          WHERE provider_id = $1
        `,
        [parties.providerId]
      );
      assert.ok(snapshot.rows[0]?.dimension_scores?.s5?.trust_score);
    });

    it("exposes profile, frame, and history routes by user id", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { trust, trustScore } = createTrustModule(db);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.ESCROW_RELEASED,
        sourceEntityType: "escrow",
        sourceEntityId: "00000000-0000-4000-8000-000000000201",
        idempotencyKey: "s5-escrow-released",
      });

      const app = await buildTrustReputationTestServer(trustScore);

      const profileResponse = await app.inject({
        method: "GET",
        url: `/trust/profile/${parties.providerUserId}`,
      });
      assert.equal(profileResponse.statusCode, 200);
      assert.equal(profileResponse.json().provider_id, parties.providerId);

      const frameResponse = await app.inject({
        method: "GET",
        url: `/trust/frame/${parties.providerUserId}`,
      });
      assert.equal(frameResponse.statusCode, 200);
      assert.equal(frameResponse.json().user_id, parties.providerUserId);
      assert.ok(frameResponse.json().tier);

      const historyResponse = await app.inject({
        method: "GET",
        url: `/trust/history/${parties.providerUserId}`,
      });
      assert.equal(historyResponse.statusCode, 200);
      assert.ok(historyResponse.json().entries.some(
        (entry: { event_type: string }) => entry.event_type === TrustEventTypes.ESCROW_RELEASED
      ));

      await app.close();
    });

    it("records contract cancellation as a supported trust event", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { trust } = createTrustModule(db);

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_CANCELLED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000301",
        idempotencyKey: "s5-contract-cancelled",
      });

      const history = await db.query<{ event_type: string }>(
        `
          SELECT event_type
          FROM trust.trust_score_events
          WHERE provider_id = $1 AND event_type = $2
        `,
        [parties.providerId, TrustEventTypes.CONTRACT_CANCELLED]
      );
      assert.equal(history.rows.length, 1);
    });
  });
});
