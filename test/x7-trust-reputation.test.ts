import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerTrustReputationExperienceRoutes } from "../src/api/routes/trust-reputation.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createTrustReputationExperienceModule } from "../src/experience/trust-reputation/module.js";
import {
  buildTrustDrivers,
  buildTrustOverview,
  buildTrustProgress,
  buildTrustPublicCard,
  buildTrustReputationExperience,
  buildTrustReputationSummary,
  buildTrustTimeline,
} from "../src/experience/trust-reputation/domain/trust-reputation-experience.js";
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

function authContext(userId: string, roles: string[] = ["provider"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T2",
    status: "active",
    sessionId: "x7-trust-reputation-test-session",
  };
}

function buildSampleProfileView() {
  const profile = buildTrustProfile({
    providerId: "provider-1",
    userId: "user-1",
    displayName: "X7 Provider",
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

function buildSampleSnapshot() {
  const profile = buildSampleProfileView();
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

  return {
    profile,
    history,
    platformContext: {
      providersWithScores: 10,
      averageTrustScore: 72,
      lowTrustProviderCount: 1,
      tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 4 }],
      trustEventsLast7Days: 3,
      trustEventsLast30Days: 12,
    },
    verificationTier: "T2",
    inboxTrustEvents: [
      {
        eventId: "inbox-1",
        eventType: "trust_updated",
        title: "Trust score updated",
        description: "Your trust score changed after a completed contract.",
        occurredAt: new Date("2026-06-15T10:00:00.000Z"),
      },
    ],
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X7 Trust & Reputation Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds trust overview with platform context", () => {
      const snapshot = buildSampleSnapshot();
      const overview = buildTrustOverview({
        profile: snapshot.profile,
        platformContext: snapshot.platformContext,
        verificationTier: snapshot.verificationTier,
      });

      assert.equal(overview.userId, "user-1");
      assert.equal(overview.trustScore, snapshot.profile.trust_score);
      assert.equal(overview.platformAverageScore, 72);
      assert.match(overview.summary, /Trust score/);
    });

    it("derives positive and negative trust drivers from S5 breakdown", () => {
      const { positiveDrivers, negativeDrivers } = buildTrustDrivers(buildSampleProfileView());
      assert.ok(positiveDrivers.length > 0);
      assert.ok(positiveDrivers.every((driver) => driver.impact === "positive"));
      assert.ok(negativeDrivers.every((driver) => driver.impact === "negative"));
    });

    it("calculates progress to the next trust tier", () => {
      const progress = buildTrustProgress(82, "SAPPHIRE_VERIFIED");
      assert.equal(progress.nextTier, "EMERALD_PRO");
      assert.equal(progress.pointsToNextTier, 3);
      assert.equal(progress.atMaxTier, false);
    });

    it("marks platinum elite as max tier progress", () => {
      const progress = buildTrustProgress(98, "PLATINUM_ELITE");
      assert.equal(progress.atMaxTier, true);
      assert.equal(progress.progressPercent, 100);
    });

    it("builds 30-day trust timeline from history and inbox events", () => {
      const snapshot = buildSampleSnapshot();
      const timeline = buildTrustTimeline({
        history: snapshot.history,
        inboxEvents: snapshot.inboxTrustEvents,
        referenceDate: FIXED_TIME,
      });

      assert.equal(timeline.windowDays, 30);
      assert.ok(timeline.entries.length >= 3);
      assert.ok(timeline.entries.some((entry) => entry.source === "inbox"));
      assert.ok(timeline.entries.some((entry) => entry.source === "trust_history"));
    });

    it("builds reputation summary with deterministic label", () => {
      const snapshot = buildSampleSnapshot();
      const { positiveDrivers, negativeDrivers } = buildTrustDrivers(snapshot.profile);
      const timeline = buildTrustTimeline({
        history: snapshot.history,
        inboxEvents: snapshot.inboxTrustEvents,
        referenceDate: FIXED_TIME,
      });
      const reputation = buildTrustReputationSummary({
        profile: snapshot.profile,
        positiveDrivers,
        negativeDrivers,
        timeline,
      });

      assert.ok(reputation.reputationLabel.length > 0);
      assert.equal(reputation.positiveDriverCount, positiveDrivers.length);
    });

    it("builds safe public trust card without internal breakdown weights", () => {
      const snapshot = buildSampleSnapshot();
      const card = buildTrustPublicCard({
        provider_id: snapshot.profile.provider_id,
        user_id: snapshot.profile.user_id,
        display_name: snapshot.profile.display_name,
        verification_tier: "T2",
        trust_score: snapshot.profile.trust_score,
        live_frame: snapshot.profile.live_frame,
        badge: snapshot.profile.badge,
        trust_breakdown: snapshot.profile.breakdown,
        completion_summary: {
          completed_contracts: 2,
          completion_rate_percent: 100,
          summary: "Completed 2 contracts.",
        },
        dispute_summary: {
          open_issue_count: 0,
          resolved_issue_count: 0,
          summary: "No open disputes.",
        },
        rating_summary: {
          average_rating: 5,
          rating_count: 1,
          summary: "Average rating 5.0 from 1 evaluation.",
        },
        generated_at: FIXED_TIME.toISOString(),
      });

      assert.equal(card.safeForPublic, true);
      assert.equal(card.badgeLabel, snapshot.profile.badge.label);
      assert.equal((card as { trust_breakdown?: unknown }).trust_breakdown, undefined);
    });

    it("composes full trust reputation experience deterministically", () => {
      const experience = buildTrustReputationExperience({
        snapshot: buildSampleSnapshot(),
        generatedAt: FIXED_TIME,
      });

      assert.equal(experience.userId, "user-1");
      assert.equal(experience.overview.trustScore, buildSampleProfileView().trust_score);
      assert.ok(experience.positiveDrivers.length > 0);
      assert.equal(experience.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("returns empty timeline summary when no recent events exist", () => {
      const timeline = buildTrustTimeline({
        history: toTrustHistoryView(buildTrustHistory("provider-1", [])),
        inboxEvents: [],
        referenceDate: FIXED_TIME,
      });

      assert.equal(timeline.entries.length, 0);
      assert.match(timeline.summary, /No trust timeline entries/);
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
        customerUserId = parties.customerUserId;

        const { trust } = createTrustModule(db!);
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          sourceEntityType: "contract",
          sourceEntityId: "00000000-0000-4000-8000-000000000701",
          idempotencyKey: "x7-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000702",
          payload: { rating: 5 },
          idempotencyKey: "x7-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes trust reputation experience from S5 and platform projections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { trustReputationExperience } = createTrustReputationExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const view = await trustReputationExperience.getTrustExperience(
        authContext(providerUserId)
      );

      assert.equal(view.user_id, providerUserId);
      assert.ok(view.overview.trust_score >= 0);
      assert.ok(view.positive_drivers.length >= 0);
      assert.ok(view.timeline.entries.length >= 0);
    });

    it("returns drivers, progress, and timeline endpoints", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { trustReputationExperience } = createTrustReputationExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      const drivers = await trustReputationExperience.getDrivers(authContext(providerUserId));
      assert.ok(Array.isArray(drivers.positive_drivers));
      assert.ok(Array.isArray(drivers.negative_drivers));

      const progress = await trustReputationExperience.getProgress(authContext(providerUserId));
      assert.ok(progress.current_tier.length > 0);

      const timeline = await trustReputationExperience.getTimeline(authContext(providerUserId));
      assert.equal(timeline.window_days, 30);
    });

    it("rejects non-provider access and serves trust experience routes", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { trustReputationExperience } = createTrustReputationExperienceModule(db, {
        trustScore,
        providerProfile,
      });

      await assert.rejects(
        () => trustReputationExperience.getTrustExperience(authContext(customerUserId!, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerTrustReputationExperienceRoutes(app, trustReputationExperience);

      for (const path of [
        "/trust-experience",
        "/trust-experience/drivers",
        "/trust-experience/progress",
        "/trust-experience/timeline",
        `/trust-experience/public?user_id=${providerUserId}`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
