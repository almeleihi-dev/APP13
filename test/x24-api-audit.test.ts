import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerApiAuditRoutes } from "../src/api/routes/api-audit.js";
import { createApiAuditModule } from "../src/experience/api-audit/module.js";
import {
  API_AUDIT_ROUTES,
  buildApiAuditCenter,
  buildApiAuditSnapshot,
  buildAuthenticationAudit,
  buildEndpointCoverageAudit,
  buildParsedRouteRegistry,
  buildRouteRegistryAudit,
  collectApiAuditPaths,
  computeApiSurfaceScore,
  toApiAuditCenterView,
  type ApiAuditRawSnapshot,
  type ApiAuditSources,
} from "../src/experience/api-audit/domain/api-audit.js";
import { AppError } from "../src/shared/errors/index.js";
import type { AuthContext } from "../src/shared/auth/index.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  isPostgresAvailable,
  runMigrations,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FIXED_TIME = new Date("2026-06-19T21:00:00.000Z");

function buildHealthyApiAuditSources(): ApiAuditSources {
  const existingPaths = new Set(collectApiAuditPaths());
  const serverSource = [
    "await registerApiAuditRoutes(app, deps.apiAudit);",
    "await registerArchitectureReviewRoutes(app, deps.architectureReview);",
    "await registerHealthRoutes(app);",
  ].join("\n");

  const routeSources: Record<string, string> = {
    "src/api/routes/api-audit.ts": [
      "export async function registerApiAuditRoutes",
      ...API_AUDIT_ROUTES.map(
        (route) => `app.get("${route}", { config: { authRequired: true } }`
      ),
    ].join("\n"),
    "src/api/routes/health.ts": [
      "export async function registerHealthRoutes",
      'app.get("/health", { config: { authRequired: false } }',
    ].join("\n"),
    "src/api/routes/contracts.ts": [
      "export async function registerContractRoutes",
      'app.get("/contracts", { config: { authRequired: true } }',
      'app.post("/contracts", { config: { authRequired: true } }',
      'app.patch("/contracts/:id", { config: { authRequired: true } }',
      'app.delete("/contracts/:id", { config: { authRequired: true } }',
    ].join("\n"),
    "src/api/routes/analytics.ts": [
      "export async function registerAnalyticsRoutes",
      'app.get("/analytics", { config: { authRequired: false } }',
    ].join("\n"),
  };

  return {
    serverSource,
    packageSource: '"verify:x24"\n"lint:imports"',
    existingPaths,
    routeSources,
    documentationSources: {
      "docs/experience/X24-API-Surface-Audit-Center.md": [
        ...API_AUDIT_ROUTES,
        "/contracts",
        "/health",
      ].join("\n"),
    },
  };
}

function buildUnitRawSnapshot(): ApiAuditRawSnapshot {
  return {
    sources: buildHealthyApiAuditSources(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x24-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x24-customer-session",
});

async function seedX24Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x24@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x24@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X24 API surface audit center", () => {
  describe("domain (unit)", () => {
    it("builds deterministic route registry and endpoint coverage", () => {
      const raw = buildUnitRawSnapshot();
      const routes = buildParsedRouteRegistry(raw.sources);
      const routeRegistry = buildRouteRegistryAudit(routes, raw.sources);
      const endpointCoverage = buildEndpointCoverageAudit(routes);
      const authentication = buildAuthenticationAudit(routes);

      assert.ok(routeRegistry.registeredRoutes.length >= API_AUDIT_ROUTES.length);
      assert.equal(routeRegistry.duplicateRoutes.length, 0);
      assert.ok(endpointCoverage.totalEndpoints >= 10);
      assert.ok(endpointCoverage.getCount >= 1);
      assert.ok(endpointCoverage.postCount >= 1);
      assert.ok(authentication.protectedRoutes.length >= 1);
      assert.ok(authentication.missingProtectionWarnings.length >= 1);
    });

    it("computes weighted API surface score and center view", () => {
      const snapshot = buildApiAuditSnapshot({ raw: buildUnitRawSnapshot(), generatedAt: FIXED_TIME });
      const center = buildApiAuditCenter({ snapshot });
      const view = toApiAuditCenterView(center);

      assert.equal(view.overview.headline, "APP13 API surface audit center");
      assert.ok(view.surface_score.score >= 0);
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(view.recommendations.summary.length > 0);

      const surfaceScore = computeApiSurfaceScore({
        routeRegistry: snapshot.routeRegistry,
        endpointCoverage: snapshot.endpointCoverage,
        authentication: snapshot.authentication,
        documentation: snapshot.documentation,
        productionReadiness: snapshot.productionReadiness,
      });
      assert.equal(surfaceScore.score, snapshot.surfaceScore.score);
    });
  });

  describe("integration (postgres)", () => {
    before(async () => {
      postgresReady = await isPostgresAvailable();
      if (!postgresReady) return;
      try {
        runMigrations();
        db = await createTestDbPool();
        await db.query(
          `DELETE FROM identity.users WHERE email IN ('admin-x24@test.app13', 'customer-x24@test.app13')`
        );
        const admin = await seedX24Admin(db);
        const customer = await seedSampleCustomer(db);
        adminUserId = admin.adminUserId;
        customerUserId = customer.customerUserId;
      } catch {
        postgresReady = false;
      }
    });

    after(async () => {
      if (db) await db.close();
    });

    it("loads API audit center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { apiAudit } = createApiAuditModule(db, { rootDir: ROOT_DIR });
      const view = await apiAudit.getApiAuditCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "APP13 API surface audit center");
      assert.ok(view.route_registry.registered_routes.length > 50);
      assert.ok(view.surface_score.score >= 0);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { apiAudit } = createApiAuditModule(db, { rootDir: ROOT_DIR });

      const overview = await apiAudit.getApiOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const routes = await apiAudit.getRouteRegistryAudit(ADMIN_AUTH(adminUserId));
      assert.ok(routes.registered_routes.length > 50);

      const endpoints = await apiAudit.getEndpointCoverageAudit(ADMIN_AUTH(adminUserId));
      assert.ok(endpoints.total_endpoints > 50);

      const auth = await apiAudit.getAuthenticationAudit(ADMIN_AUTH(adminUserId));
      assert.ok(auth.protected_routes.length > 0);

      const documentation = await apiAudit.getApiDocumentationAudit(ADMIN_AUTH(adminUserId));
      assert.ok(documentation.coverage_score >= 0);

      const modules = await apiAudit.getModuleExposureAudit(ADMIN_AUTH(adminUserId));
      assert.ok(modules.module_count > 20);

      const readiness = await apiAudit.getApiProductionReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(readiness.readiness_score >= 0);

      const risks = await apiAudit.getApiRiskRegister(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(risks.risks));

      const recommendations = await apiAudit.getApiRecommendations(ADMIN_AUTH(adminUserId));
      assert.ok(recommendations.summary.length > 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { apiAudit } = createApiAuditModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () => apiAudit.getApiAuditCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers API audit routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { apiAudit } = createApiAuditModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x24");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerApiAuditRoutes(app, apiAudit);

      for (const routePath of API_AUDIT_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
