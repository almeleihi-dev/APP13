import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerRequestRoutes } from "../src/api/routes/requests.js";
import {
  inferRequestIntent,
  suggestMatchingActions,
  buildRequestSummary,
  toRequestSuggestionView,
} from "../src/request-experience/domain/request.js";
import {
  createRequestExperienceModule,
  createRequestIntelligenceService,
} from "../src/request-experience/application/request-intelligence-service.js";
import { createMatchingService } from "../src/matching/application/matching-service.js";
import { createTrustModule } from "../src/trust/module.js";
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

async function seedS7Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s7@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s7@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S7 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'S7 Provider', 'active')
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

async function seedProviderOffering(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS7Parties>>
) {
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
      "technology.code",
      "Technology — Code",
      "E",
      "ready_for_contract",
      parties.customerId,
      parties.providerId,
      "Provider software development offering",
    ]
  );
}

let db: DbPool | undefined;
let postgresReady = false;
let seededParties: Awaited<ReturnType<typeof seedS7Parties>> | undefined;

describe("S7 Customer Request Experience", () => {
  describe("projection layer (unit)", () => {
    it("infers website build intent from request description", () => {
      const intent = inferRequestIntent(WEBSITE_REQUEST);
      assert.equal(intent.primaryActionCode, "engineering.design");
      assert.ok(intent.confidence >= 70);
    });

    it("suggests catalog actions deterministically from keywords", () => {
      const suggestions = suggestMatchingActions("Need financial audit and reconciliation report");
      assert.ok(suggestions.length > 0);
      assert.equal(suggestions[0]?.category, "finance");
      assert.ok(suggestions.every((entry) => entry.confidence > 0));
    });

    it("builds request summary with intent and suggestion count", () => {
      const suggestions = suggestMatchingActions(WEBSITE_REQUEST);
      const summary = buildRequestSummary(
        {
          id: "req-1",
          customerUserId: "user-1",
          customerId: "customer-1",
          requestText: WEBSITE_REQUEST,
          budget: 5000,
          preferredDays: 21,
          status: "open",
          createdAt: new Date("2026-06-19T20:00:00.000Z"),
          updatedAt: new Date("2026-06-19T20:00:00.000Z"),
        },
        suggestions
      );

      assert.match(summary.summary, /Budget 5000/);
      assert.equal(summary.suggestionCount, suggestions.length);
      assert.ok(summary.topSuggestion);
    });

    it("maps suggestions to API views", () => {
      const [first] = suggestMatchingActions("Need code review and testing for deployment");
      assert.ok(first);
      const view = toRequestSuggestionView(first);
      assert.equal(view.action_code, first.actionCode);
      assert.ok(view.reason.length > 0);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(
          `DELETE FROM action.actions WHERE title = 'Provider software development offering'`
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s7@test.app13', 'provider-s7@test.app13')
          `
        );
        seededParties = await seedS7Parties(db);
        await seedProviderOffering(db, seededParties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("creates and retrieves a customer request with summary", async (t) => {
      if (!postgresReady || !db || !seededParties) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const service = createRequestIntelligenceService({
        db,
        matching: createMatchingService(),
        trustScore,
      });

      const created = await service.createCustomerRequest(seededParties.customerUserId, {
        request_text: WEBSITE_REQUEST,
        budget: 8000,
        preferred_days: 30,
      });

      assert.equal(created.customer_user_id, seededParties.customerUserId);
      assert.ok(created.summary.top_suggestion);

      const fetched = await service.getCustomerRequest(
        seededParties.customerUserId,
        created.id
      );
      assert.equal(fetched.id, created.id);
      assert.equal(fetched.request_text, WEBSITE_REQUEST);
    });

    it("returns suggestions and deterministic provider matches", async (t) => {
      if (!postgresReady || !db || !seededParties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { requestIntelligence } = createRequestExperienceModule(db);
      const created = await requestIntelligence.createCustomerRequest(
        seededParties.customerUserId,
        {
          request_text: "Need a software developer to code and deploy our product",
          budget: 12000,
        }
      );

      const suggestions = await requestIntelligence.getRequestSuggestions(
        seededParties.customerUserId,
        created.id
      );
      assert.ok(suggestions.length > 0);

      const matches = await requestIntelligence.getRequestMatches(
        seededParties.customerUserId,
        created.id
      );
      assert.ok(matches.returned_matches >= 1);
      assert.equal(matches.matches[0]?.provider_id, seededParties.providerId);
    });

    it("exposes request routes for create, read, suggestions, and matches", async (t) => {
      if (!postgresReady || !db || !seededParties) {
        t.skip("PostgreSQL required");
        return;
      }

      const { requestIntelligence } = createRequestExperienceModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = {
          ...TEST_AUTH_CONTEXT,
          userId: seededParties!.customerUserId,
        };
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerRequestRoutes(app, requestIntelligence);

      const createResponse = await app.inject({
        method: "POST",
        url: "/requests",
        payload: {
          request_text: WEBSITE_REQUEST,
          budget: 9000,
          preferred_days: 14,
        },
      });

      assert.equal(createResponse.statusCode, 201);
      const requestId = createResponse.json().id as string;

      const getResponse = await app.inject({
        method: "GET",
        url: `/requests/${requestId}`,
      });
      assert.equal(getResponse.statusCode, 200);

      const suggestionsResponse = await app.inject({
        method: "GET",
        url: `/requests/${requestId}/suggestions`,
      });
      assert.equal(suggestionsResponse.statusCode, 200);
      assert.ok(Array.isArray(suggestionsResponse.json().suggestions));

      const matchesResponse = await app.inject({
        method: "GET",
        url: `/requests/${requestId}/matches`,
      });
      assert.equal(matchesResponse.statusCode, 200);
      assert.ok(Array.isArray(matchesResponse.json().matches));

      await app.close();
    });
  });
});
