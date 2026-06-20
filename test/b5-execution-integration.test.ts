import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { DomainEvents } from "../src/shared/events/index.js";
import { AppError } from "../src/shared/errors/index.js";
import { createActionService } from "../src/action/application/action-service.js";
import { createContractEngineService } from "../src/contract/application/contract-engine.service.js";
import { contractRepository } from "../src/contract/infrastructure/contract-repository.js";
import { createExecutionService } from "../src/execution/application/execution-service.js";
import { createEvaluationService } from "../src/execution/application/evaluation-service.js";
import { createIssueService } from "../src/complaint/application/issue-service.js";
import { S3ObjectStorage } from "../src/platform/storage/index.js";
import { identityRepository } from "../src/identity/infrastructure/identity-repository.js";
import type { DbPool } from "../src/shared/db/index.js";
import {
  createTestDbPool,
  resetContractEngineData,
  runMigrations,
  seedPartyUsers,
  FULL_TEKRR_PROFILE,
  countOutboxEvents,
  isPostgresAvailable,
  DEFAULT_DATABASE_URL,
} from "./helpers/postgres-integration.js";
import {
  DEFAULT_S3_CONFIG,
  ensureMinioBucket,
  isMinioAvailable,
  putObjectViaPresignedUrl,
  sha256ContentHash,
} from "./helpers/minio-integration.js";

let db: DbPool;
let postgresReady = false;
let minioReady = false;

async function activateContract(dbPool: DbPool, parties: Awaited<ReturnType<typeof seedPartyUsers>>) {
  const actions = createActionService(dbPool, identityRepository);
  const contracts = createContractEngineService(dbPool, identityRepository);

  const created = await actions.createAction(parties.customerUserId, {
    action_type_code: "A.2.1",
    title: "B5 integration contract",
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
    "b5-generate"
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

  return { contract, contracts, actions };
}

function createExecution(dbPool: DbPool) {
  return createExecutionService(dbPool, contractRepository, new S3ObjectStorage(DEFAULT_S3_CONFIG));
}

async function uploadAndConfirmEvidence(
  execution: ReturnType<typeof createExecution>,
  contractId: string,
  milestoneId: string,
  userId: string,
  body: Buffer,
  idempotencySuffix: string
) {
  const contentHash = sha256ContentHash(body);
  const intent = await execution.createEvidenceUploadIntent(contractId, milestoneId, userId, {
    evidence_type: "EV-PHOTO",
    content_hash: contentHash,
    idempotency_key: `upload-${idempotencySuffix}`,
  });
  await putObjectViaPresignedUrl(intent.upload_url, body, "image/jpeg");
  return execution.confirmEvidence(contractId, milestoneId, userId, {
    intent_id: intent.intent_id,
    storage_key: intent.storage_key,
    content_hash: contentHash,
    evidence_type: "EV-PHOTO",
    idempotency_key: `confirm-${idempotencySuffix}`,
  });
}

describe("B5 PostgreSQL + MinIO integration", () => {
  before(async () => {
    postgresReady = await isPostgresAvailable();
    minioReady = await isMinioAvailable();
    if (!postgresReady) {
      throw new Error(
        `PostgreSQL unavailable at ${DEFAULT_DATABASE_URL} — run: docker compose up -d postgres`
      );
    }
    if (!minioReady) {
      throw new Error(
        `MinIO unavailable at ${DEFAULT_S3_CONFIG.endpoint} — run: docker compose up -d minio minio-init`
      );
    }

    await runMigrations();
    await ensureMinioBucket();
    db = await createTestDbPool();
    await resetContractEngineData(db);
  });

  after(async () => {
    if (db) await db.close();
  });

  it("EC-B5.1 UF-08 milestone submit → accept with required evidence", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);

    const milestones = await db.query<{ id: string; milestone_code: string }>(
      `SELECT id, milestone_code FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order`,
      [contract.id]
    );
    const access = milestones.rows.find((m) => m.milestone_code === "M-ACCESS")!;

    const body = Buffer.from("b5-milestone-evidence-bytes");
    await uploadAndConfirmEvidence(
      execution,
      contract.id,
      access.id,
      parties.providerUserId,
      body,
      "ec-b5-1"
    );

    await execution.transitionMilestone(contract.id, access.id, parties.providerUserId, "start");
    await execution.transitionMilestone(contract.id, access.id, parties.providerUserId, "submit");
    await execution.transitionMilestone(contract.id, access.id, parties.customerUserId, "accept");

    const updated = await db.query<{ status: string }>(
      `SELECT status FROM execution.milestones WHERE id = $1`,
      [access.id]
    );
    assert.equal(updated.rows[0].status, "accepted");
  });

  it("EC-B5.2 upload-intent rejects client-specified storage_key", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);

    const milestone = await db.query<{ id: string }>(
      `SELECT id FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order LIMIT 1`,
      [contract.id]
    );

    await assert.rejects(
      () =>
        execution.createEvidenceUploadIntent(
          contract.id,
          milestone.rows[0].id,
          parties.providerUserId,
          {
            evidence_type: "EV-PHOTO",
            content_hash: sha256ContentHash(Buffer.from("x")),
            storage_key: "client/forbidden/key",
            idempotency_key: "ec-b5-2",
          }
        ),
      (e) => e instanceof AppError && e.problem.status === 400
    );
  });

  it("EC-B5.3 evidence confirm rejects hash mismatch", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);

    const milestone = await db.query<{ id: string }>(
      `SELECT id FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order LIMIT 1`,
      [contract.id]
    );
    const body = Buffer.from("hash-mismatch-body");
    const contentHash = sha256ContentHash(body);
    const intent = await execution.createEvidenceUploadIntent(
      contract.id,
      milestone.rows[0].id,
      parties.providerUserId,
      {
        evidence_type: "EV-PHOTO",
        content_hash: contentHash,
        idempotency_key: "ec-b5-3-intent",
      }
    );
    await putObjectViaPresignedUrl(intent.upload_url, body);

    await assert.rejects(
      () =>
        execution.confirmEvidence(
          contract.id,
          milestone.rows[0].id,
          parties.providerUserId,
          {
            intent_id: intent.intent_id,
            storage_key: intent.storage_key,
            content_hash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
            evidence_type: "EV-PHOTO",
            idempotency_key: "ec-b5-3-confirm",
          }
        ),
      (e) => e instanceof AppError && e.problem.status === 409
    );
  });

  it("EC-B5.4 non-PEN attestation without evidence fails at DB (CK-3)", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);

    const attestation = await db.query<{ id: string }>(
      `SELECT id FROM execution.attestations WHERE contract_id = $1 LIMIT 1`,
      [contract.id]
    );

    await assert.rejects(
      () =>
        execution.rateAttestation(
          contract.id,
          attestation.rows[0].id,
          parties.customerUserId,
          "FUL"
        ),
      (e) => e instanceof AppError && e.problem.status === 422
    );

    await assert.rejects(
      () =>
        db.query(
          `
            UPDATE execution.attestations
            SET fulfillment_rating = 'FUL'::execution.fulfillment_rating
            WHERE id = $1
          `,
          [attestation.rows[0].id]
        ),
      (err: unknown) => {
        const pgErr = err as { message?: string };
        return Boolean(pgErr.message?.includes("attestation_evidence"));
      }
    );
  });

  it("EC-B5.5 execution blocked when contract is proposed", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const actions = createActionService(db, identityRepository);
    const contracts = createContractEngineService(db, identityRepository);
    const execution = createExecution(db);

    const created = await actions.createAction(parties.customerUserId, {
      action_type_code: "A.2.1",
      title: "Proposed contract",
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
      "b5-proposed"
    );

    await assert.rejects(
      () =>
        execution.createEvidenceUploadIntent(
          contract.id,
          "00000000-0000-0000-0000-000000000001",
          parties.providerUserId,
          {
            evidence_type: "EV-PHOTO",
            content_hash: sha256ContentHash(Buffer.from("blocked")),
            idempotency_key: "ec-b5-5",
          }
        ),
      (e) => e instanceof AppError && e.problem.status === 409
    );
  });

  it("EC-B5.6 execution allowed in issue_raised and disputed (CA-2)", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);
    const issues = createIssueService(db, contractRepository);

    const milestone = await db.query<{ id: string }>(
      `SELECT id FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order LIMIT 1`,
      [contract.id]
    );

    await issues.createIssue(parties.customerUserId, {
      contract_id: contract.id,
      description: "Quality concern on milestone delivery scope",
      dimensions: [{ tekrr_dimension: "E" }],
      idempotency_key: "ec-b5-6-issue",
    });

    const raisedIntent = await execution.createEvidenceUploadIntent(
      contract.id,
      milestone.rows[0].id,
      parties.providerUserId,
      {
        evidence_type: "EV-PHOTO",
        content_hash: sha256ContentHash(Buffer.from("issue-raised")),
        idempotency_key: "ec-b5-6-raised",
      }
    );
    assert.ok(raisedIntent.intent_id);

    await contractRepository.transition(db.pool, contract.id, "disputed", parties.customerUserId, "issue_raised");

    const disputedIntent = await execution.createEvidenceUploadIntent(
      contract.id,
      milestone.rows[0].id,
      parties.providerUserId,
      {
        evidence_type: "EV-PHOTO",
        content_hash: sha256ContentHash(Buffer.from("disputed")),
        idempotency_key: "ec-b5-6-disputed",
      }
    );
    assert.ok(disputedIntent.intent_id);
  });

  it("EC-B5.7 execution.evidence.recorded outbox on confirm", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract } = await activateContract(db, parties);
    const execution = createExecution(db);

    const milestone = await db.query<{ id: string }>(
      `SELECT id FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order LIMIT 1`,
      [contract.id]
    );

    await uploadAndConfirmEvidence(
      execution,
      contract.id,
      milestone.rows[0].id,
      parties.providerUserId,
      Buffer.from("outbox-evidence"),
      "ec-b5-7"
    );

    assert.equal(
      await countOutboxEvents(db, DomainEvents.EXECUTION_EVIDENCE_RECORDED, contract.id),
      1
    );
  });

  it("EC-B5.8 completion preconditions satisfied emits contract.completed", async () => {
    await resetContractEngineData(db);
    const parties = await seedPartyUsers(db);
    const { contract, contracts } = await activateContract(db, parties);
    const execution = createExecution(db);
    const evaluation = createEvaluationService(db, contractRepository);

    const milestones = await db.query<{
      id: string;
      milestone_code: string;
      responsible_party: string;
    }>(
      `SELECT id, milestone_code, responsible_party FROM execution.milestones WHERE contract_id = $1 ORDER BY sequence_order`,
      [contract.id]
    );

    let sampleEvidenceId: string | null = null;

    for (const milestone of milestones.rows) {
      if (milestone.responsible_party === "system") {
        await execution.transitionMilestone(
          contract.id,
          milestone.id,
          parties.customerUserId,
          "waive"
        );
        continue;
      }

      const uploader =
        milestone.responsible_party === "customer"
          ? parties.customerUserId
          : parties.providerUserId;
      const evidence = await uploadAndConfirmEvidence(
        execution,
        contract.id,
        milestone.id,
        uploader,
        Buffer.from(`complete-${milestone.milestone_code}`),
        `complete-${milestone.milestone_code}`
      );
      sampleEvidenceId = evidence.id;

      await execution.transitionMilestone(contract.id, milestone.id, uploader, "start");
      await execution.transitionMilestone(contract.id, milestone.id, uploader, "submit");
      await execution.transitionMilestone(
        contract.id,
        milestone.id,
        parties.customerUserId,
        "accept"
      );
    }

    assert.ok(sampleEvidenceId);
    const attestations = await db.query<{ id: string }>(
      `SELECT id FROM execution.attestations WHERE contract_id = $1`,
      [contract.id]
    );
    for (const attestation of attestations.rows) {
      await execution.linkAttestationEvidence(
        contract.id,
        attestation.id,
        parties.customerUserId,
        { evidence_ids: [sampleEvidenceId!], idempotency_key: `link-${attestation.id}` }
      );
      await execution.rateAttestation(
        contract.id,
        attestation.id,
        parties.customerUserId,
        "FUL"
      );
    }

    await contracts.complete(contract.id, parties.customerUserId, "ec-b5-8-complete");
    assert.equal(await countOutboxEvents(db, DomainEvents.CONTRACT_COMPLETED, contract.id), 1);

    const evalResult = await evaluation.submitEvaluation(contract.id, parties.customerUserId, {
      rating: 5,
      comment: "Excellent work",
      idempotency_key: "ec-b5-8-eval",
    });
    assert.equal(evalResult.rating, 5);
    assert.equal(evalResult.composite_score, 1000);
  });
});
