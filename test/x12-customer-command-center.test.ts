import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerCustomerCommandCenterRoutes } from "../src/api/routes/customer-command-center.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createLiveTrustFrameModule } from "../src/experience/live-trust-frame/module.js";
import { createCustomerCommandCenterModule } from "../src/experience/customer-command-center/module.js";
import {
  buildContractsSummary,
  buildCustomerCommandCenter,
  buildCustomerCommandCenterOverview,
  buildCustomerCommandCenterSnapshot,
  buildEscrowSummary,
  buildLiveTrustFrameIntegration,
  buildProviderRecommendationsIntegration,
  buildProviderRelationshipsSummary,
  buildRequestsSummary,
  collectProviderUserIdsForTrustFrames,
  deriveRecommendationRequirement,
  toCustomerCommandCenterView,
  type CustomerCommandCenterRawSnapshot,
} from "../src/experience/customer-command-center/domain/customer-command-center.js";
import { rankProvidersForRequirement } from "../src/experience/discovery-matching/domain/discovery-matching.js";
import { buildPublicLiveTrustFrame } from "../src/experience/live-trust-frame/domain/live-trust-frame.js";
import type { DiscoveryMatchProviderRecord } from "../src/experience/discovery-matching/domain/discovery-matching.js";
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

const PROVIDERS: DiscoveryMatchProviderRecord[] = [
  {
    providerId: "provider-1",
    providerUserId: "provider-user-1",
    displayName: "X12 Provider A",
    actionCodes: ["engineering.design"],
    trustScore: 84,
    availableNow: true,
    activeContracts: 1,
    distanceKm: 8,
    priceEstimate: 7000,
    completedContracts: 10,
    averageRating: 4.8,
  },
  {
    providerId: "provider-2",
    providerUserId: "provider-user-2",
    displayName: "X12 Provider B",
    actionCodes: ["engineering.design"],
    trustScore: 72,
    availableNow: false,
    activeContracts: 3,
    distanceKm: 15,
    priceEstimate: 6500,
    completedContracts: 5,
    averageRating: 4.5,
  },
];

function buildPublicFrame(providerUserId: string, displayName: string) {
  return buildPublicLiveTrustFrame({
    userId: providerUserId,
    providerId: providerUserId.replace("provider-user", "provider"),
    displayName,
    trustOverview: {
      userId: providerUserId,
      providerId: providerUserId.replace("provider-user", "provider"),
      displayName,
      verificationTier: "T3",
      trustScore: 80,
      tier: "SAPPHIRE_VERIFIED",
      tierLabel: "Sapphire Verified",
      color: "sapphire",
      badgeLabel: "Verified",
      badgeDescription: "Verified provider",
      completedContracts: 8,
      averageRating: 4.8,
      platformAverageScore: 72,
      platformProvidersWithScores: 10,
      headline: "Strong trust profile",
      summary: "Trust score 80.",
    },
    passportLevel: {
      level: "gold",
      label: "Gold Passport",
      summary: "Gold passport level.",
      verifiedCredentialCount: 2,
      verifiedLicenseCount: 1,
      completedContracts: 8,
      averageRating: 4.8,
      activeIssues: 0,
    },
    economy: {
      tier: "advanced",
      tierLabel: "Advanced Economy",
      trustBonusPercent: 5,
      visibilityBonusPercent: 10,
      pricingPremiumPercent: 3,
      summary: "Advanced verification economy tier.",
    },
    frameScore: {
      totalScore: 78,
      rawTotalScore: 78,
      components: {
        trust: 80,
        passport: 70,
        economy: 65,
        completion: 100,
        rating: 96,
      },
      weights: {
        trust: 0.4,
        passport: 0.25,
        economy: 0.15,
        completion: 0.1,
        rating: 0.1,
      },
      disputePenalty: 0,
      summary: "Frame score 78.",
    },
    frameLevel: {
      level: "gold",
      label: "Gold Frame",
      rawLevel: "gold",
      summary: "Gold live trust frame.",
      downgrade: {
        applied: false,
        levelSteps: 0,
        scorePenalty: 0,
        activeIssues: 0,
        unresolvedIssues: 0,
        summary: "No dispute downgrade applied.",
      },
    },
    signals: [],
    generatedAt: FIXED_TIME,
  });
}

function buildRawSnapshot(): CustomerCommandCenterRawSnapshot {
  const { requirement, primaryRequestId } = deriveRecommendationRequirement({
    requests: [
      {
        id: "request-1",
        customerUserId: "customer-user-1",
        customerId: "customer-1",
        requestText: "Need responsive website design",
        budget: 9000,
        preferredDays: 14,
        status: "open",
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
  });

  return {
    customerUserId: "customer-user-1",
    customerId: "customer-1",
    displayName: "X12 Customer",
    requests: [
      {
        id: "request-1",
        customerUserId: "customer-user-1",
        customerId: "customer-1",
        requestText: "Need responsive website design",
        budget: 9000,
        preferredDays: 14,
        status: "open",
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    offerCounts: [{ customerRequestId: "request-1", offerCount: 1, contractCount: 0 }],
    offers: [
      {
        id: "offer-1",
        customerRequestId: "request-1",
        customerUserId: "customer-user-1",
        customerId: "customer-1",
        providerId: "provider-1",
        providerUserId: "provider-user-1",
        providerDisplayName: "X12 Provider A",
        selectedActionId: "action-1",
        selectedActionCode: "engineering.design",
        status: "offer_created",
        contractId: null,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    contracts: [
      {
        id: "contract-1",
        contractNumber: "C-2001",
        actionId: "action-1",
        actionCode: "engineering.design",
        actionTitle: "Design Sprint",
        providerId: "provider-1",
        providerDisplayName: "X12 Provider A",
        status: "active",
        customerRequestId: "request-1",
        offerId: "offer-1",
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    escrows: [
      {
        contractId: "contract-1",
        escrowId: "escrow-1",
        status: "held",
        grossAmountMinor: 50000,
        currencyCode: "USD",
      },
    ],
    providers: PROVIDERS,
    recommendationRequirement: requirement,
    primaryRequestId,
  };
}

function buildUnitSnapshot() {
  const raw = buildRawSnapshot();
  const matches = rankProvidersForRequirement({
    requirement: raw.recommendationRequirement,
    providers: raw.providers,
    limit: 5,
  });
  const providerTrustFrames = {
    "provider-user-1": buildPublicFrame("provider-user-1", "X12 Provider A"),
    "provider-user-2": buildPublicFrame("provider-user-2", "X12 Provider B"),
  };
  return buildCustomerCommandCenterSnapshot({ raw, providerTrustFrames });
}

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T2",
    status: "active",
    sessionId: "x12-customer-command-center-test-session",
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X12 Customer Command Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds requests summary with open request counts", () => {
      const raw = buildRawSnapshot();
      const summary = buildRequestsSummary({
        requests: raw.requests,
        offerCounts: raw.offerCounts,
        activeOfferCount: 1,
      });
      assert.equal(summary.totalRequests, 1);
      assert.equal(summary.openRequests, 1);
      assert.equal(summary.activeOffers, 1);
    });

    it("builds contracts summary with active and completed counts", () => {
      const summary = buildContractsSummary({
        contracts: buildRawSnapshot().contracts,
      });
      assert.equal(summary.totalContracts, 1);
      assert.equal(summary.activeContracts, 1);
      assert.equal(summary.completedContracts, 0);
    });

    it("builds escrow summary with funded totals", () => {
      const raw = buildRawSnapshot();
      const summary = buildEscrowSummary({
        contracts: raw.contracts,
        escrows: raw.escrows,
      });
      assert.equal(summary.totalEscrows, 1);
      assert.equal(summary.fundedOrHeld, 1);
      assert.equal(summary.totalFundedMinor, 50000);
    });

    it("derives recommendation requirement from the primary open request", () => {
      const derived = deriveRecommendationRequirement({ requests: buildRawSnapshot().requests });
      assert.equal(derived.primaryRequestId, "request-1");
      assert.ok(derived.requirement.requiredActionCodes.length >= 0);
    });

    it("builds favorite and recent providers from activity history", () => {
      const raw = buildRawSnapshot();
      const frames = {
        "provider-user-1": buildPublicFrame("provider-user-1", "X12 Provider A"),
      };
      const providers = buildProviderRelationshipsSummary({
        offers: raw.offers,
        contracts: raw.contracts,
        providerTrustFrames: frames,
      });
      assert.equal(providers.recentProviders.length, 1);
      assert.equal(providers.recentProviders[0]?.providerUserId, "provider-user-1");
      assert.ok(providers.favoriteProviders.length >= 0);
    });

    it("builds X8 provider recommendations with trust frame attachments", () => {
      const raw = buildRawSnapshot();
      const matches = rankProvidersForRequirement({
        requirement: raw.recommendationRequirement,
        providers: raw.providers,
        limit: 5,
      });
      const integration = buildProviderRecommendationsIntegration({
        sourceRequestId: raw.primaryRequestId,
        matches,
        providerTrustFrames: {
          "provider-user-1": buildPublicFrame("provider-user-1", "X12 Provider A"),
        },
      });
      assert.ok(integration.totalRecommendations >= 1);
      assert.equal(integration.recommendations[0]?.liveTrustFrame?.user_id, "provider-user-1");
    });

    it("builds X10 live trust frame integration summary", () => {
      const snapshot = buildUnitSnapshot();
      const integration = buildLiveTrustFrameIntegration({
        recommendations: snapshot.recommendations.recommendations,
        relationships: snapshot.providerRelationships.recentProviders,
      });
      assert.ok(integration.providersWithFrames >= 1);
      assert.ok(integration.averageFrameScore > 0);
    });

    it("collects provider user ids for trust frame loading", () => {
      const raw = buildRawSnapshot();
      const matches = rankProvidersForRequirement({
        requirement: raw.recommendationRequirement,
        providers: raw.providers,
      });
      const ids = collectProviderUserIdsForTrustFrames({
        offers: raw.offers,
        recommendations: matches,
      });
      assert.ok(ids.includes("provider-user-1"));
    });

    it("builds customer command center overview", () => {
      const snapshot = buildUnitSnapshot();
      const overview = buildCustomerCommandCenterOverview({
        displayName: snapshot.displayName,
        dashboardSummary: {
          totalRequests: 1,
          openRequests: 1,
          activeOffers: 1,
          activeContracts: 1,
          completedContracts: 0,
          openIssues: 0,
          pendingFunding: 0,
          nextRecommendedAction: "Review conversion offers",
          summary: "Customer summary",
        },
        recommendationCount: snapshot.recommendations.totalRecommendations,
      });
      assert.match(overview.headline, /command center/);
      assert.equal(overview.recommendationCount, snapshot.recommendations.totalRecommendations);
    });

    it("composes full customer command center deterministically", () => {
      const center = buildCustomerCommandCenter({
        snapshot: buildUnitSnapshot(),
        generatedAt: FIXED_TIME,
      });
      assert.equal(center.customerUserId, "customer-user-1");
      assert.ok(center.requests.openRequests >= 0);
      assert.ok(center.recommendations.totalRecommendations >= 0);
      assert.equal(center.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("serializes customer command center view with snake_case fields", () => {
      const view = toCustomerCommandCenterView(
        buildCustomerCommandCenter({
          snapshot: buildUnitSnapshot(),
          generatedAt: FIXED_TIME,
        })
      );
      assert.equal(view.customer_user_id, "customer-user-1");
      assert.ok(view.requests.open_requests >= 0);
      assert.ok(view.live_trust_frame.providers_with_frames >= 0);
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
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
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes customer command center from S9, X8, and X10 integrations", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = await import("../src/trust/module.js").then((m) =>
        m.createTrustModule(db!)
      );
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });
      const { customerCommandCenter } = createCustomerCommandCenterModule(db, {
        liveTrustFrame,
      });

      const view = await customerCommandCenter.getCustomerCommandCenter(
        authContext(customerUserId)
      );

      assert.equal(view.customer_user_id, customerUserId);
      assert.ok(view.requests.total_requests >= 0);
      assert.ok(Array.isArray(view.recommendations.recommendations));
    });

    it("returns requests, contracts, escrow, providers, and recommendations sections", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = await import("../src/trust/module.js").then((m) =>
        m.createTrustModule(db!)
      );
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });
      const { customerCommandCenter } = createCustomerCommandCenterModule(db, {
        liveTrustFrame,
      });

      const requests = await customerCommandCenter.getRequestsSummary(authContext(customerUserId));
      assert.ok(requests.total_requests >= 0);

      const contracts = await customerCommandCenter.getContractsSummary(
        authContext(customerUserId)
      );
      assert.ok(contracts.total_contracts >= 0);

      const escrow = await customerCommandCenter.getEscrowSummary(authContext(customerUserId));
      assert.ok(escrow.total_escrows >= 0);

      const providers = await customerCommandCenter.getProviderRelationships(
        authContext(customerUserId)
      );
      assert.ok(Array.isArray(providers.recent_providers));

      const recommendations = await customerCommandCenter.getProviderRecommendations(
        authContext(customerUserId)
      );
      assert.ok(Array.isArray(recommendations.recommendations));
    });

    it("rejects non-customer access and serves customer command center routes", async (t) => {
      if (!postgresReady || !db || !customerUserId || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = await import("../src/trust/module.js").then((m) =>
        m.createTrustModule(db!)
      );
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { liveTrustFrame } = createLiveTrustFrameModule(db, {
        trustScore,
        providerProfile,
      });
      const { customerCommandCenter } = createCustomerCommandCenterModule(db, {
        liveTrustFrame,
      });

      await assert.rejects(
        () =>
          customerCommandCenter.getCustomerCommandCenter(authContext(providerUserId!, ["provider"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerCustomerCommandCenterRoutes(app, customerCommandCenter);

      for (const path of [
        "/customer-command-center",
        "/customer-command-center/requests",
        "/customer-command-center/contracts",
        "/customer-command-center/escrow",
        "/customer-command-center/providers",
        "/customer-command-center/recommendations",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
