import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLiveFrameRoutes } from "../src/api/routes/live-frame.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createLiveFrameExperienceModule } from "../src/experience/live-frame/module.js";
import {
  buildFrameDrivers,
  buildFrameEvolution,
  buildFrameProgress,
  buildLiveFrameExperience,
} from "../src/experience/live-frame/domain/live-frame-experience.js";
import {
  TrustEventTypes,
  buildTrustHistory,
  buildTrustProfile,
  createTrustModule,
  toTrustHistoryView,
  toTrustProfileView,
} from "../src/trust/module.js";
import type { TrustEvent } from "../src/trust/domain/trust-event.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  seedPartyUsers,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { resetS3TrustData } from "./helpers/s3-trust-harness.js";

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

function authContext(userId: string): AuthContext {
  return {
    userId,
    roles: ["provider"],
    tier: "T2",
    status: "active",
    sessionId: "x2-live-frame-test-session",
  };
}

function buildSampleProfileView() {
  const profile = buildTrustProfile({
    providerId: "provider-1",
    userId: "user-1",
    displayName: "X2 Provider",
    verificationTier: "T2",
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

  return toTrustProfileView(profile);
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;

describe("X2 Live Frame Experience", () => {
  describe("domain layer (unit)", () => {
    it("calculates progress to the next live frame tier", () => {
      const progress = buildFrameProgress(82, "SAPPHIRE_VERIFIED");
      assert.equal(progress.currentTier, "SAPPHIRE_VERIFIED");
      assert.equal(progress.nextTier, "EMERALD_PRO");
      assert.equal(progress.pointsToNextTier, 3);
      assert.equal(progress.atMaxTier, false);
    });

    it("marks platinum elite as max tier progress", () => {
      const progress = buildFrameProgress(98, "PLATINUM_ELITE");
      assert.equal(progress.atMaxTier, true);
      assert.equal(progress.progressPercent, 100);
      assert.equal(progress.nextTier, null);
    });

    it("builds 30-day evolution buckets deterministically", () => {
      const history = toTrustHistoryView(
        buildTrustHistory("provider-1", [
          makeEvent({
            id: "positive-1",
            eventType: TrustEventTypes.CONTRACT_COMPLETED,
            occurredAt: new Date("2026-06-10T12:00:00.000Z"),
          }),
          makeEvent({
            id: "negative-1",
            eventType: TrustEventTypes.ISSUE_RAISED,
            sourceEntityType: "issue",
            occurredAt: new Date("2026-06-12T12:00:00.000Z"),
          }),
        ])
      );

      const evolution = buildFrameEvolution(history, 30, FIXED_TIME);
      assert.equal(evolution.windowDays, 30);
      assert.equal(evolution.positiveEventCount, 1);
      assert.equal(evolution.negativeEventCount, 1);
      assert.equal(evolution.netDirection, "stable");
      assert.equal(evolution.points.length, 2);
    });

    it("derives positive and negative frame drivers from breakdown", () => {
      const profile = buildSampleProfileView();
      const { positiveDrivers, negativeDrivers } = buildFrameDrivers(profile);
      assert.ok(positiveDrivers.length > 0);
      assert.ok(positiveDrivers.every((driver) => driver.impact === "positive"));
      assert.ok(negativeDrivers.every((driver) => driver.impact === "negative"));
    });

    it("builds unified live frame experience aggregate", () => {
      const profile = buildSampleProfileView();
      const history = toTrustHistoryView(buildTrustHistory("provider-1", []));
      const experience = buildLiveFrameExperience({
        profile,
        history,
        verificationTier: "T2",
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 4 }],
          trustEventsLast7Days: 3,
          trustEventsLast30Days: 12,
        },
        generatedAt: FIXED_TIME,
      });

      assert.equal(experience.userId, "user-1");
      assert.equal(experience.summary.tier, profile.live_frame.tier);
      assert.equal(experience.progress.currentTier, profile.live_frame.tier);
      assert.equal(experience.platformContext.averageTrustScore, 72);
      assert.equal(experience.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await resetS3TrustData(db);
        const parties = await seedPartyUsers(db);
        providerUserId = parties.providerUserId;

        const { trust } = createTrustModule(db!);
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          sourceEntityType: "contract",
          sourceEntityId: "00000000-0000-4000-8000-000000000201",
          idempotencyKey: "x2-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000202",
          payload: { rating: 5 },
          idempotencyKey: "x2-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes live frame experience from S5, S6, S11, and S14 projections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveFrameExperience } = createLiveFrameExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const frame = await liveFrameExperience.getLiveFrame(authContext(providerUserId));
      assert.equal(frame.user_id, providerUserId);
      assert.ok(frame.summary.trust_score >= 0);
      assert.ok(frame.identity.live_frame.tier);
      assert.ok(frame.progress.current_tier);
      assert.ok(Array.isArray(frame.positive_drivers));
      assert.ok(frame.platform_context.providers_with_scores >= 0);
    });

    it("returns progress and evolution endpoints", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveFrameExperience } = createLiveFrameExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const progress = await liveFrameExperience.getProgress(authContext(providerUserId));
      assert.ok(progress.current_score >= 0);
      assert.equal(typeof progress.progress_percent, "number");

      const evolution = await liveFrameExperience.getEvolution(authContext(providerUserId));
      assert.equal(evolution.window_days, 30);
      assert.ok(evolution.positive_event_count >= 1);
    });

    it("returns public live frame view and rejects missing provider", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveFrameExperience } = createLiveFrameExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const publicView = await liveFrameExperience.getPublic(providerUserId);
      assert.equal(publicView.user_id, providerUserId);
      assert.ok(publicView.live_frame.tier);
      assert.ok(publicView.trust_breakdown);

      await assert.rejects(
        () => liveFrameExperience.getPublic("00000000-0000-4000-8000-000000009999"),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );
    });

    it("serves authenticated live frame routes", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveFrameExperience } = createLiveFrameExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLiveFrameRoutes(app, liveFrameExperience);

      const frameResponse = await app.inject({ method: "GET", url: "/live-frame" });
      assert.equal(frameResponse.statusCode, 200);

      const progressResponse = await app.inject({ method: "GET", url: "/live-frame/progress" });
      assert.equal(progressResponse.statusCode, 200);

      const evolutionResponse = await app.inject({ method: "GET", url: "/live-frame/evolution" });
      assert.equal(evolutionResponse.statusCode, 200);

      const publicResponse = await app.inject({ method: "GET", url: "/live-frame/public" });
      assert.equal(publicResponse.statusCode, 200);

      await app.close();
    });
  });
});
