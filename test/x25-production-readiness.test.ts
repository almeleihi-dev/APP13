import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import Fastify from "fastify";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { errorHandler } from "../src/api/middleware/request.js";
import { requireAuthMiddleware } from "../src/api/middleware/require-auth.js";
import { registerProductionReadinessRoutes } from "../src/api/routes/production-readiness.js";
import { createProductionReadinessModule } from "../src/experience/production-readiness/module.js";
import {
  PRODUCTION_READINESS_ROUTES,
  REQUIRED_ENV_VARIABLES,
  buildEnvironmentAudit,
  buildProductionReadinessCenter,
  buildProductionReadinessSnapshot,
  buildProductionRiskRegister,
  collectProductionReadinessPaths,
  computeProductionReadinessScore,
  toProductionReadinessCenterView,
  type ProductionReadinessRawSnapshot,
  type ProductionReadinessSources,
} from "../src/experience/production-readiness/domain/production-readiness.js";
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
const FIXED_TIME = new Date("2026-06-19T22:00:00.000Z");

function buildHealthyProductionSources(): ProductionReadinessSources {
  const existingPaths = new Set(collectProductionReadinessPaths());
  for (const file of [
    "001_initial_schema.sql",
    "006_audit.sql",
    "010_upload_intents.sql",
    "015_security_kernel.sql",
  ]) {
    existingPaths.add(`database/migrations/${file}`);
  }

  const envExampleSource = REQUIRED_ENV_VARIABLES.map((variable) => `${variable}=value`).join("\n");

  return {
    envExampleSource,
    packageSource: [
      '"build"',
      '"start"',
      '"migrate"',
      '"node": ">=20"',
    ].join("\n"),
    dockerComposeSource: [
      "postgres:",
      "healthcheck:",
      "postgres_data:",
      "minio_data:",
      "redis:",
      "minio-init",
      "app13-evidence",
    ].join("\n"),
    configSource: 'databaseUrl: z.string().min(1)\nsecret: z.string().min(32)\nloadConfig',
    indexSource: "createLogger\nbuildServer",
    serverSource: "requireAuthMiddleware\ncreateAuthenticateMiddleware\nsecurityAuth\nerrorHandler",
    migrateScriptSource: "schema_migrations\nmigrations complete",
    s3StorageSource: "createObjectStorage\ncreatePresignedPut\nHeadObjectCommand",
    healthRouteSource: 'app.get("/health"',
    loggingSource: "createLogger",
    migrationFiles: ["001_initial_schema.sql", "006_audit.sql"],
    existingPaths,
    runtimeEnvKeys: new Set(REQUIRED_ENV_VARIABLES),
    migrationStatus: {
      totalMigrationFiles: 2,
      appliedMigrations: 2,
      pendingMigrations: 0,
      migrationsTablePresent: true,
    },
  };
}

function buildUnitRawSnapshot(): ProductionReadinessRawSnapshot {
  return {
    sources: buildHealthyProductionSources(),
  };
}

const ADMIN_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["platform_admin"],
  tier: "T1",
  status: "active",
  sessionId: "x25-admin-session",
});

const CUSTOMER_AUTH = (userId: string): AuthContext => ({
  userId,
  roles: ["customer"],
  tier: "T1",
  status: "active",
  sessionId: "x25-customer-session",
});

async function seedX25Admin(db: DbPool) {
  const adminUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('admin-x25@test.app13', 'hash', 'admin', now(), 'T1')
      RETURNING id
    `
  );

  return { adminUserId: adminUser.rows[0].id };
}

async function seedSampleCustomer(db: DbPool) {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-x25@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );

  return { customerUserId: customerUser.rows[0].id };
}

let db: DbPool | undefined;
let postgresReady = false;
let adminUserId: string | undefined;
let customerUserId: string | undefined;

describe("X25 production readiness center", () => {
  describe("domain (unit)", () => {
    it("builds environment audit and risk register deterministically", () => {
      const sources = buildHealthyProductionSources();
      const environment = buildEnvironmentAudit(sources);
      const snapshot = buildProductionReadinessSnapshot({
        raw: { sources },
        generatedAt: FIXED_TIME,
      });
      const riskRegister = buildProductionRiskRegister({
        environment: snapshot.environment,
        database: snapshot.database,
        storage: snapshot.storage,
        security: snapshot.security,
        monitoring: snapshot.monitoring,
        deployment: snapshot.deployment,
        disasterRecovery: snapshot.disasterRecovery,
      });

      assert.equal(environment.missingVariables.length, 0);
      assert.equal(environment.environmentCoverageScore, 100);
      assert.ok(snapshot.readinessScore.score >= 70);
      assert.ok(riskRegister.risks.length <= 3);
    });

    it("computes weighted production readiness score and center view", () => {
      const snapshot = buildProductionReadinessSnapshot({
        raw: buildUnitRawSnapshot(),
        generatedAt: FIXED_TIME,
      });
      const center = buildProductionReadinessCenter({ snapshot });
      const view = toProductionReadinessCenterView(center);

      assert.equal(view.overview.headline, "APP13 production readiness center");
      assert.equal(view.generated_at, FIXED_TIME.toISOString());
      assert.ok(view.readiness_score.score >= 0);

      const score = computeProductionReadinessScore({
        environment: snapshot.environment,
        database: snapshot.database,
        storage: snapshot.storage,
        security: snapshot.security,
        monitoring: snapshot.monitoring,
        deployment: snapshot.deployment,
        disasterRecovery: snapshot.disasterRecovery,
      });
      assert.equal(score.score, snapshot.readinessScore.score);
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
          `DELETE FROM identity.users WHERE email IN ('admin-x25@test.app13', 'customer-x25@test.app13')`
        );
        const admin = await seedX25Admin(db);
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

    it("loads production readiness center for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { productionReadiness } = createProductionReadinessModule(db, { rootDir: ROOT_DIR });
      const view = await productionReadiness.getProductionReadinessCenter(
        ADMIN_AUTH(adminUserId)
      );

      assert.equal(view.overview.headline, "APP13 production readiness center");
      assert.ok(view.readiness_score.score >= 0);
      assert.ok(view.environment.required_variables.length > 10);
    });

    it("returns section endpoints for platform admin", async (t) => {
      if (!postgresReady || !db || !adminUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { productionReadiness } = createProductionReadinessModule(db, { rootDir: ROOT_DIR });

      const overview = await productionReadiness.getProductionOverview(ADMIN_AUTH(adminUserId));
      assert.ok(overview.summary.length > 0);

      const environment = await productionReadiness.getEnvironmentAudit(ADMIN_AUTH(adminUserId));
      assert.ok(environment.required_variables.length > 0);

      const database = await productionReadiness.getDatabaseReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(["ready", "attention_required", "blocked"].includes(database.postgres_readiness));

      const storage = await productionReadiness.getStorageReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(storage.summary.length > 0);

      const security = await productionReadiness.getSecurityReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(security.security_score >= 0);

      const monitoring = await productionReadiness.getMonitoringReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(monitoring.observability_score >= 0);

      const deployment = await productionReadiness.getDeploymentReadiness(ADMIN_AUTH(adminUserId));
      assert.ok(deployment.deployment_score >= 0);

      const disasterRecovery = await productionReadiness.getDisasterRecoveryReadiness(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(disasterRecovery.recovery_score >= 0);

      const risks = await productionReadiness.getProductionRiskRegister(ADMIN_AUTH(adminUserId));
      assert.ok(Array.isArray(risks.risks));

      const recommendations = await productionReadiness.getLaunchRecommendations(
        ADMIN_AUTH(adminUserId)
      );
      assert.ok(recommendations.summary.length > 0);
    });

    it("rejects non-admin callers", async (t) => {
      if (!postgresReady || !db || !customerUserId) {
        t.skip(`PostgreSQL unavailable at ${DEFAULT_DATABASE_URL}`);
        return;
      }

      const { productionReadiness } = createProductionReadinessModule(db, { rootDir: ROOT_DIR });

      await assert.rejects(
        () =>
          productionReadiness.getProductionReadinessCenter(
            CUSTOMER_AUTH(customerUserId!)
          ),
        (error: unknown) => error instanceof AppError && error.problem.status === 403
      );
    });
  });

  describe("route layer (smoke)", () => {
    it("registers production readiness routes behind auth middleware", async () => {
      const repository = {
        loadRawSnapshot: async () => buildUnitRawSnapshot(),
      };
      const { productionReadiness } = createProductionReadinessModule({} as DbPool, {
        repository: repository as never,
      });

      const app = Fastify();
      app.decorateRequest("authContext", null);
      app.addHook("preHandler", async (request) => {
        request.authContext = ADMIN_AUTH("admin-route-x25");
      });
      app.addHook("preHandler", requireAuthMiddleware);
      app.setErrorHandler(errorHandler);
      await registerProductionReadinessRoutes(app, productionReadiness);

      for (const routePath of PRODUCTION_READINESS_ROUTES) {
        const response = await app.inject({ method: "GET", url: routePath });
        assert.equal(response.statusCode, 200, `expected 200 for ${routePath}`);
      }

      await app.close();
    });
  });
});
