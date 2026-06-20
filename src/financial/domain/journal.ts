export type JournalType =
  | "fund_capture"
  | "escrow_hold"
  | "escrow_release"
  | "platform_fee"
  | "escrow_refund"
  | "escrow_partial_refund"
  | "escrow_chargeback"
  | "payout_settlement"
  | "freeze_memo";

export interface Journal {
  id: string;
  journalType: JournalType;
  idempotencyKey: string;
  escrowId: string | null;
  contractId: string | null;
  actorUserId: string | null;
  engineSource: string;
  description: string | null;
  metadata: Record<string, unknown>;
  postedAt: Date;
  createdAt: Date;
}

/** Journals that move funds out of escrow — blocked while frozen (EI-1). */
export const DISBURSEMENT_JOURNAL_TYPES = new Set<JournalType>([
  "escrow_release",
  "escrow_refund",
  "escrow_partial_refund",
  "payout_settlement",
  "platform_fee",
]);
