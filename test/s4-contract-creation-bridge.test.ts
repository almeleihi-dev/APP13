import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  buildContractCreationResult,
  createContractCreationBridgeService,
  createContractInitiationService,
  mapDraftToCreationRequest,
  resolveEngineActionCode,
  validateDraftForCreation,
  type ContractDraftView,
} from "../src/contracts-experience/module.js";
import {
  createMarketplaceExperienceService,
  createMarketplaceService,
  type MarketplaceProviderRecord,
} from "../src/marketplace/module.js";
import { createMatchingService } from "../src/matching/module.js";
import { createActionIntelligenceService } from "../src/action-intelligence/module.js";
import { createActionService } from "../src/action/application/action-service.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  resetContractEngineData,
  runMigrations,
  seedPartyUsers,
  DEFAULT_DATABASE_URL,
  FULL_TEKRR_PROFILE,
} from "./helpers/postgres-integration.js";

const FIXED_TIME = new Date("2026-06-19T22:00:00.000Z");

const MARKETPLACE_FIXTURE: MarketplaceProviderRecord[] = [
  {
    providerId: "provider-alpha",
    displayName: "Alpha Tech",
    actionCodes: ["technology.code"],
    trustScore: 92,
    availableNow: true,
    distanceKm: 2,
    priceEstimate: 700,
    completedContractsForAction: 6,
    completedContracts: 14,
    averageRating: 4.9,
  },
];

function buildSampleDraft(overrides: Partial<ContractDraftView> = {}): ContractDraftView {
  return {
    draftId: "draft:customer-001:provider-alpha:technology.code:2026-06-19T22:00:00.000Z",
    providerSummary: {
      providerId: "provider-alpha",
      displayName: "Alpha Tech",
      trustScore: 92,
      trustTier: "EMERALD_PRO",
      liveFrameLabel: "Emerald Pro",
      completedContracts: 14,
      recommendationReason: "Alpha Tech was selected for contract initiation.",
      topActions: [
        {
          actionCode: "technology.code",
          actionName: "Technology — Code",
          confidence: 85,
        },
      ],
      reputationHighlights: [],
    },
    actionSummary: {
      actionCode: "technology.code",
      actionName: "Technology — Code",
      category: "technology",
      categoryLabel: "Technology",
      workCategoryExplanation: "Technology work on the APP13 action catalog.",
      actionConfidence: 85,
      confidenceExplanation: "Action confidence 85 for technology.code",
    },
    trustSummary: {
      trustScore: 92,
      explanation: "Trust score 92 reflects strong contract completion history and positive customer outcomes.",
      tier: "EMERALD_PRO",
    },
    liveFrameSummary: {
      tier: "EMERALD_PRO",
      color: "emerald",
      label: "Emerald Pro",
      explanation: "Emerald Pro live frame (EMERALD_PRO) signals low engagement risk based on the current trust score.",
      riskLevel: "low",
    },
    commercialTerms: {
      estimatedValue: 700,
      estimatedValueExplanation: "Estimated value 700 is derived from the provider's listed price estimate; no pricing engine is applied.",
      estimatedDuration: "1-3 weeks",
      estimatedDurationExplanation: "Estimated duration 1-3 weeks based on typical Technology engagement timelines.",
      providerTrustTier: "Emerald Pro",
      completedContracts: 14,
    },
    proposedTitle: "Technology — Code with Alpha Tech",
    proposedDescription: "Contract for Technology — Code services with Alpha Tech.",
    generatedAt: FIXED_TIME,
    ...overrides,
  };
}

function createUnitBridgeService() {
  return createContractCreationBridgeService({
    db: {} as DbPool,
    actions: {} as ReturnType<typeof createActionService>,
    contracts: {} as ReturnType<typeof createContractEngineService>,
    contractRepository,
    identityRepo: identityRepository,
  });
}

describe("S4.3 Contract Creation Bridge", () => {
  describe("projection layer (unit)", () => {
    it("maps draft fields to a contract creation request", () => {
      const draft = buildSampleDraft();
      const request = mapDraftToCreationRequest(draft, {
        customerId: "customer-001",
        providerId: "provider-alpha",
      });

      assert.equal(request.customerId, "customer-001");
      assert.equal(request.providerId, "provider-alpha");
      assert.equal(request.actionCode, "technology.code");
      assert.equal(request.title, draft.proposedTitle);
      assert.equal(request.description, draft.proposedDescription);
      assert.equal(request.estimatedValue, 700);
      assert.equal(request.estimatedDuration, "1-3 weeks");
    });

    it("rejects invalid drafts", () => {
      const invalid = buildSampleDraft({
        proposedTitle: "   ",
        commercialTerms: {
          ...buildSampleDraft().commercialTerms,
          estimatedValue: 0,
        },
      });

      const validation = validateDraftForCreation(invalid, {
        customerId: "customer-001",
        providerId: "provider-alpha",
      });

      assert.equal(validation.valid, false);
      assert.ok(validation.errors.includes("title is required"));
      assert.ok(validation.errors.includes("estimated value must be greater than 0"));
    });

    it("resolves marketplace action codes to engine action codes", () => {
      assert.equal(resolveEngineActionCode("technology.code"), "E.3.1");
      assert.equal(resolveEngineActionCode("E.3.1"), "E.3.1");
      assert.equal(resolveEngineActionCode("unknown.action"), undefined);
    });

    it("builds contract creation results deterministically", () => {
      const createdAt = FIXED_TIME;
      const first = buildContractCreationResult({
        contractId: "00000000-0000-4000-8000-000000000300",
        contractNumber: "CTR-2026-ABCD1234",
        status: "proposed",
        providerId: "provider-alpha",
        customerId: "customer-001",
        actionId: "00000000-0000-4000-8000-000000000301",
        createdAt,
        created: true,
      });
      const second = buildContractCreationResult({
        contractId: "00000000-0000-4000-8000-000000000300",
        contractNumber: "CTR-2026-ABCD1234",
        status: "proposed",
        providerId: "provider-alpha",
        customerId: "customer-001",
        actionId: "00000000-0000-4000-8000-000000000301",
        createdAt,
        created: true,
      });

      assert.deepEqual(first, second);
    });

    it("validates drafts through the bridge service wrapper", () => {
      const bridge = createUnitBridgeService();
      const validation = bridge.validateDraftForCreation(buildSampleDraft(), {
        customerId: "customer-001",
        providerId: "provider-alpha",
      });

      assert.equal(validation.valid, true);
      assert.ok(validation.request);
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

    it("creates a real contract from a valid draft through the contract engine", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetContractEngineData(db);
      const parties = await seedPartyUsers(db);

      const marketplaceExperience = createMarketplaceExperienceService({
        marketplace: createMarketplaceService({
          matching: createMatchingService(),
          actionIntelligence: createActionIntelligenceService(),
        }),
        matching: createMatchingService(),
        actionIntelligence: createActionIntelligenceService(),
      });
      const contractInitiation = createContractInitiationService({ marketplaceExperience });
      const bridge = createContractCreationBridgeService({
        db,
        actions: createActionService(db, identityRepository),
        contracts: createContractEngineService(db, identityRepository),
        contractRepository,
        identityRepo: identityRepository,
      });

      const providers: MarketplaceProviderRecord[] = [
        {
          providerId: parties.providerId,
          displayName: "Seeded Provider",
          actionCodes: ["technology.code"],
          trustScore: 92,
          availableNow: true,
          distanceKm: 2,
          priceEstimate: 700,
          completedContractsForAction: 6,
          completedContracts: 14,
          averageRating: 4.9,
        },
      ];

      const initiation = contractInitiation.startContractInitiation(
        {
          customerId: parties.customerId,
          providerId: parties.providerId,
          actionCode: "technology.code",
          createdAt: FIXED_TIME,
        },
        { providers, generatedAt: FIXED_TIME }
      )!;
      const draft = (await contractInitiation.buildContractDraftView(initiation, {
        providers,
        generatedAt: FIXED_TIME,
      }))!;

      const outcome = await bridge.createContractFromDraft({
        draft,
        customerId: parties.customerId,
        customerUserId: parties.customerUserId,
        providerId: parties.providerId,
        idempotencyKey: "s4-bridge-create-contract",
        tekrrProfile: FULL_TEKRR_PROFILE,
      });

      assert.equal(outcome.ok, true);
      if (!outcome.ok) return;

      assert.ok(outcome.result.contractId);
      assert.match(outcome.result.contractNumber, /^CTR-/);
      assert.equal(outcome.result.status, "proposed");
      assert.equal(outcome.result.providerId, parties.providerId);
      assert.equal(outcome.result.customerId, parties.customerId);
      assert.equal(outcome.result.created, true);

      const commercial = await db.query<{ commercial_terms: Record<string, unknown> }>(
        `SELECT commercial_terms FROM contract.contracts WHERE id = $1`,
        [outcome.result.contractId]
      );
      assert.equal(commercial.rows[0]?.commercial_terms.estimated_value, 700);
      assert.equal(commercial.rows[0]?.commercial_terms.estimated_duration, "1-3 weeks");
      assert.equal(commercial.rows[0]?.commercial_terms.draft_id, draft.draftId);
    });

    it("rejects invalid drafts before contract creation", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      await resetContractEngineData(db);
      const parties = await seedPartyUsers(db);
      const bridge = createContractCreationBridgeService({
        db,
        actions: createActionService(db, identityRepository),
        contracts: createContractEngineService(db, identityRepository),
        contractRepository,
        identityRepo: identityRepository,
      });

      const invalidDraft = buildSampleDraft({
        providerSummary: {
          ...buildSampleDraft().providerSummary,
          providerId: parties.providerId,
        },
        commercialTerms: {
          ...buildSampleDraft().commercialTerms,
          estimatedValue: -1,
        },
      });

      const outcome = await bridge.createContractFromDraft({
        draft: invalidDraft,
        customerId: parties.customerId,
        customerUserId: parties.customerUserId,
        providerId: parties.providerId,
        tekrrProfile: FULL_TEKRR_PROFILE,
      });

      assert.equal(outcome.ok, false);
      if (outcome.ok) return;
      assert.ok(outcome.validation.errors.length > 0);

      const contractCount = await db.query<{ count: string }>(
        `SELECT COUNT(*) AS count FROM contract.contracts`
      );
      assert.equal(contractCount.rows[0]?.count, "0");
    });
  });
});
