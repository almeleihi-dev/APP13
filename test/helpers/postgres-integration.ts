import pg from "pg";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPool } from "../../src/shared/db/index.js";
import { createLogger } from "../../src/shared/logging/index.js";
import type { DbPool } from "../../src/shared/db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../..");

export const DEFAULT_DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://app13:app13@127.0.0.1:5432/app13";

export async function isPostgresAvailable(url = DEFAULT_DATABASE_URL): Promise<boolean> {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query("SELECT 1");
    return true;
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

/** Applies migrations via the existing `scripts/migrate.ts` CLI (same as `npm run migrate`). */
export function runMigrations(url = DEFAULT_DATABASE_URL): void {
  execSync("npm run migrate", {
    cwd: repoRoot,
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit",
  });
}

export async function createTestDbPool(url = DEFAULT_DATABASE_URL): Promise<DbPool> {
  const config = {
    env: "local" as const,
    serviceId: "app13-test",
    host: "127.0.0.1",
    port: 5432,
    logLevel: "error" as const,
    logPretty: false,
    databaseUrl: url,
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    s3: {
      bucket: "test",
      region: "us-east-1",
    },
    idempotencyTtlSeconds: 86400,
    jwt: {
      secret: "test-jwt-secret-minimum-32-characters-long",
      accessTtlSeconds: 900,
      issuer: "app13",
    },
    session: {
      cookieName: "app13_session",
      ttlSeconds: 604800,
      refreshTtlSeconds: 604800,
    },
    kyc: {
      webhookSecret: "local-kyc-webhook-secret",
      sandboxBaseUrl: "https://sandbox.kyc.app13.local",
    },
  };

  return createPool(config, createLogger(config));
}

export async function resetContractEngineData(db: DbPool): Promise<void> {
  await db.query(`
    TRUNCATE TABLE
      platform.domain_outbox,
      platform.operations,
      execution.attestations,
      execution.milestones,
      contract.contract_status_history,
      contract.contract_parties,
      contract.contracts,
      action.action_status_history,
      action.actions,
      identity.customers,
      identity.providers,
      identity.users
    RESTART IDENTITY CASCADE
  `);
}

export interface SeedUsers {
  customerUserId: string;
  providerUserId: string;
  customerId: string;
  providerId: string;
}

export async function seedPartyUsers(db: DbPool): Promise<SeedUsers> {
  const customerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('customer-b4@test.app13', 'hash', 'customer', now(), 'T1')
      RETURNING id
    `
  );
  const providerUser = await db.query<{ id: string }>(
    `
      INSERT INTO identity.users (email, password_hash, role, email_verified_at, verification_tier)
      VALUES ('provider-b4@test.app13', 'hash', 'provider', now(), 'T1')
      RETURNING id
    `
  );

  const customerUserId = customerUser.rows[0].id;
  const providerUserId = providerUser.rows[0].id;

  const customer = await db.query<{ id: string }>(
    `
      INSERT INTO identity.customers (user_id, display_name)
      VALUES ($1, 'B4 Customer')
      RETURNING id
    `,
    [customerUserId]
  );
  const provider = await db.query<{ id: string }>(
    `
      INSERT INTO identity.providers (user_id, display_name, status)
      VALUES ($1, 'B4 Provider', 'active')
      RETURNING id
    `,
    [providerUserId]
  );

  return {
    customerUserId,
    providerUserId,
    customerId: customer.rows[0].id,
    providerId: provider.rows[0].id,
  };
}

export const FULL_TEKRR_PROFILE = {
  T: { scheduled_start: "2026-07-01", completion_deadline: "2026-07-15" },
  E: { deliverables: ["surface repair"] },
  K: { standard_of_care: "industry standard" },
  R: { risk_level: 2 },
  S: { acceptance_criteria: "smooth finish" },
};

export async function listAppliedMigrations(db: DbPool): Promise<string[]> {
  const result = await db.query<{ version: string }>(
    "SELECT version FROM platform.schema_migrations ORDER BY version"
  );
  return result.rows.map((r) => r.version);
}

export async function countOutboxEvents(
  db: DbPool,
  eventType: string,
  contractId?: string
): Promise<number> {
  const result = await db.query<{ count: string }>(
    `
      SELECT COUNT(*) AS count FROM platform.domain_outbox
      WHERE event_type = $1
        AND ($2::text IS NULL OR payload->>'contract_id' = $2)
    `,
    [eventType, contractId ?? null]
  );
  return Number(result.rows[0].count);
}
