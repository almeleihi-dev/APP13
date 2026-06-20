import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import pg from "pg";
import { DomainEvents } from "../src/shared/events/index.js";
import { createActionService } from "../src/action/application/action-service.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  resetContractEngineData,
  runMigrations,
  seedPartyUsers,
  FULL_TEKRR_PROFILE,
  listAppliedMigrations,
  countOutboxEvents,
  isPostgresAvailable,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";

const REQUIRED_MIGRATIONS = [
  "001_initial_schema",
  "002_enums",
  "003_constraints",
  "004_indexes",
  "005_triggers",
  "006_audit",
  "007_schema_v1_1_p0",
  "008_operations",
  "009_execution_materialization_gate",
];

let db: DbPool;
let postgresReady = false;

describe("B4 PostgreSQL integration", { skip: false }, () => {
  before(async () => {
    postgresReady = await isPostgresAvailable();
    if (!postgresReady) {
      console.warn(
        `PostgreSQL unavailable at ${DEFAULT_DATABASE_URL} — start with: docker compose up -d postgres`
      );
      return;
    }

    await runMigrations();
    db = await createTestDbPool();
    await resetContractEngineData(db);
  });

  after(async () => {
    if (db) await db.close();
  });

  it("migration execution verification — all 001–008 applied", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    const applied = await listAppliedMigrations(db);
    for (const version of REQUIRED_MIGRATIONS) {
      assert.ok(applied.includes(version), `missing migration ${version}`);
    }
  });

  it("constraint verification — uq_contracts_action_id rejects duplicate", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);

    const action = await db.query<{ id: string }>(
      `
        INSERT INTO action.actions (
          action_code, action_name, domain, customer_id, provider_id,
          title, template_id, status, tekrr_completeness
        )
        VALUES ('A.2.1', 'Surface Repair', 'A', $1, $2, 'Test', 'CT-A.2.1@v1', 'ready_for_contract', 100)
        RETURNING id
      `,
      [parties.customerId, parties.providerId]
    );
    const actionId = action.rows[0].id;

    await db.query(
      `
        INSERT INTO contract.contracts (
          action_id, customer_id, provider_id, contract_number, template_id,
          template_version, jurisdiction_pack, status, tekrr_snapshot, document_hash, pdf_storage_key
        )
        VALUES ($1, $2, $3, 'CTR-TEST-1', 'CT-A.2.1@v1', '1.0.0', 'US-GENERIC-v1', 'proposed', '{}', 'sha256:abc', 'k1')
      `,
      [actionId, parties.customerId, parties.providerId]
    );

    await assert.rejects(
      () =>
        db.query(
          `
            INSERT INTO contract.contracts (
              action_id, customer_id, provider_id, contract_number, template_id,
              template_version, jurisdiction_pack, status, tekrr_snapshot, document_hash, pdf_storage_key
            )
            VALUES ($1, $2, $3, 'CTR-TEST-2', 'CT-A.2.1@v1', '1.0.0', 'US-GENERIC-v1', 'proposed', '{}', 'sha256:def', 'k2')
          `,
          [actionId, parties.customerId, parties.providerId]
        ),
      (err: unknown) => {
        const pgErr = err as { code?: string };
        return pgErr.code === "23505";
      }
    );
  });

  it("trigger verification — milestone insert blocked on proposed contract", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);

    const action = await db.query<{ id: string }>(
      `
        INSERT INTO action.actions (
          action_code, action_name, domain, customer_id, provider_id,
          title, template_id, status, tekrr_completeness
        )
        VALUES ('A.2.1', 'Surface Repair', 'A', $1, $2, 'T', 'CT-A.2.1@v1', 'ready_for_contract', 100)
        RETURNING id
      `,
      [parties.customerId, parties.providerId]
    );

    const contract = await db.query<{ id: string }>(
      `
        INSERT INTO contract.contracts (
          action_id, customer_id, provider_id, contract_number, template_id,
          template_version, jurisdiction_pack, status, tekrr_snapshot, document_hash, pdf_storage_key
        )
        VALUES ($1, $2, $3, 'CTR-TRG-1', 'CT-A.2.1@v1', '1.0.0', 'US-GENERIC-v1', 'proposed', '{}', 'sha256:abc', 'k1')
        RETURNING id
      `,
      [action.rows[0].id, parties.customerId, parties.providerId]
    );

    await assert.rejects(
      () =>
        db.query(
          `
            INSERT INTO execution.milestones (
              contract_id, milestone_code, name, sequence_order,
              responsible_party, blocking, status
            )
            VALUES ($1, 'M-ACCESS', 'Access', 1, 'provider', true, 'pending')
          `,
          [contract.rows[0].id]
        ),
      /milestones may only be materialized/
    );
  });

  it("EC-B4.1 — UF-04–07 happy path: action → TEKRR → generate → accept → active", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const actions = createActionService(db, identityRepository);
    const contracts = createContractEngineService(db, identityRepository);

    const created = await actions.createAction(parties.customerUserId, {
      action_type_code: "A.2.1",
      title: "Integration surface repair",
    });
    const actionId = created.id;

    await actions.assignProvider(actionId, parties.customerUserId, parties.providerId);

    for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
      await actions.updateTekrrDimension(
        actionId,
        parties.customerUserId,
        dimension as keyof typeof FULL_TEKRR_PROFILE,
        data
      );
    }

    const generate = await contracts.generateContract(
      actionId,
      parties.customerUserId,
      "integ-generate-key"
    );
    assert.equal(generate.created, true);
    const contractId = generate.contract.id;
    assert.equal(generate.contract.status, "proposed");
    const documentHash = generate.contract.document_hash;

    const customerAccept = await contracts.transitionContract(
      contractId,
      parties.customerUserId,
      { transition: "accept", party_role: "customer", document_hash_ack: documentHash },
      "integ-accept-customer"
    );
    assert.equal(customerAccept.type, "sync");

    const providerAccept = await contracts.transitionContract(
      contractId,
      parties.providerUserId,
      { transition: "accept", party_role: "provider", document_hash_ack: documentHash },
      "integ-accept-provider"
    );
    assert.equal(providerAccept.type, "async");

    const contractRow = await db.query<{ status: string; action_id: string }>(
      `SELECT status, action_id FROM contract.contracts WHERE id = $1`,
      [contractId]
    );
    assert.equal(contractRow.rows[0].status, "active");

    const actionRow = await db.query<{ status: string }>(
      `SELECT status FROM action.actions WHERE id = $1`,
      [actionId]
    );
    assert.equal(actionRow.rows[0].status, "contract_active");

    const idempotent = await contracts.generateContract(
      actionId,
      parties.customerUserId,
      "integ-generate-key-2"
    );
    assert.equal(idempotent.created, false);
    assert.equal(idempotent.contract.id, contractId);
  });

  it("EC-B4.4 — activation materializes milestones and attestation shells in DB", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const actions = createActionService(db, identityRepository);
    const contracts = createContractEngineService(db, identityRepository);

    const created = await actions.createAction(parties.customerUserId, {
      action_type_code: "A.2.1",
      title: "Materialization proof",
    });
    await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
    for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
      await actions.updateTekrrDimension(
        created.id,
        parties.customerUserId,
        dimension as keyof typeof FULL_TEKRR_PROFILE,
        data
      );
    }

    const { contract } = await contracts.generateContract(
      created.id,
      parties.customerUserId,
      "mat-generate"
    );
    const documentHash = contract.document_hash;

    await contracts.transitionContract(contract.id, parties.customerUserId, {
      transition: "accept",
      document_hash_ack: documentHash,
    });
    await contracts.transitionContract(contract.id, parties.providerUserId, {
      transition: "accept",
      document_hash_ack: documentHash,
    });

    const milestones = await db.query(
      `SELECT milestone_code, sequence_order FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order`,
      [contract.id]
    );
    assert.equal(milestones.rowCount, 6);
    assert.equal(milestones.rows[0].milestone_code, "M-ACCESS");
    assert.equal(milestones.rows[5].milestone_code, "M-COMPLETE");

    const attestations = await db.query(
      `SELECT tekrr_dimension, fulfillment_rating FROM execution.attestations WHERE contract_id = $1 ORDER BY tekrr_dimension`,
      [contract.id]
    );
    assert.equal(attestations.rowCount, 5);
    assert.ok(attestations.rows.every((r) => r.fulfillment_rating === "PEN"));
  });

  it("outbox transaction verification — lifecycle events persisted atomically", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const actions = createActionService(db, identityRepository);
    const contracts = createContractEngineService(db, identityRepository);

    const created = await actions.createAction(parties.customerUserId, {
      action_type_code: "A.2.1",
      title: "Outbox proof",
    });
    await actions.assignProvider(created.id, parties.customerUserId, parties.providerId);
    for (const [dimension, data] of Object.entries(FULL_TEKRR_PROFILE)) {
      await actions.updateTekrrDimension(
        created.id,
        parties.customerUserId,
        dimension as keyof typeof FULL_TEKRR_PROFILE,
        data
      );
    }

    const { contract } = await contracts.generateContract(
      created.id,
      parties.customerUserId,
      "outbox-gen"
    );
    const documentHash = contract.document_hash;

    assert.ok((await countOutboxEvents(db, DomainEvents.CONTRACT_GENERATED, contract.id)) >= 1);
    assert.ok((await countOutboxEvents(db, DomainEvents.CONTRACT_PROPOSED, contract.id)) >= 1);

    await contracts.transitionContract(contract.id, parties.customerUserId, {
      transition: "accept",
      document_hash_ack: documentHash,
    });
    await contracts.transitionContract(contract.id, parties.providerUserId, {
      transition: "accept",
      document_hash_ack: documentHash,
    });

    assert.equal(
      await countOutboxEvents(db, DomainEvents.CONTRACT_ACTIVATED, contract.id),
      1
    );
    assert.equal(
      await countOutboxEvents(db, DomainEvents.CONTRACT_MATERIALIZED, contract.id),
      1
    );

    const dup = await db.query(
      `
        INSERT INTO platform.domain_outbox (event_type, payload, engine_source, idempotency_key)
        VALUES ('test.dup', '{}', 'contract', 'outbox-gen')
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id
      `
    );
    assert.equal(dup.rowCount, 0, "outbox idempotency_key constraint enforced");
  });

  it("PostgreSQL runtime — connection and schema objects exist", async (t) => {
    if (!postgresReady) {
      t.skip("PostgreSQL not available");
      return;
    }
    const client = new pg.Client({ connectionString: DEFAULT_DATABASE_URL });
    await client.connect();
    try {
      const schemas = await client.query<{ schema_name: string }>(
        `
          SELECT schema_name FROM information_schema.schemata
          WHERE schema_name IN ('identity','action','contract','execution','platform')
        `
      );
      assert.equal(schemas.rowCount, 5);

      const trigger = await client.query(
        `
          SELECT 1 FROM pg_trigger t
          JOIN pg_class c ON c.oid = t.tgrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'execution' AND c.relname = 'milestones'
            AND t.tgname = 'trg_milestones_execution_gate'
        `
      );
      assert.equal(trigger.rowCount, 1);
    } finally {
      await client.end();
    }
  });
});
