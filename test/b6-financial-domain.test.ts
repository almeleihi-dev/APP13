import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertEscrowCanRelease,
  assertEscrowHeldBeforeRelease,
  assertEscrowNotFrozenForRelease,
  assertJournalBalanced,
  assertJournalCurrencyConsistent,
  assertNoDisbursementWhileFrozen,
  assertPlatformFeeOnlyDuringRelease,
  assertPositiveAmountMinor,
  assertRefundDoesNotExceedEscrow,
  assertValidCurrencyCode,
  computeJournalNetByCurrency,
  validateJournalDraft,
  validateLedgerEntryDraft,
  type LedgerEntryDraft,
} from "../src/financial/domain/index.js";
import { AppError, ErrorCodes } from "../src/shared/errors/index.js";

function financialError(code: string) {
  return (error: unknown) =>
    error instanceof AppError &&
    error.problem.engine === "financial" &&
    error.problem.code === code;
}

function entry(partial: Partial<LedgerEntryDraft> & Pick<LedgerEntryDraft, "accountId">): LedgerEntryDraft {
  return {
    direction: "debit",
    amountMinor: 1000,
    currencyCode: "USD",
    entryType: "hold",
    sequenceNo: 1,
    ...partial,
  };
}

describe("B6.3 financial domain — escrow release guards", () => {
  it("rejects release while escrow is frozen (EI-1)", () => {
    assert.throws(
      () => assertEscrowNotFrozenForRelease("frozen"),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
    assert.throws(
      () => assertEscrowCanRelease("frozen"),
      (e) => e instanceof AppError && e.problem.detail?.includes("frozen")
    );
  });

  it("rejects release before held lifecycle", () => {
    assert.throws(
      () => assertEscrowHeldBeforeRelease("pending_funding"),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
    assert.throws(
      () => assertEscrowHeldBeforeRelease("funded"),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
    assert.throws(
      () => assertEscrowCanRelease("funded"),
      (e) => e instanceof AppError && e.problem.detail?.includes("before held")
    );
  });

  it("allows release from held, in_execution, and awaiting_acceptance", () => {
    assert.doesNotThrow(() => assertEscrowCanRelease("held"));
    assert.doesNotThrow(() => assertEscrowCanRelease("in_execution"));
    assert.doesNotThrow(() => assertEscrowCanRelease("awaiting_acceptance"));
  });

  it("blocks disbursement journals while frozen", () => {
    assert.throws(
      () => assertNoDisbursementWhileFrozen("frozen", "escrow_release"),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
    assert.throws(
      () => assertNoDisbursementWhileFrozen("frozen", "escrow_refund"),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
    assert.doesNotThrow(() => assertNoDisbursementWhileFrozen("frozen", "escrow_hold"));
    assert.doesNotThrow(() => assertNoDisbursementWhileFrozen("held", "escrow_release"));
  });
});

describe("B6.3 financial domain — platform fee at release only", () => {
  it("allows fee lines only on escrow_release journals", () => {
    assert.doesNotThrow(() =>
      assertPlatformFeeOnlyDuringRelease("escrow_release", [{ entryType: "fee" }])
    );
    assert.throws(
      () => assertPlatformFeeOnlyDuringRelease("escrow_hold", [{ entryType: "fee" }]),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
    assert.throws(
      () => assertPlatformFeeOnlyDuringRelease("fund_capture", [{ entryType: "fee" }]),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
  });

  it("rejects standalone platform_fee journal type", () => {
    assert.throws(
      () => assertPlatformFeeOnlyDuringRelease("platform_fee", []),
      (e) =>
        e instanceof AppError &&
        e.problem.detail?.includes("standalone platform_fee journals are forbidden")
    );
  });

  it("allows funding journals without fee reservation", () => {
    assert.doesNotThrow(() =>
      assertPlatformFeeOnlyDuringRelease("fund_capture", [{ entryType: "capture" }])
    );
    assert.doesNotThrow(() =>
      assertPlatformFeeOnlyDuringRelease("escrow_hold", [{ entryType: "hold" }])
    );
  });
});

describe("B6.3 financial domain — journal invariants", () => {
  it("requires positive ledger entry amounts", () => {
    assert.throws(() => assertPositiveAmountMinor(0), financialError(ErrorCodes.VALIDATION_ERROR));
    assert.throws(() => assertPositiveAmountMinor(-1), financialError(ErrorCodes.VALIDATION_ERROR));
    assert.doesNotThrow(() => assertPositiveAmountMinor(1));
    assert.throws(
      () => validateLedgerEntryDraft(entry({ amountMinor: 0 })),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
  });

  it("requires balanced debits and credits per currency (FK-3)", () => {
    const balanced = [
      entry({ accountId: "a1", direction: "debit", amountMinor: 5000, sequenceNo: 1 }),
      entry({ accountId: "a2", direction: "credit", amountMinor: 5000, sequenceNo: 2 }),
    ];
    assert.doesNotThrow(() => assertJournalBalanced(balanced));
    const unbalanced = [
      entry({ accountId: "a1", direction: "debit", amountMinor: 5000, sequenceNo: 1 }),
      entry({ accountId: "a2", direction: "credit", amountMinor: 4000, sequenceNo: 2 }),
    ];
    assert.throws(() => assertJournalBalanced(unbalanced), financialError(ErrorCodes.VALIDATION_ERROR));
    assert.throws(
      () => assertJournalBalanced([entry({ accountId: "a1" })]),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
  });

  it("computes journal net by currency", () => {
    const nets = computeJournalNetByCurrency([
      entry({ accountId: "a1", direction: "debit", amountMinor: 3000 }),
      entry({ accountId: "a2", direction: "credit", amountMinor: 3000 }),
    ]);
    assert.equal(nets.get("USD"), 0);
  });

  it("requires a single currency across journal entries", () => {
    const mixed = [
      entry({ accountId: "a1", currencyCode: "USD", sequenceNo: 1 }),
      entry({ accountId: "a2", currencyCode: "EUR", sequenceNo: 2 }),
    ];
    assert.throws(
      () => assertJournalCurrencyConsistent(mixed),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
    assert.doesNotThrow(() =>
      assertJournalCurrencyConsistent([
        entry({ accountId: "a1", sequenceNo: 1 }),
        entry({ accountId: "a2", sequenceNo: 2 }),
      ])
    );
  });

  it("requires ledger entry currency to match account currency", () => {
    const accounts = new Map([["a1", { currencyCode: "USD" }], ["a2", { currencyCode: "USD" }]]);
    assert.doesNotThrow(() =>
      assertJournalCurrencyConsistent(
        [
          entry({ accountId: "a1", currencyCode: "USD", sequenceNo: 1 }),
          entry({ accountId: "a2", currencyCode: "USD", sequenceNo: 2 }),
        ],
        accounts
      )
    );
    assert.throws(
      () =>
        assertJournalCurrencyConsistent(
          [
            entry({ accountId: "a1", currencyCode: "EUR", sequenceNo: 1 }),
            entry({ accountId: "a2", currencyCode: "EUR", sequenceNo: 2 }),
          ],
          accounts
        ),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
  });

  it("validates currency codes", () => {
    assert.doesNotThrow(() => assertValidCurrencyCode("USD"));
    assert.throws(() => assertValidCurrencyCode("usd"), financialError(ErrorCodes.VALIDATION_ERROR));
  });
});

describe("B6.3 financial domain — refund guard", () => {
  it("rejects refunds exceeding escrow gross amount", () => {
    assert.throws(
      () =>
        assertRefundDoesNotExceedEscrow({
          refundAmountMinor: 60_000,
          escrowGrossAmountMinor: 50_000,
        }),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
    assert.throws(
      () =>
        assertRefundDoesNotExceedEscrow({
          refundAmountMinor: 30_000,
          escrowGrossAmountMinor: 50_000,
          alreadyRefundedMinor: 25_000,
        }),
      financialError(ErrorCodes.VALIDATION_ERROR)
    );
    assert.doesNotThrow(() =>
      assertRefundDoesNotExceedEscrow({
        refundAmountMinor: 20_000,
        escrowGrossAmountMinor: 50_000,
        alreadyRefundedMinor: 25_000,
      })
    );
  });
});

describe("B6.3 financial domain — validateJournalDraft", () => {
  it("accepts balanced hold journal without fee reservation", () => {
    assert.doesNotThrow(() =>
      validateJournalDraft({
        journalType: "escrow_hold",
        escrowStatus: "funded",
        entries: [
          entry({ accountId: "escrow", direction: "debit", entryType: "hold", sequenceNo: 1 }),
          entry({ accountId: "clearing", direction: "credit", entryType: "hold", sequenceNo: 2 }),
        ],
      })
    );
  });

  it("accepts balanced release journal with platform fee lines", () => {
    assert.doesNotThrow(() =>
      validateJournalDraft({
        journalType: "escrow_release",
        escrowStatus: "awaiting_acceptance",
        entries: [
          entry({ accountId: "escrow", direction: "credit", amountMinor: 10_000, entryType: "release", sequenceNo: 1 }),
          entry({ accountId: "provider", direction: "debit", amountMinor: 9_000, entryType: "release", sequenceNo: 2 }),
          entry({ accountId: "platform", direction: "debit", amountMinor: 1_000, entryType: "fee", sequenceNo: 3 }),
        ],
      })
    );
  });

  it("rejects release journal when escrow is frozen", () => {
    assert.throws(
      () =>
        validateJournalDraft({
          journalType: "escrow_release",
          escrowStatus: "frozen",
          entries: [
            entry({ accountId: "escrow", direction: "credit", entryType: "release", sequenceNo: 1 }),
            entry({ accountId: "provider", direction: "debit", entryType: "release", sequenceNo: 2 }),
          ],
        }),
      financialError(ErrorCodes.INVALID_TRANSITION)
    );
  });
});
