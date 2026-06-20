import { randomUUID } from "node:crypto";
import type { DbPool } from "../../shared/db/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { DomainEvents } from "../../shared/events/index.js";
import { outboxWriter } from "../../platform/outbox/index.js";
import type { ObjectStorage } from "../../platform/storage/index.js";
import { DOWNLOAD_URL_TTL_SECONDS } from "../../platform/storage/s3-storage.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import type { ContractParty } from "../../contract/domain/contract.js";
import {
  buildEvidenceStorageKey,
  type EvidenceType,
  getMilestoneTransition,
  assertCa2Executable,
  assertContentHashFormat,
  assertContentHashMatches,
  assertMilestoneUploadAuthorized,
  assertNoClientStorageKey,
  requiresLinkedEvidence,
  isValidFulfillmentRating,
} from "../domain/index.js";
import {
  executionRepository,
  type ExecutionRepository,
  type MilestoneStatus,
} from "../infrastructure/execution-repository.js";

const UPLOAD_INTENT_TTL_SECONDS = 900;

export class ExecutionService {
  constructor(
    private readonly db: DbPool,
    private readonly contracts: ContractRepository,
    private readonly execution: ExecutionRepository,
    private readonly storage: ObjectStorage
  ) {}

  async createEvidenceUploadIntent(
    contractId: string,
    milestoneId: string,
    userId: string,
    input: {
      evidence_type: EvidenceType;
      content_hash: string;
      filename?: string;
      content_type?: string;
      storage_key?: string;
      idempotency_key: string;
    }
  ) {
    assertNoClientStorageKey(input.storage_key);
    assertContentHashFormat(input.content_hash);

    const existing = await this.execution.findUploadIntentByIdempotencyKey(
      this.db.pool,
      input.idempotency_key
    );
    if (existing) {
      return this.toUploadIntentResponse(existing);
    }

    const contract = await this.requireContractParty(contractId, userId);
    assertCa2Executable(contract.status);

    const milestone = await this.execution.findMilestoneById(this.db.pool, milestoneId);
    if (!milestone || milestone.contractId !== contractId) throw notFound();

    const parties = await this.contracts.listParties(this.db.pool, contractId);
    const roles = this.partyRolesForUser(parties, userId);
    assertMilestoneUploadAuthorized(
      milestone.responsibleParty as "customer" | "provider" | "system" | "both",
      roles
    );

    const storageKey = buildEvidenceStorageKey(contractId, milestoneId, randomUUID());
    const presigned = await this.storage.createPresignedPut({
      storageKey,
      contentType: input.content_type,
      expiresSeconds: UPLOAD_INTENT_TTL_SECONDS,
    });

    const intent = await this.execution.createUploadIntent(this.db.pool, {
      contractId,
      milestoneId,
      userId,
      storageKey,
      contentHash: input.content_hash,
      evidenceType: input.evidence_type,
      filename: input.filename,
      contentType: input.content_type,
      idempotencyKey: input.idempotency_key,
      expiresAt: presigned.expiresAt,
    });

    return {
      upload_url: presigned.uploadUrl,
      storage_key: intent.storageKey,
      intent_id: intent.id,
      expires_at: intent.expiresAt.toISOString(),
      required_hash: intent.contentHash,
    };
  }

  async confirmEvidence(
    contractId: string,
    milestoneId: string,
    userId: string,
    input: {
      intent_id: string;
      storage_key: string;
      content_hash: string;
      evidence_type: EvidenceType;
      metadata?: Record<string, unknown>;
      idempotency_key: string;
    }
  ) {
    assertContentHashFormat(input.content_hash);

    return this.db.withTransaction(async (tx) => {
      const contract = await this.requireContractPartyTx(tx, contractId, userId);
      assertCa2Executable(contract.status);

      const milestone = await this.execution.findMilestoneById(tx, milestoneId);
      if (!milestone || milestone.contractId !== contractId) throw notFound();

      const intent = await this.execution.findUploadIntentById(tx, input.intent_id);
      if (!intent || intent.contractId !== contractId || intent.milestoneId !== milestoneId) {
        throw notFound();
      }
      if (intent.userId !== userId) {
        throw new AppError(
          problem({
            title: "Forbidden",
            status: 403,
            code: ErrorCodes.FORBIDDEN,
            engine: "execution",
            detail: "Upload intent belongs to another user",
          })
        );
      }
      if (intent.status !== "pending") {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "execution",
            detail: "Upload intent is not pending",
          })
        );
      }
      if (intent.expiresAt.getTime() < Date.now()) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "execution",
            detail: "Upload intent expired",
          })
        );
      }
      if (intent.storageKey !== input.storage_key) {
        throw new AppError(
          problem({
            title: "Bad Request",
            status: 400,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "execution",
            detail: "storage_key must match server-issued upload intent",
          })
        );
      }
      assertContentHashMatches(intent.contentHash, input.content_hash);
      if (intent.evidenceType !== input.evidence_type) {
        throw new AppError(
          problem({
            title: "Bad Request",
            status: 400,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "execution",
            detail: "evidence_type must match upload intent",
          })
        );
      }

      if (!(await this.storage.objectExists(intent.storageKey))) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "execution",
            detail: "Uploaded object not found in storage",
          })
        );
      }

      const hashOk = await this.storage.verifyObjectContentHash(
        intent.storageKey,
        input.content_hash
      );
      if (!hashOk) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "execution",
            detail: "Stored object hash does not match content_hash",
          })
        );
      }

      const evidence = await this.execution.insertEvidence(tx, {
        contractId,
        milestoneId,
        submittedByUserId: userId,
        evidenceType: input.evidence_type,
        storageKey: intent.storageKey,
        contentHash: input.content_hash,
        metadata: input.metadata,
      });

      await this.execution.confirmUploadIntent(tx, intent.id);

      await outboxWriter.write(tx, {
        eventType: DomainEvents.EXECUTION_EVIDENCE_RECORDED,
        payload: {
          contract_id: contractId,
          milestone_id: milestoneId,
          evidence_id: evidence.id,
        },
        engineSource: "execution",
        idempotencyKey: input.idempotency_key,
      });

      return {
        id: evidence.id,
        evidence_type: evidence.evidenceType,
        content_hash: evidence.contentHash,
        milestone_id: evidence.milestoneId,
        contract_id: evidence.contractId,
        created_at: evidence.createdAt.toISOString(),
      };
    });
  }

  async transitionMilestone(
    contractId: string,
    milestoneId: string,
    userId: string,
    transition: string
  ) {
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    const rule = getMilestoneTransition(transition);
    if (!rule) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.INVALID_TRANSITION,
          engine: "execution",
          detail: "Invalid milestone transition",
        })
      );
    }

    return this.db.withTransaction(async (tx) => {
      const updated = await this.execution.transitionMilestone(
        tx,
        milestoneId,
        rule.to,
        rule.from as MilestoneStatus | undefined
      );
      if (!updated) {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "execution",
            detail: "Invalid milestone transition",
          })
        );
      }

      if (transition === "submit") {
        await outboxWriter.write(tx, {
          eventType: DomainEvents.EXECUTION_MILESTONE_SUBMITTED,
          payload: { contract_id: contractId, milestone_id: milestoneId },
          engineSource: "execution",
          idempotencyKey: `milestone-submit-${milestoneId}`,
        });
      }

      return { id: updated.id, status: updated.status };
    });
  }

  async rateAttestation(
    contractId: string,
    attestationId: string,
    userId: string,
    rating: string
  ) {
    if (!isValidFulfillmentRating(rating)) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "Invalid fulfillment_rating",
        })
      );
    }

    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    if (requiresLinkedEvidence(rating)) {
      const evidenceCount = await this.execution.countAttestationEvidence(
        this.db.pool,
        attestationId
      );
      if (evidenceCount < 1) {
        throw new AppError(
          problem({
            title: "Unprocessable Entity",
            status: 422,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "execution",
            detail: "Non-PEN attestation requires linked evidence (CK-3)",
          })
        );
      }
    }

    return this.db.withTransaction(async (tx) => {
      const updated = await this.execution.rateAttestation(tx, attestationId, rating, userId);
      if (!updated) throw notFound();

      await outboxWriter.write(tx, {
        eventType: DomainEvents.EXECUTION_ATTESTATION_RATED,
        payload: { contract_id: contractId, attestation_id: attestationId, rating },
        engineSource: "execution",
        idempotencyKey: `attest-rate-${attestationId}-${rating}`,
      });

      return { id: updated.id, fulfillment_rating: updated.fulfillmentRating };
    });
  }

  async listContractEvidence(contractId: string, userId: string) {
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    const rows = await this.execution.listEvidenceByContract(this.db.pool, contractId);
    return {
      data: rows.map((e) => this.toEvidenceResponse(e)),
      meta: { has_more: false },
    };
  }

  async listMilestoneEvidence(contractId: string, milestoneId: string, userId: string) {
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    const milestone = await this.execution.findMilestoneById(this.db.pool, milestoneId);
    if (!milestone || milestone.contractId !== contractId) throw notFound();

    const rows = await this.execution.listEvidenceByMilestone(
      this.db.pool,
      contractId,
      milestoneId
    );
    return {
      data: rows.map((e) => this.toEvidenceResponse(e)),
      meta: { has_more: false },
    };
  }

  async getEvidence(evidenceId: string, userId: string) {
    const evidence = await this.execution.findEvidenceById(this.db.pool, evidenceId);
    if (!evidence) throw notFound();

    await this.requireContractParty(evidence.contractId, userId);
    return this.toEvidenceResponse(evidence);
  }

  async getEvidenceDownloadUrl(evidenceId: string, userId: string) {
    const evidence = await this.execution.findEvidenceById(this.db.pool, evidenceId);
    if (!evidence) throw notFound();

    await this.requireContractParty(evidence.contractId, userId);

    if (!evidence.storageKey) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "Evidence has no stored object",
        })
      );
    }

    this.assertStorageKeyTenancy(evidence.storageKey, evidence.contractId, evidence.milestoneId);

    if (!(await this.storage.objectExists(evidence.storageKey))) {
      throw new AppError(
        problem({
          title: "Not Found",
          status: 404,
          code: ErrorCodes.NOT_FOUND,
          engine: "execution",
          detail: "Stored object not found",
        })
      );
    }

    const presigned = await this.storage.createPresignedGet({
      storageKey: evidence.storageKey,
      expiresSeconds: DOWNLOAD_URL_TTL_SECONDS,
    });

    return {
      url: presigned.downloadUrl,
      expires_at: presigned.expiresAt.toISOString(),
      document_hash: evidence.contentHash,
    };
  }

  async linkAttestationEvidence(
    contractId: string,
    attestationId: string,
    userId: string,
    input: { evidence_ids: string[]; idempotency_key: string }
  ) {
    void input.idempotency_key;
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    const attestation = await this.execution.findAttestationById(this.db.pool, attestationId);
    if (!attestation || attestation.contractId !== contractId) throw notFound();

    if (!input.evidence_ids.length) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "evidence_ids must not be empty",
        })
      );
    }

    return this.db.withTransaction(async (tx) => {
      for (const evidenceId of input.evidence_ids) {
        const evidence = await this.execution.findEvidenceById(tx, evidenceId);
        if (!evidence || evidence.contractId !== contractId) throw notFound();
        if (evidence.storageKey) {
          this.assertStorageKeyTenancy(evidence.storageKey, contractId, evidence.milestoneId);
        }
      }

      const linked = await this.execution.linkAttestationEvidence(
        tx,
        attestationId,
        input.evidence_ids,
        contractId
      );

      return { linked, attestation_id: attestationId };
    });
  }

  async linkAttestationMilestones(
    contractId: string,
    attestationId: string,
    userId: string,
    input: { milestone_ids: string[]; idempotency_key: string }
  ) {
    void input.idempotency_key;
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    const attestation = await this.execution.findAttestationById(this.db.pool, attestationId);
    if (!attestation || attestation.contractId !== contractId) throw notFound();

    if (!input.milestone_ids.length) {
      throw new AppError(
        problem({
          title: "Bad Request",
          status: 400,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "execution",
          detail: "milestone_ids must not be empty",
        })
      );
    }

    return this.db.withTransaction(async (tx) => {
      for (const milestoneId of input.milestone_ids) {
        const milestone = await this.execution.findMilestoneById(tx, milestoneId);
        if (!milestone || milestone.contractId !== contractId) throw notFound();
      }

      const linked = await this.execution.linkAttestationMilestones(
        tx,
        attestationId,
        input.milestone_ids,
        contractId
      );

      return { linked, attestation_id: attestationId };
    });
  }

  private toEvidenceResponse(evidence: {
    id: string;
    contractId: string;
    milestoneId: string;
    evidenceType: EvidenceType;
    contentHash: string | null;
    createdAt: Date;
  }) {
    return {
      id: evidence.id,
      contract_id: evidence.contractId,
      milestone_id: evidence.milestoneId,
      evidence_type: evidence.evidenceType,
      content_hash: evidence.contentHash,
      created_at: evidence.createdAt.toISOString(),
    };
  }

  private assertStorageKeyTenancy(
    storageKey: string,
    contractId: string,
    milestoneId: string
  ): void {
    const expectedPrefix = `contracts/${contractId}/milestones/${milestoneId}/`;
    if (!storageKey.startsWith(expectedPrefix)) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.FORBIDDEN,
          engine: "execution",
          detail: "Storage key tenancy mismatch",
        })
      );
    }
  }

  private toUploadIntentResponse(intent: {
    id: string;
    storageKey: string;
    contentHash: string;
    expiresAt: Date;
  }) {
    return {
      upload_url: `memory://upload/${intent.storageKey}`,
      storage_key: intent.storageKey,
      intent_id: intent.id,
      expires_at: intent.expiresAt.toISOString(),
      required_hash: intent.contentHash,
    };
  }

  private partyRolesForUser(
    parties: ContractParty[],
    userId: string
  ): Set<"customer" | "provider"> {
    const roles = new Set<"customer" | "provider">();
    for (const party of parties) {
      if (party.userId === userId) roles.add(party.partyRole);
    }
    return roles;
  }

  private async requireContractParty(contractId: string, userId: string) {
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    const parties = await this.contracts.listParties(this.db.pool, contractId);
    if (!parties.some((p) => p.userId === userId)) throw notFound();
    return contract;
  }

  private async requireContractPartyTx(
    tx: Parameters<ExecutionRepository["findMilestoneById"]>[0],
    contractId: string,
    userId: string
  ) {
    const contract = await this.contracts.findById(tx, contractId);
    if (!contract) throw notFound();
    const parties = await this.contracts.listParties(tx, contractId);
    if (!parties.some((p) => p.userId === userId)) throw notFound();
    return contract;
  }
}

export function createExecutionService(
  db: DbPool,
  contracts: ContractRepository,
  storage: ObjectStorage,
  execution: ExecutionRepository = executionRepository
): ExecutionService {
  return new ExecutionService(db, contracts, execution, storage);
}
