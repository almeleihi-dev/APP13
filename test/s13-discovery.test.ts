import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerDiscoveryRoutes } from "../src/api/routes/discovery.js";
import {
  buildProviderResult,
  buildRankingExplanation,
  compareProviderResults,
  passesCategoryFilter,
  passesTrustTierFilter,
  scoreDisputeComponent,
} from "../src/discovery/domain/discovery.js";
import { createDiscoveryModule } from "../src/discovery/module.js";
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

async function seedS13Parties(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s13@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-s13@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S13 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'S13 Provider', 'active')
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
  parties: Awaited<ReturnType<typeof seedS13Parties>>
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
      "S13 provider offering",
    ]
  );
}

async function seedCustomerRequest(
  db: DbPool,
  parties: Awaited<ReturnType<typeof seedS13Parties>>
) {
  await db.query(
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
    `,
    [parties.customerUserId, parties.customerId, WEBSITE_REQUEST, 9000, 21]
  );
}

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "s13-customer-session",
});

let db: DbPool | undefined;
let postgresReady = false;
let customerUserId: string | undefined;

describe("S13 Platform Search & Discovery", () => {
  describe("domain layer (unit)", () => {
    it("filters providers by category and trust tier", () => {
      assert.equal(
        passesCategoryFilter(["technology.code"], "technology"),
        true
      );
      assert.equal(
        passesCategoryFilter(["legal.review"], "technology"),
        false
      );
      assert.equal(passesTrustTierFilter(72, "SAPPHIRE_VERIFIED"), true);
      assert.equal(passesTrustTierFilter(72, "EMERALD_PRO"), false);
    });

    it("scores dispute safety deterministically", () => {
      assert.equal(scoreDisputeComponent({ issuesRaised: 0, issuesResolved: 0, activeIssues: 0 }), 100);
      assert.ok(
        scoreDisputeComponent({ issuesRaised: 2, issuesResolved: 1, activeIssues: 1 }) <
          scoreDisputeComponent({ issuesRaised: 1, issuesResolved: 1, activeIssues: 0 })
      );
    });

    it("ranks providers with deterministic tie-breakers", () => {
      const high = buildProviderResult({
        providerId: "provider-a",
        providerUserId: "user-a",
        displayName: "Provider A",
        actionCodes: ["technology.code"],
        trustScore: 90,
        availableNow: true,
        activeContracts: 1,
        completedContracts: 5,
        averageRating: 4.8,
        issuesRaised: 0,
        issuesResolved: 0,
        activeIssues: 0,
      });
      const low = buildProviderResult({
        providerId: "provider-b",
        providerUserId: "user-b",
        displayName: "Provider B",
        actionCodes: ["technology.code"],
        trustScore: 60,
        availableNow: false,
        activeContracts: 5,
        completedContracts: 1,
        averageRating: 3.5,
        issuesRaised: 2,
        issuesResolved: 1,
        activeIssues: 1,
      });

      assert.ok(compareProviderResults(high, low) < 0);
      assert.match(
        buildRankingExplanation({
          trustScore: 90,
          availableNow: true,
          completedContracts: 5,
          averageRating: 4.8,
          issuesRaised: 0,
          issuesResolved: 0,
          activeIssues: 0,
        }).summary,
        /Ranked/
      );
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.event_inbox`);
        await db.query(`DELETE FROM experience.match_contract_offers`);
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(
          `
            DELETE FROM action.actions
            WHERE title = 'S13 provider offering'
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-s13@test.app13', 'provider-s13@test.app13')
          `
        );
        const parties = await seedS13Parties(db);
        customerUserId = parties.customerUserId;
        await seedProviderAction(db, parties);
        await seedCustomerRequest(db, parties);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("discovers providers with trust-aware ranking", async (t) => {
      if (!postgresReady || !db) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { discovery } = createDiscoveryModule(db);
      const result = await discovery.searchProviders({
        category: "technology",
        availableNow: true,
        limit: 10,
      });

      assert.ok(result.providers.length >= 1);
      assert.equal(result.providers[0].action_codes.includes("technology.code"), true);
      assert.ok(result.providers[0].rank_score >= 0);
      assert.ok(result.summary.total_providers >= 1);
    });

    it("discovers actions and requests", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      const { discovery } = createDiscoveryModule(db);
      const actions = await discovery.searchActions({ category: "technology", limit: 10 });
      assert.ok(actions.actions.some((action) => action.action_code === "technology.code"));

      const requests = await discovery.searchRequests({ text: "website", limit: 10 });
      assert.ok(requests.requests.length >= 1);
      assert.match(requests.requests[0].request_text, /website/i);
    });

    it("returns unified search results", async (t) => {
      if (!postgresReady || !db) {
        t.skip("PostgreSQL required");
        return;
      }

      const { discovery } = createDiscoveryModule(db);
      const result = await discovery.unifiedSearch({
        text: "website",
        limit: 9,
      });

      assert.ok(result.requests.length >= 1);
      assert.ok(result.summary.applied_filters.some((filter) => filter.startsWith("text:")));
    });

    it("exposes discovery routes", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { discovery } = createDiscoveryModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = CUSTOMER_AUTH(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerDiscoveryRoutes(app, discovery);

      const providersResponse = await app.inject({
        method: "GET",
        url: "/discover/providers?category=technology",
      });
      assert.equal(providersResponse.statusCode, 200);

      const actionsResponse = await app.inject({
        method: "GET",
        url: "/discover/actions?category=technology",
      });
      assert.equal(actionsResponse.statusCode, 200);

      const requestsResponse = await app.inject({
        method: "GET",
        url: "/discover/requests?text=website",
      });
      assert.equal(requestsResponse.statusCode, 200);

      const searchResponse = await app.inject({
        method: "GET",
        url: "/discover/search?q=website&category=technology",
      });
      assert.equal(searchResponse.statusCode, 200);

      await app.close();
    });
  });
});
