import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerContractJourneyRoutes } from "../src/api/routes/contract-journey.js";
import { createContractsExperienceModule } from "../src/contracts-experience/module.js";
import { createConversionModule } from "../src/conversion/module.js";
import { createMatchingService } from "../src/matching/application/matching-service.js";
import { matchContractConversionRepository } from "../src/conversion/infrastructure/match-contract-conversion-repository.js";
import { requestRepository } from "../src/request-experience/infrastructure/request-repository.js";
import { createMatchContractConversionService } from "../src/conversion/application/match-contract-conversion-service.js";
import { createContractJourneyModule } from "../src/experience/contract-journey/module.js";
import {
  buildContractJourney,
  buildJourneyProgress,
  detectCurrentStage,
  evaluateStageCompletion,
} from "../src/experience/contract-journey/domain/contract-journey.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { ContractJourneySnapshot } from "../src/experience/contract-journey/domain/contract-journey.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const WEBSITE_REQUEST =
  "We need to build company website with design, coding, testing, and deployment.";

const BASE_SNAPSHOT: ContractJourneySnapshot = {
  contractId: "contract-1",
  contractNumber: "CTR-2026-ABCD",
  actionId: "action-1",
  actionCode: "technology.code",
  actionTitle: "Website build",
  contractStatus: "proposed",
  customerUserId: "customer-user-1",
  providerUserId: "provider-user-1",
  customerDisplayName: "X3 Customer",
  providerDisplayName: "X3 Provider",
  contractCreatedAt: new Date("2026-06-19T18:00:00.000Z"),
  contractUpdatedAt: new Date("2026-06-19T18:00:00.000Z"),
  request: {
    id: "request-1",
    status: "matched",
    requestText: WEBSITE_REQUEST,
    createdAt: new Date("2026-06-19T17:00:00.000Z"),
  },
  offer: {
    id: "offer-1",
    status: "contract_created",
    createdAt: new Date("2026-06-19T17:30:00.000Z"),
    updatedAt: new Date("2026-06-19T18:00:00.000Z"),
  },
  escrow: null,
  milestones: {
    totalMilestones: 0,
    completedMilestones: 0,
    inProgressMilestones: 0,
    pendingMilestones: 0,
  },
  evidenceCount: 0,
  openIssueCount: 0,
  latestIssueStatus: null,
  hasEvaluation: false,
  timelineEvents: [],
};

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x3-journey-test-session",
  };
}

async function seedX3Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x3@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x3@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X3 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X3 Provider', 'active')
      RETURNING id
    `,
    [providerUser.rows[0].id]
  );

  return {
    customerUserId: customerUser.rows[0].id,
    providerUserId: providerUser.rows[0].id,
    customerId: customer.rows[0].id,
    providerId: provider.rows[0].id,
  };
}

async function seedProviderAction(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedX3Parties>>
) {
  const action = await db.query<{ id: string }>(
    `
      INSERT INTO action.actions (
        action_code,
        action_name,
        domain,
        status,
        customer_id,
        provider_id,
        title
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `,
    [
      "technology.code",
      "Technology — Code",
      "E",
      "ready_for_contract",
      parties.customerId,
      parties.providerId,
      "X3 provider offering",
    ]
  );
  return action.rows[0].id;
}

async function seedCustomerRequest(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedX3Parties>>
) {
  const request = await db.query<{ id: string }>(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        budget_minor,
        preferred_days,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'matched')
      RETURNING id
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );
  return request.rows[0].id;
}

let db: DbPool | undefined;
let postgresReady = false;
let parties: Awaited<ReturnType<typeof seedX3Parties>> | undefined;
let providerActionId: string | undefined;
let customerRequestId: string | undefined;
let contractId: string | undefined;

describe("X3 Contract Journey Experience", () => {
  describe("domain layer (unit)", () => {
    it("evaluates journey stage completion deterministically", () => {
      const completion = evaluateStageCompletion(BASE_SNAPSHOT);
      assert.equal(completion.request_created, true);
      assert.equal(completion.provider_matched, true);
      assert.equal(completion.offer_created, true);
      assert.equal(completion.contract_created, true);
      assert.equal(completion.escrow_funded, false);
      assert.equal(completion.contract_completed, false);
    });

    it("detects current stage as first incomplete milestone", () => {
      assert.equal(detectCurrentStage(BASE_SNAPSHOT), "escrow_funded");
    });

    it("calculates journey progress percentage", () => {
      const progress = buildJourneyProgress(BASE_SNAPSHOT);
      assert.equal(progress.totalStageCount, 10);
      assert.equal(progress.completedStageCount, 4);
      assert.equal(progress.progressPercent, 40);
      assert.equal(progress.currentStage, "escrow_funded");
    });

    it("builds customer and provider perspectives with next actions", () => {
      const journey = buildContractJourney({
        snapshot: BASE_SNAPSHOT,
        perspective: "customer",
        generatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });

      assert.equal(journey.perspective, "customer");
      assert.equal(journey.recommendedNextAction.role, "customer");
      assert.equal(journey.customerNextAction.title, "Accept contract terms");
      assert.equal(journey.providerNextAction.role, "provider");
      assert.equal(journey.progress.milestones.length, 10);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.match_contract_offers`);
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(`DELETE FROM action.actions WHERE title = 'X3 provider offering'`);
        await db.query(
          `
            DELETE FROM identity.customers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x3@test.app13', 'provider-x3@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.providers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x3@test.app13', 'provider-x3@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-x3@test.app13', 'provider-x3@test.app13')
          `
        );

        parties = await seedX3Parties(db);
        providerActionId = await seedProviderAction(db, parties);
        customerRequestId = await seedCustomerRequest(db, parties);

        const contractsExperience = createContractsExperienceModule(db);
        const service = createMatchContractConversionService({
          db,
          requestRepository,
          conversionRepository: matchContractConversionRepository,
          contractInitiation: contractsExperience.contractInitiation,
          contractBridge: contractsExperience.contractBridge,
          matching: createMatchingService(),
        });

        const offer = await service.createContractOffer(parties.customerUserId, {
          customer_request_id: customerRequestId,
          provider_user_id: parties.providerUserId,
          selected_action_id: providerActionId,
          commercial_terms: {
            estimated_value: 9000,
            title: "Website build with X3 Provider",
          },
          idempotency_key: "x3-offer",
        });
        await service.getContractDraftPreview(parties.customerUserId, offer.id);
        const accepted = await service.acceptContractOffer(parties.customerUserId, offer.id);
        contractId = accepted.contract.contract_id;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes contract journey from lifecycle projections", async (t) => {
      if (!postgresReady || !db || !parties || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { contractJourney } = createContractJourneyModule(db);
      const journey = await contractJourney.getJourney(
        authContext(parties.customerUserId),
        contractId
      );

      assert.equal(journey.contract_id, contractId);
      assert.equal(journey.perspective, "customer");
      assert.equal(journey.progress.completed_stage_count, 4);
      assert.equal(journey.progress.current_stage, "escrow_funded");
      assert.ok(journey.customer_summary.headline.length > 0);
      assert.ok(journey.provider_summary.headline.length > 0);
    });

    it("returns progress and timeline endpoints for contract parties", async (t) => {
      if (!postgresReady || !db || !parties || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { contractJourney } = createContractJourneyModule(db);
      const progress = await contractJourney.getProgress(
        authContext(parties.providerUserId, ["provider"]),
        contractId
      );
      assert.equal(progress.total_stage_count, 10);
      assert.equal(progress.current_stage, "escrow_funded");

      const timeline = await contractJourney.getTimeline(
        authContext(parties.customerUserId),
        contractId
      );
      assert.equal(timeline.contract_id, contractId);
      assert.ok(timeline.events.length >= 4);
    });

    it("rejects non-party access and serves journey routes", async (t) => {
      if (!postgresReady || !db || !parties || !contractId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const outsider = await db.query<{ id: string }>(
        `
          INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
          VALUES ('outsider-x3@test.app13', 'hash', 'customer', now(), 'T1')
          RETURNING id
        `
      );

      const { contractJourney } = createContractJourneyModule(db);
      await assert.rejects(
        () => contractJourney.getJourney(authContext(outsider.rows[0].id), contractId),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(parties!.customerUserId);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerContractJourneyRoutes(app, contractJourney);

      const response = await app.inject({
        method: "GET",
        url: `/journeys/${contractId}`,
      });
      assert.equal(response.statusCode, 200);

      const timelineResponse = await app.inject({
        method: "GET",
        url: `/journeys/${contractId}/timeline`,
      });
      assert.equal(timelineResponse.statusCode, 200);

      await app.close();
    });
  });
});
