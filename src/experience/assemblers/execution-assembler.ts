import type { Milestone } from "../../execution/infrastructure/execution-repository.js";
import type { ExecutionExperienceSource } from "../../ui/execution/types.js";
import type { EscrowExperienceSource } from "../../ui/escrow/types.js";
import { formatMinorAmount, toIso } from "../format.js";

export interface ExecutionAssemblyInput {
  contract: {
    id: string;
    contract_number: string;
    status: string;
    template_id: string;
  };
  milestones: Milestone[];
  evidenceItems: Array<{
    id: string;
    contract_id: string;
    milestone_id: string;
    evidence_type: string;
    content_hash: string | null;
    created_at: string;
  }>;
  attestations: Array<{
    id: string;
    tekrr_dimension: string;
    fulfillment_rating: string | null;
  }>;
  escrow: EscrowExperienceSource | null;
  evaluation: {
    status: "pending" | "submitted";
    rating?: number;
    composite_score?: number;
    submitted_at?: string;
  };
  openIssues: number;
}

function countByStatus(milestones: Milestone[], status: Milestone["status"]): number {
  return milestones.filter((milestone) => milestone.status === status).length;
}

export function assembleExecutionExperienceSource(
  input: ExecutionAssemblyInput
): ExecutionExperienceSource {
  const completed = countByStatus(input.milestones, "accepted");
  const total = input.milestones.length;
  const blocking = input.milestones.filter((milestone) => milestone.blocking);
  const blockingCompleted = blocking.filter((milestone) => milestone.status === "accepted").length;

  const evidenceByType: Record<string, number> = {};
  for (const item of input.evidenceItems) {
    evidenceByType[item.evidence_type] = (evidenceByType[item.evidence_type] ?? 0) + 1;
  }

  const latestEvidence = input.evidenceItems
    .map((item) => item.created_at)
    .sort()
    .at(-1) ?? null;

  const escrowSnapshot = input.escrow
    ? {
        escrowId: input.escrow.escrow.id,
        status: input.escrow.escrow.status,
        heldAmountLabel: formatMinorAmount(
          input.escrow.financial.heldAmountMinor,
          input.escrow.financial.currencyCode
        ),
        releasedAmountLabel: formatMinorAmount(
          input.escrow.financial.releasedAmountMinor,
          input.escrow.financial.currencyCode
        ),
        remainingAmountLabel: formatMinorAmount(
          input.escrow.financial.remainingAmountMinor,
          input.escrow.financial.currencyCode
        ),
      }
    : {
        escrowId: "—",
        status: "none",
        heldAmountLabel: "—",
        releasedAmountLabel: "—",
        remainingAmountLabel: "—",
      };

  const timeline = input.milestones.flatMap((milestone) => {
    const events: ExecutionExperienceSource["timeline"] = [];
    if (milestone.startedAt) {
      events.push({
        timestamp: toIso(milestone.startedAt) ?? milestone.startedAt.toISOString(),
        eventType: "milestone_started",
        label: `${milestone.name} started`,
        milestoneId: milestone.id,
        statusTransition: "pending → in_progress",
      });
    }
    if (milestone.submittedAt) {
      events.push({
        timestamp: toIso(milestone.submittedAt) ?? milestone.submittedAt.toISOString(),
        eventType: "milestone_submitted",
        label: `${milestone.name} submitted`,
        milestoneId: milestone.id,
        statusTransition: "in_progress → submitted",
      });
    }
    if (milestone.acceptedAt) {
      events.push({
        timestamp: toIso(milestone.acceptedAt) ?? milestone.acceptedAt.toISOString(),
        eventType: "milestone_accepted",
        label: `${milestone.name} accepted`,
        milestoneId: milestone.id,
        statusTransition: "submitted → accepted",
      });
    }
    return events;
  });

  return {
    contract: {
      id: input.contract.id,
      contractNumber: input.contract.contract_number,
      status: input.contract.status as ExecutionExperienceSource["contract"]["status"],
      title: input.contract.template_id,
      category: input.contract.template_id,
      duration: "—",
    },
    progress: {
      totalMilestones: total,
      completedMilestones: completed,
      blockingTotal: blocking.length,
      blockingCompleted,
      percentComplete: total === 0 ? 0 : Math.round((completed / total) * 100),
    },
    milestones: input.milestones.map((milestone) => ({
      id: milestone.id,
      milestoneCode: milestone.milestoneCode,
      name: milestone.name,
      sequenceOrder: milestone.sequenceOrder,
      status: milestone.status,
      responsibleParty: milestone.responsibleParty,
      tekrrDimension: milestone.tekrrDimension,
      blocking: milestone.blocking,
      dueAt: toIso(milestone.dueAt),
      startedAt: toIso(milestone.startedAt),
      submittedAt: toIso(milestone.submittedAt),
      acceptedAt: toIso(milestone.acceptedAt),
      evidenceCount: input.evidenceItems.filter((item) => item.milestone_id === milestone.id).length,
    })),
    evidence: {
      totalCount: input.evidenceItems.length,
      byType: evidenceByType,
      latestSubmittedAt: latestEvidence,
      items: input.evidenceItems.map((item) => ({
        id: item.id,
        milestoneId: item.milestone_id,
        evidenceType: item.evidence_type,
        submittedAt: item.created_at,
        contentHash: item.content_hash,
      })),
    },
    acceptance: {
      totalAttestations: input.attestations.length,
      resolvedAttestations: input.attestations.filter((row) => row.fulfillment_rating).length,
      pendingAttestations: input.attestations.filter((row) => !row.fulfillment_rating).length,
      ratings: input.attestations
        .filter((row) => row.fulfillment_rating)
        .map((row) => ({
          dimension: row.tekrr_dimension,
          rating: row.fulfillment_rating ?? "—",
        })),
    },
    escrow: escrowSnapshot,
    timeline,
    risk: {
      frozenMilestones: input.milestones.filter((milestone) => milestone.status === "frozen").length,
      disputedMilestones: 0,
      pendingAttestations: input.attestations.filter((row) => !row.fulfillment_rating).length,
      escrowFrozen: input.escrow?.escrow.status === "frozen",
      openIssues: input.openIssues,
      indicators: input.openIssues > 0 ? ["open_issue"] : [],
    },
    evaluation: input.evaluation,
  };
}
