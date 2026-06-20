import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { EscrowExperienceSource } from "../escrow/types.js";
import { MVP_MILESTONE_ESCROW_SOURCE } from "../escrow/escrow-payload.js";
import type {
  ExecutionDashboardRequest,
  ExecutionExperienceSource,
  ExecutionRequestValidationResult,
  MilestoneDetailsRequest,
  MilestoneSnapshot,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_EXECUTION_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440001";
export const MVP_MILESTONE_ACCESS_ID = "990e8400-e29b-41d4-a716-446655440001";
export const MVP_MILESTONE_WIP_ID = "990e8400-e29b-41d4-a716-446655440002";

const BASE_MILESTONES: MilestoneSnapshot[] = [
  {
    id: MVP_MILESTONE_ACCESS_ID,
    milestoneCode: "M-ACCESS",
    name: "Access / Kickoff",
    sequenceOrder: 1,
    tekrrDimension: "T",
    status: "accepted",
    responsibleParty: "provider",
    blocking: true,
    dueAt: "2026-06-10T00:00:00.000Z",
    startedAt: "2026-06-01T09:00:00.000Z",
    submittedAt: "2026-06-05T12:00:00.000Z",
    acceptedAt: "2026-06-06T10:00:00.000Z",
    evidenceCount: 2,
  },
  {
    id: MVP_MILESTONE_WIP_ID,
    milestoneCode: "M-WIP",
    name: "Work In Progress",
    sequenceOrder: 3,
    tekrrDimension: "E",
    status: "in_progress",
    responsibleParty: "provider",
    blocking: true,
    dueAt: "2026-06-20T00:00:00.000Z",
    startedAt: "2026-06-07T08:00:00.000Z",
    submittedAt: null,
    acceptedAt: null,
    evidenceCount: 1,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440003",
    milestoneCode: "M-VERIFY",
    name: "Verification",
    sequenceOrder: 4,
    tekrrDimension: "K",
    status: "pending",
    responsibleParty: "provider",
    blocking: true,
    dueAt: "2026-06-25T00:00:00.000Z",
    startedAt: null,
    submittedAt: null,
    acceptedAt: null,
    evidenceCount: 0,
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440004",
    milestoneCode: "M-ACCEPT",
    name: "Customer Acceptance",
    sequenceOrder: 5,
    tekrrDimension: "S",
    status: "pending",
    responsibleParty: "customer",
    blocking: true,
    dueAt: "2026-06-30T00:00:00.000Z",
    startedAt: null,
    submittedAt: null,
    acceptedAt: null,
    evidenceCount: 0,
  },
];

/** Active execution in progress with milestone and escrow snapshots. */
export const MVP_ACTIVE_EXECUTION_SOURCE: ExecutionExperienceSource = {
  contract: {
    id: MVP_EXECUTION_CONTRACT_ID,
    contractNumber: "CTR-2026-001",
    status: "active",
    title: "Software Delivery Contract",
    category: "software_developer",
    duration: "14 days",
  },
  progress: {
    totalMilestones: 4,
    completedMilestones: 1,
    blockingTotal: 4,
    blockingCompleted: 1,
    percentComplete: 25,
  },
  milestones: BASE_MILESTONES,
  evidence: {
    totalCount: 3,
    byType: { "EV-DOC": 1, "EV-PHOTO": 1, "EV-NOTE": 1 },
    latestSubmittedAt: "2026-06-07T11:30:00.000Z",
    items: [
      {
        id: "aa0e8400-e29b-41d4-a716-446655440001",
        milestoneId: MVP_MILESTONE_ACCESS_ID,
        evidenceType: "EV-DOC",
        submittedAt: "2026-06-05T12:00:00.000Z",
        contentHash: "sha256:abc123",
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440002",
        milestoneId: MVP_MILESTONE_ACCESS_ID,
        evidenceType: "EV-PHOTO",
        submittedAt: "2026-06-05T12:05:00.000Z",
        contentHash: "sha256:def456",
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440003",
        milestoneId: MVP_MILESTONE_WIP_ID,
        evidenceType: "EV-NOTE",
        submittedAt: "2026-06-07T11:30:00.000Z",
        contentHash: "sha256:ghi789",
      },
    ],
  },
  acceptance: {
    totalAttestations: 5,
    resolvedAttestations: 2,
    pendingAttestations: 3,
    ratings: [
      { dimension: "T", rating: "FUL" },
      { dimension: "E", rating: "PEN" },
      { dimension: "K", rating: "PEN" },
    ],
  },
  escrow: {
    escrowId: MVP_MILESTONE_ESCROW_SOURCE.escrow.id,
    status: MVP_MILESTONE_ESCROW_SOURCE.escrow.status,
    heldAmountLabel: "13,500.00 SAR",
    releasedAmountLabel: "3,375.00 SAR",
    remainingAmountLabel: "10,125.00 SAR",
  },
  timeline: [
    {
      timestamp: "2026-06-01T09:00:00.000Z",
      eventType: "milestone_started",
      label: "Access / Kickoff started",
      milestoneId: MVP_MILESTONE_ACCESS_ID,
      statusTransition: "pending → in_progress",
    },
    {
      timestamp: "2026-06-06T10:00:00.000Z",
      eventType: "milestone_accepted",
      label: "Access / Kickoff accepted",
      milestoneId: MVP_MILESTONE_ACCESS_ID,
      statusTransition: "submitted → accepted",
    },
    {
      timestamp: "2026-06-07T08:00:00.000Z",
      eventType: "milestone_started",
      label: "Work In Progress started",
      milestoneId: MVP_MILESTONE_WIP_ID,
      statusTransition: "pending → in_progress",
    },
    {
      timestamp: "2026-06-15T14:00:00.000Z",
      eventType: "escrow_release",
      label: "Escrow milestone release",
      statusTransition: "held → held",
    },
  ],
  risk: {
    frozenMilestones: 0,
    disputedMilestones: 0,
    pendingAttestations: 3,
    escrowFrozen: false,
    openIssues: 0,
    indicators: ["Pending attestations", "Active milestone in progress"],
  },
  evaluation: {
    status: "pending",
  },
};

/** Completed execution with final evaluation submitted. */
export const MVP_COMPLETED_EXECUTION_SOURCE: ExecutionExperienceSource = {
  ...MVP_ACTIVE_EXECUTION_SOURCE,
  contract: {
    ...MVP_ACTIVE_EXECUTION_SOURCE.contract,
    status: "completed",
  },
  progress: {
    totalMilestones: 4,
    completedMilestones: 4,
    blockingTotal: 4,
    blockingCompleted: 4,
    percentComplete: 100,
  },
  milestones: BASE_MILESTONES.map((milestone) => ({
    ...milestone,
    status: "accepted" as const,
    startedAt: milestone.startedAt ?? "2026-06-01T09:00:00.000Z",
    submittedAt: milestone.submittedAt ?? "2026-06-20T12:00:00.000Z",
    acceptedAt: milestone.acceptedAt ?? "2026-06-21T10:00:00.000Z",
  })),
  acceptance: {
    totalAttestations: 5,
    resolvedAttestations: 5,
    pendingAttestations: 0,
    ratings: [
      { dimension: "T", rating: "FUL" },
      { dimension: "E", rating: "FUL" },
      { dimension: "K", rating: "SUF" },
      { dimension: "R", rating: "FUL" },
      { dimension: "S", rating: "FUL" },
    ],
  },
  escrow: {
    ...MVP_ACTIVE_EXECUTION_SOURCE.escrow,
    status: "released",
    heldAmountLabel: "0.00 SAR",
    releasedAmountLabel: "13,500.00 SAR",
    remainingAmountLabel: "0.00 SAR",
  },
  risk: {
    frozenMilestones: 0,
    disputedMilestones: 0,
    pendingAttestations: 0,
    escrowFrozen: false,
    openIssues: 0,
    indicators: [],
  },
  evaluation: {
    status: "submitted",
    rating: 5,
    compositeScore: 1000,
    submittedAt: "2026-06-22T16:00:00.000Z",
    comment: "Excellent delivery",
  },
};

/** Disputed milestone execution scenario. */
export const MVP_DISPUTED_EXECUTION_SOURCE: ExecutionExperienceSource = {
  ...MVP_ACTIVE_EXECUTION_SOURCE,
  contract: {
    ...MVP_ACTIVE_EXECUTION_SOURCE.contract,
    status: "disputed",
  },
  milestones: BASE_MILESTONES.map((milestone) =>
    milestone.id === MVP_MILESTONE_WIP_ID
      ? { ...milestone, status: "disputed" as const, submittedAt: "2026-06-18T12:00:00.000Z" }
      : milestone
  ),
  escrow: {
    ...MVP_ACTIVE_EXECUTION_SOURCE.escrow,
    status: "frozen",
  },
  risk: {
    frozenMilestones: 0,
    disputedMilestones: 1,
    pendingAttestations: 3,
    escrowFrozen: true,
    openIssues: 1,
    indicators: ["Disputed milestone", "Escrow frozen", "Open issue"],
  },
};

/** Milestone with no evidence edge-case fixture. */
export const MVP_EMPTY_EVIDENCE_MILESTONE_SOURCE: ExecutionExperienceSource = {
  ...MVP_ACTIVE_EXECUTION_SOURCE,
  milestones: [
    {
      ...BASE_MILESTONES[2]!,
      evidenceCount: 0,
    },
  ],
  evidence: {
    totalCount: 0,
    byType: {},
    latestSubmittedAt: null,
    items: [],
  },
};

export function validateExecutionDashboardRequest(
  input: ExecutionDashboardRequest
): ExecutionRequestValidationResult {
  const errors: ExecutionRequestValidationResult["errors"] = [];
  const contractId = input.contract_id?.trim() ?? "";

  if (!contractId) {
    errors.push({ field: "contract_id", message: "contract_id is required" });
  } else if (!UUID_PATTERN.test(contractId)) {
    errors.push({ field: "contract_id", message: "contract_id must be a valid UUID" });
  }

  return { valid: errors.length === 0, errors };
}

export function validateMilestoneDetailsRequest(
  input: MilestoneDetailsRequest
): ExecutionRequestValidationResult {
  const dashboardValidation = validateExecutionDashboardRequest({ contract_id: input.contract_id });
  const errors = [...dashboardValidation.errors];
  const milestoneId = input.milestone_id?.trim() ?? "";

  if (!milestoneId) {
    errors.push({ field: "milestone_id", message: "milestone_id is required" });
  } else if (!UUID_PATTERN.test(milestoneId)) {
    errors.push({ field: "milestone_id", message: "milestone_id must be a valid UUID" });
  }

  return { valid: errors.length === 0, errors };
}

export function resolveExecutionFixture(contractId: string): ExecutionExperienceSource | null {
  const fixtures = [
    MVP_ACTIVE_EXECUTION_SOURCE,
    MVP_COMPLETED_EXECUTION_SOURCE,
    MVP_DISPUTED_EXECUTION_SOURCE,
  ];

  return fixtures.find((fixture) => fixture.contract.id === contractId) ?? null;
}

export function buildEscrowStatusSnapshotFromEscrowSource(
  escrowSource: EscrowExperienceSource
): ExecutionExperienceSource["escrow"] {
  const { escrow, financial } = escrowSource;

  const formatMoney = (minor: number) =>
    `${(minor / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${financial.currencyCode}`;

  return {
    escrowId: escrow.id,
    status: escrow.status,
    heldAmountLabel: formatMoney(financial.heldAmountMinor),
    releasedAmountLabel: formatMoney(financial.releasedAmountMinor),
    remainingAmountLabel: formatMoney(financial.remainingAmountMinor),
  };
}

export function buildExecutionSourceFromWorkflowAndEscrow(
  workflow: WorkflowAnalyzeResult,
  escrowSource: EscrowExperienceSource,
  overrides: Partial<ExecutionExperienceSource> = {}
): ExecutionExperienceSource {
  const contractId = escrowSource.escrow.contractId;

  return {
    contract: {
      id: contractId,
      contractNumber: workflow.contract?.draft_contract.title ?? "Contract",
      status: "active",
      title: workflow.contract?.draft_contract.title ?? "Contract",
      category: workflow.requirement.suggested_actions[0]?.action_code?.split(".")[0] ?? "general",
      duration:
        typeof workflow.negotiation?.recommended_days === "number"
          ? `${workflow.negotiation.recommended_days} days`
          : "—",
    },
    progress: {
      totalMilestones: workflow.contract?.milestones.length ?? 0,
      completedMilestones: 0,
      blockingTotal: workflow.contract?.milestones.length ?? 0,
      blockingCompleted: 0,
      percentComplete: 0,
    },
    milestones: (workflow.contract?.milestones ?? []).map((milestone, index) => ({
      id: `990e8400-e29b-41d4-a716-44665544000${index + 1}`,
      milestoneCode: `M-${index + 1}`,
      name: milestone.title,
      sequenceOrder: index + 1,
      tekrrDimension: null,
      status: "pending" as const,
      responsibleParty: "provider",
      blocking: true,
      dueAt: null,
      startedAt: null,
      submittedAt: null,
      acceptedAt: null,
      evidenceCount: 0,
    })),
    evidence: {
      totalCount: 0,
      byType: {},
      latestSubmittedAt: null,
      items: [],
    },
    acceptance: {
      totalAttestations: 0,
      resolvedAttestations: 0,
      pendingAttestations: 0,
      ratings: [],
    },
    escrow: buildEscrowStatusSnapshotFromEscrowSource(escrowSource),
    timeline: [],
    risk: {
      frozenMilestones: 0,
      disputedMilestones: 0,
      pendingAttestations: 0,
      escrowFrozen: escrowSource.escrow.status === "frozen",
      openIssues: 0,
      indicators: escrowSource.escrow.status === "frozen" ? ["Escrow frozen"] : [],
    },
    evaluation: { status: "pending" },
    ...overrides,
  };
}

export function findMilestoneInSource(
  source: ExecutionExperienceSource,
  milestoneId: string
): MilestoneSnapshot | null {
  return source.milestones.find((milestone) => milestone.id === milestoneId) ?? null;
}
