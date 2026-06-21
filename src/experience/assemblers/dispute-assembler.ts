import type { EscrowAgreement } from "../../financial/domain/escrow.js";
import type { DisputeExperienceSource } from "../../ui/dispute/types.js";
import { formatMinorAmount, mapIssueStatusToDisputeStatus, toIso } from "../format.js";

export interface DisputeAssemblyInput {
  issue: {
    id: string;
    contract_id: string;
    status: string;
    description: string;
    filed_at: string;
    case_id: string | null;
  };
  customerName: string;
  providerName: string;
  filedByUserId: string;
  escrow: EscrowAgreement | null;
  evidenceCount: number;
  linkedMilestoneId?: string | null;
  linkedEvidenceIds?: string[];
  providerTrustScore?: string;
  providerTrustTier?: string;
}

export function assembleDisputeExperienceSource(input: DisputeAssemblyInput): DisputeExperienceSource {
  const disputeStatus = mapIssueStatusToDisputeStatus(input.issue.status as never);
  const escrowStatus = input.escrow?.status ?? "none";
  const affectedAmount = input.escrow
    ? formatMinorAmount(input.escrow.grossAmountMinor, input.escrow.currencyCode)
    : "—";

  const filedAt = input.issue.filed_at;

  return {
    summary: {
      disputeId: input.issue.id,
      contractId: input.issue.contract_id,
      issueType: "contract_issue",
      severity: "medium",
      currentStatus: disputeStatus,
    },
    parties: {
      customer: input.customerName,
      provider: input.providerName,
      disputeOwner: input.customerName,
      openedBy: input.filedByUserId,
    },
    escrowImpact: {
      escrowStatus,
      frozen: escrowStatus === "frozen",
      unfrozen: escrowStatus !== "frozen",
      affectedAmountLabel: affectedAmount,
    },
    evidenceStatus: {
      totalEvidence: input.evidenceCount,
      verifiedEvidence: input.evidenceCount,
      pendingEvidence: 0,
      attestedEvidence: 0,
    },
    resolutionProgress: {
      open: disputeStatus === "open" ? "Yes" : "No",
      investigating: disputeStatus === "investigating" ? "Yes" : "No",
      mediation: disputeStatus === "mediation" ? "Yes" : "No",
      resolved: disputeStatus === "resolved" ? "Yes" : "No",
      closed: disputeStatus === "closed" ? "Yes" : "No",
    },
    riskContext: {
      riskLevel: escrowStatus === "frozen" ? "high" : "medium",
      escalationIndicator: disputeStatus === "mediation" ? "elevated" : "normal",
      financialImpact: affectedAmount,
    },
    trustContext: {
      providerTrustScore: input.providerTrustScore ?? "—",
      trustTier: input.providerTrustTier ?? "—",
      disputeImpactIndicator: disputeStatus === "open" ? "restricted" : "stable",
    },
    timelineSummary: {
      created: filedAt,
      evidenceAdded: filedAt,
      freeze: escrowStatus === "frozen" && input.escrow?.frozenAt
        ? toIso(input.escrow.frozenAt) ?? filedAt
        : "—",
      mediation: disputeStatus === "mediation" ? filedAt : "—",
      resolution: disputeStatus === "resolved" ? filedAt : "—",
    },
    details: {
      disputeId: input.issue.id,
      title: input.issue.case_id ?? input.issue.id,
      description: input.issue.description,
      category: "contract",
      severity: "medium",
      createdBy: input.filedByUserId,
      createdAt: filedAt,
      status: disputeStatus,
      assignedReviewer: null,
      linkedContractId: input.issue.contract_id,
      linkedMilestoneId: input.linkedMilestoneId ?? null,
      linkedEscrowId: input.escrow?.id ?? null,
      linkedEvidenceIds: input.linkedEvidenceIds ?? [],
    },
    resolutionTimeline: buildResolutionTimeline(input, disputeStatus),
  };
}

function buildResolutionTimeline(
  input: DisputeAssemblyInput,
  disputeStatus: DisputeExperienceSource["summary"]["currentStatus"]
): DisputeExperienceSource["resolutionTimeline"] {
  const events: DisputeExperienceSource["resolutionTimeline"] = [
    {
      timestamp: input.issue.filed_at,
      eventType: "dispute_created",
      label: "Dispute created",
      statusTransition: `none → ${disputeStatus}`,
    },
  ];

  if (input.escrow?.status === "frozen") {
    events.push({
      timestamp: toIso(input.escrow.frozenAt) ?? input.issue.filed_at,
      eventType: "escrow_frozen",
      label: "Escrow frozen for dispute",
    });
  }

  if (disputeStatus === "resolved" || disputeStatus === "closed") {
    events.push({
      timestamp: input.issue.filed_at,
      eventType: "dispute_resolved",
      label: "Dispute resolved",
      statusTransition: `${disputeStatus}`,
    });
  }

  return events;
}
