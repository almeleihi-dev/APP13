import { createHash, randomBytes } from "node:crypto";
import type { DbClient, DbPool } from "../../shared/db/index.js";
import { isUniqueViolation } from "../../shared/db/pg-errors.js";
import { setSessionGuc } from "../../shared/db/index.js";
import { DomainEvents } from "../../shared/events/index.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import { outboxWriter } from "../../platform/outbox/index.js";
import { operationsService } from "../../platform/operations/index.js";
import type { IdentityRepository } from "../../identity/infrastructure/identity-repository.js";
import { ActionRepository, actionRepository } from "../../action/infrastructure/action-repository.js";
import { getTemplateByActionCode, listTemplates } from "../templates/registry.js";
import {
  allPartiesAccepted,
  type Contract,
  type ContractParty,
  type ContractStatus,
} from "../domain/contract.js";
import {
  assertActionReadyForContract,
  assertDocumentHashAck,
  assertTierGates,
  assertCa2Executable,
} from "../domain/guards.js";
import {
  assertCompletionReady,
  computeComplaintWindowEnd,
} from "../domain/completion.js";
import { contractRepository, ContractRepository } from "../infrastructure/contract-repository.js";
import {
  complaintReadinessRepository,
  ComplaintReadinessRepository,
} from "../infrastructure/complaint-readiness.js";
import { executionRepository } from "../../execution/infrastructure/execution-repository.js";
import { MilestoneFactory, AttestationFactory } from "../materialization/factory.js";

export function sha256Document(payload: unknown): string {
  const hash = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  return `sha256:${hash}`;
}

function contractNumber(): string {
  const year = new Date().getFullYear();
  return `CTR-${year}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

function activationOperationKey(contractId: string): string {
  return `contract-activate-${contractId}`;
}

export function toContractResponse(c: Contract) {
  return {
    id: c.id,
    action_id: c.actionId,
    contract_number: c.contractNumber,
    status: c.status,
    template_id: c.templateId,
    document_hash: c.documentHash,
    customer_id: c.customerId,
    provider_id: c.providerId,
    activated_at: c.activatedAt?.toISOString() ?? null,
    complaint_window_ends_at: c.complaintWindowEndsAt?.toISOString() ?? null,
    tekrr_snapshot: c.tekrrSnapshot,
  };
}

function conflictTransition(engine: "contract" | "execution" = "contract"): AppError {
  return new AppError(
    problem({
      title: "Conflict",
      status: 409,
      code: ErrorCodes.INVALID_TRANSITION,
      engine,
      detail: "Invalid transition",
    })
  );
}

export class ContractEngineService {
  private readonly milestoneFactory = new MilestoneFactory(executionRepository);
  private readonly attestationFactory = new AttestationFactory(executionRepository);

  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository,
    private readonly actions: ActionRepository = actionRepository,
    private readonly contracts: ContractRepository = contractRepository,
    private readonly complaints: ComplaintReadinessRepository = complaintReadinessRepository
  ) {}

  async generateContract(actionId: string, userId: string, idempotencyKey?: string) {
    return this.db.withTransaction(async (tx) => {
      const action = await this.actions.findByIdForUpdate(tx, actionId);
      if (!action) throw notFound();

      const existing = await this.contracts.findByActionId(tx, actionId);
      if (existing) {
        return { contract: toContractResponse(existing), created: false };
      }

      assertActionReadyForContract(action);
      if (!action.providerId) {
        throw new AppError(
          problem({
            title: "Unprocessable Entity",
            status: 422,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "contract",
            detail: "Provider must be assigned before contract generation",
          })
        );
      }

      const template = getTemplateByActionCode(action.actionCode);
      if (!template) throw notFound();

      const customerProfile = await this.identityRepo.findCustomerById(tx, action.customerId);
      const providerProfile = await this.identityRepo.findProviderById(tx, action.providerId);
      if (!customerProfile || !providerProfile) throw notFound();

      const customerUser = await this.identityRepo.findUserById(tx, customerProfile.userId);
      const providerUser = await this.identityRepo.findUserById(tx, providerProfile.userId);
      if (!customerUser || !providerUser) throw notFound();
      assertTierGates(customerUser, providerUser, template);

      const documentPayload = {
        template_id: template.templateId,
        tekrr_snapshot: action.tekrrProfile,
        clause_modules: template.clauseModules,
        jurisdiction_pack: template.jurisdictionPack,
      };
      const documentHash = sha256Document(documentPayload);
      const pdfKey = `contracts/pending/${actionId}/document.pdf`;

      try {
        const contract = await this.contracts.create(tx, {
          actionId: action.id,
          customerId: action.customerId,
          providerId: action.providerId,
          contractNumber: contractNumber(),
          templateId: template.templateId,
          templateVersion: template.version,
          jurisdictionPack: template.jurisdictionPack,
          tekrrSnapshot: action.tekrrProfile as Record<string, unknown>,
          documentHash,
          pdfStorageKey: pdfKey,
        });

        await this.contracts.addParty(tx, {
          contractId: contract.id,
          userId: customerUser.id,
          partyRole: "customer",
        });
        await this.contracts.addParty(tx, {
          contractId: contract.id,
          userId: providerUser.id,
          partyRole: "provider",
        });

        await this.actions.transition(tx, action.id, "contract_pending", userId, action.status);

        await outboxWriter.write(tx, {
          eventType: DomainEvents.CONTRACT_GENERATED,
          payload: { contract_id: contract.id, action_id: action.id },
          engineSource: "contract",
          idempotencyKey: idempotencyKey ?? `contract-generated-${contract.id}`,
        });
        await outboxWriter.write(tx, {
          eventType: DomainEvents.CONTRACT_PROPOSED,
          payload: { contract_id: contract.id, action_id: action.id },
          engineSource: "contract",
          idempotencyKey: `${idempotencyKey ?? contract.id}-proposed`,
        });

        return { contract: toContractResponse(contract), created: true };
      } catch (error) {
        if (isUniqueViolation(error, "uq_contracts_action_id")) {
          const raced = await this.contracts.findByActionId(tx, actionId);
          if (raced) {
            return { contract: toContractResponse(raced), created: false };
          }
        }
        throw error;
      }
    });
  }

  async transitionContract(
    contractId: string,
    userId: string,
    input: {
      transition: string;
      party_role?: string;
      document_hash_ack?: string;
      reason?: string;
    },
    idempotencyKey?: string,
    requestId?: string
  ) {
    if (input.transition === "accept") {
      return this.db.withTransaction(async (tx) => {
        const contract = await this.contracts.findByIdForUpdate(tx, contractId);
        if (!contract) throw notFound();
        await this.assertPartyMembership(tx, contractId, userId);

        const user = await this.identityRepo.findUserById(tx, userId);
        if (!user) throw notFound();

        if (contract.status === "accepted" || contract.status === "active") {
          const op = await this.getOrRunActivateOperation(
            tx,
            contractId,
            userId,
            idempotencyKey,
            requestId
          );
          return { type: "async" as const, operation: op };
        }

        if (contract.status !== "proposed") throw conflictTransition();
        assertDocumentHashAck(contract.documentHash, input.document_hash_ack);

        const acceptedParty = await this.contracts.acceptParty(
          tx,
          contractId,
          userId,
          user.verificationTier
        );
        if (!acceptedParty) {
          const parties = await this.contracts.listParties(tx, contractId);
          const self = parties.find((p) => p.userId === userId);
          if (!self?.acceptedAt) throw conflictTransition();
        }

        const parties = await this.contracts.listParties(tx, contractId);
        if (!allPartiesAccepted(parties)) {
          const refreshed = await this.contracts.findById(tx, contractId);
          return { type: "sync" as const, contract: toContractResponse(refreshed!) };
        }

        const extra: {
          customerAcceptedAt?: Date;
          providerAcceptedAt?: Date;
        } = {};
        if (input.party_role === "customer") extra.customerAcceptedAt = new Date();
        if (input.party_role === "provider") extra.providerAcceptedAt = new Date();

        const transitioned = await this.contracts.transition(
          tx,
          contractId,
          "accepted",
          userId,
          "proposed",
          extra
        );
        if (!transitioned) {
          const current = await this.contracts.findById(tx, contractId);
          if (current && (current.status === "accepted" || current.status === "active")) {
            const op = await this.getOrRunActivateOperation(
              tx,
              contractId,
              userId,
              idempotencyKey,
              requestId
            );
            return { type: "async" as const, operation: op };
          }
          throw conflictTransition();
        }

        const op = await this.getOrRunActivateOperation(
          tx,
          contractId,
          userId,
          idempotencyKey,
          requestId
        );
        return { type: "async" as const, operation: op };
      });
    }

    const contract = await this.requireContractParty(contractId, userId);

    if (input.transition === "decline" && contract.status === "proposed") {
      await this.contracts.transition(this.db.pool, contractId, "draft", userId, "proposed");
      const refreshed = await this.contracts.findById(this.db.pool, contractId);
      return { type: "sync" as const, contract: toContractResponse(refreshed!) };
    }

    if (input.transition === "cancel") {
      return this.db.withTransaction(async (tx) => {
        const locked = await this.contracts.findByIdForUpdate(tx, contractId);
        if (!locked) throw notFound();
        await this.assertPartyMembership(tx, contractId, userId);
        await this.contracts.transition(
          tx,
          contractId,
          "cancelled",
          userId,
          locked.status
        );
        await outboxWriter.write(tx, {
          eventType: DomainEvents.CONTRACT_CANCELLED,
          payload: { contract_id: contractId },
          engineSource: "contract",
          idempotencyKey: idempotencyKey ?? `contract-cancelled-${contractId}`,
        });
        const refreshed = await this.contracts.findById(tx, contractId);
        return { type: "sync" as const, contract: toContractResponse(refreshed!) };
      });
    }

    throw conflictTransition();
  }

  async materialize(contractId: string, actorUserId: string, idempotencyKey?: string) {
    return this.db.withTransaction(async (tx) => {
      const contract = await this.contracts.findByIdForUpdate(tx, contractId);
      if (!contract || contract.status !== "accepted") {
        throw conflictTransition();
      }
      const action = await this.actions.findById(tx, contract.actionId);
      if (!action) throw notFound();
      const template = getTemplateByActionCode(action.actionCode);
      if (!template) throw notFound();
      return this.materializeInTransaction(tx, contractId, template, actorUserId, idempotencyKey);
    });
  }

  async activate(contractId: string, actorUserId: string, idempotencyKey?: string) {
    return this.db.withTransaction(async (tx) =>
      this.activateInTransaction(tx, contractId, actorUserId, idempotencyKey)
    );
  }

  async complete(contractId: string, actorUserId: string, idempotencyKey?: string) {
    return this.db.withTransaction(async (tx) => {
      const contract = await this.contracts.findByIdForUpdate(tx, contractId);
      if (!contract) throw notFound();

      const action = await this.actions.findById(tx, contract.actionId);
      const template = action ? getTemplateByActionCode(action.actionCode) : undefined;
      const filingWindowDays = template?.filingWindowDays ?? 30;

      const counts = await executionRepository.countMilestonesByStatus(tx, contractId);
      const attestations = await executionRepository.listAttestations(tx, contractId);
      const blockingComplaints = await this.complaints.countBlockingComplaints(tx, contractId);
      const penWithComplaint = await this.complaints.listPenDimensionsWithActiveComplaints(
        tx,
        contractId
      );

      assertCompletionReady({
        contractStatus: contract.status,
        blockingMilestones: counts.blocking,
        completedBlockingMilestones: counts.done,
        attestations,
        blockingComplaintCount: blockingComplaints,
        penDimensionsWithActiveComplaint: penWithComplaint,
      });

      const completedAt = new Date();
      const complaintWindowEndsAt = computeComplaintWindowEnd(completedAt, filingWindowDays);

      const updated = await this.contracts.transition(
        tx,
        contractId,
        "completed",
        actorUserId,
        contract.status,
        { completedAt, complaintWindowEndsAt }
      );
      if (!updated) throw conflictTransition();

      if (action) {
        await this.actions.transition(tx, action.id, "completed", actorUserId, action.status);
      }

      await outboxWriter.write(tx, {
        eventType: DomainEvents.CONTRACT_COMPLETED,
        payload: { contract_id: contractId },
        engineSource: "contract",
        idempotencyKey: idempotencyKey ?? `contract-completed-${contractId}`,
      });

      return toContractResponse(updated);
    });
  }

  async applyIssuePathTransition(
    contractId: string,
    actorUserId: string,
    input: { transition: string; reason?: string }
  ) {
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();

    const map: Record<string, { from: ContractStatus; to: ContractStatus }> = {
      issue_raise: { from: "active", to: "issue_raised" },
      dispute: { from: "issue_raised", to: "disputed" },
      resolve: { from: "disputed", to: "resolved" },
      close: { from: "resolved", to: "closed" },
      withdraw: { from: "issue_raised", to: "active" },
    };
    const rule = map[input.transition];
    if (!rule || contract.status !== rule.from) throw conflictTransition();

    const updated = await this.contracts.transition(
      this.db.pool,
      contractId,
      rule.to,
      actorUserId,
      rule.from
    );
    if (!updated) throw conflictTransition();
    return toContractResponse(updated);
  }

  async listMilestones(contractId: string, userId: string) {
    const contract = await this.requireContractParty(contractId, userId);
    assertCa2Executable(contract.status);
    const milestones = await executionRepository.listMilestones(this.db.pool, contractId);
    return {
      data: milestones.map((m) => ({
        id: m.id,
        milestone_code: m.milestoneCode,
        name: m.name,
        status: m.status,
        sequence_order: m.sequenceOrder,
        tekrr_dimension: m.tekrrDimension,
      })),
      meta: { has_more: false },
    };
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

    const map: Record<string, { to: "in_progress" | "submitted" | "accepted"; from?: string }> = {
      start: { to: "in_progress", from: "pending" },
      submit: { to: "submitted", from: "in_progress" },
      accept: { to: "accepted", from: "submitted" },
    };
    const rule = map[transition];
    if (!rule) throw conflictTransition("execution");

    return this.db.withTransaction(async (tx) => {
      const updated = await executionRepository.transitionMilestone(
        tx,
        milestoneId,
        rule.to,
        rule.from as never
      );
      if (!updated) throw conflictTransition("execution");

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

  async listAttestations(contractId: string, userId: string) {
    const contract = await this.requireContractParty(contractId, userId);
    assertCa2Executable(contract.status);
    const rows = await executionRepository.listAttestations(this.db.pool, contractId);
    return {
      data: rows.map((a) => ({
        id: a.id,
        tekrr_dimension: a.tekrrDimension,
        fulfillment_rating: a.fulfillmentRating,
      })),
      meta: { has_more: false },
    };
  }

  async rateAttestation(
    contractId: string,
    attestationId: string,
    userId: string,
    rating: string
  ) {
    await this.requireContractParty(contractId, userId);
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    assertCa2Executable(contract.status);

    return this.db.withTransaction(async (tx) => {
      const updated = await executionRepository.rateAttestation(
        tx,
        attestationId,
        rating,
        userId
      );
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

  async getContract(contractId: string, userId: string) {
    const contract = await this.requireContractParty(contractId, userId);
    return toContractResponse(contract);
  }

  async listContracts(userId: string) {
    const contracts = await this.contracts.listForUser(this.db.pool, userId);
    return {
      data: contracts.map(toContractResponse),
      meta: { has_more: false },
    };
  }

  async getParties(contractId: string, userId: string) {
    await this.requireContractParty(contractId, userId);
    const parties = await this.contracts.listParties(this.db.pool, contractId);
    return parties.map((p: ContractParty) => ({
      party_role: p.partyRole,
      accepted_at: p.acceptedAt?.toISOString() ?? null,
      declined_at: p.declinedAt?.toISOString() ?? null,
    }));
  }

  listTemplates() {
    return {
      data: listTemplates().map((t) => ({
        template_id: t.templateId,
        action_code: t.actionCode,
        version: t.version,
        min_customer_tier: t.minCustomerTier,
        min_provider_tier: t.minProviderTier,
      })),
    };
  }

  async enqueueActivate(
    contractId: string,
    userId: string,
    idempotencyKey?: string,
    requestId?: string
  ) {
    return this.db.withTransaction(async (tx) =>
      this.getOrRunActivateOperation(tx, contractId, userId, idempotencyKey, requestId)
    );
  }

  enqueueActivateViaInternal = this.enqueueActivate;

  async processOperation(operationId: string, actorUserId: string) {
    const op = await operationsService.getById(this.db.pool, operationId);
    if (!op || op.status !== "queued") return;

    try {
      if (op.operationType === "contract.activate") {
        await this.activate(op.resourceId!, actorUserId, op.idempotencyKey ?? undefined);
      } else if (op.operationType === "contract.complete") {
        await this.complete(op.resourceId!, actorUserId, op.idempotencyKey ?? undefined);
      }
      await operationsService.complete(this.db.pool, operationId);
    } catch (error) {
      await operationsService.fail(
        this.db.pool,
        operationId,
        error instanceof Error ? error.message : "error"
      );
      throw error;
    }
  }

  async enqueueComplete(
    contractId: string,
    userId: string,
    idempotencyKey?: string,
    requestId?: string
  ) {
    const op = await operationsService.enqueue(this.db.pool, {
      operationType: "contract.complete",
      resourceType: "contract",
      resourceId: contractId,
      idempotencyKey,
      requestId,
      actorUserId: userId,
    });
    await this.processOperation(op.id, userId);
    return operationsService.toAsyncResponse(
      (await operationsService.getById(this.db.pool, op.id))!
    );
  }

  private async activateInTransaction(
    tx: DbClient,
    contractId: string,
    actorUserId: string,
    idempotencyKey?: string
  ) {
    const contract = await this.contracts.findByIdForUpdate(tx, contractId);
    if (!contract) throw notFound();
    if (contract.status === "active") {
      return toContractResponse(contract);
    }
    if (contract.status !== "accepted") throw conflictTransition();

    const action = await this.actions.findById(tx, contract.actionId);
    if (!action) throw notFound();
    const template = getTemplateByActionCode(action.actionCode);
    if (!template) throw notFound();

    const customer = await this.identityRepo.findCustomerById(tx, contract.customerId!);
    const provider = await this.identityRepo.findProviderById(tx, contract.providerId!);
    const customerUser = customer
      ? await this.identityRepo.findUserById(tx, customer.userId)
      : null;
    const providerUser = provider
      ? await this.identityRepo.findUserById(tx, provider.userId)
      : null;

    const verificationSnapshot = {
      customer_tier: customerUser?.verificationTier,
      provider_tier: providerUser?.verificationTier,
      captured_at: new Date().toISOString(),
    };

    await this.materializeInTransaction(
      tx,
      contractId,
      template,
      actorUserId,
      `${idempotencyKey ?? contractId}-mat`
    );

    const updated = await this.contracts.transition(
      tx,
      contractId,
      "active",
      actorUserId,
      "accepted",
      {
        activatedAt: new Date(),
        verificationSnapshot,
      }
    );
    if (!updated) throw conflictTransition();

    await this.actions.transition(tx, action.id, "contract_active", actorUserId, action.status);

    await outboxWriter.write(tx, {
      eventType: DomainEvents.CONTRACT_ACTIVATED,
      payload: { contract_id: contractId, action_id: action.id },
      engineSource: "contract",
      idempotencyKey: idempotencyKey ?? `contract-activated-${contractId}`,
    });

    return toContractResponse(updated);
  }

  private async getOrRunActivateOperation(
    tx: DbClient,
    contractId: string,
    userId: string,
    idempotencyKey?: string,
    requestId?: string
  ) {
    const opKey = idempotencyKey ?? activationOperationKey(contractId);
    let op = await operationsService.findByIdempotencyKey(tx, opKey);
    if (!op) {
      op = await operationsService.enqueue(tx, {
        operationType: "contract.activate",
        resourceType: "contract",
        resourceId: contractId,
        idempotencyKey: opKey,
        requestId,
        actorUserId: userId,
      });
    }

    if (op.status === "queued" || op.status === "failed") {
      await this.activateInTransaction(tx, contractId, userId, opKey);
      await operationsService.complete(tx, op.id);
      op = (await operationsService.getById(tx, op.id))!;
    }

    return operationsService.toAsyncResponse(op);
  }

  private async materializeInTransaction(
    tx: DbClient,
    contractId: string,
    template: NonNullable<ReturnType<typeof getTemplateByActionCode>>,
    actorUserId: string,
    idempotencyKey?: string
  ) {
    await setSessionGuc(tx, "app13.contract_materialization", "on");
    const existing = await executionRepository.listMilestones(tx, contractId);
    if (existing.length === 0) {
      await this.milestoneFactory.materialize(tx, contractId, template);
      const providerParty = (await this.contracts.listParties(tx, contractId)).find(
        (p: ContractParty) => p.partyRole === "provider"
      );
      await this.attestationFactory.materializeShells(
        tx,
        contractId,
        template.tekrrDimensions,
        providerParty?.userId ?? actorUserId
      );
      await outboxWriter.write(tx, {
        eventType: DomainEvents.CONTRACT_MATERIALIZED,
        payload: { contract_id: contractId },
        engineSource: "contract",
        idempotencyKey: idempotencyKey ?? `materialize-${contractId}`,
      });
    }
    return { contract_id: contractId };
  }

  private async assertPartyMembership(
    tx: DbClient,
    contractId: string,
    userId: string
  ): Promise<void> {
    const parties = await this.contracts.listParties(tx, contractId);
    if (!parties.some((p: ContractParty) => p.userId === userId)) throw notFound();
  }

  private async requireContractParty(contractId: string, userId: string): Promise<Contract> {
    const contract = await this.contracts.findById(this.db.pool, contractId);
    if (!contract) throw notFound();
    const parties = await this.contracts.listParties(this.db.pool, contractId);
    if (!parties.some((p: ContractParty) => p.userId === userId)) throw notFound();
    return contract;
  }
}

export function createContractEngineService(
  db: DbPool,
  identityRepo: IdentityRepository
): ContractEngineService {
  return new ContractEngineService(db, identityRepo);
}
