import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerLiveTrustFrameRoutes } from "../src/api/routes/live-trust-frame.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createLiveTrustFrameModule } from "../src/experience/live-trust-frame/module.js";
import {
  applyDisputeDowngrade,
  buildFrameScoreComponents,
  buildFrameSignals,
  buildLiveTrustFrameExperience,
  buildLiveTrustFrameSnapshot,
  buildPublicLiveTrustFrame,
  calculateFrameTotalScore,
  computeFrameLevelFromScore,
  FRAME_SCORE_WEIGHTS,
  FRAME_LEVEL_ORDER,
} from "../src/experience/live-trust-frame/domain/live-trust-frame.js";
import type { ProfessionalSealsSnapshot } from "../src/experience/professional-seals/domain/professional-seals.js";
import {
  buildProviderPublicProfile,
  toProviderPublicProfileView,
} from "../src/provider-experience/domain/provider-profile.js";
import {
  TrustEventTypes,
  buildTrustProfile,
  createTrustModule,
  toTrustProfileView,
} from "../src/trust/module.js";
import type { TrustEvent } from "../src/trust/domain/trust-event.js";
import type { Credential } from "../src/identity/domain/user.js";
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

function makeCredential(
  partial: Partial<Credential> & Pick<Credential, "id" | "credentialType" | "credentialName">
): Credential {
  return {
    id: partial.id,
    providerId: partial.providerId ?? "provider-1",
    verificationId: partial.verificationId ?? null,
    credentialType: partial.credentialType,
    credentialName: partial.credentialName,
    issuingAuthority: partial.issuingAuthority ?? "State Board",
    credentialNumber: partial.credentialNumber ?? null,
    status: partial.status ?? "verified",
    issuedAt: partial.issuedAt ?? FIXED_TIME,
    expiresAt: partial.expiresAt ?? null,
    storageKey: partial.storageKey ?? null,
    metadata: partial.metadata ?? {},
    createdAt: partial.createdAt ?? FIXED_TIME,
    updatedAt: partial.updatedAt ?? FIXED_TIME,
  };
}

function buildSealsSnapshot(overrides?: {
  activeIssues?: number;
  issuesRaised?: number;
  issuesResolved?: number;
}): ProfessionalSealsSnapshot {
  const profile = toTrustProfileView(
    buildTrustProfile({
      providerId: "provider-1",
      userId: "user-1",
      displayName: "X10 Provider",
      verificationTier: "T3",
      events: Array.from({ length: 12 }, (_, index) =>
        makeEvent({
          id: `completed-${index}`,
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
        })
      ).concat([
        makeEvent({
          id: "eval-1",
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          payload: { rating: 5 },
        }),
      ]),
      generatedAt: FIXED_TIME,
    })
  );

  const publicProfile = toProviderPublicProfileView(
    buildProviderPublicProfile({
      identity: {
        providerId: "provider-1",
        userId: "user-1",
        displayName: "X10 Provider",
        businessName: "Frame Studio",
        bio: "Live trust frame provider.",
        primaryTrade: "Design",
        slug: "x10-provider",
        status: "active",
        verificationTier: "T3",
      },
      offeredActions: [
        {
          actionCode: "engineering.design",
          actionName: "Engineering — Design",
          confidence: 90,
        },
      ],
      trust: profile,
      metrics: {
        completedContracts: 12,
        cancelledContracts: 0,
        completionRate: 1,
        averageRating: 4.9,
        evaluationCount: 10,
        issuesRaised: overrides?.issuesRaised ?? 0,
        issuesResolved: overrides?.issuesResolved ?? 0,
        activeIssues: overrides?.activeIssues ?? 0,
      },
      availability: {
        activeContracts: 1,
        providerStatus: "active",
      },
      generatedAt: FIXED_TIME,
    })
  );

  return {
    publicProfile,
    trustProfile: profile,
    verificationTier: "T3",
    verificationStatus: "approved",
    credentials: [
      makeCredential({
        id: "license-1",
        credentialType: "professional_license",
        credentialName: "State Design License",
      }),
      makeCredential({
        id: "cert-1",
        credentialType: "certification",
        credentialName: "Certified UX Professional",
      }),
    ],
  };
}

function authContext(userId: string, roles: string[] = ["provider"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T3",
    status: "active",
    sessionId: "x10-live-trust-frame-test-session",
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X10 Live Trust Frame Experience", () => {
  describe("domain layer (unit)", () => {
    it("uses X10 frame score weights that sum to 100%", () => {
      const total =
        FRAME_SCORE_WEIGHTS.trust +
        FRAME_SCORE_WEIGHTS.passport +
        FRAME_SCORE_WEIGHTS.economy +
        FRAME_SCORE_WEIGHTS.completion +
        FRAME_SCORE_WEIGHTS.rating;
      assert.equal(total, 1);
      assert.equal(FRAME_SCORE_WEIGHTS.trust, 0.4);
      assert.equal(FRAME_SCORE_WEIGHTS.passport, 0.25);
    });

    it("builds weighted frame score components from X7/X9/X9.5 inputs", () => {
      const components = buildFrameScoreComponents({
        trustScore: 88,
        passportLevel: "platinum",
        economyTier: "expert",
        completionRate: 1,
        averageRating: 4.9,
      });
      assert.equal(components.trust, 88);
      assert.equal(components.passport, 85);
      assert.equal(components.economy, 80);
    });

    it("calculates deterministic frame total score", () => {
      const components = buildFrameScoreComponents({
        trustScore: 80,
        passportLevel: "gold",
        economyTier: "advanced",
        completionRate: 1,
        averageRating: 5,
      });
      const total = calculateFrameTotalScore(components);
      assert.equal(
        total,
        Math.round(
          components.trust * 0.4 +
            components.passport * 0.25 +
            components.economy * 0.15 +
            components.completion * 0.1 +
            components.rating * 0.1
        )
      );
    });

    it("maps frame levels from score thresholds", () => {
      assert.equal(computeFrameLevelFromScore(45), "bronze");
      assert.equal(computeFrameLevelFromScore(58), "silver");
      assert.equal(computeFrameLevelFromScore(72), "gold");
      assert.equal(computeFrameLevelFromScore(85), "platinum");
      assert.equal(computeFrameLevelFromScore(92), "elite");
    });

    it("applies dispute downgrade rules to level and score", () => {
      const downgraded = applyDisputeDowngrade({
        frameLevel: "platinum",
        frameScore: 85,
        activeIssues: 2,
        issuesRaised: 3,
        issuesResolved: 1,
      });
      assert.equal(downgraded.frameLevel, "silver");
      assert.equal(downgraded.frameScore, 55);
      assert.equal(downgraded.downgrade.applied, true);
    });

    it("integrates X7, X9, and X9.5 into live trust frame snapshot", () => {
      const snapshot = buildLiveTrustFrameSnapshot({
        sealsSnapshot: buildSealsSnapshot(),
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 4 }],
          trustEventsLast7Days: 3,
          trustEventsLast30Days: 12,
        },
      });
      assert.ok(snapshot.trustOverview.trustScore > 0);
      assert.ok(snapshot.passportLevel.level.length > 0);
      assert.ok(snapshot.economy.tier.length > 0);
    });

    it("builds frame score breakdown with dispute penalty", () => {
      const snapshot = buildLiveTrustFrameSnapshot({
        sealsSnapshot: buildSealsSnapshot({ activeIssues: 1 }),
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [],
          trustEventsLast7Days: 0,
          trustEventsLast30Days: 0,
        },
      });
      const experience = buildLiveTrustFrameExperience({ snapshot, generatedAt: FIXED_TIME });
      assert.ok(experience.frameScore.rawTotalScore >= experience.frameScore.totalScore);
      assert.ok(experience.frameScore.disputePenalty > 0);
    });

    it("exposes frame signals across trust, passport, economy, and dispute", () => {
      const snapshot = buildLiveTrustFrameSnapshot({
        sealsSnapshot: buildSealsSnapshot(),
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [],
          trustEventsLast7Days: 0,
          trustEventsLast30Days: 0,
        },
      });
      const experience = buildLiveTrustFrameExperience({ snapshot, generatedAt: FIXED_TIME });
      const signals = buildFrameSignals({
        trustOverview: experience.trustOverview,
        passportLevel: experience.passportLevel,
        economy: experience.economy,
        components: experience.frameScore.components,
        downgrade: experience.frameLevel.downgrade,
        publicProfile: snapshot.publicProfile,
      });
      assert.ok(signals.some((signal) => signal.category === "trust"));
      assert.ok(signals.some((signal) => signal.category === "passport"));
      assert.ok(signals.some((signal) => signal.category === "economy"));
    });

    it("orders frame levels bronze through elite", () => {
      assert.deepEqual(FRAME_LEVEL_ORDER, ["bronze", "silver", "gold", "platinum", "elite"]);
    });

    it("composes full live trust frame experience deterministically", () => {
      const snapshot = buildLiveTrustFrameSnapshot({
        sealsSnapshot: buildSealsSnapshot(),
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [],
          trustEventsLast7Days: 0,
          trustEventsLast30Days: 0,
        },
      });
      const experience = buildLiveTrustFrameExperience({ snapshot, generatedAt: FIXED_TIME });
      assert.equal(experience.userId, "user-1");
      assert.ok(experience.signals.length > 0);
      assert.equal(experience.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("builds safe public live trust frame card", () => {
      const snapshot = buildLiveTrustFrameSnapshot({
        sealsSnapshot: buildSealsSnapshot(),
        platformContext: {
          providersWithScores: 10,
          averageTrustScore: 72,
          lowTrustProviderCount: 1,
          tierDistribution: [],
          trustEventsLast7Days: 0,
          trustEventsLast30Days: 0,
        },
      });
      const experience = buildLiveTrustFrameExperience({ snapshot, generatedAt: FIXED_TIME });
      const card = buildPublicLiveTrustFrame(experience);
      assert.equal(card.safe_for_public, true);
      assert.ok(card.top_signals.length > 0);
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
          sourceEntityId: "00000000-0000-4000-8000-000000000b01",
          idempotencyKey: "x10-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000b02",
          payload: { rating: 5 },
          idempotencyKey: "x10-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes live trust frame from X7, X9, and X9.5 projections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });

      const view = await liveTrustFrame.getLiveTrustFrame(authContext(providerUserId));

      assert.equal(view.user_id, providerUserId);
      assert.ok(view.trust_overview.trust_score >= 0);
      assert.ok(FRAME_LEVEL_ORDER.includes(view.frame_level.level));
      assert.ok(view.signals.length > 0);
    });

    it("returns score, level, and signals sections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });

      const score = await liveTrustFrame.getFrameScore(authContext(providerUserId));
      assert.ok(score.total_score >= 0);

      const level = await liveTrustFrame.getFrameLevel(authContext(providerUserId));
      assert.ok(level.label.length > 0);

      const signals = await liveTrustFrame.getFrameSignals(authContext(providerUserId));
      assert.ok(Array.isArray(signals));
    });

    it("rejects non-provider access and serves live trust frame routes", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });

      await assert.rejects(
        () => liveTrustFrame.getLiveTrustFrame(authContext(customerUserId!, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerLiveTrustFrameRoutes(app, liveTrustFrame);

      for (const path of [
        "/live-trust-frame",
        "/live-trust-frame/score",
        "/live-trust-frame/level",
        "/live-trust-frame/signals",
        `/live-trust-frame/public?user_id=${providerUserId}`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
