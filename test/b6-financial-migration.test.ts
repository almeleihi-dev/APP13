import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import {
  createTestDbPool,
  runMigrations,
  seedPartyUsers,
  resetContractEngineData,
  isPostgresAvailable,
  DEFAULT_DATABASE_URL,
  listAppliedMigrations,
} from "./helpers/postgres-integration.js";
import type { DbPool } from "../src/shared/db/index.js";

const FINANCIAL_MIGRATIONS = [
  "011_financial_schema",
  "012_financial_ledger",
  "013_financial_escrow",
  "014_financial_processors",
];

let db: DbPool;
let postgresReady = false;

async function resetFinancialData(dbPool: DbPool): Promise<void> {
  await dbPool.query(`
    TRUNCATE TABLE
      financial.processor_webhook_log,
      financial.settlement_instructions,
      financial.payment_intents,
      financial.escrow_status_history,
      financial.ledger_entries,
      financial.journals,
      financial.escrow_agreements,
      financial.accounts
    RESTART IDENTITY CASCADE
  `);
  await resetContractEngineData(dbPool);
}

async function seedMinimalContract(dbPool: DbPool): Promise<string> {
  const parties = await seedPartyUsers(dbPool);
  const action = await dbPool.query<{ id: string }>(
    `
      INSERT INTO action.actions (
        action_code, action_name, domain, customer_id, provider_id,
        title, template_id, status, tekrr_completeness
      )
      VALUES ('A.2.1', 'Financial test', 'A', $1, $2, 'T', 'CT-A.2.1@v1', 'contract_active', 100)
      RETURNING id
    `,
    [parties.customerId, parties.providerId]
  );
  const contract = await dbPool.query<{ id: string }>(
    `
      INSERT INTO contract.contracts (
        action_id, customer_id, provider_id, contract_number, template_id,
        template_version, jurisdiction_pack, status, tekrr_snapshot, document_hash,
        pdf_storage_key, payment_ready, escrow_ready
      )
      VALUES ($1, $2, $3, 'CTR-FIN-1', 'CT-A.2.1@v1', '1.0.0', 'US-GENERIC-v1', 'active',
              '{}', 'sha256:fin', 'k-fin', true, true)
      RETURNING id
    `,
    [action.rows[0].id, parties.customerId, parties.providerId]
  );
  return contract.rows[0].id;
}

describe("B6 financial PostgreSQL migrations", () => {
  before(async () => {
    postgresReady = await isPostgresAvailable();
    if (!postgresReady) {
      throw new Error(
        `PostgreSQL unavailable at ${DEFAULT_DATABASE_URL} — run: docker compose up -d postgres`
      );
    }
    await runMigrations();
    db = await createTestDbPool();
  });

  after(async () => {
    if (db) await db.close();
  });

  it("applies migrations 011–014", async () => {
    const applied = await listAppliedMigrations(db);
    for (const version of FINANCIAL_MIGRATIONS) {
      assert.ok(applied.includes(version), `missing migration ${version}`);
    }
  });

  it("FK-2: financial schema has no balance columns", async () => {
    const result = await db.query<{ table_name: string; column_name: string }>(
      `
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_schema = 'financial'
          AND column_name ILIKE '%balance%'
      `
    );
    assert.equal(
      result.rowCount,
      0,
      `unexpected balance columns: ${result.rows.map((r) => `${r.table_name}.${r.column_name}`).join(", ")}`
    );
  });

  it("ledger_entries are append-only", async () => {
    await resetFinancialData(db);
    const contractId = await seedMinimalContract(db);
    const escrow = await db.query<{ id: string }>(
      `
        INSERT INTO financial.escrow_agreements (
          contract_id, gross_amount_minor, platform_fee_minor, currency_code, status
        )
        VALUES ($1, 100000, 10000, 'USD', 'held')
        RETURNING id
      `,
      [contractId]
    );
    const customerAcct = await db.query<{ id: string }>(
      `
        INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
        VALUES ('test:customer:append', 'customer_wallet', 'USD', 'platform')
        RETURNING id
      `
    );
    const escrowAcct = await db.query<{ id: string }>(
      `
        INSERT INTO financial.accounts (
          account_code, account_type, currency_code, owner_entity_type, owner_entity_id
        )
        VALUES ('test:escrow:append', 'escrow_contract', 'USD', 'escrow', $1)
        RETURNING id
      `,
      [escrow.rows[0].id]
    );
    const journal = await db.query<{ id: string }>(
      `
        INSERT INTO financial.journals (journal_type, idempotency_key, escrow_id, contract_id)
        VALUES ('escrow_hold', 'b6-append-only-journal', $1, $2)
        RETURNING id
      `,
      [escrow.rows[0].id, contractId]
    );

    const client = new pg.Client({ connectionString: DEFAULT_DATABASE_URL });
    await client.connect();
    let entryId: string;
    try {
      await client.query("BEGIN");
      const entry = await client.query<{ id: string }>(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor, currency_code, entry_type, sequence_no
          )
          VALUES ($1, $2, 'debit', 100000, 'USD', 'hold', 1)
          RETURNING id
        `,
        [journal.rows[0].id, customerAcct.rows[0].id]
      );
      entryId = entry.rows[0].id;
      await client.query(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor, currency_code, entry_type, sequence_no
          )
          VALUES ($1, $2, 'credit', 100000, 'USD', 'hold', 2)
        `,
        [journal.rows[0].id, escrowAcct.rows[0].id]
      );
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      await client.end();
    }

    await assert.rejects(
      () =>
        db.query(`UPDATE financial.ledger_entries SET amount_minor = 1 WHERE id = $1`, [entryId!]),
      (err: unknown) => {
        const pgErr = err as { message?: string };
        return Boolean(pgErr.message?.includes("append-only"));
      }
    );
  });

  it("rejects unbalanced journals at commit", async () => {
    await resetFinancialData(db);
    const contractId = await seedMinimalContract(db);
    const escrow = await db.query<{ id: string }>(
      `
        INSERT INTO financial.escrow_agreements (
          contract_id, gross_amount_minor, platform_fee_minor, currency_code, status
        )
        VALUES ($1, 50000, 5000, 'USD', 'held')
        RETURNING id
      `,
      [contractId]
    );
    const acct = await db.query<{ id: string }>(
      `
        INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
        VALUES ('test:unbalanced', 'suspense', 'USD', 'platform')
        RETURNING id
      `
    );
    const journal = await db.query<{ id: string }>(
      `
        INSERT INTO financial.journals (journal_type, idempotency_key, escrow_id, contract_id)
        VALUES ('fund_capture', 'b6-unbalanced-journal', $1, $2)
        RETURNING id
      `,
      [escrow.rows[0].id, contractId]
    );

    const client = new pg.Client({ connectionString: DEFAULT_DATABASE_URL });
    await client.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor, currency_code, entry_type, sequence_no
          )
          VALUES ($1, $2, 'debit', 50000, 'USD', 'capture', 1)
        `,
        [journal.rows[0].id, acct.rows[0].id]
      );
      await assert.rejects(
        () => client.query("COMMIT"),
        (err: unknown) => {
          const pgErr = err as { message?: string };
          return Boolean(pgErr.message?.includes("not balanced"));
        }
      );
      await client.query("ROLLBACK");
    } finally {
      await client.end();
    }
  });

  it("EI-1: blocks disbursement journals while escrow is frozen", async () => {
    await resetFinancialData(db);
    const contractId = await seedMinimalContract(db);
    const escrow = await db.query<{ id: string }>(
      `
        INSERT INTO financial.escrow_agreements (
          contract_id, gross_amount_minor, platform_fee_minor, currency_code, status, frozen_at, frozen_reason
        )
        VALUES ($1, 100000, 10000, 'USD', 'frozen', now(), 'issue_raised')
        RETURNING id
      `,
      [contractId]
    );

    await assert.rejects(
      () =>
        db.query(
          `
            INSERT INTO financial.journals (journal_type, idempotency_key, escrow_id, contract_id)
            VALUES ('escrow_release', 'b6-frozen-release', $1, $2)
          `,
          [escrow.rows[0].id, contractId]
        ),
      (err: unknown) => {
        const pgErr = err as { message?: string };
        return Boolean(pgErr.message?.includes("frozen"));
      }
    );
  });

  it("accepts balanced escrow_hold journal", async () => {
    await resetFinancialData(db);
    const contractId = await seedMinimalContract(db);
    const escrow = await db.query<{ id: string }>(
      `
        INSERT INTO financial.escrow_agreements (
          contract_id, gross_amount_minor, platform_fee_minor, currency_code, status
        )
        VALUES ($1, 75000, 7500, 'USD', 'funded')
        RETURNING id
      `,
      [contractId]
    );
    const customerAcct = await db.query<{ id: string }>(
      `
        INSERT INTO financial.accounts (account_code, account_type, currency_code, owner_entity_type)
        VALUES ($1, 'customer_wallet', 'USD', 'platform')
        RETURNING id
      `,
      [`test:customer:balanced:${escrow.rows[0].id}`]
    );
    const escrowAcct = await db.query<{ id: string }>(
      `
        INSERT INTO financial.accounts (
          account_code, account_type, currency_code, owner_entity_type, owner_entity_id
        )
        VALUES ($1, 'escrow_contract', 'USD', 'escrow', $2)
        RETURNING id
      `,
      [`test:escrow:balanced:${escrow.rows[0].id}`, escrow.rows[0].id]
    );

    const client = new pg.Client({ connectionString: DEFAULT_DATABASE_URL });
    await client.connect();
    try {
      await client.query("BEGIN");
      const journal = await client.query<{ id: string }>(
        `
          INSERT INTO financial.journals (journal_type, idempotency_key, escrow_id, contract_id)
          VALUES ('escrow_hold', $1, $2, $3)
          RETURNING id
        `,
        [`b6-balanced-${escrow.rows[0].id}`, escrow.rows[0].id, contractId]
      );
      await client.query(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor, currency_code, entry_type, sequence_no
          )
          VALUES ($1, $2, 'debit', 75000, 'USD', 'hold', 1)
        `,
        [journal.rows[0].id, customerAcct.rows[0].id]
      );
      await client.query(
        `
          INSERT INTO financial.ledger_entries (
            journal_id, account_id, direction, amount_minor, currency_code, entry_type, sequence_no
          )
          VALUES ($1, $2, 'credit', 75000, 'USD', 'hold', 2)
        `,
        [journal.rows[0].id, escrowAcct.rows[0].id]
      );
      await client.query("COMMIT");

      const check = await db.query<{ net: string }>(
        `
          SELECT SUM(
            CASE WHEN direction = 'debit' THEN amount_minor ELSE -amount_minor END
          ) AS net
          FROM financial.ledger_entries
          WHERE journal_id = $1
        `,
        [journal.rows[0].id]
      );
      assert.equal(Number(check.rows[0].net), 0);
    } finally {
      await client.end();
    }
  });
});
