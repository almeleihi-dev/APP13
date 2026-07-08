import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProfessionalPassportRoutes } from "../src/api/routes/professional-passport.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createProfessionalPassportModule } from "../src/experience/professional-passport/module.js";
import {
  buildCertifications,
  buildIdentityProfile,
  buildLicenses,
  buildPassportLevelAssessment,
  buildPerformanceMetrics,
  buildProfessionalBadges,
  buildProfessionalPassport,
  buildPublicProfessionalPassport,
  buildVerificationStatusSummary,
  computePassportLevel,
  isCertificationCredential,
  isLicenseCredential,
  PASSPORT_LEVEL_ORDER,
  type ProfessionalPassportSnapshot,
} from "../src/experience/professional-passport/domain/professional-passport.js";
import {
  buildProviderPublicProfile,
  toProviderPublicProfileView,
} from "../src/provider-experience/domain/provider-profile.js";
import {
  TrustEventTypes,
  buildTrustHistory,
  buildTrustProfile,
  createTrustModule,
  toTrustHistoryView,
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

function makeCredential(partial: Partial<Credential> & Pick<Credential, "id" | "credentialType" | "credentialName">): Credential {
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

function buildSampleSnapshot(): ProfessionalPassportSnapshot {
  const profile = toTrustProfileView(
    buildTrustProfile({
      providerId: "provider-1",
      userId: "user-1",
      displayName: "X9 Provider",
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
        displayName: "X9 Provider",
        businessName: "X9 Studio",
        bio: "Professional design provider.",
        primaryTrade: "Design",
        slug: "x9-provider",
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
        evaluationCount: 8,
        issuesRaised: 0,
        issuesResolved: 0,
        activeIssues: 0,
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
    trustHistory: toTrustHistoryView(buildTrustHistory("provider-1", [])),
    verificationTier: "T3",
    verificationStatus: "approved",
    verificationReviewedAt: FIXED_TIME,
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
    platformContext: {
      providersWithScores: 12,
      averageTrustScore: 72,
      lowTrustProviderCount: 1,
      tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 5 }],
      trustEventsLast7Days: 4,
      trustEventsLast30Days: 15,
    },
  };
}

function authContext(userId: string, roles: string[] = ["provider"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T3",
    status: "active",
    sessionId: "x9-professional-passport-test-session",
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X9 Professional Passport Experience", () => {
  describe("domain layer (unit)", () => {
    it("classifies licenses and certifications from credential types", () => {
      const license = makeCredential({
        id: "l1",
        credentialType: "trade_license",
        credentialName: "Trade License",
      });
      const certification = makeCredential({
        id: "c1",
        credentialType: "certification",
        credentialName: "PMP",
      });
      assert.equal(isLicenseCredential(license), true);
      assert.equal(isCertificationCredential(certification), true);
    });

    it("computes passport levels deterministically", () => {
      assert.equal(
        computePassportLevel({
          trustScore: 40,
          verificationTier: "T0",
          completedContracts: 0,
          averageRating: 0,
          activeIssues: 0,
          verifiedCredentialCount: 0,
          verifiedLicenseCount: 0,
        }),
        "bronze"
      );
      assert.equal(
        computePassportLevel({
          trustScore: 88,
          verificationTier: "T3",
          completedContracts: 12,
          averageRating: 4.5,
          activeIssues: 0,
          verifiedCredentialCount: 2,
          verifiedLicenseCount: 1,
        }),
        "platinum"
      );
    });

    it("builds identity profile from S6 public profile", () => {
      const snapshot = buildSampleSnapshot();
      const identity = buildIdentityProfile(snapshot.publicProfile);
      assert.equal(identity.displayName, "X9 Provider");
      assert.equal(identity.offeredActions.length, 1);
    });

    it("builds verification status summary", () => {
      const snapshot = buildSampleSnapshot();
      const verification = buildVerificationStatusSummary({
        verificationTier: snapshot.verificationTier,
        verificationStatus: snapshot.verificationStatus,
        verificationReviewedAt: snapshot.verificationReviewedAt,
      });
      assert.equal(verification.tierLabel, "Business verified");
      assert.equal(verification.statusLabel, "Approved");
    });

    it("builds historical performance metrics with confidence band", () => {
      const snapshot = buildSampleSnapshot();
      const performance = buildPerformanceMetrics({
        profile: snapshot.publicProfile,
        trustProfile: snapshot.trustProfile,
      });
      assert.equal(performance.completedContracts, 12);
      assert.equal(performance.confidenceBand, "high");
      assert.ok(performance.trustScore > 0);
    });

    it("splits licenses and certifications", () => {
      const snapshot = buildSampleSnapshot();
      const licenses = buildLicenses(snapshot.credentials);
      const certifications = buildCertifications(snapshot.credentials);
      assert.equal(licenses.length, 1);
      assert.equal(certifications.length, 1);
    });

    it("builds professional badges including passport and trust badges", () => {
      const snapshot = buildSampleSnapshot();
      const passport = buildProfessionalPassport({ snapshot, generatedAt: FIXED_TIME });
      const badges = buildProfessionalBadges({
        passportLevel: passport.passportLevel,
        trustProfile: snapshot.trustProfile,
        credentials: snapshot.credentials,
        performance: passport.performance,
      });
      assert.ok(badges.some((badge) => badge.category === "passport_level"));
      assert.ok(badges.some((badge) => badge.category === "trust"));
      assert.ok(badges.some((badge) => badge.category === "credential"));
    });

    it("assesses passport level progress toward next tier", () => {
      const assessment = buildPassportLevelAssessment({
        trustScore: 88,
        verificationTier: "T3",
        completedContracts: 12,
        averageRating: 4.5,
        activeIssues: 0,
        verifiedCredentialCount: 2,
        verifiedLicenseCount: 1,
      });
      assert.equal(assessment.level, "platinum");
      assert.equal(assessment.nextLevel, "elite");
      assert.ok(assessment.progressPercent > 0);
    });

    it("orders passport levels bronze through elite", () => {
      assert.deepEqual(PASSPORT_LEVEL_ORDER, ["bronze", "silver", "gold", "platinum", "elite"]);
    });

    it("composes full professional passport with X7 trust overview", () => {
      const passport = buildProfessionalPassport({
        snapshot: buildSampleSnapshot(),
        generatedAt: FIXED_TIME,
      });
      assert.equal(passport.userId, "user-1");
      assert.equal(passport.trust.trustScore, passport.performance.trustScore);
      assert.equal(passport.passportLevel.level, "platinum");
      assert.equal(passport.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("builds safe public passport card", () => {
      const passport = buildProfessionalPassport({
        snapshot: buildSampleSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const card = buildPublicProfessionalPassport(passport);
      assert.equal(card.safe_for_public, true);
      assert.equal(card.passport_level, "platinum");
      assert.equal((card as { credentials?: unknown }).credentials, undefined);
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
          sourceEntityId: "00000000-0000-4000-8000-000000000901",
          idempotencyKey: "x9-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000902",
          payload: { rating: 5 },
          idempotencyKey: "x9-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes professional passport from S6, S5, and verification projections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalPassport } = createProfessionalPassportModule(db, {
        trustScore,
        providerProfile,
      });

      const view = await professionalPassport.getProfessionalPassport(
        authContext(providerUserId)
      );

      assert.equal(view.user_id, providerUserId);
      assert.ok(view.identity.display_name.length > 0);
      assert.ok(view.trust.trust_score >= 0);
      assert.ok(PASSPORT_LEVEL_ORDER.includes(view.passport_level.level));
    });

    it("returns level, performance, and credentials sections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalPassport } = createProfessionalPassportModule(db, {
        trustScore,
        providerProfile,
      });

      const level = await professionalPassport.getPassportLevel(authContext(providerUserId));
      assert.ok(level.label.length > 0);

      const performance = await professionalPassport.getPerformance(authContext(providerUserId));
      assert.ok(performance.completed_contracts >= 0);

      const credentials = await professionalPassport.getCredentials(authContext(providerUserId));
      assert.ok(Array.isArray(credentials.licenses));
      assert.ok(Array.isArray(credentials.certifications));
    });

    it("rejects non-provider access and serves passport routes", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalPassport } = createProfessionalPassportModule(db, {
        trustScore,
        providerProfile,
      });

      await assert.rejects(
        () =>
          professionalPassport.getProfessionalPassport(authContext(customerUserId!, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProfessionalPassportRoutes(app, professionalPassport);

      for (const path of [
        "/professional-passport",
        "/professional-passport/level",
        "/professional-passport/performance",
        "/professional-passport/credentials",
        `/professional-passport/public?user_id=${providerUserId}`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
