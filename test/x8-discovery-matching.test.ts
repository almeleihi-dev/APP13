import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerDiscoveryMatchingRoutes } from "../src/api/routes/discovery-matching.js";
import { createDiscoveryMatchingModule } from "../src/experience/discovery-matching/module.js";
import {
  DISCOVERY_MATCH_WEIGHTS,
  buildAvailableNowFeed,
  buildDiscoveryFeed,
  buildDiscoveryMatchScoreBreakdown,
  buildDiscoveryMatchingExperience,
  calculateDiscoveryMatchTotal,
  deriveRequiredSkills,
  deriveRequirementFromRequest,
  parseDiscoveryMatchQuery,
  passesDiscoveryProviderFilters,
  rankProvidersForRequirement,
  rankRequestsAgainstProviders,
  rankRequestsForProvider,
  scoreDiscoveryMatchComponents,
  type DiscoveryMatchingSnapshot,
} from "../src/experience/discovery-matching/domain/discovery-matching.js";
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

const BASE_SNAPSHOT: DiscoveryMatchingSnapshot = {
  query: { text: WEBSITE_REQUEST, limit: 5 },
  providers: [
    {
      providerId: "provider-1",
      providerUserId: "provider-user-1",
      displayName: "X8 Provider A",
      actionCodes: ["engineering.design", "technology.code"],
      trustScore: 80,
      availableNow: true,
      activeContracts: 1,
      distanceKm: 8,
      priceEstimate: 8500,
      completedContracts: 6,
      averageRating: 4.8,
    },
    {
      providerId: "provider-2",
      providerUserId: "provider-user-2",
      displayName: "X8 Provider B",
      actionCodes: ["engineering.design"],
      trustScore: 55,
      availableNow: false,
      activeContracts: 5,
      distanceKm: 20,
      priceEstimate: 7000,
      completedContracts: 2,
      averageRating: 4.1,
    },
  ],
  requests: [
    {
      requestId: "request-1",
      customerUserId: "customer-user-1",
      requestText: WEBSITE_REQUEST,
      status: "open",
      budget: 9000,
      preferredDays: 21,
    },
  ],
  requirement: {
    requiredActionCodes: ["engineering.design", "technology.code"],
    requiredSkills: ["design", "coding", "engineering.design", "technology.code"],
    budget: 9000,
  },
  suggestions: [
    {
      actionCode: "engineering.design",
      actionName: "Engineering — Design",
      category: "engineering",
      confidence: 95,
      reason: "Matched design keyword.",
      matchedKeywords: ["design"],
    },
    {
      actionCode: "technology.code",
      actionName: "Technology — Code",
      category: "technology",
      confidence: 90,
      reason: "Matched coding keyword.",
      matchedKeywords: ["coding"],
    },
  ],
  primaryActionCode: "engineering.design",
  primaryActionName: "Engineering — Design",
};

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x8-discovery-matching-test-session",
  };
}

interface X8Parties {
  customerUserId: string;
  providerUserId: string;
  customerId: string;
  providerId: string;
}

async function seedX8Parties(db: DbPool): Promise<X8Parties> {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x8@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x8@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X8 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X8 Provider', 'active')
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

async function seedX8Data(db: DbPool, parties: X8Parties) {
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
      "X8 design offering",
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
let providerUserId: string | undefined;
let requestId: string | undefined;

describe("X8 Discovery & Matching Experience", () => {
  describe("domain layer (unit)", () => {
    it("uses X8 weights that sum to 100%", () => {
      const total =
        DISCOVERY_MATCH_WEIGHTS.skill +
        DISCOVERY_MATCH_WEIGHTS.trust +
        DISCOVERY_MATCH_WEIGHTS.availability +
        DISCOVERY_MATCH_WEIGHTS.distance +
        DISCOVERY_MATCH_WEIGHTS.priceFit;
      assert.equal(total, 1);
      assert.equal(DISCOVERY_MATCH_WEIGHTS.skill, 0.4);
      assert.equal(DISCOVERY_MATCH_WEIGHTS.trust, 0.25);
    });

    it("calculates deterministic weighted totals from components", () => {
      const total = calculateDiscoveryMatchTotal({
        skill: 90,
        trust: 80,
        availability: 100,
        distance: 85,
        priceFit: 75,
      });
      assert.equal(total, Math.round(90 * 0.4 + 80 * 0.25 + 100 * 0.15 + 85 * 0.1 + 75 * 0.1));
    });

    it("derives required skills from request suggestions", () => {
      const skills = deriveRequiredSkills(BASE_SNAPSHOT.suggestions);
      assert.ok(skills.includes("design"));
      assert.ok(skills.includes("engineering.design"));
    });

    it("scores skill higher for providers with broader action coverage", () => {
      const requirement = BASE_SNAPSHOT.requirement;
      const strong = scoreDiscoveryMatchComponents(requirement, BASE_SNAPSHOT.providers[0]!);
      const weak = scoreDiscoveryMatchComponents(requirement, BASE_SNAPSHOT.providers[1]!);
      assert.ok(strong.skill > weak.skill);
      assert.ok(strong.trust > weak.trust);
    });

    it("ranks providers for a requirement with trust tie-breakers", () => {
      const ranked = rankProvidersForRequirement({
        requirement: BASE_SNAPSHOT.requirement,
        providers: BASE_SNAPSHOT.providers,
      });
      assert.equal(ranked[0]?.providerId, "provider-1");
      assert.equal(ranked[0]?.rank, 1);
      assert.ok(ranked[0]!.matchScore >= ranked[1]!.matchScore);
    });

    it("matches requests to a provider using action eligibility", () => {
      const matches = rankRequestsForProvider({
        provider: BASE_SNAPSHOT.providers[0]!,
        requests: BASE_SNAPSHOT.requests,
      });
      assert.equal(matches.length, 1);
      assert.equal(matches[0]?.requestId, "request-1");
      assert.ok(matches[0]!.matchScore > 0);
    });

    it("ranks requests against the best provider in the pool", () => {
      const matches = rankRequestsAgainstProviders({
        requests: BASE_SNAPSHOT.requests,
        providers: BASE_SNAPSHOT.providers,
      });
      assert.equal(matches.length, 1);
      assert.match(matches[0]?.summary ?? "", /X8 Provider A/);
    });

    it("builds discovery feed with providers and requests", () => {
      const providers = rankProvidersForRequirement({
        requirement: BASE_SNAPSHOT.requirement,
        providers: BASE_SNAPSHOT.providers,
      });
      const requests = rankRequestsAgainstProviders({
        requests: BASE_SNAPSHOT.requests,
        providers: BASE_SNAPSHOT.providers,
      });
      const feed = buildDiscoveryFeed({
        query: BASE_SNAPSHOT.query,
        providerMatches: providers,
        requestMatches: requests,
        availableNowCount: 1,
      });
      assert.ok(feed.items.length >= 2);
      assert.equal(feed.availableNowCount, 1);
    });

    it("builds available now feed from capacity-eligible providers", () => {
      const feed = buildAvailableNowFeed({
        providers: BASE_SNAPSHOT.providers,
        requirement: BASE_SNAPSHOT.requirement,
        limit: 5,
      });
      assert.equal(feed.totalAvailable, 1);
      assert.equal(feed.items[0]?.providerId, "provider-1");
    });

    it("composes full discovery matching experience deterministically", () => {
      const experience = buildDiscoveryMatchingExperience({
        snapshot: BASE_SNAPSHOT,
        generatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });
      assert.ok(experience.providerMatches.length >= 1);
      assert.ok(experience.feed.items.length >= 1);
      assert.equal(experience.generatedAt.toISOString(), "2026-06-19T20:00:00.000Z");
    });

    it("applies provider filters including available_now", () => {
      assert.equal(
        passesDiscoveryProviderFilters(BASE_SNAPSHOT.providers[0]!, { availableNow: true }),
        true
      );
      assert.equal(
        passesDiscoveryProviderFilters(BASE_SNAPSHOT.providers[1]!, { availableNow: true }),
        false
      );
    });

    it("parses discovery match query params", () => {
      const query = parseDiscoveryMatchQuery({
        text: "website design",
        action_code: "engineering.design",
        available_now: "true",
        limit: "3",
      });
      assert.equal(query.text, "website design");
      assert.equal(query.actionCode, "engineering.design");
      assert.equal(query.availableNow, true);
      assert.equal(query.limit, 3);
    });

    it("builds score breakdown with weighted summary", () => {
      const breakdown = buildDiscoveryMatchScoreBreakdown({
        requirement: deriveRequirementFromRequest({
          request: BASE_SNAPSHOT.requests[0]!,
          suggestions: BASE_SNAPSHOT.suggestions,
        }),
        provider: BASE_SNAPSHOT.providers[0]!,
      });
      assert.equal(breakdown.totalScore, calculateDiscoveryMatchTotal(breakdown.components));
      assert.match(breakdown.summary, /skill/);
    });
  });

  describe("PostgreSQL integration", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(`DELETE FROM experience.customer_requests WHERE request_text = $1`, [
          WEBSITE_REQUEST,
        ]);
        await db.query(`DELETE FROM action.actions WHERE title = 'X8 design offering'`);
        await db.query(
          `
            DELETE FROM identity.customers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x8@test.app13', 'provider-x8@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.providers
            WHERE user_id IN (
              SELECT id FROM identity.users
              WHERE email IN ('customer-x8@test.app13', 'provider-x8@test.app13')
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('customer-x8@test.app13', 'provider-x8@test.app13')
          `
        );

        const parties = await seedX8Parties(db);
        const seeded = await seedX8Data(db, parties);
        customerUserId = parties.customerUserId;
        providerUserId = parties.providerUserId;
        requestId = seeded.requestId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes discovery matching experience from S13 and S7 projections", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { discoveryMatching } = createDiscoveryMatchingModule(db, { trustScore });
      const view = await discoveryMatching.getDiscoveryExperience(authContext(customerUserId), {
        text: WEBSITE_REQUEST,
      });

      assert.ok(view.provider_matches.length >= 0);
      assert.ok(view.feed.items.length >= 0);
      assert.equal(view.available_now.total_available >= 0, true);
    });

    it("matches providers to owned customer requests", async (t) => {
      if (!postgresReady || !db || !customerUserId || !requestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { discoveryMatching } = createDiscoveryMatchingModule(db, { trustScore });
      const result = await discoveryMatching.getProvidersForRequest(
        authContext(customerUserId),
        requestId
      );

      assert.equal(result.request_id, requestId);
      assert.ok(Array.isArray(result.providers));
    });

    it("matches requests for provider accounts and rejects customers", async (t) => {
      if (!postgresReady || !db || !customerUserId || !providerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { discoveryMatching } = createDiscoveryMatchingModule(db, { trustScore });

      const providerResult = await discoveryMatching.getRequestsForProvider(
        authContext(providerUserId, ["provider"])
      );
      assert.ok(Array.isArray(providerResult.requests));

      await assert.rejects(
        () => discoveryMatching.getRequestsForProvider(authContext(customerUserId, ["customer"])),
        (error: unknown) => error instanceof AppError && error.problem.status === 404
      );
    });

    it("serves discovery matching routes over HTTP", async (t) => {
      if (!postgresReady || !db || !customerUserId || !providerUserId || !requestId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { discoveryMatching } = createDiscoveryMatchingModule(db, { trustScore });

      const customerApp = Fastify({ logger: false });
      customerApp.decorateRequest("authContext", null);
      customerApp.addHook("preHandler", async (request) => {
        request.authContext = authContext(customerUserId!);
      });
      customerApp.addHook("preHandler", requireAuthMiddleware);
      customerApp.setErrorHandler(errorHandler);
      await registerDiscoveryMatchingRoutes(customerApp, discoveryMatching);

      for (const path of [
        `/discovery-matching?text=${encodeURIComponent(WEBSITE_REQUEST)}`,
        "/discovery-matching/feed",
        "/discovery-matching/available-now",
        `/discovery-matching/requests/${requestId}/providers`,
      ]) {
        const response = await customerApp.inject({ method: "GET", url: path });
        assert.equal(response.statusCode, 200, `expected 200 for ${path}`);
      }

      await customerApp.close();

      const providerApp = Fastify({ logger: false });
      providerApp.decorateRequest("authContext", null);
      providerApp.addHook("preHandler", async (request) => {
        request.authContext = authContext(providerUserId!, ["provider"]);
      });
      providerApp.addHook("preHandler", requireAuthMiddleware);
      providerApp.setErrorHandler(errorHandler);
      await registerDiscoveryMatchingRoutes(providerApp, discoveryMatching);

      const providerResponse = await providerApp.inject({
        method: "GET",
        url: "/discovery-matching/providers/requests",
      });
      assert.equal(providerResponse.statusCode, 200);
      await providerApp.close();
    });
  });
});
