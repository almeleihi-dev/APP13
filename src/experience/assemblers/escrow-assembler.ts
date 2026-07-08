import type { EscrowAgreement } from "../../financial/domain/escrow.js";
import type { EscrowStatusHistoryRecord } from "../../financial/infrastructure/escrow-repository.js";
import type { EscrowExperienceSource, EscrowReleaseStrategyDisplay } from "../../ui/escrow/types.js";
import { deriveEscrowFinancials, readReleaseStrategy, toIso } from "../format.js";

export interface EscrowAssemblyInput {
  escrow: EscrowAgreement;
  history: EscrowStatusHistoryRecord[];
  milestoneTotal: number;
  milestoneCompleted: number;
  providerTrustScore?: string;
  providerTrustTier?: string;
  contractCategory?: string;
}

export function assembleEscrowExperienceSource(input: EscrowAssemblyInput): EscrowExperienceSource {
  const financial = deriveEscrowFinancials({
    status: input.escrow.status,
    grossAmountMinor: input.escrow.grossAmountMinor,
    currencyCode: input.escrow.currencyCode,
  });

  const pending = Math.max(0, input.milestoneTotal - input.milestoneCompleted);
  const releaseStrategy = readReleaseStrategy(input.escrow.feePolicySnapshot);

  return {
    escrow: {
      id: input.escrow.id,
      contractId: input.escrow.contractId,
      status: input.escrow.status,
      grossAmountMinor: input.escrow.grossAmountMinor,
      platformFeeMinor: input.escrow.platformFeeMinor,
      currencyCode: input.escrow.currencyCode,
      createdAt: toIso(input.escrow.createdAt) ?? new Date().toISOString(),
    },
    financial,
    history: input.history.map((entry) => ({
      timestamp: toIso(entry.createdAt) ?? new Date().toISOString(),
      fromStatus: entry.fromStatus,
      toStatus: entry.toStatus,
      journalId: entry.journalId,
      reason: entry.reason,
    })),
    releaseStrategy: releaseStrategy as EscrowReleaseStrategyDisplay,
    milestones: {
      total: input.milestoneTotal,
      completed: input.milestoneCompleted,
      pending,
      releaseAllocation: pending > 0 ? `${pending} milestones pending release` : "Complete",
    },
    trust: {
      providerTrustScore: input.providerTrustScore ?? "—",
      providerTrustTier: input.providerTrustTier ?? "—",
      riskLevel: input.escrow.status === "frozen" ? "high" : "medium",
    },
    contract: {
      category: input.contractCategory ?? "—",
      duration: "—",
      readiness: input.escrow.status === "pending_funding" ? "pending" : "ready",
    },
  };
}
