import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerRequestMatchRoutes } from "../src/api/routes/request-match.js";
import { createRequestMatchExperienceModule } from "../src/experience/request-match/module.js";
import {
  buildConversionReadiness,
  buildProviderRecommendations,
  buildRecommendedNextAction,
  buildRequestMatchExperience,
  buildRequestUnderstanding,
  buildSuggestedActions,
  type RequestMatchSnapshot,
} from "../src/experience/request-match/domain/request-match-experience.js";
import { createTrustModule } from "../src/trust/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const WEBSITE_REQUEST =
  "We need to build company website with design, coding, testing, and deployment.";

const BASE_SNAPSHOT: RequestMatchSnapshot = {
  request: {
    id: "request-1",
    customerUserId: "customer-user-1",
    customerId: "customer-1",
    requestText: WEBSITE_REQUEST,
    budget: 9000,
    preferredDays: 21,
    status: "open",
    createdAt: new Date("2026-06-19T10:00:00.000Z"),
    updatedAt: new Date("2026-06-19T10:00:00.000Z"),
  },
  suggestions: [
    {
      actionCode: "engineering.design",
      actionName: "Engineering — Design",
      category: "engineering",
      confidence: 95,
      reason: "Task decomposition rule matched the request description.",
      matchedKeywords: ["design"],
    },
    {
      actionCode: "technology.code",
      actionName: "Technology — Code",
      category: "technology",
      confidence: 90,
      reason: "Matched keywords (coding) map to catalog action technology.code.",
      matchedKeywords: ["coding"],
    },
  ],
  primaryActionCode: "engineering.design",
  primaryActionName: "Engineering — Design",
  marketplaceProviderCount: 2,
  totalEligibleCandidates: 2,
  rankedMatches: [
    {
      provider: {
        providerId: "provider-1",
        providerUserId: "provider-user-1",
        displayName: "X5 Provider A",
        actionCodes: ["engineering.design", "technology.code"],
        trustScore: 72,
        availableNow: true,
        distanceKm: 10,
        priceEstimate: 9000,
        completedContractsForAction: 3,
        completedContracts: 5,
        averageRating: 4.8,
        publishedActionId: "action-1",
      },
      matchScore: 84,
      rank: 1,
    },
    {
      provider: {
        providerId: "provider-2",
        providerUserId: "provider-user-2",
        displayName: "X5 Provider B",
        actionCodes: ["engineering.design"],
        trustScore: 58,
        availableNow: false,
        distanceKm: 12,
        priceEstimate: 8500,
        completedContractsForAction: 1,
        completedContracts: 2,
        averageRating: 4.2,
        publishedActionId: "action-2",
      },
      matchScore: 71,
      rank: 2,
    },
  ],
  offers: [],
};

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x5-request-match-test-session",
  };
}

interface X5Parties {
  customerUserId: string;
  providerUserId: string;
  customerId: string;
  providerId: string;
}

async function seedX5Parties(db: DbPool): Promise<X5Parties> {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x5@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x5@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X5 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X5 Provider', 'active')
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

async function seedX5Data(db: DbPool, parties: X5Parties) {
  await db.query(
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
    `,
    [
      "engineering.design",
      "Engineering — Design",
      "E",
      "ready_for_contract",
      parties.customerId,
      parties.providerId,
      "X5 design offering",
    ]
  );

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
      VALUES ($1, $2, $3, $4, $5, 'open')
      RETURNING id
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );

  return { requestId: request.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let customerUserId: string | undefined;
let requestId: string | undefined;

describe("X5 Request-to-Match Experience", () => {
  describe("domain layer (unit)", () => {
    it("builds request understanding with intent inference", () => {
      const understanding = buildRequestUnderstanding(
        BASE_SNAPSHOT.request,
        BASE_SNAPSHOT.suggestions
      );
      assert.equal(understanding.intent.primaryActionCode, "engineering.design");
      assert.match(understanding.summary, /Engineering — Design/);
      assert.ok(understanding.budgetLabel);
    });

    it("builds ranked suggested actions", () => {
      const actions = buildSuggestedActions(BASE_SNAPSHOT.suggestions);
      assert.equal(actions.length, 2);
      assert.equal(actions[0]?.rank, 1);
      assert.equal(actions[0]?.actionCode, "engineering.design");
    });

    it("builds provider recommendations with trust and availability labels", () => {
      const providers = buildProviderRecommendations(BASE_SNAPSHOT);
      assert.equal(providers[0]?.rank, 1);
      assert.equal(providers[0]?.liveFrameTier.length > 0, true);
      assert.equal(providers[0]?.availabilityLabel, "Available now");
      assert.equal(providers[1]?.availabilityLabel, "Limited capacity");
    });

    it("marks conversion readiness as ready_for_offer when matches exist", () => {
      const readiness = buildConversionReadiness(BASE_SNAPSHOT);
      assert.equal(readiness.status, "ready_for_offer");
      assert.equal(readiness.canCreateOffer, true);
    });

    it("recommends contract offer creation when ready for conversion", () => {
      const readiness = buildConversionReadiness(BASE_SNAPSHOT);
      const nextAction = buildRecommendedNextAction(BASE_SNAPSHOT, readiness);
      assert.equal(nextAction.actionCode, "create_contract_offer");
      assert.match(nextAction.routeHint, /POST \/conversions\/offers/);
    });

    it("recommends draft preview when offer is created", () => {
      const snapshot: RequestMatchSnapshot = {
        ...BASE_SNAPSHOT,
        offers: [
          {
            id: "offer-1",
            providerId: "provider-1",
            providerUserId: "provider-user-1",
            selectedActionId: "action-1",
            selectedActionCode: "engineering.design",
            status: "offer_created",
            contractId: null,
          },
        ],
      };
      const readiness = buildConversionReadiness(snapshot);
      const nextAction = buildRecommendedNextAction(snapshot, readiness);
      assert.equal(readiness.status, "offer_created");
      assert.equal(nextAction.actionCode, "preview_contract_draft");
    });

    it("composes full request-to-match experience deterministically", () => {
      const experience = buildRequestMatchExperience({
        snapshot: BASE_SNAPSHOT,
        generatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });

      assert.equal(experience.requestId, "request-1");
      assert.equal(experience.suggestedActions.length, 2);
      assert.equal(experience.providers.length, 2);
      assert.equal(experience.match.trustWeightedRanking, true);
      assert.equal(experience.generatedAt.toISOString(), "2026-06-19T20:00:00.000Z");
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
        await db.query(`DELETE FROM experience.customer_requests WHERE request_text = $1`, [
          WEBSITE_REQUEST,
        ]);
        await db.query(`DELETE FROM action.actions WHERE title = 'X5 design offering'`);
        await db.query(
          `
            DELETE FROM identity.customers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x5@test.app13', 'provider-x5@test.app13', 'outsider-x5@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.providers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x5@test.app13', 'provider-x5@test.app13', 'outsider-x5@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-x5@test.app13', 'provider-x5@test.app13', 'outsider-x5@test.app13')
          `
        );

        const parties = await seedX5Parties(db);
        customerUserId = parties.customerUserId;
        const seeded = await seedX5Data(db, parties);
        requestId = seeded.requestId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes request-to-match experience from S7/S8/S13 projections", async (t) => {
      if (!postgresReady || !db || !customerUserId || !requestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { requestMatchExperience } = createRequestMatchExperienceModule(db, { trustScore });
      const view = await requestMatchExperience.getRequestMatchExperience(
        authContext(customerUserId),
        requestId
      );

      assert.equal(view.customer_user_id, customerUserId);
      assert.equal(view.request_id, requestId);
      assert.ok(view.understanding.intent.primary_action_code);
      assert.ok(view.suggested_actions.length >= 1);
      assert.ok(view.providers.length >= 1);
      assert.equal(view.readiness.status, "ready_for_offer");
    });

    it("returns actions, providers, and readiness endpoints", async (t) => {
      if (!postgresReady || !db || !customerUserId || !requestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { requestMatchExperience } = createRequestMatchExperienceModule(db, { trustScore });

      const actions = await requestMatchExperience.getSuggestedActions(
        authContext(customerUserId),
        requestId
      );
      assert.ok(actions.suggested_actions.length >= 1);
      assert.ok(actions.understanding.intent.intent_label.length > 0);

      const providers = await requestMatchExperience.getProviderRecommendations(
        authContext(customerUserId),
        requestId
      );
      assert.ok(providers.match.returned_matches >= 1);
      assert.ok(providers.providers[0]?.live_frame_label.length > 0);

      const readiness = await requestMatchExperience.getConversionReadiness(
        authContext(customerUserId),
        requestId
      );
      assert.equal(readiness.readiness.can_create_offer, true);
      assert.equal(readiness.recommended_next_action.action_code, "create_contract_offer");
    });

    it("rejects non-owner access and serves request-match routes", async (t) => {
      if (!postgresReady || !db || !customerUserId || !requestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const outsider = await db.query<{ id: string }>(
        `
          INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
          VALUES ('outsider-x5@test.app13', 'hash', 'customer', now(), 'T1')
          RETURNING id
        `
      );
      await db.query(
        `
          INSERT INTO identity.customers (user_id, display_name)
          VALUES ($1, 'X5 Outsider')
        `,
        [outsider.rows[0].id]
      );

      const { trustScore } = createTrustModule(db);
      const { requestMatchExperience } = createRequestMatchExperienceModule(db, { trustScore });

      await assert.rejects(
        () =>
          requestMatchExperience.getRequestMatchExperience(
            authContext(outsider.rows[0].id),
            requestId!
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerRequestMatchRoutes(app, requestMatchExperience);

      for (const path of [
        `/request-match/${requestId}`,
        `/request-match/${requestId}/actions`,
        `/request-match/${requestId}/providers`,
        `/request-match/${requestId}/readiness`,
      ]) {
        const response = await app.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await app.close();
    });
  });
});
