import type { DbClient, DbPool } from "../../shared/db/index.js";
import { isUniqueViolation } from "../../shared/db/pg-errors.js";
import { AppError, ErrorCodes, notFound, problem } from "../../shared/errors/index.js";
import {
  assertRefundDoesNotExceedEscrow,
  validateJournalDraft,
  type LedgerEntryDraft,
} from "../domain/index.js";
import type { EscrowAgreement, EscrowStatus } from "../domain/escrow.js";
import type { Journal, JournalType } from "../domain/journal.js";
import type { LedgerEntry } from "../domain/ledger-entry.js";
import { AccountRepository, accountRepository } from "../infrastructure/account-repository.js";
import { EscrowRepository, escrowRepository } from "../infrastructure/escrow-repository.js";
import { LedgerRepository, ledgerRepository } from "../infrastructure/ledger-repository.js";

export interface PostJournalInput {
  journalType: JournalType;
  idempotencyKey: string;
  escrowId?: string;
  contractId?: string;
  actorUserId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  entries: LedgerEntryDraft[];
}

export interface PostJournalResult {
  journal: Journal;
  entries: LedgerEntry[];
  idempotentReplay: boolean;
}

export interface FundEscrowHoldInput {
  escrowId: string;
  contractId: string;
  idempotencyKey: string;
  amountMinor: number;
  customerAccountId: string;
  escrowAccountId: string;
  currencyCode: string;
  actorUserId?: string;
}

export interface ReleaseEscrowInput {
  escrowId: string;
  contractId: string;
  idempotencyKey: string;
  providerAccountId: string;
  platformAccountId: string;
  escrowAccountId: string;
  currencyCode: string;
  actorUserId?: string;
}

export interface RefundEscrowInput {
  escrowId: string;
  contractId: string;
  idempotencyKey: string;
  refundAmountMinor: number;
  customerAccountId: string;
  escrowAccountId: string;
  currencyCode: string;
  actorUserId?: string;
}

export class LedgerService {
  constructor(
    private readonly db: DbPool,
    private readonly ledger: LedgerRepository = ledgerRepository,
    private readonly accounts: AccountRepository = accountRepository,
    private readonly escrow: EscrowRepository = escrowRepository
  ) {}

  async postJournal(tx: DbClient, input: PostJournalInput): Promise<PostJournalResult> {
    const existing = await this.ledger.findJournalByIdempotencyKey(tx, input.idempotencyKey);
    if (existing) {
      const entries = await this.ledger.listEntriesByJournalId(tx, existing.id);
      return { journal: existing, entries, idempotentReplay: true };
    }

    let escrow: EscrowAgreement | null = null;
    if (input.escrowId) {
      escrow = await this.escrow.findByIdForUpdate(tx, input.escrowId);
      if (!escrow) {
        throw notFound();
      }
    }

    const accountIds = [...new Set(input.entries.map((entry) => entry.accountId))];
    const accountRows = await this.accounts.listByIds(tx, accountIds);
    const accountsById = new Map(accountRows.map((account) => [account.id, account]));

    validateJournalDraft({
      journalType: input.journalType,
      entries: input.entries,
      escrowStatus: escrow?.status,
      accountsById,
    });

    try {
      const journal = await this.ledger.insertJournal(tx, input);
      const entries = await this.ledger.insertLedgerEntries(tx, journal.id, input.entries);
      return { journal, entries, idempotentReplay: false };
    } catch (error) {
      if (isUniqueViolation(error, "uq_journals_idempotency_key")) {
        const raced = await this.ledger.findJournalByIdempotencyKey(tx, input.idempotencyKey);
        if (raced) {
          const entries = await this.ledger.listEntriesByJournalId(tx, raced.id);
          return { journal: raced, entries, idempotentReplay: true };
        }
      }
      throw error;
    }
  }

  postJournalStandalone(input: PostJournalInput): Promise<PostJournalResult> {
    return this.db.withTransaction((tx) => this.postJournal(tx, input));
  }

  async fundEscrowHold(input: FundEscrowHoldInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const existing = await this.ledger.findJournalByIdempotencyKey(tx, input.idempotencyKey);
      if (existing) {
        const entries = await this.ledger.listEntriesByJournalId(tx, existing.id);
        return { journal: existing, entries, idempotentReplay: true };
      }

      const escrow = await this.escrow.findByIdForUpdate(tx, input.escrowId);
      if (!escrow) {
        throw notFound();
      }
      if (escrow.status !== "funded") {
        throw new AppError(
          problem({
            title: "Conflict",
            status: 409,
            code: ErrorCodes.INVALID_TRANSITION,
            engine: "financial",
            detail: `escrow hold requires funded status (status=${escrow.status})`,
          })
        );
      }
      if (input.amountMinor !== escrow.grossAmountMinor) {
        throw new AppError(
          problem({
            title: "Unprocessable Entity",
            status: 422,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "financial",
            detail: "hold amount must equal escrow gross amount",
          })
        );
      }

      const result = await this.postJournal(tx, {
        journalType: "escrow_hold",
        idempotencyKey: input.idempotencyKey,
        escrowId: input.escrowId,
        contractId: input.contractId,
        actorUserId: input.actorUserId,
        entries: [
          {
            accountId: input.customerAccountId,
            direction: "debit",
            amountMinor: input.amountMinor,
            currencyCode: input.currencyCode,
            entryType: "hold",
            sequenceNo: 1,
          },
          {
            accountId: input.escrowAccountId,
            direction: "credit",
            amountMinor: input.amountMinor,
            currencyCode: input.currencyCode,
            entryType: "hold",
            sequenceNo: 2,
          },
        ],
      });

      if (!result.idempotentReplay) {
        await this.escrow.updateStatus(tx, input.escrowId, "held");
      }

      return result;
    });
  }

  async releaseEscrow(input: ReleaseEscrowInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const existing = await this.ledger.findJournalByIdempotencyKey(tx, input.idempotencyKey);
      if (existing) {
        const entries = await this.ledger.listEntriesByJournalId(tx, existing.id);
        return { journal: existing, entries, idempotentReplay: true };
      }

      const escrow = await this.escrow.findByIdForUpdate(tx, input.escrowId);
      if (!escrow) {
        throw notFound();
      }

      const providerAmountMinor = escrow.grossAmountMinor - escrow.platformFeeMinor;
      if (providerAmountMinor < 0) {
        throw new AppError(
          problem({
            title: "Unprocessable Entity",
            status: 422,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "financial",
            detail: "platform fee exceeds escrow gross amount",
          })
        );
      }

      const entries: LedgerEntryDraft[] = [
        {
          accountId: input.escrowAccountId,
          direction: "credit",
          amountMinor: escrow.grossAmountMinor,
          currencyCode: input.currencyCode,
          entryType: "release",
          sequenceNo: 1,
        },
        {
          accountId: input.providerAccountId,
          direction: "debit",
          amountMinor: providerAmountMinor,
          currencyCode: input.currencyCode,
          entryType: "release",
          sequenceNo: 2,
        },
      ];

      if (escrow.platformFeeMinor > 0) {
        entries.push({
          accountId: input.platformAccountId,
          direction: "debit",
          amountMinor: escrow.platformFeeMinor,
          currencyCode: input.currencyCode,
          entryType: "fee",
          sequenceNo: 3,
        });
      }

      const result = await this.postJournal(tx, {
        journalType: "escrow_release",
        idempotencyKey: input.idempotencyKey,
        escrowId: input.escrowId,
        contractId: input.contractId,
        actorUserId: input.actorUserId,
        entries,
      });

      if (!result.idempotentReplay) {
        await this.escrow.updateStatus(tx, input.escrowId, "released");
      }

      return result;
    });
  }

  async refundEscrow(input: RefundEscrowInput): Promise<PostJournalResult> {
    return this.db.withTransaction(async (tx) => {
      const existing = await this.ledger.findJournalByIdempotencyKey(tx, input.idempotencyKey);
      if (existing) {
        const entries = await this.ledger.listEntriesByJournalId(tx, existing.id);
        return { journal: existing, entries, idempotentReplay: true };
      }

      const escrow = await this.escrow.findByIdForUpdate(tx, input.escrowId);
      if (!escrow) {
        throw notFound();
      }

      const alreadyRefundedMinor = await this.ledger.sumRefundedMinor(tx, input.escrowId);
      assertRefundDoesNotExceedEscrow({
        refundAmountMinor: input.refundAmountMinor,
        escrowGrossAmountMinor: escrow.grossAmountMinor,
        alreadyRefundedMinor,
      });

      const isFullRefund = alreadyRefundedMinor + input.refundAmountMinor >= escrow.grossAmountMinor;
      const journalType: JournalType = isFullRefund ? "escrow_refund" : "escrow_partial_refund";
      const entryType = isFullRefund ? "refund" : "partial_refund";

      const result = await this.postJournal(tx, {
        journalType,
        idempotencyKey: input.idempotencyKey,
        escrowId: input.escrowId,
        contractId: input.contractId,
        actorUserId: input.actorUserId,
        entries: [
          {
            accountId: input.customerAccountId,
            direction: "debit",
            amountMinor: input.refundAmountMinor,
            currencyCode: input.currencyCode,
            entryType,
            sequenceNo: 1,
          },
          {
            accountId: input.escrowAccountId,
            direction: "credit",
            amountMinor: input.refundAmountMinor,
            currencyCode: input.currencyCode,
            entryType,
            sequenceNo: 2,
          },
        ],
      });

      if (!result.idempotentReplay) {
        const nextStatus: EscrowStatus = isFullRefund ? "refunded" : "partially_refunded";
        await this.escrow.updateStatus(tx, input.escrowId, nextStatus);
      }

      return result;
    });
  }
}

export function createLedgerService(db: DbPool): LedgerService {
  return new LedgerService(db);
}
