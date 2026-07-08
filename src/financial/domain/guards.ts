import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import type { Account } from "./account.js";
import {
  HELD_OR_BEYOND_ESCROW_STATUSES,
  RELEASE_ELIGIBLE_ESCROW_STATUSES,
  type EscrowStatus,
} from "./escrow.js";
import { DISBURSEMENT_JOURNAL_TYPES, type JournalType } from "./journal.js";
import type { LedgerDirection, LedgerEntryDraft, LedgerEntryType } from "./ledger-entry.js";

const FEE_ENTRY_TYPE: LedgerEntryType = "fee";

/** Journals where platform fee lines are forbidden (fee charged only at release). */
const FEE_FORBIDDEN_JOURNAL_TYPES = new Set<JournalType>([
  "fund_capture",
  "escrow_hold",
  "escrow_refund",
  "escrow_partial_refund",
  "escrow_chargeback",
  "payout_settlement",
  "freeze_memo",
]);

export function assertValidCurrencyCode(currencyCode: string): void {
  if (!/^[A-Z]{3}$/.test(currencyCode)) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: "currency_code must be a 3-letter ISO 4217 code",
      })
    );
  }
}

export function assertPositiveAmountMinor(amountMinor: number): void {
  if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: "amount_minor must be a positive integer",
      })
    );
  }
}

export function assertNonNegativeAmountMinor(amountMinor: number, fieldName: string): void {
  if (!Number.isInteger(amountMinor) || amountMinor < 0) {
    throw new AppError(
      problem({
        title: "Bad Request",
        status: 400,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: `${fieldName} must be a non-negative integer`,
      })
    );
  }
}

/** EI-1 — disbursement journals forbidden while escrow is frozen. */
export function assertNoDisbursementWhileFrozen(
  escrowStatus: EscrowStatus,
  journalType: JournalType
): void {
  if (escrowStatus !== "frozen") {
    return;
  }
  if (!DISBURSEMENT_JOURNAL_TYPES.has(journalType)) {
    return;
  }
  throw new AppError(
    problem({
      title: "Conflict",
      status: 409,
      code: ErrorCodes.INVALID_TRANSITION,
      engine: "financial",
      detail: `disbursement journal type ${journalType} forbidden while escrow is frozen (EI-1)`,
    })
  );
}

/** Escrow cannot release while frozen. */
export function assertEscrowNotFrozenForRelease(escrowStatus: EscrowStatus): void {
  if (escrowStatus === "frozen") {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "financial",
        detail: "escrow cannot release while frozen",
      })
    );
  }
}

/** Escrow cannot release before funded/held lifecycle. */
export function assertEscrowHeldBeforeRelease(escrowStatus: EscrowStatus): void {
  if (!HELD_OR_BEYOND_ESCROW_STATUSES.has(escrowStatus)) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "financial",
        detail: `escrow cannot release before held (status=${escrowStatus})`,
      })
    );
  }
}

/** Combined release precondition guard for disbursement authorization. */
export function assertEscrowCanRelease(escrowStatus: EscrowStatus): void {
  assertEscrowNotFrozenForRelease(escrowStatus);
  assertEscrowHeldBeforeRelease(escrowStatus);
  if (!RELEASE_ELIGIBLE_ESCROW_STATUSES.has(escrowStatus)) {
    throw new AppError(
      problem({
        title: "Conflict",
        status: 409,
        code: ErrorCodes.INVALID_TRANSITION,
        engine: "financial",
        detail: `escrow status ${escrowStatus} is not eligible for release`,
      })
    );
  }
}

/**
 * Platform fee is charged only at release time (B6.3).
 * Fee ledger lines may appear only on escrow_release journals.
 */
export function assertPlatformFeeOnlyDuringRelease(
  journalType: JournalType,
  entries: Pick<LedgerEntryDraft, "entryType">[]
): void {
  const hasFeeEntry = entries.some((entry) => entry.entryType === FEE_ENTRY_TYPE);
  if (journalType === "platform_fee") {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail:
          "standalone platform_fee journals are forbidden; record fee lines on escrow_release only",
      })
    );
  }
  if (hasFeeEntry && journalType !== "escrow_release") {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: `platform fee entries are only permitted on escrow_release journals (journal=${journalType})`,
      })
    );
  }
  if (!hasFeeEntry && FEE_FORBIDDEN_JOURNAL_TYPES.has(journalType)) {
    return;
  }
  if (hasFeeEntry && FEE_FORBIDDEN_JOURNAL_TYPES.has(journalType)) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: `platform fee entries are forbidden on journal type ${journalType}`,
      })
    );
  }
}

export function computeJournalNetByCurrency(
  entries: Pick<LedgerEntryDraft, "direction" | "amountMinor" | "currencyCode">[]
): Map<string, number> {
  const nets = new Map<string, number>();
  for (const entry of entries) {
    const signed =
      entry.direction === "debit" ? entry.amountMinor : -entry.amountMinor;
    nets.set(entry.currencyCode, (nets.get(entry.currencyCode) ?? 0) + signed);
  }
  return nets;
}

/** FK-3 — journal debits must equal credits per currency. */
export function assertJournalBalanced(
  entries: Pick<LedgerEntryDraft, "direction" | "amountMinor" | "currencyCode">[]
): void {
  if (entries.length < 2) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: "journal must contain at least two ledger entries",
      })
    );
  }
  const nets = computeJournalNetByCurrency(entries);
  for (const [currencyCode, netMinor] of nets) {
    if (netMinor !== 0) {
      throw new AppError(
        problem({
          title: "Unprocessable Entity",
          status: 422,
          code: ErrorCodes.VALIDATION_ERROR,
          engine: "financial",
          detail: `journal is not balanced for currency ${currencyCode} (net=${netMinor})`,
        })
      );
    }
  }
}

/** All ledger entries in a journal must share one currency. */
export function assertJournalCurrencyConsistent(
  entries: Pick<LedgerEntryDraft, "currencyCode" | "accountId">[],
  accountsById?: ReadonlyMap<string, Pick<Account, "currencyCode">>
): void {
  if (entries.length === 0) {
    return;
  }
  const currencies = new Set(entries.map((entry) => entry.currencyCode));
  if (currencies.size > 1) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: "journal contains ledger entries with multiple currencies",
      })
    );
  }
  if (accountsById) {
    for (const entry of entries) {
      const account = accountsById.get(entry.accountId);
      if (account && account.currencyCode !== entry.currencyCode) {
        throw new AppError(
          problem({
            title: "Unprocessable Entity",
            status: 422,
            code: ErrorCodes.VALIDATION_ERROR,
            engine: "financial",
            detail: "ledger entry currency must match account currency",
          })
        );
      }
    }
  }
}

export function assertRefundDoesNotExceedEscrow(input: {
  refundAmountMinor: number;
  escrowGrossAmountMinor: number;
  alreadyRefundedMinor?: number;
}): void {
  assertPositiveAmountMinor(input.refundAmountMinor);
  assertNonNegativeAmountMinor(input.escrowGrossAmountMinor, "escrow_gross_amount_minor");
  const alreadyRefundedMinor = input.alreadyRefundedMinor ?? 0;
  assertNonNegativeAmountMinor(alreadyRefundedMinor, "already_refunded_minor");
  const totalRefundMinor = alreadyRefundedMinor + input.refundAmountMinor;
  if (totalRefundMinor > input.escrowGrossAmountMinor) {
    throw new AppError(
      problem({
        title: "Unprocessable Entity",
        status: 422,
        code: ErrorCodes.VALIDATION_ERROR,
        engine: "financial",
        detail: `refund amount ${totalRefundMinor} exceeds escrow gross ${input.escrowGrossAmountMinor}`,
      })
    );
  }
}

export function validateLedgerEntryDraft(entry: LedgerEntryDraft): void {
  assertPositiveAmountMinor(entry.amountMinor);
  assertValidCurrencyCode(entry.currencyCode);
}

export function validateJournalDraft(input: {
  journalType: JournalType;
  entries: LedgerEntryDraft[];
  escrowStatus?: EscrowStatus;
  accountsById?: ReadonlyMap<string, Pick<Account, "currencyCode">>;
}): void {
  for (const entry of input.entries) {
    validateLedgerEntryDraft(entry);
  }
  assertJournalCurrencyConsistent(input.entries, input.accountsById);
  assertJournalBalanced(input.entries);
  assertPlatformFeeOnlyDuringRelease(input.journalType, input.entries);
  if (input.escrowStatus !== undefined) {
    assertNoDisbursementWhileFrozen(input.escrowStatus, input.journalType);
    if (input.journalType === "escrow_release") {
      assertEscrowCanRelease(input.escrowStatus);
    }
  }
}

export function isBalancedEntryPair(
  debitAmountMinor: number,
  creditAmountMinor: number,
  directionA: LedgerDirection = "debit",
  directionB: LedgerDirection = "credit"
): boolean {
  if (directionA === "debit" && directionB === "credit") {
    return debitAmountMinor === creditAmountMinor;
  }
  return false;
}
