import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  CA2_EXECUTABLE_STATUSES,
  assertCa2Executable,
  assertNoClientStorageKey,
  assertContentHashMatches,
  requiresLinkedEvidence,
  isValidFulfillmentRating,
  buildEvidenceStorageKey,
} from "../src/execution/domain/index.js";
import { ExecutionService } from "../src/execution/application/execution-service.js";
import { InMemoryObjectStorage } from "../src/platform/storage/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";
import type { DbClient, DbPool } from "../src/shared/db/index.js";
import type { ContractRepository } from "../src/contract/infrastructure/contract-repository.js";
import type { ExecutionRepository, Milestone } from "../src/execution/infrastructure/execution-repository.js";
import type { Contract, ContractParty } from "../src/contract/domain/contract.js";

describe("CA-2 executable gate (B5)", () => {
  it("defines six executable contract states aligned with PostgreSQL CA-2", () => {
    assert.deepEqual(
      [...CA2_EXECUTABLE_STATUSES].sort(),
      ["active", "closed", "completed", "disputed", "issue_raised", "resolved"].sort()
    );
  });

  it("allows execution in issue_raised and disputed", () => {
    assert.doesNotThrow(() => assertCa2Executable("issue_raised"));
    assert.doesNotThrow(() => assertCa2Executable("disputed"));
    assert.doesNotThrow(() => assertCa2Executable("completed"));
    assert.doesNotThrow(() => assertCa2Executable("closed"));
  });

  it("blocks execution when contract is draft/proposed (EC-B5.5)", () => {
    assert.throws(
      () => assertCa2Executable("proposed"),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.EXECUTION_BLOCKED
    );
    assert.throws(
      () => assertCa2Executable("draft"),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.EXECUTION_BLOCKED
    );
  });
});

describe("P0-S4 upload tenancy guards", () => {
  it("rejects client-supplied storage_key on upload-intent (EC-B5.2)", () => {
    assert.throws(
      () => assertNoClientStorageKey("contracts/other/key"),
      (e) =>
        e instanceof AppError &&
        e.problem.status === 400 &&
        e.problem.detail?.includes("server-generated")
    );
  });

  it("builds server-generated storage_key under contract/milestone prefix", () => {
    const key = buildEvidenceStorageKey("c1", "m1", "obj-1");
    assert.match(key, /^contracts\/c1\/milestones\/m1\//);
  });

  it("rejects hash mismatch on confirm (EC-B5.3)", () => {
    assert.throws(
      () => assertContentHashMatches("sha256:abc", "sha256:def"),
      (e) => e instanceof AppError && e.problem.status === 409
    );
  });
});

describe("CK-3 attestation evidence (Law 13)", () => {
  it("requires linked evidence for non-PEN ratings (EC-B5.4 domain rule)", () => {
    assert.equal(requiresLinkedEvidence("FUL"), true);
    assert.equal(requiresLinkedEvidence("SUF"), true);
    assert.equal(requiresLinkedEvidence("PEN"), false);
    assert.equal(requiresLinkedEvidence("N/A"), false);
  });

  it("validates fulfillment rating enum", () => {
    assert.equal(isValidFulfillmentRating("FUL"), true);
    assert.equal(isValidFulfillmentRating("INVALID"), false);
  });
});

describe("ExecutionService evidence flow", () => {
  const contract: Contract = {
    id: "contract-1",
    actionId: "action-1",
    customerId: "cust-1",
    providerId: "prov-1",
    contractNumber: "CTR-1",
    templateId: "CT-A.2.1@v1",
    templateVersion: "1.0.0",
    jurisdictionPack: "US-GENERIC-v1",
    status: "active",
    tekrrSnapshot: {},
    commercialTerms: {},
    verificationSnapshot: null,
    documentHash: null,
    pdfStorageKey: null,
    customerAcceptedAt: null,
    providerAcceptedAt: null,
    activatedAt: new Date(),
    completedAt: null,
    complaintWindowEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const parties: ContractParty[] = [
    {
      id: "p1",
      contractId: "contract-1",
      userId: "user-provider",
      partyRole: "provider",
      acceptanceRequired: true,
      acceptedAt: new Date(),
      declinedAt: null,
      verificationTierAtAccept: "T1",
    },
  ];

  const milestone: Milestone = {
    id: "ms-1",
    contractId: "contract-1",
    milestoneCode: "M-ACCESS",
    name: "Access",
    sequenceOrder: 1,
    tekrrDimension: "T",
    status: "pending",
    responsibleParty: "provider",
    blocking: true,
    dueAt: null,
    startedAt: null,
    submittedAt: null,
    acceptedAt: null,
  };

  function createService(overrides?: Partial<ExecutionRepository>) {
    const storage = new InMemoryObjectStorage();
    const intents = new Map<string, Record<string, unknown>>();
    const evidenceRows: Record<string, unknown>[] = [];

    const execution: ExecutionRepository = {
      findMilestoneById: async (_db, id) => (id === milestone.id ? milestone : null),
      findUploadIntentByIdempotencyKey: async () => null,
      findUploadIntentById: async (_db, id) => {
        const row = intents.get(id);
        return row ? mapIntent(row) : null;
      },
      createUploadIntent: async (_db, input) => {
        const row = {
          id: "intent-1",
          contract_id: input.contractId,
          milestone_id: input.milestoneId,
          user_id: input.userId,
          storage_key: input.storageKey,
          content_hash: input.contentHash,
          evidence_type: input.evidenceType,
          filename: input.filename ?? null,
          content_type: input.contentType ?? null,
          idempotency_key: input.idempotencyKey,
          status: "pending",
          expires_at: input.expiresAt,
          confirmed_at: null,
          created_at: new Date(),
        };
        intents.set(row.id, row);
        return mapIntent(row);
      },
      confirmUploadIntent: async (_db, id) => {
        const row = intents.get(id);
        if (!row) return null;
        row.status = "confirmed";
        row.confirmed_at = new Date();
        return mapIntent(row);
      },
      insertEvidence: async (_db, input) => {
        const row = {
          id: "ev-1",
          contract_id: input.contractId,
          milestone_id: input.milestoneId,
          submitted_by_user_id: input.submittedByUserId,
          evidence_type: input.evidenceType,
          storage_key: input.storageKey,
          content_hash: input.contentHash,
          metadata: input.metadata ?? {},
          submitted_at: new Date(),
          created_at: new Date(),
        };
        evidenceRows.push(row);
        return {
          id: row.id as string,
          contractId: row.contract_id as string,
          milestoneId: row.milestone_id as string,
          submittedByUserId: row.submitted_by_user_id as string,
          evidenceType: row.evidence_type as "EV-PHOTO",
          storageKey: row.storage_key as string,
          contentHash: row.content_hash as string,
          metadata: row.metadata as Record<string, unknown>,
          submittedAt: row.submitted_at as Date,
          createdAt: row.created_at as Date,
        };
      },
      countAttestationEvidence: async () => 0,
      transitionMilestone: async () => null,
      rateAttestation: async () => null,
      insertMilestone: async () => milestone,
      insertAttestationShell: async () => ({
        id: "a1",
        contractId: "contract-1",
        tekrrDimension: "T",
        fulfillmentRating: "PEN",
        attestedByUserId: "user-provider",
        attestedAt: new Date(),
        source: "mutual",
      }),
      listMilestones: async () => [],
      listAttestations: async () => [],
      countMilestonesByStatus: async () => ({ blocking: 0, done: 0 }),
      unresolvedAttestations: async () => 0,
      ...overrides,
    } as ExecutionRepository;

    const contracts: ContractRepository = {
      findById: async () => contract,
      listParties: async () => parties,
    } as ContractRepository;

    const outbox: unknown[] = [];
    const db: DbPool = {
      pool: {} as DbClient,
      query: async () => ({ rows: [], rowCount: 0 }),
      withTransaction: async (fn) =>
        fn({
          query: async (sql: string) => {
            if (sql.includes("platform.domain_outbox")) {
              return {
                rows: [{ id: "out-1", published_at: null, created_at: new Date() }],
                rowCount: 1,
              };
            }
            return { rows: [], rowCount: 0 };
          },
        } as DbClient),
      close: async () => undefined,
    };

    const service = new ExecutionService(db, contracts, execution, storage);
    return { service, storage, intents, evidenceRows, outbox };
  }

  it("creates upload intent with server storage_key and rejects client storage_key", async () => {
    const { service } = createService();

    await assert.rejects(
      () =>
        service.createEvidenceUploadIntent("contract-1", "ms-1", "user-provider", {
          evidence_type: "EV-PHOTO",
          content_hash: "sha256:abc",
          storage_key: "client/forbidden",
          idempotency_key: "idem-1",
        }),
      (e) => e instanceof AppError && e.problem.status === 400
    );

    const intent = await service.createEvidenceUploadIntent(
      "contract-1",
      "ms-1",
      "user-provider",
      {
        evidence_type: "EV-PHOTO",
        content_hash: "sha256:abc1234567890abcdef1234567890abcdef1234567890abcdef12",
        idempotency_key: "idem-2",
      }
    );

    assert.match(intent.storage_key, /^contracts\/contract-1\/milestones\/ms-1\//);
    assert.equal(
      intent.required_hash,
      "sha256:abc1234567890abcdef1234567890abcdef1234567890abcdef12"
    );
    assert.ok(intent.intent_id);
  });

  it("confirms evidence when object hash matches intent", async () => {
    const { service, storage, intents } = createService();
    const intent = await service.createEvidenceUploadIntent(
      "contract-1",
      "ms-1",
      "user-provider",
      {
        evidence_type: "EV-PHOTO",
        content_hash: "sha256:deadbeef",
        idempotency_key: "idem-3",
      }
    );
    storage.seedObject(intent.storage_key, "sha256:deadbeef");
    intents.set(intent.intent_id, {
      id: intent.intent_id,
      contract_id: "contract-1",
      milestone_id: "ms-1",
      user_id: "user-provider",
      storage_key: intent.storage_key,
      content_hash: intent.required_hash,
      evidence_type: "EV-PHOTO",
      filename: null,
      content_type: null,
      idempotency_key: "idem-3",
      status: "pending",
      expires_at: new Date(Date.now() + 60_000),
      confirmed_at: null,
      created_at: new Date(),
    });

    const evidence = await service.confirmEvidence("contract-1", "ms-1", "user-provider", {
      intent_id: intent.intent_id,
      storage_key: intent.storage_key,
      content_hash: "sha256:deadbeef",
      evidence_type: "EV-PHOTO",
      idempotency_key: "confirm-1",
    });

    assert.equal(evidence.id, "ev-1");
    assert.equal(evidence.content_hash, "sha256:deadbeef");
  });

  it("rejects confirm when stored object hash mismatches (EC-B5.3)", async () => {
    const { service, storage, intents } = createService();
    const intent = await service.createEvidenceUploadIntent(
      "contract-1",
      "ms-1",
      "user-provider",
      {
        evidence_type: "EV-PHOTO",
        content_hash: "sha256:expected",
        idempotency_key: "idem-4",
      }
    );
    storage.seedObject(intent.storage_key, "sha256:wrong");
    intents.set(intent.intent_id, {
      id: intent.intent_id,
      contract_id: "contract-1",
      milestone_id: "ms-1",
      user_id: "user-provider",
      storage_key: intent.storage_key,
      content_hash: intent.required_hash,
      evidence_type: "EV-PHOTO",
      filename: null,
      content_type: null,
      idempotency_key: "idem-4",
      status: "pending",
      expires_at: new Date(Date.now() + 60_000),
      confirmed_at: null,
      created_at: new Date(),
    });

    await assert.rejects(
      () =>
        service.confirmEvidence("contract-1", "ms-1", "user-provider", {
          intent_id: intent.intent_id,
          storage_key: intent.storage_key,
          content_hash: "sha256:expected",
          evidence_type: "EV-PHOTO",
          idempotency_key: "confirm-2",
        }),
      (e) => e instanceof AppError && e.problem.status === 409
    );
  });

  it("blocks non-PEN attestation rating without linked evidence (CK-3)", async () => {
    const { service } = createService();
    await assert.rejects(
      () => service.rateAttestation("contract-1", "att-1", "user-provider", "FUL"),
      (e) =>
        e instanceof AppError &&
        e.problem.status === 422 &&
        e.problem.detail?.includes("CK-3")
    );
  });
});

function mapIntent(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    contractId: row.contract_id as string,
    milestoneId: row.milestone_id as string,
    userId: row.user_id as string,
    storageKey: row.storage_key as string,
    contentHash: row.content_hash as string,
    evidenceType: row.evidence_type as "EV-PHOTO",
    filename: (row.filename as string | null) ?? null,
    contentType: (row.content_type as string | null) ?? null,
    idempotencyKey: row.idempotency_key as string,
    status: row.status as "pending",
    expiresAt: row.expires_at as Date,
    confirmedAt: (row.confirmed_at as Date | null) ?? null,
    createdAt: row.created_at as Date,
  };
}
