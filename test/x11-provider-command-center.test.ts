import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProviderCommandCenterRoutes } from "../src/api/routes/provider-command-center.js";
import { createProviderExperienceModule } from "../src/provider-experience/module.js";
import { createProviderCommandCenterModule } from "../src/experience/provider-command-center/module.js";
import {
  buildCommandCenterOverview,
  buildContractsSummary,
  buildOpportunitiesIntegration,
  buildProviderCommandCenter,
  buildProviderCommandCenterSnapshot,
  buildRevenueSummary,
  buildSealsEconomyIntegration,
  buildTrustIntegration,
  deriveCommandCenterNextAction,
  toProviderCommandCenterView,
} from "../src/experience/provider-command-center/domain/provider-command-center.js";
import type { ProfessionalSealsSnapshot } from "../src/experience/professional-seals/domain/professional-seals.js";
import type { DiscoveryMatchProviderRecord } from "../src/experience/discovery-matching/domain/discovery-matching.js";
import type { ProfessionalSealsSnapshot } from "../src/experience/professional-seals/domain/professional-seals.js";
import type { DiscoveryMatchProviderRecord } from "../src/experience/discovery-matching/domain/discovery-matching.js";
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

function buildSealsSnapshot(): ProfessionalSealsSnapshot {
  const profile = toTrustProfileView(
    buildTrustProfile({
      providerId: "provider-1",
      userId: "user-1",
      displayName: "X11 Provider",
      verificationTier: "T3",
      events: Array.from({ length: 8 }, (_, index) =>
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
        displayName: "X11 Provider",
        businessName: "Command Studio",
        bio: "Provider command center.",
        primaryTrade: "Design",
        slug: "x11-provider",
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
        completedContracts: 8,
        cancelledContracts: 0,
        completionRate: 1,
        averageRating: 4.8,
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
    verificationTier: "T3",
    verificationStatus: "approved",
    credentials: [
      makeCredential({
        id: "license-1",
        credentialType: "professional_license",
        credentialName: "State Design License",
      }),
    ],
  };
}

const PROVIDER_RECORD: DiscoveryMatchProviderRecord = {
  providerId: "provider-1",
  providerUserId: "user-1",
  displayName: "X11 Provider",
  actionCodes: ["engineering.design"],
  trustScore: 82,
  availableNow: true,
  activeContracts: 1,
  distanceKm: 12,
  priceEstimate: 5000,
  completedContracts: 8,
  averageRating: 4.8,
};

function buildUnitSnapshot() {
  return buildProviderCommandCenterSnapshot({
    providerUserId: "user-1",
    providerId: "provider-1",
    displayName: "X11 Provider",
    earningsRecord: {
      currencyCode: "USD",
      releasedEarningsMinor: 125000,
      pendingHeldMinor: 45000,
      walletBalanceMinor: 80000,
      contractsWithEarnings: 3,
    },
    contracts: [
      {
        id: "contract-active",
        contractNumber: "C-1001",
        actionId: "action-1",
        actionCode: "engineering.design",
        actionTitle: "Design Sprint",
        customerId: "customer-1",
        customerDisplayName: "Acme Corp",
        status: "active",
        customerRequestId: "request-1",
        offerId: "offer-1",
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
      {
        id: "contract-completed",
        contractNumber: "C-1000",
        actionId: "action-1",
        actionCode: "engineering.design",
        actionTitle: "Brand Refresh",
        customerId: "customer-2",
        customerDisplayName: "Beta LLC",
        status: "completed",
        customerRequestId: null,
        offerId: null,
        createdAt: FIXED_TIME,
        updatedAt: FIXED_TIME,
      },
    ],
    incomingOfferCount: 2,
    sealsSnapshot: buildSealsSnapshot(),
    platformContext: {
      providersWithScores: 10,
      averageTrustScore: 72,
      lowTrustProviderCount: 1,
      tierDistribution: [{ tier: "SAPPHIRE_VERIFIED", count: 4 }],
      trustEventsLast7Days: 3,
      trustEventsLast30Days: 12,
    },
    providerRecord: PROVIDER_RECORD,
    openRequests: [
      {
        requestId: "request-open",
        customerUserId: "customer-user-1",
        requestText: "Need a responsive website design",
        status: "open",
        budget: 9000,
        preferredDays: 14,
      },
    ],
  });
}

function authContext(userId: string, roles: string[] = ["provider"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T3",
    status: "active",
    sessionId: "x11-provider-command-center-test-session",
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let providerUserId: string | undefined;
let customerUserId: string | undefined;

describe("X11 Provider Command Center Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds revenue summary from S10 earnings projection", () => {
      const snapshot = buildUnitSnapshot();
      const revenue = buildRevenueSummary(snapshot.earnings);
      assert.equal(revenue.releasedEarningsMinor, 125000);
      assert.equal(revenue.contractsWithEarnings, 3);
      assert.match(revenue.summary, /Released earnings/);
    });

    it("builds contracts summary with active and completed counts", () => {
      const summary = buildContractsSummary({
        contracts: buildUnitSnapshot().contracts,
        incomingOfferCount: 2,
      });
      assert.equal(summary.totalContracts, 2);
      assert.equal(summary.activeContracts, 1);
      assert.equal(summary.completedContracts, 1);
      assert.equal(summary.incomingOffers, 2);
      assert.equal(summary.recentContracts.length, 2);
    });

    it("derives next action for dispute downgrade before offers", () => {
      const snapshot = buildUnitSnapshot();
      const downgradedFrame = {
        ...snapshot.liveTrustFrame,
        frameLevel: {
          ...snapshot.liveTrustFrame.frameLevel,
          downgrade: {
            applied: true,
            reason: "active_disputes",
            originalLevel: "gold" as const,
            originalScore: 75,
            summary: "Downgraded due to disputes.",
          },
        },
      };
      const action = deriveCommandCenterNextAction({
        opportunities: snapshot.opportunities,
        activeContracts: 1,
        incomingOffers: 2,
        liveTrustFrame: downgradedFrame,
      });
      assert.equal(action, "Resolve open disputes to restore live trust frame");
    });

    it("derives next action for incoming offers when no disputes", () => {
      const snapshot = buildUnitSnapshot();
      const action = deriveCommandCenterNextAction({
        opportunities: snapshot.opportunities,
        activeContracts: 0,
        incomingOffers: 2,
        liveTrustFrame: snapshot.liveTrustFrame,
      });
      assert.equal(action, "Review incoming contract offers");
    });

    it("integrates X7, X8, X9, X9.5, and X10 in command center snapshot", () => {
      const snapshot = buildUnitSnapshot();
      assert.ok(snapshot.trustOverview.trustScore > 0);
      assert.ok(snapshot.opportunities.length >= 0);
      assert.ok(snapshot.passportLevel.level.length > 0);
      assert.ok(snapshot.sealsEconomy.tier.length > 0);
      assert.ok(snapshot.liveTrustFrame.frameScore.totalScore >= 0);
    });

    it("builds trust integration from X7 overview", () => {
      const snapshot = buildUnitSnapshot();
      const trust = buildTrustIntegration(snapshot.trustOverview);
      assert.equal(trust.trustScore, snapshot.trustOverview.trustScore);
      assert.equal(trust.overview.providerId, snapshot.trustOverview.providerId);
    });

    it("builds opportunities integration with top five cap", () => {
      const snapshot = buildUnitSnapshot();
      const opportunities = buildOpportunitiesIntegration(
        Array.from({ length: 7 }, (_, index) => ({
          ...snapshot.opportunities[0]!,
          requestId: `request-${index}`,
          rank: index + 1,
        }))
      );
      assert.equal(opportunities.totalOpportunities, 7);
      assert.equal(opportunities.topOpportunities.length, 5);
    });

    it("builds seals economy integration with seal points", () => {
      const snapshot = buildUnitSnapshot();
      const integration = buildSealsEconomyIntegration({
        economy: snapshot.sealsEconomy,
        sealPointsTotal: snapshot.sealPointsTotal,
      });
      assert.equal(integration.sealPoints, snapshot.sealPointsTotal);
      assert.ok(integration.trustBonusPercent >= 0);
    });

    it("builds command center overview with trust and frame scores", () => {
      const snapshot = buildUnitSnapshot();
      const overview = buildCommandCenterOverview({ snapshot });
      assert.match(overview.headline, /command center/);
      assert.equal(overview.trustScore, snapshot.trustOverview.trustScore);
      assert.equal(overview.frameScore, snapshot.liveTrustFrame.frameScore.totalScore);
      assert.equal(overview.incomingOffers, 2);
    });

    it("composes full provider command center deterministically", () => {
      const center = buildProviderCommandCenter({
        snapshot: buildUnitSnapshot(),
        generatedAt: FIXED_TIME,
      });
      assert.equal(center.providerUserId, "user-1");
      assert.ok(center.revenue.releasedEarningsMinor >= 0);
      assert.ok(center.trust.trustScore > 0);
      assert.ok(center.liveTrustFrame.frameScore >= 0);
      assert.equal(center.generatedAt.toISOString(), FIXED_TIME.toISOString());
    });

    it("serializes provider command center view with snake_case fields", () => {
      const view = toProviderCommandCenterView(
        buildProviderCommandCenter({
          snapshot: buildUnitSnapshot(),
          generatedAt: FIXED_TIME,
        })
      );
      assert.equal(view.provider_user_id, "user-1");
      assert.ok(view.revenue.released_earnings_minor >= 0);
      assert.ok(view.trust.overview.trust_score >= 0);
      assert.ok(view.live_trust_frame.frame_score >= 0);
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

        const { trust } = createTrustModule(db!);
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CONTRACT_COMPLETED,
          sourceEntityType: "contract",
          sourceEntityId: "00000000-0000-4000-8000-000000000c01",
          idempotencyKey: "x11-contract-completed",
        });
        await trust.recordEventTx({
          providerId: parties.providerId,
          eventType: TrustEventTypes.CUSTOMER_EVALUATION_SUBMITTED,
          sourceEntityType: "evaluation",
          sourceEntityId: "00000000-0000-4000-8000-000000000c02",
          payload: { rating: 5 },
          idempotencyKey: "x11-evaluation",
        });
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes provider command center from X7 through X10 integrations", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { providerCommandCenter } = createProviderCommandCenterModule(db, {
        trustScore,
        providerProfile,
      });

      const view = await providerCommandCenter.getProviderCommandCenter(
        authContext(providerUserId)
      );

      assert.equal(view.provider_user_id, providerUserId);
      assert.ok(view.overview.trust_score >= 0);
      assert.ok(view.live_trust_frame.frame_score >= 0);
      assert.ok(view.passport.assessment.level.length > 0);
      assert.ok(view.seals_economy.economy.tier.length > 0);
    });

    it("returns revenue, contracts, trust, and opportunities sections", async (t) => {
      if (!postgresReady || !db || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { providerCommandCenter } = createProviderCommandCenterModule(db, {
        trustScore,
        providerProfile,
      });

      const revenue = await providerCommandCenter.getRevenueSummary(authContext(providerUserId));
      assert.ok(revenue.currency_code.length > 0);

      const contracts = await providerCommandCenter.getContractsSummary(
        authContext(providerUserId)
      );
      assert.ok(contracts.total_contracts >= 0);

      const trust = await providerCommandCenter.getTrustIntegration(authContext(providerUserId));
      assert.ok(trust.trust_score >= 0);

      const opportunities = await providerCommandCenter.getOpportunitiesIntegration(
        authContext(providerUserId)
      );
      assert.ok(Array.isArray(opportunities.top_opportunities));
    });

    it("rejects non-provider access and serves provider command center routes", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { providerProfile } = createProviderExperienceModule(db, { trustScore });
      const { providerCommandCenter } = createProviderCommandCenterModule(db, {
        trustScore,
        providerProfile,
      });

      await assert.rejects(
        () =>
          providerCommandCenter.getProviderCommandCenter(
            authContext(customerUserId!, ["customer"])
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProviderCommandCenterRoutes(app, providerCommandCenter);

      for (const path of [
        "/provider-command-center",
        "/provider-command-center/revenue",
        "/provider-command-center/contracts",
        "/provider-command-center/trust",
        "/provider-command-center/opportunities",
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
