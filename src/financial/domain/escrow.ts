export type EscrowStatus =
  | "pending_funding"
  | "funded"
  | "held"
  | "in_execution"
  | "awaiting_acceptance"
  | "released"
  | "partially_refunded"
  | "refunded"
  | "frozen";

export type FrozenReason = "issue_raised" | "disputed" | "admin_hold";

export interface EscrowAgreement {
  id: string;
  contractId: string;
  status: EscrowStatus;
  grossAmountMinor: number;
  platformFeeMinor: number;
  currencyCode: string;
  feePolicySnapshot: Record<string, unknown>;
  paymentIntentId: string | null;
  frozenAt: Date | null;
  frozenReason: FrozenReason | null;
  frozenByIssueId: string | null;
  fundedAt: Date | null;
  releasedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Escrow states that may authorize a release journal (EI-1 / B6.3). */
export const RELEASE_ELIGIBLE_ESCROW_STATUSES = new Set<EscrowStatus>([
  "held",
  "in_execution",
  "awaiting_acceptance",
]);

/** Minimum funded lifecycle before hold/release operations. */
export const HELD_OR_BEYOND_ESCROW_STATUSES = new Set<EscrowStatus>([
  "held",
  "in_execution",
  "awaiting_acceptance",
  "released",
  "partially_refunded",
  "refunded",
  "frozen",
]);
