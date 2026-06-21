import type { DbClient, DbPool } from "../../shared/db/index.js";
import { isUniqueViolation } from "../../shared/db/pg-errors.js";
import type { ContractRepository } from "../../contract/infrastructure/contract-repository.js";
import { contractRepository } from "../../contract/infrastructure/contract-repository.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import {
  FREEZE_ELIGIBLE_ESCROW_STATUSES,
  RELEASE_ELIGIBLE_ESCROW_STATUSES,
  type EscrowAgreement,
  type EscrowStatus,
} from "../domain/escrow.js";
import type { AccountType, OwnerEntityType } from "../domain/account.js";
import type { PostJournalResult } from "./ledger-service.js";
import { LedgerService, createLedgerService } from "./ledger-service.js";
import { AccountRepository, accountRepository } from "../infrastructure/account-repository.js";
import { EscrowRepository, escrowRepository } from "../infrastructure/escrow-repository.js";
import type { TrustService } from "../../trust/application/trust-service.js";
import {
  observeEscrowRefunded,
  observeEscrowReleased,
} from "../../trust/application/trust-service.js";

export interface EscrowAccountSet {
  customerAccountId: string;
  escrowAccountId: string;
  providerAccountId: string;
  platformAccountId: string;
}

export interface CreateEscrowInput {
  contractId: string;
  grossAmountMinor: number;
  platformFeeMinor: number;
  currencyCode: string;
  feePolicySnapshot?: Record<string, unknown>;
  idempotencyKey: string;
  actorUserId?: string;
}

export interface EscrowOperationInput {
  contractId: string;
  idempotencyKey: string;
  actorUserId?: string;
}

export interface RefundEscrowOperationInput extends EscrowOperationInput {
  refundAmountMinor: number;
}

const UNFREEZE_CONTRACT_STATUSES = new Set(["active", "resolved"]);

export class EscrowService {
  constructor(
    private readonly db: DbPool,
    private readonly ledger: LedgerService,
    private readonly escrow: EscrowRepository = escrowRepository,
    private readonly accounts: AccountRepository = accountRepository,
    private readonly contracts: ContractRepository = contractRepository,
    private readonly trust?: TrustService
  ) {}

  async createForContract(input: CreateEscrowInput): Promise<EscrowAgreement> {
    return this.db.withTransaction(async (tx) => {
      const existing = await this.escrow.findByContractId(tx, input.contractId);
      if (existing) {
        return existing;
      }

      const contract = await this.contracts.findByIdForUpdate(tx, input.contractId);
      if (!contract) {
        throw notFound();
      }

      try {
        const escrow = await this.escrow.create(tx, {
          contractId: input.contractId,
          grossAmountMinor: input.grossAmountMinor,
          platformFeeMinor: input.platformFeeMinor,
          currencyCode: input.currencyCode,
          feePolicySnapshot: input.feePolicySnapshot,
        });

        await this.escrow.insertStatusHistory(tx, {
          escrowId: escrow.id,
          fromStatus: null,
          toStatus: "pending_funding",
          actorUserId: input.actorUserId,
          reason: input.idempotencyKey,
        });

        return escrow;
      } catch (error) {
        if (isUniqueViolation(error, "uq_escrow_agreements_contract_id")) {
          const raced = await this.escrow.findByContractId(tx, input.contractId);
          if (raced) return raced;
        }
        throw error;
      }
    });
  }

  async markFunded(input: EscrowOperationInput): Promise<EscrowAgreement> {
    return this.db.withTransaction(async (tx) => {
      const escrow = await this.requireEscrowForContract(tx, input.contractId);
      if (escrow.status === "funded") {
        return escrow;
      }
      if (escrow.status !== "pending_funding") {
        throw invalidEscrowTransition(escrow.status, "funded");
      }

      const updated = await this.escrow.updateStatus(tx, escrow.id, "funded");
      await this.recordTransition(tx, {
        escrow,
        toStatus: "funded",
        actorUserId: input.actorUserId,
        reason: input.idempotencyKey,
      });
      return updated;
    });
  }

  async holdFunds(input: EscrowOperationInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const escrow = await this.requireEscrowForContract(tx, input.contractId);
      const accountSet = await this.ensureEscrowAccounts(tx, escrow);

      const result = await this.ledger.fundEscrowHoldTx(
        tx,
        {
          escrowId: escrow.id,
          contractId: escrow.contractId,
          idempotencyKey: input.idempotencyKey,
          amountMinor: escrow.grossAmountMinor,
          customerAccountId: accountSet.customerAccountId,
          escrowAccountId: accountSet.escrowAccountId,
          currencyCode: escrow.currencyCode,
          actorUserId: input.actorUserId,
        },
        { updateEscrowStatus: false }
      );

      if (!result.idempotentReplay) {
        const updated = await this.escrow.updateStatus(tx, escrow.id, "held");
        await this.recordTransition(tx, {
          escrow: updated,
          fromStatus: "funded",
          toStatus: "held",
          actorUserId: input.actorUserId,
          reason: input.idempotencyKey,
          journalId: result.journal.id,
        });
      }

      return result;
    });
  }

  async releaseAfterAcceptance(input: EscrowOperationInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const escrow = await this.requireEscrowForContract(tx, input.contractId);
      if (!RELEASE_ELIGIBLE_ESCROW_STATUSES.has(escrow.status)) {
        throw invalidEscrowTransition(escrow.status, "released");
      }

      const accountSet = await this.ensureEscrowAccounts(tx, escrow);
      const fromStatus = escrow.status;
      const result = await this.ledger.releaseEscrowTx(
        tx,
        {
          escrowId: escrow.id,
          contractId: escrow.contractId,
          idempotencyKey: input.idempotencyKey,
          providerAccountId: accountSet.providerAccountId,
          platformAccountId: accountSet.platformAccountId,
          escrowAccountId: accountSet.escrowAccountId,
          currencyCode: escrow.currencyCode,
          actorUserId: input.actorUserId,
        },
        { updateEscrowStatus: false }
      );

      if (!result.idempotentReplay) {
        const updated = await this.escrow.updateStatus(tx, escrow.id, "released");
        await this.recordTransition(tx, {
          escrow: updated,
          fromStatus,
          toStatus: "released",
          actorUserId: input.actorUserId,
          reason: input.idempotencyKey,
          journalId: result.journal.id,
        });

        const contract = await this.contracts.findById(tx, input.contractId);
        await observeEscrowReleased(this.trust, tx, {
          providerId: contract?.providerId ?? null,
          contractId: input.contractId,
          escrowId: escrow.id,
          idempotencyKey: input.idempotencyKey,
        });
      }

      return result;
    });
  }

  async refund(input: RefundEscrowOperationInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const escrow = await this.requireEscrowForContract(tx, input.contractId);
      if (escrow.status === "frozen") {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "financial",
            detail: "escrow cannot refund while frozen",
          })
        );
      }

      const accountSet = await this.ensureEscrowAccounts(tx, escrow);
      const fromStatus = escrow.status;
      const result = await this.ledger.refundEscrowTx(
        tx,
        {
          escrowId: escrow.id,
          contractId: escrow.contractId,
          idempotencyKey: input.idempotencyKey,
          refundAmountMinor: input.refundAmountMinor,
          customerAccountId: accountSet.customerAccountId,
          escrowAccountId: accountSet.escrowAccountId,
          currencyCode: escrow.currencyCode,
          actorUserId: input.actorUserId,
        },
        { updateEscrowStatus: false }
      );

      if (!result.idempotentReplay) {
        const nextStatus: EscrowStatus =
          result.journal.journalType === "escrow_refund" ? "refunded" : "partially_refunded";
        const updated = await this.escrow.updateStatus(tx, escrow.id, nextStatus);
        await this.recordTransition(tx, {
          escrow: updated,
          fromStatus,
          toStatus: nextStatus,
          actorUserId: input.actorUserId,
          reason: input.idempotencyKey,
          journalId: result.journal.id,
        });

        const contract = await this.contracts.findById(tx, input.contractId);
        await observeEscrowRefunded(this.trust, tx, {
          providerId: contract?.providerId ?? null,
          contractId: input.contractId,
          escrowId: escrow.id,
          idempotencyKey: input.idempotencyKey,
          refundAmountMinor: input.refundAmountMinor,
        });
      }

      return result;
    });
  }

  async freezeOnIssueRaisedTx(
    tx: DbClient,
    input: { contractId: string; issueId: string; actorUserId: string }
  ): Promise<EscrowAgreement | null> {
    const escrow = await this.escrow.findByContractIdForUpdate(tx, input.contractId);
    if (!escrow) {
      return null;
    }
    if (escrow.status === "frozen") {
      return escrow;
    }
    if (!FREEZE_ELIGIBLE_ESCROW_STATUSES.has(escrow.status)) {
      return escrow;
    }

    const fromStatus = escrow.status;
    const updated = await this.escrow.freeze(tx, escrow.id, {
      issueId: input.issueId,
      reason: "issue_raised",
    });
    await this.recordTransition(tx, {
      escrow: updated,
      fromStatus,
      toStatus: "frozen",
      actorUserId: input.actorUserId,
      reason: `issue_raised:${input.issueId}`,
    });
    return updated;
  }

  async unfreezeAfterIssueResolvedTx(
    tx: DbClient,
    input: { contractId: string; actorUserId: string }
  ): Promise<EscrowAgreement | null> {
    const contract = await this.contracts.findById(tx, input.contractId);
    if (!contract) {
      throw notFound();
    }
    if (!UNFREEZE_CONTRACT_STATUSES.has(contract.status)) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.INVALID_TRANSITION,
          engine: "financial",
          detail: `escrow unfreeze requires contract status active or resolved (status=${contract.status})`,
        })
      );
    }

    const escrow = await this.escrow.findByContractIdForUpdate(tx, input.contractId);
    if (!escrow) {
      return null;
    }
    if (escrow.status !== "frozen") {
      return escrow;
    }

    const resumeStatus = await this.escrow.findResumeStatusBeforeLatestFreeze(tx, escrow.id);
    if (!resumeStatus || !FREEZE_ELIGIBLE_ESCROW_STATUSES.has(resumeStatus)) {
      throw new AppError(
        problem({
          title: "Conflict",
          status: 409,
          code: ErrorCodes.INVALID_TRANSITION,
          engine: "financial",
          detail: "escrow resume status unavailable after freeze",
        })
      );
    }

    const updated = await this.escrow.unfreeze(tx, escrow.id, resumeStatus);
    await this.recordTransition(tx, {
      escrow: updated,
      fromStatus: "frozen",
      toStatus: resumeStatus,
      actorUserId: input.actorUserId,
      reason: "issue_resolved",
    });
    return updated;
  }

  unfreezeAfterIssueResolved(input: {
    contractId: string;
    actorUserId: string;
  }): Promise<EscrowAgreement | null> {
    return this.db.withTransaction((tx) => this.unfreezeAfterIssueResolvedTx(tx, input));
  }

  async getByContractId(contractId: string): Promise<EscrowAgreement | null> {
    return this.escrow.findByContractId(this.db.pool, contractId);
  }

  private async requireEscrowForContract(
    tx: DbClient,
    contractId: string
  ): Promise<EscrowAgreement> {
    const escrow = await this.escrow.findByContractIdForUpdate(tx, contractId);
    if (!escrow) {
      throw notFound();
    }
    return escrow;
  }

  private async ensureEscrowAccounts(
    tx: DbClient,
    escrow: EscrowAgreement
  ): Promise<EscrowAccountSet> {
    const contract = await this.contracts.findById(tx, escrow.contractId);
    if (!contract) {
      throw notFound();
    }

    const customerCode = `customer:contract:${escrow.contractId}`;
    const escrowCode = `escrow:contract:${escrow.contractId}`;
    const providerCode = `provider:contract:${escrow.contractId}`;
    const platformCode = `platform:revenue:${escrow.currencyCode}:${escrow.contractId}`;

    const customerAccount = await this.getOrCreateAccount(tx, {
      accountCode: customerCode,
      accountType: "customer_wallet",
      currencyCode: escrow.currencyCode,
      ownerEntityType: "user",
      ownerEntityId: contract.customerId,
    });
    const escrowAccount = await this.getOrCreateAccount(tx, {
      accountCode: escrowCode,
      accountType: "escrow_contract",
      currencyCode: escrow.currencyCode,
      ownerEntityType: "escrow",
      ownerEntityId: escrow.id,
    });
    const providerAccount = await this.getOrCreateAccount(tx, {
      accountCode: providerCode,
      accountType: "provider_wallet",
      currencyCode: escrow.currencyCode,
      ownerEntityType: "user",
      ownerEntityId: contract.providerId,
    });
    const platformAccount = await this.getOrCreateAccount(tx, {
      accountCode: platformCode,
      accountType: "platform_revenue",
      currencyCode: escrow.currencyCode,
      ownerEntityType: "platform",
      ownerEntityId: null,
    });

    return {
      customerAccountId: customerAccount.id,
      escrowAccountId: escrowAccount.id,
      providerAccountId: providerAccount.id,
      platformAccountId: platformAccount.id,
    };
  }

  private async getOrCreateAccount(
    tx: DbClient,
    input: {
      accountCode: string;
      accountType: AccountType;
      currencyCode: string;
      ownerEntityType: OwnerEntityType | null;
      ownerEntityId: string | null;
    }
  ) {
    const existing = await this.accounts.findByAccountCode(tx, input.accountCode);
    if (existing) {
      return existing;
    }
    try {
      return await this.accounts.insert(tx, input);
    } catch (error) {
      if (isUniqueViolation(error, "uq_accounts_account_code")) {
        const raced = await this.accounts.findByAccountCode(tx, input.accountCode);
        if (raced) return raced;
      }
      throw error;
    }
  }

  private async recordTransition(
    tx: DbClient,
    input: {
      escrow: EscrowAgreement;
      fromStatus?: EscrowStatus | null;
      toStatus: EscrowStatus;
      actorUserId?: string;
      reason?: string;
      journalId?: string;
    }
  ): Promise<void> {
    await this.escrow.insertStatusHistory(tx, {
      escrowId: input.escrow.id,
      fromStatus: input.fromStatus ?? input.escrow.status,
      toStatus: input.toStatus,
      actorUserId: input.actorUserId,
      reason: input.reason,
      journalId: input.journalId,
    });
  }
}

function invalidEscrowTransition(from: EscrowStatus, to: EscrowStatus): AppError {
  return new AppError(
    problem({
      title: "Conflict",
      status: 409,
      code: ErrorCodes.INVALID_TRANSITION,
      engine: "financial",
      detail: `invalid escrow transition from ${from} to ${to}`,
    })
  );
}

export function createEscrowService(
  db: DbPool,
  ledger: LedgerService = createLedgerService(db),
  contracts: ContractRepository = contractRepository,
  trust?: TrustService
): EscrowService {
  return new EscrowService(db, ledger, escrowRepository, accountRepository, contracts, trust);
}
