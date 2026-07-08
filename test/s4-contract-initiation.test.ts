import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  createContractInitiationService,
  type MarketplaceProviderRecord,
} from "../src/contracts-experience/module.js";
import {
  createMarketplaceExperienceService,
  createMarketplaceService,
} from "../src/marketplace/module.js";
import { createMatchingService } from "../src/matching/module.js";
import { createActionIntelligenceService } from "../src/action-intelligence/module.js";

const FIXED_TIME = new Date("2026-06-19T21:00:00.000Z");

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
];

function createUnitContractInitiationService() {
  const marketplaceExperience = createMarketplaceExperienceService({
    marketplace: createMarketplaceService({
      matching: createMatchingService(),
      actionIntelligence: createActionIntelligenceService(),
    }),
    matching: createMatchingService(),
    actionIntelligence: createActionIntelligenceService(),
  });

  return createContractInitiationService({ marketplaceExperience });
}

describe("S4.2 Contract Initiation Experience", () => {
  describe("projection layer (unit)", () => {
    it("starts contract initiation from provider and action selection", () => {
      const service = createUnitContractInitiationService();
      const initiation = service.startContractInitiation(
        {
          customerId: "customer-001",
          providerId: "provider-alpha",
          actionCode: "technology.code",
          createdAt: FIXED_TIME,
        },
        { providers: MARKETPLACE_FIXTURE, generatedAt: FIXED_TIME }
      );

      assert.ok(initiation);
      assert.equal(initiation!.providerId, "provider-alpha");
      assert.equal(initiation!.estimatedValue, 700);
      assert.equal(initiation!.estimatedDuration, "1-3 weeks");
      assert.match(initiation!.proposedTitle, /Alpha Tech/);
    });

    it("builds contract draft view with provider, action, trust, and live frame summaries", async () => {
      const service = createUnitContractInitiationService();
      const context = { providers: MARKETPLACE_FIXTURE, generatedAt: FIXED_TIME };
      const initiation = service.startContractInitiation(
        {
          customerId: "customer-001",
          providerId: "provider-alpha",
          actionCode: "technology.code",
          createdAt: FIXED_TIME,
        },
        context
      )!;

      const draft = await service.buildContractDraftView(initiation, context);

      assert.ok(draft);
      assert.match(draft!.draftId, /^draft:customer-001:provider-alpha:technology.code:/);
      assert.equal(draft!.providerSummary.displayName, "Alpha Tech");
      assert.equal(draft!.actionSummary.actionCode, "technology.code");
      assert.equal(draft!.trustSummary.trustScore, 92);
      assert.equal(draft!.liveFrameSummary.label, "Emerald Pro");
      assert.equal(draft!.commercialTerms.estimatedValue, 700);
      assert.equal(draft!.commercialTerms.providerTrustTier, "Emerald Pro");
      assert.equal(draft!.commercialTerms.completedContracts, 14);
    });

    it("builds provider contract summary with recommendation context", async () => {
      const service = createUnitContractInitiationService();
      const marketplaceExperience = createMarketplaceExperienceService({
        marketplace: createMarketplaceService({
          matching: createMatchingService(),
          actionIntelligence: createActionIntelligenceService(),
        }),
        matching: createMatchingService(),
        actionIntelligence: createActionIntelligenceService(),
      });
      const results = await marketplaceExperience.buildMarketplaceResultsView(
        { actionCode: "technology.code", generatedAt: FIXED_TIME },
        MARKETPLACE_FIXTURE
      );

      const summary = await service.buildProviderContractSummary(
        "provider-alpha",
        "technology.code",
        {
          providers: MARKETPLACE_FIXTURE,
          selectedProviderCard: results.results[0],
          generatedAt: FIXED_TIME,
        }
      );

      assert.ok(summary);
      assert.match(summary!.recommendationReason, /Alpha Tech was selected/);
      assert.match(summary!.recommendationReason, /Trust score 92/);
      assert.match(summary!.recommendationReason, /Match score/);
      assert.equal(summary!.trustTier, "EMERALD_PRO");
    });

    it("returns deterministic contract draft output", async () => {
      const service = createUnitContractInitiationService();
      const context = { providers: MARKETPLACE_FIXTURE, generatedAt: FIXED_TIME };
      const input = {
        customerId: "customer-001",
        providerId: "provider-alpha",
        actionCode: "technology.code",
        createdAt: FIXED_TIME,
      };
      const initiation = service.startContractInitiation(input, context)!;

      const first = await service.buildContractDraftView(initiation, context);
      const second = await service.buildContractDraftView(initiation, context);

      assert.deepEqual(first, second);
    });

    it("rejects initiation when provider does not support the action", () => {
      const service = createUnitContractInitiationService();
      const initiation = service.startContractInitiation(
        {
          customerId: "customer-001",
          providerId: "provider-beta",
          actionCode: "technology.test",
          createdAt: FIXED_TIME,
        },
        { providers: MARKETPLACE_FIXTURE, generatedAt: FIXED_TIME }
      );

      assert.equal(initiation, null);
    });
  });
});
