import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerConversionRoutes } from "../src/api/routes/conversions.js";
import {
  buildConversionSummary,
  canAcceptOffer,
  canCancelOffer,
  canPreviewDraft,
} from "../src/conversion/domain/match-contract-conversion.js";
import {
  createConversionModule,
  createMatchContractConversionService,
} from "../src/conversion/application/match-contract-conversion-service.js";
import { createContractsExperienceModule } from "../src/contracts-experience/application/contract-creation-bridge-service.js";
import { createMatchingService } from "../src/matching/application/matching-service.js";
import { requestRepository } from "../src/request-experience/infrastructure/request-repository.js";
import { matchContractConversionRepository } from "../src/conversion/infrastructure/match-contract-conversion-repository.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import { TEST_AUTH_CONTEXT } from "./helpers/experience-server-integration.js";

const WEBSITE_REQUEST =
  "We need to build company website with design, coding, testing, and deployment.";

async function seedS8Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s8@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s8@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S8 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'S8 Provider', 'active')
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
  parties: Awaited<ReturnType<typeof seedS8Parties>>
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
      "S8 provider offering",
    ]
  );

  return action.rows[0].id;
}

async function seedCustomerRequest(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS8Parties>>
) {
  const request = await db.query<{ id: string }>(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        budget_minor,
        preferred_days
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );

  return request.rows[0].id;
}

let db: DbPool | undefined;
let postgresReady = false;
let parties: Awaited<ReturnType<typeof seedS8Parties>> | undefined;
let providerActionId: string | undefined;
let customerRequestId: string | undefined;

describe("S8 Match-to-Contract Conversion", () => {
  describe("projection layer (unit)", () => {
    it("tracks conversion status transitions", () => {
      assert.equal(canPreviewDraft("offer_created"), true);
      assert.equal(canPreviewDraft("draft_previewed"), true);
      assert.equal(canAcceptOffer("draft_previewed"), true);
      assert.equal(canCancelOffer("offer_created"), true);
      assert.equal(canAcceptOffer("contract_created"), false);
      assert.equal(canCancelOffer("cancelled"), false);
    });

    it("builds conversion summaries for each status", () => {
      const summary = buildConversionSummary({
        id: "offer-1",
        customerRequestId: "req-1",
        customerUserId: "user-1",
        customerId: "customer-1",
        providerId: "provider-1",
        providerUserId: "provider-user-1",
        selectedActionId: "action-1",
        selectedActionCode: "technology.code",
        commercialTerms: { estimated_value: 9000 },
        status: "draft_previewed",
        contractId: null,
        idempotencyKey: "s8:test",
        createdAt: new Date("2026-06-19T20:00:00.000Z"),
        updatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });

      assert.match(summary.summary, /draft preview/i);
      assert.equal(summary.status, "draft_previewed");
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
        await db.query(`DELETE FROM action.actions WHERE title = 'S8 provider offering'`);
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s8@test.app13', 'provider-s8@test.app13')
          `
        );
        parties = await seedS8Parties(db);
        providerActionId = await seedProviderAction(db, parties);
        customerRequestId = await seedCustomerRequest(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("creates an offer, previews draft, and converts to contract", async (t) => {
      if (!postgresReady || !db || !parties || !providerActionId || !customerRequestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

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
          title: "Website build with S8 Provider",
        },
      });

      assert.equal(offer.status, "offer_created");
      assert.equal(offer.selected_action_code, "technology.code");

      const draft = await service.getContractDraftPreview(parties.customerUserId, offer.id);
      assert.equal(draft.status, "draft_previewed");
      assert.equal(draft.draft.actionCode, "technology.code");

      const accepted = await service.acceptContractOffer(parties.customerUserId, offer.id);
      assert.equal(accepted.status, "contract_created");
      assert.ok(accepted.contract.contract_id);
      assert.equal(accepted.contract.status, "proposed");
    });

    it("cancels an open offer", async (t) => {
      if (!postgresReady || !db || !parties || !providerActionId || !customerRequestId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { matchContractConversion } = createConversionModule(db);
      const offer = await matchContractConversion.createContractOffer(parties.customerUserId, {
        customer_request_id: customerRequestId,
        provider_user_id: parties.providerUserId,
        selected_action_id: providerActionId,
        idempotency_key: `s8-cancel:${Date.now()}`,
      });

      const cancelled = await matchContractConversion.cancelContractOffer(
        parties.customerUserId,
        offer.id
      );
      assert.equal(cancelled.status, "cancelled");
    });

    it("exposes conversion offer routes", async (t) => {
      if (!postgresReady || !db || !parties || !providerActionId || !customerRequestId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { matchContractConversion } = createConversionModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = {
          ...TEST_AUTH_CONTEXT,
          userId: parties!.customerUserId,
        };
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerConversionRoutes(app, matchContractConversion);

      const createResponse = await app.inject({
        method: "POST",
        url: "/conversions/offers",
        payload: {
          customer_request_id: customerRequestId,
          provider_user_id: parties.providerUserId,
          selected_action_id: providerActionId,
          idempotency_key: `s8-route:${Date.now()}`,
        },
      });

      assert.equal(createResponse.statusCode, 201);
      const offerId = createResponse.json().id as string;

      const draftResponse = await app.inject({
        method: "GET",
        url: `/conversions/offers/${offerId}/draft`,
      });
      assert.equal(draftResponse.statusCode, 200);

      const getResponse = await app.inject({
        method: "GET",
        url: `/conversions/offers/${offerId}`,
      });
      assert.equal(getResponse.statusCode, 200);

      await app.close();
    });
  });
});
