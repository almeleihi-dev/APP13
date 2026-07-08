import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerAdminConsoleRoutes } from "../src/api/routes/admin-console.js";
import {
  buildContractOverview,
  buildEscrowOverview,
  buildExecutionOverview,
  buildIssueOverview,
  buildOfferOverview,
  buildPlatformOverview,
  buildRequestOverview,
  buildRiskOverview,
  buildTrendSummary,
  buildTrustOverview,
  deriveOperationsHealthStatus,
} from "../src/operations/domain/admin-console.js";
import { createOperationsModule } from "../src/operations/module.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

async function seedS11Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-s11@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return {
    adminUserId: adminUser.rows[0].id,
  };
}

async function seedSampleRequest(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-s11@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'S11 Customer')
      RETURNING id
    `,
    [customerUser.rows[0].id]
  );

  await db.query(
    `
      INSERT INTO experience.customer_requests (
        customer_user_id,
        customer_id,
        request_text,
        status
      )
      VALUES ($1, $2, $3, 'open')
    `,
    [customerUser.rows[0].id, customer.rows[0].id, "Need operations monitoring coverage."]
  );
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "s11-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "s11-customer-session",
});

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;

describe("S11 Operations Admin Console", () => {
  describe("projection layer (unit)", () => {
    it("builds trend summaries with direction", () => {
      const trend = buildTrendSummary({
        periodDays: 7,
        recentCount: 5,
        priorCount: 2,
        entityLabel: "new request",
      });

      assert.equal(trend.direction, "up");
      assert.match(trend.summary, /up from 2/);
    });

    it("derives platform health from risk severity", () => {
      assert.equal(
        deriveOperationsHealthStatus({
          highSeverityCount: 1,
          mediumSeverityCount: 0,
          failedOperations: 0,
          openIssues: 0,
        }),
        "degraded"
      );
      assert.equal(
        deriveOperationsHealthStatus({
          highSeverityCount: 0,
          mediumSeverityCount: 1,
          failedOperations: 0,
          openIssues: 1,
        }),
        "attention"
      );
    });

    it("builds risk indicators from operational metrics", () => {
      const risks = buildRiskOverview({
        frozenEscrows: 1,
        openIssues: 2,
        escalatedIssues: 1,
        disputedContracts: 1,
        failedOperations: 0,
        staleOffers: 3,
        lowTrustProviders: 1,
        pendingFundingEscrows: 2,
      });

      assert.ok(risks.indicators.length >= 4);
      assert.equal(risks.highSeverityCount >= 1, true);
    });

    it("builds platform overview snapshot", () => {
      const emptyMetrics = {
        totalCount: 0,
        statusDistribution: [],
        recentCount: 0,
        priorCount: 0,
      };

      const overview = buildPlatformOverview({
        requests: buildRequestOverview({
          totalCount: 4,
          statusDistribution: [
            { status: "open", count: 2 },
            { status: "matched", count: 2 },
          ],
          recentCount: 1,
          priorCount: 1,
        }),
        offers: buildOfferOverview(emptyMetrics),
        contracts: buildContractOverview(emptyMetrics),
        escrow: buildEscrowOverview(emptyMetrics),
        execution: buildExecutionOverview({
          totalMilestones: 0,
          milestoneStatusDistribution: [],
          totalEvidence: 0,
          contractsWithMilestones: 0,
          recentCount: 0,
          priorCount: 0,
        }),
        issues: buildIssueOverview(emptyMetrics),
        trust: buildTrustOverview({
          providersWithScores: 0,
          averageTrustScore: 0,
          lowTrustProviderCount: 0,
          frameTierDistribution: [],
          recentCount: 0,
          priorCount: 0,
        }),
        risks: buildRiskOverview({
          frozenEscrows: 0,
          openIssues: 0,
          escalatedIssues: 0,
          disputedContracts: 0,
          failedOperations: 0,
          staleOffers: 0,
          lowTrustProviders: 0,
          pendingFundingEscrows: 0,
        }),
        failedOperations: 0,
      });

      assert.equal(overview.requests.totalCount, 4);
      assert.ok(overview.summary.healthStatus);
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
        await db.query(
          `
            DELETE FROM identity.users
            WHERE email IN ('admin-s11@test.app13', 'customer-s11@test.app13')
          `
        );
        const admin = await seedS11Admin(db);
        adminUserId = admin.adminUserId;
        await seedSampleRequest(db);
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("returns platform overview for admin users", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { adminConsole } = createOperationsModule(db);
      const overview = await adminConsole.getOverview(ADMIN_AUTH(adminUserId));

      assert.equal(overview.summary.health_status, "healthy");
      assert.ok(overview.requests.total_count >= 1);
      assert.ok(overview.summary.next_recommended_action);
      assert.ok(overview.generated_at);
    });

    it("exposes admin console routes", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { adminConsole } = createOperationsModule(db);
      const app = Fastify({ logger: false });
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH(adminUserId!);
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerAdminConsoleRoutes(app, adminConsole);

      const overviewResponse = await app.inject({ method: "GET", url: "/admin/overview" });
      assert.equal(overviewResponse.statusCode, 200);

      const requestsResponse = await app.inject({ method: "GET", url: "/admin/requests" });
      assert.equal(requestsResponse.statusCode, 200);

      const risksResponse = await app.inject({ method: "GET", url: "/admin/risks" });
      assert.equal(risksResponse.statusCode, 200);

      await app.close();
    });

    it("rejects non-admin access", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip("PostgreSQL required");
        return;
      }

      const { adminConsole } = createOperationsModule(db);
      await assert.rejects(
        () => adminConsole.getOverview(CUSTOMER_AUTH(adminUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });
});
