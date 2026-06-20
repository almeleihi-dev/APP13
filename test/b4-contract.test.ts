import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeTekrrCompleteness, isTekrrComplete } from "../src/action/domain/tekrr.js";
import { getTemplateByActionCode, listTemplates } from "../src/contract/templates/registry.js";
import {
  assertDocumentHashAck,
  assertActionReadyForContract,
  assertCa2Executable,
} from "../src/contract/domain/guards.js";
import {
  assertCompletionReady,
  computeComplaintWindowEnd,
} from "../src/contract/domain/completion.js";
import { allPartiesAccepted } from "../src/contract/domain/contract.js";
import { ContractEngineService, sha256Document } from "../src/contract/application/contract-engine.service.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";
import { DomainEvents } from "../src/shared/events/index.js";
import { isUniqueViolation } from "../src/shared/db/pg-errors.js";
import { IdentityRevalidationService } from "../src/identity/application/revalidation-service.js";
import type { Action } from "../src/action/domain/action.js";
import type { Contract } from "../src/contract/domain/contract.js";
import type { DbClient, DbPool } from "../src/shared/db/index.js";
import type { User } from "../src/identity/domain/user.js";

describe("TEKRR completeness", () => {
  it("computes 100% when all required fields filled", () => {
    const template = getTemplateByActionCode("A.2.1")!;
    const profile = {
      T: { scheduled_start: "2026-07-01", completion_deadline: "2026-07-15" },
      E: { deliverables: ["repair surface"] },
      K: { standard_of_care: "industry standard" },
      R: { risk_level: 2 },
      S: { acceptance_criteria: "smooth finish" },
    };
    const score = computeTekrrCompleteness(profile, template.requiredTekrrFields);
    assert.equal(score, 100);
    assert.equal(isTekrrComplete(score), true);
  });

  it("returns partial score for incomplete profile (EC-B4.2)", () => {
    const template = getTemplateByActionCode("A.2.1")!;
    const score = computeTekrrCompleteness(
      { T: { scheduled_start: "2026-07-01" } },
      template.requiredTekrrFields
    );
    assert.ok(score > 0 && score < 100);
    assert.throws(
      () =>
        assertActionReadyForContract({
          id: "a1",
          actionCode: "A.2.1",
          actionName: "Surface Repair",
          domain: "A",
          status: "ready_for_contract",
          customerId: "c1",
          providerId: "p1",
          invitedProviderEmail: null,
          companyId: null,
          title: "Fix",
          description: null,
          tekrrProfile: {},
          tekrrCompleteness: score,
          tekrrFrameworkVersion: "1.0",
          templateId: "CT-A.2.1@v1",
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.TEKRR_INCOMPLETE
    );
  });
});

describe("Contract templates", () => {
  it("registers 15 MVP templates", () => {
    assert.equal(listTemplates().length, 15);
  });

  it("includes filing_window_days default", () => {
    const tpl = getTemplateByActionCode("A.2.1")!;
    assert.equal(tpl.filingWindowDays, 30);
  });
});

describe("Constitutional guards", () => {
  const readyAction: Action = {
    id: "a1",
    actionCode: "A.2.1",
    actionName: "Surface Repair",
    domain: "A",
    status: "ready_for_contract",
    customerId: "c1",
    providerId: "p1",
    invitedProviderEmail: null,
    companyId: null,
    title: "Fix wall",
    description: null,
    tekrrProfile: {},
    tekrrCompleteness: 100,
    tekrrFrameworkVersion: "1.0",
    templateId: "CT-A.2.1@v1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it("blocks contract generation when TEKRR incomplete", () => {
    assert.throws(
      () => assertActionReadyForContract({ ...readyAction, tekrrCompleteness: 80 }),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.TEKRR_INCOMPLETE
    );
  });

  it("requires document_hash_ack on accept (EC-B4.5 / CL-5)", () => {
    assert.throws(
      () => assertDocumentHashAck("sha256:abc", undefined),
      (e) => e instanceof AppError && e.problem.status === 400
    );
  });

  it("rejects mismatched document hash", () => {
    assert.throws(
      () => assertDocumentHashAck("sha256:abc", "sha256:xyz"),
      (e) => e instanceof AppError && e.problem.status === 409
    );
  });

  it("allows CA-2 execution only in executable statuses", () => {
    assert.doesNotThrow(() => assertCa2Executable("active"));
    assert.throws(
      () => assertCa2Executable("proposed"),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.EXECUTION_BLOCKED
    );
  });
});

describe("Completion readiness (Contract Engine §5.3)", () => {
  it("sets complaint window end from filing_window_days", () => {
    const from = new Date("2026-06-01T12:00:00.000Z");
    const end = computeComplaintWindowEnd(from, 30);
    assert.equal(end.toISOString(), "2026-07-01T12:00:00.000Z");
  });

  it("blocks completion when blocking complaint exists", () => {
    assert.throws(
      () =>
        assertCompletionReady({
          contractStatus: "active",
          blockingMilestones: 1,
          completedBlockingMilestones: 1,
          attestations: [
            {
              id: "1",
              contractId: "c1",
              tekrrDimension: "T",
              fulfillmentRating: "FUL",
              attestedByUserId: "u1",
              attestedAt: new Date(),
              source: "mutual",
            },
          ],
          blockingComplaintCount: 1,
          penDimensionsWithActiveComplaint: [],
        }),
      (e) =>
        e instanceof AppError &&
        e.problem.status === 422 &&
        e.problem.detail?.includes("complaint")
    );
  });

  it("allows PEN attestation when active complaint on same dimension", () => {
    assert.doesNotThrow(() =>
      assertCompletionReady({
        contractStatus: "active",
        blockingMilestones: 0,
        completedBlockingMilestones: 0,
        attestations: [
          {
            id: "1",
            contractId: "c1",
            tekrrDimension: "T",
            fulfillmentRating: "PEN",
            attestedByUserId: "u1",
            attestedAt: new Date(),
            source: "mutual",
          },
        ],
        blockingComplaintCount: 0,
        penDimensionsWithActiveComplaint: ["T"],
      })
    );
  });
});

describe("Contract acceptance (EC-B4.3)", () => {
  it("detects when all parties accepted", () => {
    assert.equal(
      allPartiesAccepted([
        {
          id: "1",
          contractId: "c",
          userId: "u1",
          partyRole: "customer",
          acceptanceRequired: true,
          acceptedAt: new Date(),
          declinedAt: null,
          verificationTierAtAccept: "T1",
        },
        {
          id: "2",
          contractId: "c",
          userId: "u2",
          partyRole: "provider",
          acceptanceRequired: true,
          acceptedAt: new Date(),
          declinedAt: null,
          verificationTierAtAccept: "T2",
        },
      ]),
      true
    );
  });
});

describe("Document hash", () => {
  it("produces stable sha256 prefix", () => {
    const hash = sha256Document({ template_id: "CT-A.2.1@v1", tekrr_snapshot: {} });
    assert.match(hash, /^sha256:[a-f0-9]{64}$/);
    assert.equal(hash, sha256Document({ template_id: "CT-A.2.1@v1", tekrr_snapshot: {} }));
  });
});

describe("CA-1 idempotent generate (EC-B4.6)", () => {
  it("returns existing contract without creating duplicate", async () => {
    const existing: Contract = {
      id: "contract-1",
      actionId: "action-1",
      customerId: "cust-1",
      providerId: "prov-1",
      contractNumber: "CTR-2026-ABCD",
      templateId: "CT-A.2.1@v1",
      templateVersion: "1.0.0",
      jurisdictionPack: "US-GENERIC-v1",
      status: "proposed",
      tekrrSnapshot: {},
      commercialTerms: {},
      verificationSnapshot: null,
      documentHash: "sha256:abc",
      pdfStorageKey: "k",
      customerAcceptedAt: null,
      providerAcceptedAt: null,
      activatedAt: null,
      completedAt: null,
      complaintWindowEndsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = createMockDbPool();
    const service = new ContractEngineService(
      db,
      {} as never,
      {
        findByIdForUpdate: async () => readyActionFixture(),
        transition: async () => readyActionFixture(),
      } as never,
      {
        findByActionId: async () => existing,
        create: async () => {
          throw new Error("should not create");
        },
      } as never
    );

    const result = await service.generateContract("action-1", "user-1", "key-1");
    assert.equal(result.created, false);
    assert.equal(result.contract.id, "contract-1");
  });

  it("handles unique violation race as idempotent return", async () => {
    const raced: Contract = {
      id: "contract-race",
      actionId: "action-1",
      customerId: "cust-1",
      providerId: "prov-1",
      contractNumber: "CTR-2026-RACE",
      templateId: "CT-A.2.1@v1",
      templateVersion: "1.0.0",
      jurisdictionPack: "US-GENERIC-v1",
      status: "proposed",
      tekrrSnapshot: {},
      commercialTerms: {},
      verificationSnapshot: null,
      documentHash: "sha256:abc",
      pdfStorageKey: "k",
      customerAcceptedAt: null,
      providerAcceptedAt: null,
      activatedAt: null,
      completedAt: null,
      complaintWindowEndsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let createCalls = 0;
    const db = createMockDbPool();
    const identityRepo = createIdentityRepoStub();
    const service = new ContractEngineService(
      db,
      identityRepo,
      {
        findByIdForUpdate: async () => readyActionFixture(),
        transition: async () => readyActionFixture(),
      } as never,
      {
        findByActionId: async (_db, actionId, pass?: number) => {
          void actionId;
          void pass;
          return createCalls > 0 ? raced : null;
        },
        create: async () => {
          createCalls++;
          const err = new Error("duplicate") as Error & { code: string; constraint: string };
          err.code = "23505";
          err.constraint = "uq_contracts_action_id";
          throw err;
        },
        addParty: async () => ({}),
      } as never
    );

    const result = await service.generateContract("action-1", "user-1", "key-race");
    assert.equal(result.created, false);
    assert.equal(result.contract.id, "contract-race");
  });
});

describe("contract.activated outbox (EC-B4.7)", () => {
  it("emits contract.activated in activation transaction", async () => {
    const { executionRepository } = await import(
      "../src/execution/infrastructure/execution-repository.js"
    );
    const origList = executionRepository.listMilestones.bind(executionRepository);
    const origInsert = executionRepository.insertMilestone.bind(executionRepository);
    const origInsertAtt = executionRepository.insertAttestationShell.bind(executionRepository);

    executionRepository.listMilestones = async () => [];
    executionRepository.insertMilestone = async () => ({
      id: "m1",
      contractId: "contract-act",
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
    });
    executionRepository.insertAttestationShell = async () => ({
      id: "a1",
      contractId: "contract-act",
      tekrrDimension: "T",
      fulfillmentRating: "PEN",
      attestedByUserId: "u1",
      attestedAt: new Date(),
      source: "mutual",
    });

    const outboxEvents: Array<{ eventType: string; idempotencyKey: string }> = [];
    const outboxModule = await import("../src/platform/outbox/index.js");
    const originalWrite = outboxModule.outboxWriter.write;
    outboxModule.outboxWriter.write = (async (
      _db: unknown,
      event: { eventType: string; idempotencyKey: string }
    ) => {
      outboxEvents.push(event);
      return { ...event, id: "1", publishedAt: null, createdAt: new Date() };
    }) as typeof originalWrite;

    try {
      const contract: Contract = {
        id: "contract-act",
        actionId: "action-1",
        customerId: "cust-1",
        providerId: "prov-1",
        contractNumber: "CTR-2026-ACT",
        templateId: "CT-A.2.1@v1",
        templateVersion: "1.0.0",
        jurisdictionPack: "US-GENERIC-v1",
        status: "accepted",
        tekrrSnapshot: {},
        commercialTerms: {},
        verificationSnapshot: null,
        documentHash: "sha256:abc",
        pdfStorageKey: "k",
        customerAcceptedAt: new Date(),
        providerAcceptedAt: new Date(),
        activatedAt: null,
        completedAt: null,
        complaintWindowEndsAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const db = createMockDbPool();
      const service = new ContractEngineService(
        db,
        createIdentityRepoStub(),
        {
          findById: async () => readyActionFixture(),
          transition: async () => readyActionFixture(),
        } as never,
        {
          findByIdForUpdate: async () => contract,
          transition: async (_db, _id, toStatus) => ({ ...contract, status: toStatus }),
          listParties: async () => [
            {
              id: "p1",
              contractId: "contract-act",
              userId: "prov-user",
              partyRole: "provider",
              acceptanceRequired: true,
              acceptedAt: new Date(),
              declinedAt: null,
              verificationTierAtAccept: "T2",
            },
          ],
        } as never,
        {
          countBlockingComplaints: async () => 0,
          listPenDimensionsWithActiveComplaints: async () => [],
        } as never
      );

      await service.activate("contract-act", "user-1", "activate-key");
      const activated = outboxEvents.find((e) => e.eventType === DomainEvents.CONTRACT_ACTIVATED);
      assert.ok(activated);
      assert.equal(activated.idempotencyKey, "activate-key");
    } finally {
      outboxModule.outboxWriter.write = originalWrite;
      executionRepository.listMilestones = origList;
      executionRepository.insertMilestone = origInsert;
      executionRepository.insertAttestationShell = origInsertAtt;
    }
  });
});

describe("P0-S1 revalidation", () => {
  it("rejects stale tier from session vs DB", async () => {
    const user: User = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "test@example.com",
      phone: null,
      passwordHash: "hash",
      role: "customer",
      status: "active",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: null,
      verificationTier: "T2",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const db = createMockDbPool();
    const service = new IdentityRevalidationService(db, {
      findUserById: async () => user,
    } as never);

    await assert.rejects(
      () =>
        service.revalidate({
          userId: user.id,
          roles: ["customer"],
          tier: "T1",
          status: "active",
          sessionId: "sess-1",
        }),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.TIER_STALE
    );
  });

  it("rejects JWT role superset vs DB roles", async () => {
    const user: User = {
      id: "550e8400-e29b-41d4-a716-446655440001",
      email: "p@example.com",
      phone: null,
      passwordHash: "hash",
      role: "provider",
      status: "active",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: null,
      verificationTier: "T1",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const db = createMockDbPool();
    const service = new IdentityRevalidationService(db, {
      findUserById: async () => user,
    } as never);

    await assert.rejects(
      () =>
        service.revalidate({
          userId: user.id,
          roles: ["provider", "platform_admin"],
          tier: "T1",
          status: "active",
          sessionId: "sess-2",
        }),
      (e) => e instanceof AppError && e.problem.code === ErrorCodes.ROLES_STALE
    );
  });
});

describe("pg-errors", () => {
  it("detects unique violation by constraint", () => {
    const err = Object.assign(new Error("dup"), {
      code: "23505",
      constraint: "uq_contracts_action_id",
    });
    assert.equal(isUniqueViolation(err, "uq_contracts_action_id"), true);
    assert.equal(isUniqueViolation(err, "other"), false);
  });
});

function readyActionFixture(): Action {
  return {
    id: "action-1",
    actionCode: "A.2.1",
    actionName: "Surface Repair",
    domain: "A",
    status: "ready_for_contract",
    customerId: "cust-1",
    providerId: "prov-1",
    invitedProviderEmail: null,
    companyId: null,
    title: "Fix",
    description: null,
    tekrrProfile: {
      T: { scheduled_start: "2026-07-01", completion_deadline: "2026-07-15" },
      E: { deliverables: ["x"] },
      K: { standard_of_care: "std" },
      R: { risk_level: 2 },
      S: { acceptance_criteria: "ok" },
    },
    tekrrCompleteness: 100,
    tekrrFrameworkVersion: "1.0",
    templateId: "CT-A.2.1@v1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockDbPool(): DbPool {
  const client = {
    query: async () => ({ rowCount: 0, rows: [] }),
  } as unknown as DbClient;

  return {
    pool: client as never,
    query: async () => ({ rowCount: 0, rows: [] }),
    withTransaction: async <T>(fn: (tx: DbClient) => Promise<T>) => fn(client),
    close: async () => undefined,
  };
}

function createIdentityRepoStub() {
  return {
    findCustomerById: async () => ({ id: "cust-1", userId: "cust-user" }),
    findProviderById: async () => ({ id: "prov-1", userId: "prov-user" }),
    findUserById: async (id: string) => ({
      id,
      email: "a@b.com",
      phone: null,
      passwordHash: "h",
      role: "customer",
      status: "active",
      emailVerifiedAt: new Date(),
      phoneVerifiedAt: null,
      verificationTier: "T1",
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    }),
  };
}
