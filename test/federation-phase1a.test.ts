import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import {
  isPersonActive,
  isEmailVerified,
  isCredentialActive,
  PERSON_ALLOWED_FIELDS,
  PERSON_FORBIDDEN_FIELD_MARKERS,
  registerPersonSchema,
  linkProviderCredentialSchema,
  type Person,
  type Credential,
} from "../src/federation/domain/index.js";
import { FederationPersonService } from "../src/federation/application/index.js";
import {
  hashPassword,
  verifyPassword,
} from "../src/identity/infrastructure/password-hasher.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const samplePerson: Person = {
  id: "11111111-1111-1111-1111-111111111111",
  primaryEmail: "person@example.com",
  emailVerifiedAt: null,
  status: "active",
  displayName: "Test Person",
  locale: "en",
  authLevel: "L1",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

// ---------------------------------------------------------------------------
// Unit — no database required
// ---------------------------------------------------------------------------
describe("Federation Phase 1A — domain", () => {
  it("isPersonActive true only when active and not soft-deleted", () => {
    assert.equal(isPersonActive(samplePerson), true);
    assert.equal(isPersonActive({ ...samplePerson, status: "suspended" }), false);
    assert.equal(isPersonActive({ ...samplePerson, deletedAt: new Date() }), false);
  });

  it("isEmailVerified reflects emailVerifiedAt", () => {
    assert.equal(isEmailVerified(samplePerson), false);
    assert.equal(
      isEmailVerified({ ...samplePerson, emailVerifiedAt: new Date() }),
      true
    );
  });

  it("isCredentialActive true only when active and not soft-deleted", () => {
    const cred: Credential = {
      id: "c",
      personId: samplePerson.id,
      type: "password",
      secretRef: "scrypt:x:y",
      providerSubject: null,
      status: "active",
      lastUsedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    assert.equal(isCredentialActive(cred), true);
    assert.equal(isCredentialActive({ ...cred, status: "revoked" }), false);
  });
});

describe("Federation Phase 1A — Person holds NO engine data", () => {
  it("every Person field is in the allow-list", () => {
    for (const key of Object.keys(samplePerson)) {
      assert.ok(
        (PERSON_ALLOWED_FIELDS as readonly string[]).includes(key),
        `unexpected Person field: ${key}`
      );
    }
  });

  it("no Person field matches a forbidden engine-data marker", () => {
    for (const key of PERSON_ALLOWED_FIELDS) {
      const lower = String(key).toLowerCase();
      for (const marker of PERSON_FORBIDDEN_FIELD_MARKERS) {
        assert.ok(
          !lower.includes(marker),
          `Person field "${key}" must not contain engine marker "${marker}"`
        );
      }
    }
  });
});

describe("Federation Phase 1A — validation schemas", () => {
  it("normalizes email (trim + lowercase)", () => {
    const parsed = registerPersonSchema.parse({ email: "  Foo@Example.COM " });
    assert.equal(parsed.email, "foo@example.com");
  });

  it("rejects invalid email", () => {
    assert.throws(() => registerPersonSchema.parse({ email: "not-an-email" }));
  });

  it("rejects too-short password", () => {
    assert.throws(() =>
      registerPersonSchema.parse({ email: "a@b.com", password: "short" })
    );
  });

  it("accepts provider credential input for apple/google only", () => {
    assert.deepEqual(
      linkProviderCredentialSchema.parse({
        type: "google",
        providerSubject: "sub-123",
      }),
      { type: "google", providerSubject: "sub-123" }
    );
    assert.throws(() =>
      linkProviderCredentialSchema.parse({ type: "password", providerSubject: "x" })
    );
  });
});

describe("Federation Phase 1A — credential hashing reuses identity hasher", () => {
  it("hashPassword/verifyPassword round-trips (no duplicated logic)", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.match(hash, /^scrypt:[0-9a-f]+:[0-9a-f]+$/);
    assert.equal(await verifyPassword("correct horse battery staple", hash), true);
    assert.equal(await verifyPassword("wrong", hash), false);
  });
});

describe("Federation Phase 1A — migration isolation (static)", () => {
  const sql = readFileSync(
    path.resolve(
      __dirname,
      "../database/migrations/021_federation_identity_foundation.sql"
    ),
    "utf8"
  );

  it("creates only the federation schema and its tables", () => {
    assert.match(sql, /CREATE SCHEMA IF NOT EXISTS federation/);
    assert.match(sql, /CREATE TABLE federation\.person/);
    assert.match(sql, /CREATE TABLE federation\.credential/);
  });

  it("never ALTERs or DROPs any existing engine schema/table", () => {
    for (const schema of [
      "identity",
      "action",
      "contract",
      "execution",
      "complaint",
      "trust",
      "experience",
    ]) {
      assert.ok(
        !new RegExp(`ALTER\\s+TABLE\\s+${schema}\\.`, "i").test(sql),
        `migration must not ALTER ${schema}`
      );
      assert.ok(
        !new RegExp(`DROP\\s+(TABLE|SCHEMA)\\s+${schema}`, "i").test(sql),
        `migration must not DROP ${schema}`
      );
    }
  });

  it("creates no cross-schema foreign keys into engine schemas", () => {
    assert.ok(
      !/REFERENCES\s+identity\./i.test(sql),
      "federation must not FK into identity"
    );
    assert.ok(
      !/REFERENCES\s+(action|contract|execution|complaint|trust)\./i.test(sql),
      "federation must not FK into engine schemas"
    );
  });

  it("federation.person has no forbidden engine columns", () => {
    const personBlock = sql.slice(
      sql.indexOf("CREATE TABLE federation.person"),
      sql.indexOf("CREATE UNIQUE INDEX uq_person_primary_email")
    );
    for (const marker of ["contract", "action", "passport", "reflection", "pattern", "trust_score", "behavior"]) {
      assert.ok(
        !personBlock.toLowerCase().includes(marker),
        `federation.person must not contain "${marker}"`
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Integration — requires a Postgres with migration 021 applied.
// Skipped automatically when DATABASE_URL is not set.
// ---------------------------------------------------------------------------
const HAS_DB = Boolean(process.env.DATABASE_URL);

describe("Federation Phase 1A — integration (DB)", { skip: !HAS_DB }, () => {
  let pool: pg.Pool;
  let db: {
    pool: pg.Pool;
    query: (text: string, values?: unknown[]) => Promise<pg.QueryResult>;
    withTransaction: <T>(fn: (tx: pg.PoolClient) => Promise<T>) => Promise<T>;
    close: () => Promise<void>;
  };
  let service: FederationPersonService;
  let schemaPresent = false;
  const cleanupEmails: string[] = [];

  before(async () => {
    pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
    db = {
      pool,
      query: (text, values) => pool.query(text, values),
      async withTransaction(fn) {
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          const r = await fn(client);
          await client.query("COMMIT");
          return r;
        } catch (e) {
          await client.query("ROLLBACK");
          throw e;
        } finally {
          client.release();
        }
      },
      async close() {
        await pool.end();
      },
    };
    const reg = await pool.query("SELECT to_regclass('federation.person') AS t");
    schemaPresent = reg.rows[0].t !== null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    service = new FederationPersonService({ db: db as any });
  });

  after(async () => {
    if (pool) {
      for (const email of cleanupEmails) {
        await pool.query(
          "DELETE FROM federation.person WHERE lower(primary_email) = lower($1)",
          [email]
        );
      }
      await pool.end();
    }
  });

  it("creates a Person and finds it by email", async (t) => {
    if (!schemaPresent) return t.skip("run migrations first (021)");
    const email = `p1a+${Date.now()}@example.com`;
    cleanupEmails.push(email);
    const person = await service.registerPerson({ email, password: "supersecret123" });
    assert.equal(person.primaryEmail, email);
    const found = await service.findByEmail(email);
    assert.equal(found?.id, person.id);
  });

  it("links a password credential to the Person", async (t) => {
    if (!schemaPresent) return t.skip("run migrations first (021)");
    const email = `p1a+${Date.now()}-cred@example.com`;
    cleanupEmails.push(email);
    const person = await service.registerPerson({ email, password: "supersecret123" });
    const creds = await service.listCredentials(person.id);
    assert.equal(creds.length, 1);
    assert.equal(creds[0].type, "password");
    assert.ok(creds[0].secretRef && creds[0].secretRef.startsWith("scrypt:"));
    // and it verifies
    const verified = await service.verifyEmailCredentials({ email, password: "supersecret123" });
    assert.equal(verified?.id, person.id);
  });

  it("prevents duplicate accounts by email", async (t) => {
    if (!schemaPresent) return t.skip("run migrations first (021)");
    const email = `p1a+${Date.now()}-dup@example.com`;
    cleanupEmails.push(email);
    await service.registerPerson({ email });
    await assert.rejects(() => service.registerPerson({ email }), /already registered/i);
  });

  it("leaves the existing identity system intact (identity.users still queryable)", async (t) => {
    if (!schemaPresent) return t.skip("run migrations first (021)");
    const r = await pool.query("SELECT to_regclass('identity.users') AS t");
    assert.notEqual(r.rows[0].t, null, "identity.users must still exist");
  });
});
