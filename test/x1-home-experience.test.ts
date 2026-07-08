import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerHomeRoutes } from "../src/api/routes/home.js";
import { createCustomerExperienceModule } from "../src/customer-experience/module.js";
import { createProviderWorkspaceModule } from "../src/provider-workspace/module.js";
import { createNotificationsModule } from "../src/notifications/module.js";
import { createTrustModule } from "../src/trust/module.js";
import { createHomeExperienceModule } from "../src/experience/module.js";
import {
  buildHomeExperience,
  buildNotificationSummaryFromUnread,
  buildQuickActions,
  buildTrustSummaryFromProfile,
  detectHomeMode,
  selectTopRecommendedAction,
} from "../src/experience/domain/home-experience.js";
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

function authContext(userId: string, roles: string[] = ["customer"]): AuthContext {
  return {
    userId,
    roles,
    tier: "T1",
    status: "active",
    sessionId: "x1-home-test-session",
  };
}

async function seedX1CustomerUser(db: DbPool) {
  const user = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x1@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X1 Customer')
      RETURNING id
    `,
    [user.rows[0].id]
  );

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
    [user.rows[0].id, customer.rows[0].id, WEBSITE_REQUEST, 9000, 21]
  );

  return {
    userId: user.rows[0].id,
    customerId: customer.rows[0].id,
  };
}

async function seedX1ProviderUser(db: DbPool) {
  const user = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-x1@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );
  await db.query(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X1 Provider', 'active')
    `,
    [user.rows[0].id]
  );

  return {
    userId: user.rows[0].id,
  };
}

async function seedX1HybridUser(db: DbPool) {
  const user = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('hybrid-x1@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X1 Hybrid Customer')
      RETURNING id
    `,
    [user.rows[0].id]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'X1 Hybrid Provider', 'active')
      RETURNING id
    `,
    [user.rows[0].id]
  );

  const hybridRequest = await db.query<{ id: string }>(
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
    [user.rows[0].id, customer.rows[0].id, WEBSITE_REQUEST, 9000, 21]
  );

  const externalCustomerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('external-x1@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const externalCustomer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'X1 External Customer')
      RETURNING id
    `,
    [externalCustomerUser.rows[0].id]
  );
  const externalRequest = await db.query<{ id: string }>(
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
    [externalCustomerUser.rows[0].id, externalCustomer.rows[0].id, WEBSITE_REQUEST, 12000, 14]
  );
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
      externalCustomer.rows[0].id,
      provider.rows[0].id,
      "X1 hybrid provider offering",
    ]
  );

  await db.query(
    `
      INSERT INTO experience.match_contract_offers (
        customer_request_id,
        customer_user_id,
        customer_id,
        provider_id,
        provider_user_id,
        selected_action_id,
        selected_action_code,
        status,
        idempotency_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'offer_created', $8)
    `,
    [
      externalRequest.rows[0].id,
      externalCustomerUser.rows[0].id,
      externalCustomer.rows[0].id,
      provider.rows[0].id,
      user.rows[0].id,
      action.rows[0].id,
      "technology.code",
      "x1-hybrid-offer",
    ]
  );

  return {
    userId: user.rows[0].id,
    customerId: customer.rows[0].id,
    providerId: provider.rows[0].id,
    hybridRequestId: hybridRequest.rows[0].id,
  };
}

let db: DbPool | undefined;
let postgresReady = false;
let customerUserId: string | undefined;
let providerUserId: string | undefined;
let hybridUserId: string | undefined;

describe("X1 Unified Home Experience", () => {
  describe("domain layer (unit)", () => {
    it("detects home mode from activity and profiles", () => {
      assert.equal(
        detectHomeMode({
          userId: "user-1",
          hasCustomerProfile: true,
          hasProviderProfile: false,
          customerRequestCount: 2,
          customerOfferCount: 0,
          customerContractCount: 0,
          providerOfferCount: 0,
          providerContractCount: 0,
        }),
        "need_service"
      );

      assert.equal(
        detectHomeMode({
          userId: "user-2",
          hasCustomerProfile: false,
          hasProviderProfile: true,
          customerRequestCount: 0,
          customerOfferCount: 0,
          customerContractCount: 0,
          providerOfferCount: 1,
          providerContractCount: 0,
        }),
        "offer_service"
      );

      assert.equal(
        detectHomeMode({
          userId: "user-3",
          hasCustomerProfile: true,
          hasProviderProfile: true,
          customerRequestCount: 1,
          customerOfferCount: 0,
          customerContractCount: 0,
          providerOfferCount: 1,
          providerContractCount: 0,
        }),
        "hybrid"
      );
    });

    it("builds deterministic quick actions per mode", () => {
      const customerActions = buildQuickActions("need_service");
      const providerActions = buildQuickActions("offer_service");
      const hybridActions = buildQuickActions("hybrid");

      assert.equal(customerActions[0]?.actionCode, "create_request");
      assert.equal(providerActions[0]?.actionCode, "view_provider_dashboard");
      assert.ok(hybridActions.length > customerActions.length);
      assert.deepEqual(
        hybridActions.map((action) => action.actionCode),
        [...hybridActions.map((action) => action.actionCode)].sort()
      );
    });

    it("selects top recommended action with notification priority", () => {
      const action = selectTopRecommendedAction({
        mode: "need_service",
        notifications: buildNotificationSummaryFromUnread({
          unread_count: 2,
          critical_count: 1,
          high_priority_count: 1,
          recent_unread: [],
        }),
        customer: {
          customerUserId: "cust-1",
          customerId: "cust-id",
          totalRequests: 1,
          openRequests: 1,
          activeOffers: 0,
          activeContracts: 0,
          completedContracts: 0,
          openIssues: 0,
          pendingFunding: 0,
          headline: "Open request",
          nextRecommendedAction: "Review provider suggestions",
        },
        provider: null,
      });

      assert.equal(action.actionCode, "review_critical_notifications");
    });

    it("builds unified home experience aggregate", () => {
      const experience = buildHomeExperience({
        userId: "user-1",
        mode: "need_service",
        customer: {
          customerUserId: "user-1",
          customerId: "cust-1",
          totalRequests: 1,
          openRequests: 1,
          activeOffers: 0,
          activeContracts: 0,
          completedContracts: 0,
          openIssues: 0,
          pendingFunding: 0,
          headline: "You have 1 open request.",
          nextRecommendedAction: "Review provider suggestions",
        },
        provider: null,
        notifications: buildNotificationSummaryFromUnread({
          unread_count: 0,
          critical_count: 0,
          high_priority_count: 0,
          recent_unread: [],
        }),
        trust: buildTrustSummaryFromProfile("user-1", null),
        generatedAt: new Date("2026-06-19T20:00:00.000Z"),
      });

      assert.equal(experience.mode, "need_service");
      assert.equal(experience.summary.activeWorkCount, 1);
      assert.equal(experience.recommendedAction.actionCode, "follow_customer_recommendation");
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
        await db.query(`DELETE FROM experience.customer_requests`);
        await db.query(`DELETE FROM action.actions WHERE title = 'X1 hybrid provider offering'`);
        await db.query(
          `
            DELETE FROM identity.customers
            WHERE user_id IN (
              SELECT id
              FROM identity.users
              WHERE email IN (
                'customer-x1@test.app13',
                'provider-x1@test.app13',
                'hybrid-x1@test.app13',
                'external-x1@test.app13'
              )
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.providers
            WHERE user_id IN (
              SELECT id
              FROM identity.users
              WHERE email IN (
                'customer-x1@test.app13',
                'provider-x1@test.app13',
                'hybrid-x1@test.app13',
                'external-x1@test.app13'
              )
            )
          `
        );
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN (
              'customer-x1@test.app13',
              'provider-x1@test.app13',
              'hybrid-x1@test.app13',
              'external-x1@test.app13'
            )
          `
        );

        const customer = await seedX1CustomerUser(db);
        const provider = await seedX1ProviderUser(db);
        const hybrid = await seedX1HybridUser(db);
        customerUserId = customer.userId;
        providerUserId = provider.userId;
        hybridUserId = hybrid.userId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("composes customer home from S9 and S12 projections", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { eventInbox } = createNotificationsModule(db);
      const { customerDashboard } = createCustomerExperienceModule(db);
      const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
      const { homeExperience } = createHomeExperienceModule(db, {
        customerDashboard,
        providerDashboard,
        eventInbox,
        trustScore,
      });

      const home = await homeExperience.getHome(authContext(customerUserId));
      assert.equal(home.mode, "need_service");
      assert.ok(home.customer);
      assert.equal(home.customer?.open_requests, 1);
      assert.equal(home.provider, null);
      assert.equal(typeof home.notifications.unread_count, "number");
      assert.equal(home.recommended_action.role, "customer");
      assert.ok(home.quick_actions.length > 0);
    });

    it("returns provider home and rejects missing customer profile", async (t) => {
      if (!postgresReady || !db || !providerUserId || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { eventInbox } = createNotificationsModule(db);
      const { customerDashboard } = createCustomerExperienceModule(db);
      const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
      const { homeExperience } = createHomeExperienceModule(db, {
        customerDashboard,
        providerDashboard,
        eventInbox,
        trustScore,
      });

      const providerHome = await homeExperience.getProviderHome(authContext(providerUserId, ["provider"]));
      assert.equal(providerHome.mode, "offer_service");
      assert.ok(providerHome.provider);

      await assert.rejects(
        () => homeExperience.getCustomerHome(authContext(providerUserId, ["provider"])),
        (error: unknown) =>
          error instanceof AppError && error.problem.status === 404
      );

      const customerHome = await homeExperience.getCustomerHome(authContext(customerUserId));
      assert.equal(customerHome.mode, "need_service");
      assert.equal(customerHome.customer.open_requests, 1);
    });

    it("detects hybrid mode when both sides have activity", async (t) => {
      if (!postgresReady || !db || !hybridUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trustScore } = createTrustModule(db);
      const { eventInbox } = createNotificationsModule(db);
      const { customerDashboard } = createCustomerExperienceModule(db);
      const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
      const { homeExperience } = createHomeExperienceModule(db, {
        customerDashboard,
        providerDashboard,
        eventInbox,
        trustScore,
      });

      const home = await homeExperience.getHome(authContext(hybridUserId));
      assert.equal(home.mode, "hybrid");
      assert.ok(home.customer);
      assert.ok(home.provider);
      assert.ok(home.quick_actions.length >= 4);
    });

    it("serves authenticated home routes", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { trust, trustScore } = createTrustModule(db);
      const { eventInbox } = createNotificationsModule(db);
      trust.attachEventInboxService(eventInbox);
      const { customerDashboard } = createCustomerExperienceModule(db);
      const { providerDashboard } = createProviderWorkspaceModule(db, { trustScore });
      const { homeExperience } = createHomeExperienceModule(db, {
        customerDashboard,
        providerDashboard,
        eventInbox,
        trustScore,
      });

      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = authContext(customerUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerHomeRoutes(app, homeExperience);

      const response = await app.inject({ method: "GET", url: "/home" });
      assert.equal(response.statusCode, 200);
      const body = response.json() as { mode: string; customer: { open_requests: number } | null };
      assert.equal(body.mode, "need_service");
      assert.equal(body.customer?.open_requests, 1);

      const customerResponse = await app.inject({ method: "GET", url: "/home/customer" });
      assert.equal(customerResponse.statusCode, 200);

      await app.close();
    });
  });
});
