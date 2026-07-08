import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerSecurityReadinessRoutes } from "../src/api/routes/security-readiness.js";
import { createSecurityReadinessModule } from "../src/experience/security-readiness/module.js";
import {
  REQUIRED_SECRET_KEYS,
  SECURITY_READINESS_ROUTES,
  buildAuthenticationAudit,
  buildAuthorizationAudit,
  buildParsedSecurityRoutes,
  buildSecretsAudit,
  buildSecurityReadinessCenter,
  buildSecurityReadinessSnapshot,
  buildSecurityRiskRegister,
  computeSecurityReadinessScore,
  toSecurityReadinessCenterView,
  type SecurityReadinessRawSnapshot,
  type SecurityReadinessSources,
} from "../src/experience/security-readiness/domain/security-readiness.js";
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
const FIXED_TIME = new Date("2026-06-19T23:00:00.000Z");

function buildHealthySecuritySources(): SecurityReadinessSources {
  const existingPaths = new Set([
    "database/migrations/006_audit.sql",
    "database/migrations/010_upload_intents.sql",
    "database/migrations/015_security_kernel.sql",
    "database/migrations/020_event_inbox.sql",
    "database/migrations/001_initial_schema.sql",
    "database/migrations/013_financial_escrow.sql",
    "database/migrations/007_schema_v1_1_p0.sql",
  ]);

  const envExampleSource = REQUIRED_SECRET_KEYS.map((key) => `${key}=configured`).join("\n");

  return {
    serverSource: [
      "createAuthenticateMiddleware",
      "requireAuthMiddleware",
      "securityAudit",
      "registerNotificationRoutes",
      "logger",
    ].join("\n"),
    indexSource: "createLogger\nsecurityAudit\neventInbox\nbuildServer",
    packageSource: '"build"\n"start"',
    envExampleSource,
    configSource: 'jwt:\n  secret: z.string().min(32)\nJWT_SECRET\nverification',
    guardsSource: 'requireRole\nrequireOwnership\n"platform_admin"',
    requireAuthSource: "authRequired",
    authenticateSource: "jwt.verify",
    loggingSource: "createLogger",
    s3StorageSource: "createPresignedPut\nHeadObjectCommand",
    routeSources: {
      "src/api/routes/security-readiness.ts": [
        "export async function registerSecurityReadinessRoutes",
        ...SECURITY_READINESS_ROUTES.map(
          (route) => `app.get("${route}", { config: { authRequired: true } }`
        ),
      ].join("\n"),
      "src/api/routes/health.ts": 'app.get("/health", { config: { authRequired: false } }',
      "src/api/routes/contracts.ts": 'app.get("/contracts", { config: { authRequired: true } }',
      "src/api/routes/evidence.ts": 'app.post("/evidence", { config: { authRequired: true } }',
      "src/api/routes/analytics.ts": 'app.get("/analytics", { config: { authRequired: true } }',
    },
    documentationSources: {
      "docs/experience/X26-Security-Compliance-Readiness.md":
        "privacy consent contract evidence terms compliance",
    },
    serviceSources: {
      "src/experience/security-readiness/application/security-readiness-service.ts":
        'requireRole(authContext, "platform_admin")',
      "src/customer/application/customer-service.ts": 'requireRole(authContext, "customer")',
      "src/provider/application/provider-service.ts": 'requireRole(authContext, "provider")',
    },
    existingPaths,
    runtimeEnvKeys: new Set(REQUIRED_SECRET_KEYS),
  };
}

function buildUnitRawSnapshot(): SecurityReadinessRawSnapshot {
  return {
    sources: buildHealthySecuritySources(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x26-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x26-customer-session",
});

async function seedX26Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x26@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x26@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X26 security and compliance readiness center", () => {
  describe("domain (unit)", () => {
    it("builds authentication audit with protected route counts", () => {
      const sources = buildHealthySecuritySources();
      const routes = buildParsedSecurityRoutes(sources);
      const authentication = buildAuthenticationAudit({ sources, routes });

      assert.ok(authentication.protectedRouteCount >= 1);
      assert.equal(authentication.jwtCoverage, 100);
      assert.equal(authentication.authMiddlewareCoverage, 100);
    });

    it("builds authorization audit role enforcement statistics", () => {
      const authorization = buildAuthorizationAudit(buildHealthySecuritySources());

      assert.ok(authorization.platformAdmin.enforcementCount >= 1);
      assert.equal(authorization.roleEnforcementStatistics.length, 4);
      assert.ok(authorization.summary.includes("platform_admin"));
    });

    it("never exposes secret values in secrets audit output", () => {
      const secrets = buildSecretsAudit(buildHealthySecuritySources());

      assert.equal(secrets.missingKeys.length, 0);
      assert.equal(secrets.envKeyCoverage, 100);
      for (const indicator of secrets.hardcodedSecretIndicators) {
        assert.ok(!indicator.includes("configured"));
        assert.ok(!REQUIRED_SECRET_KEYS.some((key) => indicator.includes(process.env[key] ?? "")));
      }
    });

    it("computes weighted security readiness score deterministically", () => {
      const snapshot = buildSecurityReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildSecurityReadinessCenter({ snapshot });
      const view = toSecurityReadinessCenterView(center);

      assert.equal(view.overview.headline, "APP13 security and compliance readiness center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(view.readiness_score.security_readiness_score >= 70);

      const score = computeSecurityReadinessScore({
        authentication: snapshot.authentication,
        authorization: snapshot.authorization,
        apiSecurity: snapshot.apiSecurity,
        secrets: snapshot.secrets,
        dataProtection: snapshot.dataProtection,
        auditability: snapshot.auditability,
        compliance: snapshot.compliance,
        routes: buildParsedSecurityRoutes(buildHealthySecuritySources()),
      });
      assert.equal(score.securityReadinessScore, snapshot.readinessScore.securityReadinessScore);
    });

    it("builds security risk register with severity buckets", () => {
      const snapshot = buildSecurityReadinessSnapshot({ raw: buildUnitRawSnapshot() });
      const riskRegister = buildSecurityRiskRegister({
        authentication: snapshot.authentication,
        secrets: snapshot.secrets,
        apiSecurity: snapshot.apiSecurity,
        dataProtection: snapshot.dataProtection,
        auditability: snapshot.auditability,
        compliance: snapshot.compliance,
      });

      assert.ok(Array.isArray(riskRegister.critical));
      assert.ok(Array.isArray(riskRegister.high));
      assert.ok(riskRegister.summary.length > 0);
    });

    it("flags missing secret keys in unhealthy secrets audit", () => {
      const sources = buildHealthySecuritySources();
      sources.runtimeEnvKeys = new Set(["JWT_SECRET"]);
      const secrets = buildSecretsAudit(sources);

      assert.ok(secrets.missingKeys.length > 0);
      assert.ok(secrets.envKeyCoverage < 100);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x26@test.app13', 'customer-x26@test.app13')`
        );
        const admin = await seedX26Admin(db);
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

    it("loads security readiness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { securityReadiness } = createSecurityReadinessModule(db, { rootDir: ROOT_DIR });
      const view = await securityReadiness.getSecurityReadinessCenter(ADMIN_AUTH(adminUserId));

      assert.equal(view.overview.headline, "APP13 security and compliance readiness center");
      assert.ok(view.readiness_score.security_readiness_score >= 0);
      assert.ok(view.authentication.protected_route_count > 50);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { securityReadiness } = createSecurityReadinessModule(db, { rootDir: ROOT_DIR });

      const overview = await securityReadiness.getSecurityOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const authentication = await securityReadiness.getAuthenticationAudit(ADMIN_AUTH(adminUserId));
      assert.ok(authentication.protected_route_count > 0);

      const authorization = await securityReadiness.getAuthorizationAudit(ADMIN_AUTH(adminUserId));
      assert.ok(authorization.platform_admin.enforcement_count > 0);

      const secrets = await securityReadiness.getSecretsAudit(ADMIN_AUTH(adminUserId));
      assert.ok(secrets.required_keys.length > 0);

      const apiSecurity = await securityReadiness.getApiSecurityAudit(ADMIN_AUTH(adminUserId));
      assert.ok(apiSecurity.authenticated_routes.length > 0);

      const dataProtection = await securityReadiness.getDataProtectionAudit(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(dataProtection.summary.length > 0);

      const auditability = await securityReadiness.getAuditabilityReview(ADMIN_AUTH(adminUserId));
      assert.ok(auditability.audit_readiness >= 0);

      const compliance = await securityReadiness.getComplianceReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(compliance.privacy_readiness >= 0);

      const risks = await securityReadiness.getSecurityRiskRegister(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(risks.critical));

      const recommendations = await securityReadiness.getSecurityRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { securityReadiness } = createSecurityReadinessModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () =>
          securityReadiness.getSecurityReadinessCenter(CUSTOMER_AUTH(customerUserId!)),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers security readiness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { securityReadiness } = createSecurityReadinessModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x26");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerSecurityReadinessRoutes(app, securityReadiness);

      for (const routePath of SECURITY_READINESS_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
