export type LedgerDirection = "debit" | "credit";

export type LedgerEntryType =
  | "capture"
  | "hold"
  | "release"
  | "fee"
  | "refund"
  | "partial_refund"
  | "chargeback"
  | "payout"
  | "memo"
  | "adjustment";

export interface LedgerEntry {
  id: string;
  journalId: string;
  accountId: string;
  direction: LedgerDirection;
  amountMinor: number;
  currencyCode: string;
  entryType: LedgerEntryType;
  sequenceNo: number;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface LedgerEntryDraft {
  accountId: string;
  direction: LedgerDirection;
  amountMinor: number;
  currencyCode: string;
  entryType: LedgerEntryType;
  sequenceNo: number;
  metadata?: Record<string, unknown>;
}
