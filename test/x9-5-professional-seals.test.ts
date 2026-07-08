import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProfessionalSealsRoutes } from "../src/api/routes/professional-seals.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createProfessionalSealsModule } from "../src/experience/professional-seals/module.js";
import {
  buildCommunitySeals,
  buildExperienceSeals,
  buildProfessionalCategorySeals,
  buildProfessionalSealsProfile,
  buildPublicProfessionalSeals,
  buildRegulatorySeals,
  buildVerificationEconomy,
  computeEconomyTier,
  computeSealPoints,
  ECONOMY_TIER_BONUSES,
  ECONOMY_TIER_ORDER,
  groupSealsByCategory,
  SEAL_CATEGORIES,
  type ProfessionalSealsSnapshot,
} from "../src/experience/professional-seals/domain/professional-seals.js";
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

function buildSampleSnapshot(): ProfessionalSealsSnapshot {
  const profile = toTrustProfileView(
    buildTrustProfile({
      providerId: "provider-1",
      userId: "user-1",
      displayName: "X9.5 Provider",
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
        displayName: "X9.5 Provider",
        businessName: "Seals Studio",
        bio: "Verified professional.",
        primaryTrade: "Design",
        slug: "x9-5-provider",
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
        issuesRaised: 1,
        issuesResolved: 1,
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
    sessionId: "x9-5-professional-seals-test-session",
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X9.5 Professional Seals & Verification Economy", () => {
  describe("domain layer (unit)", () => {
    it("defines four seal categories", () => {
      assert.deepEqual(SEAL_CATEGORIES, ["regulatory", "professional", "experience", "community"]);
    });

    it("builds regulatory seals from verification tier and licenses", () => {
      const snapshot = buildSampleSnapshot();
      const seals = buildRegulatorySeals({
        verificationTier: snapshot.verificationTier,
        verificationStatus: snapshot.verificationStatus,
        credentials: snapshot.credentials,
      });
      assert.ok(seals.some((seal) => seal.category === "regulatory"));
      assert.ok(seals.some((seal) => seal.code === "verified_license"));
    });

    it("builds professional seals from certifications", () => {
      const seals = buildProfessionalCategorySeals({
        credentials: buildSampleSnapshot().credentials,
      });
      assert.equal(seals.length, 1);
      assert.equal(seals[0]?.category, "professional");
    });

    it("builds experience seals from contracts and trust frame", () => {
      const snapshot = buildSampleSnapshot();
      const seals = buildExperienceSeals({
        profile: snapshot.publicProfile,
        trustProfile: snapshot.trustProfile,
      });
      assert.ok(seals.some((seal) => seal.code === "contracts_10"));
      assert.ok(seals.some((seal) => seal.category === "experience"));
    });

    it("builds community seals from ratings and dispute record", () => {
      const seals = buildCommunitySeals({ profile: buildSampleSnapshot().publicProfile });
      assert.ok(seals.some((seal) => seal.code === "rating_45"));
      assert.ok(seals.some((seal) => seal.code === "clean_record"));
    });

    it("groups seals by category and computes seal points", () => {
      const snapshot = buildSampleSnapshot();
      const seals = [
        ...buildRegulatorySeals({
          verificationTier: snapshot.verificationTier,
          verificationStatus: snapshot.verificationStatus,
          credentials: snapshot.credentials,
        }),
        ...buildProfessionalCategorySeals({ credentials: snapshot.credentials }),
        ...buildExperienceSeals({
          profile: snapshot.publicProfile,
          trustProfile: snapshot.trustProfile,
        }),
        ...buildCommunitySeals({ profile: snapshot.publicProfile }),
      ];
      const grouped = groupSealsByCategory(seals);
      const points = computeSealPoints(seals);
      assert.ok(grouped.regulatory.length > 0);
      assert.ok(points.totalPoints > 0);
      assert.equal(
        points.totalPoints,
        points.regulatoryPoints +
          points.professionalPoints +
          points.experiencePoints +
          points.communityPoints
      );
    });

    it("computes economy tier from seal points", () => {
      assert.equal(computeEconomyTier(30), "starter");
      assert.equal(computeEconomyTier(120), "professional");
      assert.equal(computeEconomyTier(420), "elite");
    });

    it("computes trust, visibility, and pricing bonuses by economy tier", () => {
      const points = computeSealPoints(
        buildProfessionalSealsProfile({
          snapshot: buildSampleSnapshot(),
          generatedAt: FIXED_TIME,
        }).seals
      );
      const economy = buildVerificationEconomy({
        sealPoints: points,
        passportLevel: "platinum",
      });
      assert.equal(economy.trustBonusPercent, ECONOMY_TIER_BONUSES[economy.tier].trustBonusPercent);
      assert.equal(
        economy.visibilityBonusPercent,
        ECONOMY_TIER_BONUSES[economy.tier].visibilityBonusPercent
      );
      assert.equal(
        economy.pricingPremiumPercent,
        ECONOMY_TIER_BONUSES[economy.tier].pricingPremiumPercent
      );
    });

    it("orders economy tiers starter through elite", () => {
      assert.deepEqual(ECONOMY_TIER_ORDER, [
        "starter",
        "professional",
        "advanced",
        "expert",
        "elite",
      ]);
    });

    it("composes full professional seals profile deterministically", () => {
      const profile = buildProfessionalSealsProfile({
        snapshot: buildSampleSnapshot(),
        generatedAt: FIXED_TIME,
      });
      assert.equal(profile.userId, "user-1");
      assert.ok(profile.sealPoints.totalPoints > 0);
      assert.ok(profile.economy.tier.length > 0);
      assert.equal(profile.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("builds safe public seals card", () => {
      const profile = buildProfessionalSealsProfile({
        snapshot: buildSampleSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const card = buildPublicProfessionalSeals(profile);
      assert.equal(card.safe_for_public, true);
      assert.ok(card.top_seals.length > 0);
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
          sourceEntityId: "00000000-0000-4000-8000-000000000a01",
          idempotencyKey: "x9-5-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000a02",
          payload: { rating: 5 },
          idempotencyKey: "x9-5-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes professional seals profile from S6, S5, and credentials", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalSeals } = createProfessionalSealsModule(db, {
        trustScore,
        providerProfile,
      });

      const view = await professionalSeals.getProfessionalSealsProfile(
        authContext(providerUserId)
      );

      assert.equal(view.user_id, providerUserId);
      assert.ok(view.seals.length > 0);
      assert.ok(view.seal_points.total_points >= 0);
      assert.ok(ECONOMY_TIER_ORDER.includes(view.economy.tier));
    });

    it("returns categories, points, and economy sections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalSeals } = createProfessionalSealsModule(db, {
        trustScore,
        providerProfile,
      });

      const categories = await professionalSeals.getSealsByCategory(authContext(providerUserId));
      assert.ok(Array.isArray(categories.regulatory));

      const points = await professionalSeals.getSealPoints(authContext(providerUserId));
      assert.ok(points.total_points >= 0);

      const economy = await professionalSeals.getVerificationEconomy(authContext(providerUserId));
      assert.ok(economy.tier_label.length > 0);
    });

    it("rejects non-provider access and serves seals routes", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { professionalSeals } = createProfessionalSealsModule(db, {
        trustScore,
        providerProfile,
      });

      await assert.rejects(
        () =>
          professionalSeals.getProfessionalSealsProfile(authContext(customerUserId!, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProfessionalSealsRoutes(app, professionalSeals);

      for (const path of [
        "/professional-seals",
        "/professional-seals/categories",
        "/professional-seals/points",
        "/professional-seals/economy",
        `/professional-seals/public?user_id=${providerUserId}`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
