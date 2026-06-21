import type { EscrowStatus } from "../financial/domain/escrow.js";
import type { IssueStatus } from "../complaint/domain/issue.js";
import type { DisputeStatus } from "../ui/dispute/types.js";

export function formatMinorAmount(amountMinor: number, currencyCode: string): string {
  const major = (amountMinor / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${major} ${currencyCode}`;
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
}

export function mapIssueStatusToDisputeStatus(status: IssueStatus): DisputeStatus {
  switch (status) {
    case "raised":
      return "open";
    case "escalated":
      return "mediation";
    case "resolved":
      return "resolved";
    case "closed":
      return "closed";
    case "withdrawn":
    default:
      return "closed";
  }
}

export function deriveEscrowFinancials(input: {
  status: EscrowStatus;
  grossAmountMinor: number;
  currencyCode: string;
}) {
  const gross = input.grossAmountMinor;
  let heldAmountMinor = 0;
  let releasedAmountMinor = 0;
  let refundedAmountMinor = 0;

  switch (input.status) {
    case "released":
      releasedAmountMinor = gross;
      break;
    case "refunded":
      refundedAmountMinor = gross;
      break;
    case "partially_refunded":
      refundedAmountMinor = Math.floor(gross / 2);
      heldAmountMinor = gross - refundedAmountMinor;
      break;
    case "held":
    case "frozen":
    case "in_execution":
    case "awaiting_acceptance":
    case "funded":
      heldAmountMinor = gross;
      break;
    default:
      break;
  }

  const remainingAmountMinor = Math.max(0, gross - releasedAmountMinor - refundedAmountMinor);

  return {
    contractValueMinor: gross,
    heldAmountMinor,
    releasedAmountMinor,
    refundedAmountMinor,
    remainingAmountMinor,
    currencyCode: input.currencyCode,
  };
}

export function readReleaseStrategy(
  feePolicySnapshot: Record<string, unknown> | undefined
): string {
  const strategy = feePolicySnapshot?.release_strategy;
  return typeof strategy === "string" && strategy.length > 0 ? strategy : "milestone_based";
}
