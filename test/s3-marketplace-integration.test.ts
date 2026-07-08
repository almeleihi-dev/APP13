import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  TrustEventTypes,
  createTrustModule,
} from "../src/trust/module.js";
import {
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

const FIXED_TIME = new Date("2026-06-19T18:00:00.000Z");

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

function createUnitMarketplaceService() {
  return createMarketplaceService({
    matching: createMatchingService(),
    actionIntelligence: createActionIntelligenceService(),
  });
}

describe("S3.8 Marketplace Integration", () => {
  describe("projection layer (unit)", () => {
    it("searches providers by action code", async () => {
      const marketplace = createUnitMarketplaceService();
      const results = await marketplace.searchProvidersByAction(
        { actionCode: "technology.code", generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );

      assert.deepEqual(
        results.map((card) => card.providerId),
        ["provider-alpha", "provider-beta", "provider-delta"]
      );
      assert.ok(results.every((card) => card.actionCodes.includes("technology.code")));
    });

    it("ranks providers by match score, trust score, and completed contracts", async () => {
      const marketplace = createUnitMarketplaceService();
      const ranked = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );

      assert.equal(ranked.results[0]?.providerId, "provider-alpha");
      assert.ok(ranked.results[0]!.matchScore >= ranked.results[1]!.matchScore);
      assert.ok(ranked.results[0]!.trustScore >= ranked.results[1]!.trustScore);
    });

    it("integrates live frame classification into provider cards", async () => {
      const marketplace = createUnitMarketplaceService();
      const card = await marketplace.buildProviderCard(
        MARKETPLACE_FIXTURE[0]!,
        88,
        FIXED_TIME
      );

      assert.equal(card.frameTier, "EMERALD_PRO");
      assert.equal(card.frameColor, "emerald");
      assert.equal(card.riskLevel, "low");
      assert.equal(card.trustScore, 92);
    });

    it("returns deterministic marketplace results", async () => {
      const marketplace = createUnitMarketplaceService();
      const first = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", limit: 10, generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );
      const second = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", limit: 10, generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );

      assert.deepEqual(first, second);
    });

    it("supports result limits of 10, 20, and 50", async () => {
      const marketplace = createUnitMarketplaceService();
      const expanded = Array.from({ length: 25 }, (_, index) => ({
        ...MARKETPLACE_FIXTURE[0]!,
        providerId: `provider-${index}`,
        displayName: `Provider ${index}`,
      }));

      const top10 = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", limit: 10, generatedAt: FIXED_TIME },
        expanded
      );
      const top20 = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", limit: 20, generatedAt: FIXED_TIME },
        expanded
      );

      assert.equal(top10.results.length, 10);
      assert.equal(top20.results.length, 20);
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

    it("uses trust engine scores and live frame in marketplace cards", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetS3TrustData(db);
      const parties = await seedPartyUsers(db);
      const { trust, liveFrame } = createTrustModule(db);
      const marketplace = createMarketplaceService({
        matching: createMatchingService(),
        actionIntelligence: createActionIntelligenceService(),
        trust,
        liveFrame,
      });

      await trust.recordEventTx({
        providerId: parties.providerId,
        eventType: TrustEventTypes.CONTRACT_COMPLETED,
        sourceEntityType: "contract",
        sourceEntityId: "00000000-0000-4000-8000-000000000100",
        idempotencyKey: "marketplace-trust-contract",
      });

      const lowerRankProviderId = "00000000-0000-4000-8000-000000000099";
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
        {
          providerId: lowerRankProviderId,
          displayName: "Lower Rank Provider",
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

      const ranked = await marketplace.getRankedMarketplaceResults(
        { actionCode: "technology.code", generatedAt: FIXED_TIME },
        providers
      );

      const seeded = ranked.results.find((card) => card.providerId === parties.providerId);
      assert.ok(seeded);
      assert.ok(seeded!.trustScore > 0);
      assert.ok(seeded!.frameTier.length > 0);
      assert.equal(seeded!.providerId, ranked.results[0]?.providerId);
    });
  });
});
