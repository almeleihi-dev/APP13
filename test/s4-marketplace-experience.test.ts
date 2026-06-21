import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  TrustEventTypes,
  createTrustModule,
} from "../src/trust/module.js";
import {
  createMarketplaceExperienceService,
  createMarketplaceService,
  type MarketplaceProviderRecord,
} from "../src/marketplace/module.js";
import { createMatchingService } from "../src/matching/module.js";
import { createActionIntelligenceService } from "../src/action-intelligence/module.js";
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

const MARKETPLACE_FIXTURE: MarketplaceProviderRecord[] = [
  {
    providerId: "provider-alpha",
    displayName: "Alpha Tech",
    actionCodes: ["technology.code", "technology.test"],
    trustScore: 92,
    availableNow: true,
    distanceKm: 2,
    priceEstimate: 700,
    completedContractsForAction: 6,
    completedContracts: 14,
    averageRating: 4.9,
  },
  {
    providerId: "provider-beta",
    displayName: "Beta Tech",
    actionCodes: ["technology.code", "technology.deploy"],
    trustScore: 78,
    availableNow: true,
    distanceKm: 8,
    priceEstimate: 850,
    completedContractsForAction: 3,
    completedContracts: 8,
    averageRating: 4.5,
  },
  {
    providerId: "provider-gamma",
    displayName: "Gamma Docs",
    actionCodes: ["technology.document"],
    trustScore: 85,
    availableNow: true,
    distanceKm: 4,
    priceEstimate: 600,
    completedContractsForAction: 4,
    completedContracts: 10,
    averageRating: 4.7,
  },
  {
    providerId: "provider-delta",
    displayName: "Delta Budget",
    actionCodes: ["technology.code"],
    trustScore: 55,
    availableNow: false,
    distanceKm: 18,
    priceEstimate: 450,
    completedContractsForAction: 1,
    completedContracts: 3,
    averageRating: 3.8,
  },
];

function createUnitExperienceService() {
  return createMarketplaceExperienceService({
    marketplace: createMarketplaceService({
      matching: createMatchingService(),
      actionIntelligence: createActionIntelligenceService(),
    }),
    matching: createMatchingService(),
    actionIntelligence: createActionIntelligenceService(),
  });
}

describe("S4.1 Marketplace Experience", () => {
  describe("projection layer (unit)", () => {
    it("projects provider cards with live frame and confidence fields", async () => {
      const experience = createUnitExperienceService();
      const marketplace = createMarketplaceService({
        matching: createMatchingService(),
        actionIntelligence: createActionIntelligenceService(),
      });

      const card = await marketplace.buildProviderCard(
        MARKETPLACE_FIXTURE[0]!,
        88,
        FIXED_TIME
      );
      const view = experience.buildProviderCardView(
        card,
        MARKETPLACE_FIXTURE[0]!,
        "technology.code"
      );

      assert.equal(view.providerId, "provider-alpha");
      assert.equal(view.liveFrameTier, "EMERALD_PRO");
      assert.equal(view.liveFrameColor, "emerald");
      assert.equal(view.liveFrameLabel, "Emerald Pro");
      assert.ok(view.averageActionConfidence > 0);
    });

    it("exposes ranking visibility with transparent explanations", async () => {
      const experience = createUnitExperienceService();
      const view = await experience.buildMarketplaceResultsView(
        { actionCode: "technology.code", generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );

      assert.equal(view.actionCode, "technology.code");
      assert.equal(view.results[0]?.rankingPosition, 1);
      assert.equal(view.results[0]?.providerId, "provider-alpha");
      assert.match(view.results[0]!.matchScoreExplanation, /Match score \d+/);
      assert.match(view.results[0]!.trustScoreExplanation, /Trust score 92/);
      assert.match(view.results[0]!.liveFrameExplanation, /Emerald Pro live frame/);
      assert.match(view.results[0]!.actionConfidenceExplanation, /Action confidence/);
      assert.ok(view.results[1]?.rankingComparison?.includes("Alpha Tech"));
    });

    it("surfaces trust and live frame in provider summary", async () => {
      const experience = createUnitExperienceService();
      const summary = await experience.buildProviderSummary(
        "provider-alpha",
        MARKETPLACE_FIXTURE,
        "technology.code"
      );

      assert.ok(summary);
      assert.equal(summary!.trustScore, 92);
      assert.match(summary!.trustExplanation, /Trust score 92/);
      assert.equal(summary!.liveFrameLabel, "Emerald Pro");
      assert.match(summary!.liveFrameExplanation, /Emerald Pro live frame/);
      assert.ok(summary!.topActions.length > 0);
      assert.ok(summary!.reputationHighlights.length > 0);
    });

    it("returns deterministic marketplace experience output", async () => {
      const experience = createUnitExperienceService();
      const input = { actionCode: "technology.code", generatedAt: FIXED_TIME };

      const first = await experience.buildMarketplaceResultsView(input, MARKETPLACE_FIXTURE);
      const second = await experience.buildMarketplaceResultsView(input, MARKETPLACE_FIXTURE);

      assert.deepEqual(first, second);
    });
  });

  describe("PostgreSQL integration", () => {
    let db: DbPool | undefined;
    let postgresReady = false;

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

    it("uses trust timeline highlights in provider summary", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { trust, reputationTimeline } = createTrustModule(db);
      const experience = createMarketplaceExperienceService({
        marketplace: createMarketplaceService({
          matching: createMatchingService(),
          actionIntelligence: createActionIntelligenceService(),
          trust,
        }),
        matching: createMatchingService(),
        actionIntelligence: createActionIntelligenceService(),
        reputationTimeline,
      });

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000200",
        idempotencyKey: "experience-trust-contract",
      });

      const providers: MarketplaceProviderRecord[] = [
        {
          providerId: parties.providerId,
          displayName: "Seeded Provider",
          actionCodes: ["technology.code"],
          availableNow: true,
          distanceKm: 5,
          priceEstimate: 800,
          completedContractsForAction: 2,
          completedContracts: 2,
          averageRating: 4.6,
        },
      ];

      const summary = await experience.buildProviderSummary(
        parties.providerId,
        providers,
        "technology.code"
      );

      assert.ok(summary);
      assert.ok(summary!.trustScore > 0);
      assert.equal(summary!.reputationHighlights[0]?.title, "Contract completed");
    });
  });
});
