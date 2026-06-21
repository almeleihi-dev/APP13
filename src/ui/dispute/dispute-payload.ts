import {
  MVP_EVIDENCE_ID_REJECTED,
  MVP_MILESTONE_WIP_ID,
  MVP_REJECTED_EVIDENCE_CONTRACT_ID,
} from "../evidence/evidence-payload.js";
import { MVP_MILESTONE_ESCROW_SOURCE } from "../escrow/escrow-payload.js";
import type {
  DisputeDashboardRequest,
  DisputeDetailsRequest,
  DisputeExperienceSource,
  DisputeRequestValidationResult,
  ResolutionTimelineEventSnapshot,
  ResolutionTimelineRequest,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_DISPUTE_ID = "dd0e8400-e29b-41d4-a716-446655440001";
export const MVP_DISPUTE_CONTRACT_ID = MVP_REJECTED_EVIDENCE_CONTRACT_ID;
export const MVP_RESOLVED_DISPUTE_ID = "dd0e8400-e29b-41d4-a716-446655440002";
export const MVP_RESOLVED_DISPUTE_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440012";
export const MVP_CLOSED_DISPUTE_ID = "dd0e8400-e29b-41d4-a716-446655440003";
export const MVP_CLOSED_DISPUTE_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440013";

function timelineEvent(
  timestamp: string,
  eventType: ResolutionTimelineEventSnapshot["eventType"],
  label: string,
  statusTransition?: string
): ResolutionTimelineEventSnapshot {
  return { timestamp, eventType, label, statusTransition };
}

const OPEN_TIMELINE: ResolutionTimelineEventSnapshot[] = [
  timelineEvent("2026-06-18T08:00:00.000Z", "dispute_created", "Dispute created", "none → open"),
  timelineEvent("2026-06-18T09:00:00.000Z", "evidence_submitted", "Dispute evidence submitted"),
  timelineEvent("2026-06-18T10:30:00.000Z", "evidence_verified", "Dispute evidence verified"),
  timelineEvent("2026-06-18T11:00:00.000Z", "escrow_frozen", "Escrow frozen for dispute", "held → frozen"),
  timelineEvent("2026-06-19T09:00:00.000Z", "mediation_started", "Mediation started", "investigating → mediation"),
];

/** Open dispute with frozen escrow (integration fixture). */
export const MVP_OPEN_DISPUTE_SOURCE: DisputeExperienceSource = {
  summary: {
    disputeId: MVP_DISPUTE_ID,
    contractId: MVP_DISPUTE_CONTRACT_ID,
    issueType: "quality_dispute",
    severity: "high",
    currentStatus: "mediation",
  },
  parties: {
    customer: "Demo Customer",
    provider: "Demo Provider",
    disputeOwner: "Demo Customer",
    openedBy: "user-customer-001",
  },
  escrowImpact: {
    escrowStatus: "frozen",
    frozen: true,
    unfrozen: false,
    affectedAmountLabel: "9,000.00 SAR",
  },
  evidenceStatus: {
    totalEvidence: 2,
    verifiedEvidence: 1,
    pendingEvidence: 1,
    attestedEvidence: 0,
  },
  resolutionProgress: {
    open: "Yes",
    investigating: "Yes",
    mediation: "Yes",
    resolved: "No",
    closed: "No",
  },
  riskContext: {
    riskLevel: "high",
    escalationIndicator: "elevated",
    financialImpact: "9,000.00 SAR held",
  },
  trustContext: {
    providerTrustScore: "65",
    trustTier: "silver",
    disputeImpactIndicator: "restricted",
  },
  timelineSummary: {
    created: "2026-06-18T08:00:00.000Z",
    evidenceAdded: "2026-06-18T09:00:00.000Z",
    freeze: "2026-06-18T11:00:00.000Z",
    mediation: "2026-06-19T09:00:00.000Z",
    resolution: "—",
  },
  details: {
    disputeId: MVP_DISPUTE_ID,
    title: "Incomplete Deliverable Dispute",
    description: "Customer reports missing acceptance criteria on WIP milestone deliverables",
    category: "quality",
    severity: "high",
    createdBy: "user-customer-001",
    createdAt: "2026-06-18T08:00:00.000Z",
    status: "mediation",
    assignedReviewer: "reviewer-001",
    linkedContractId: MVP_DISPUTE_CONTRACT_ID,
    linkedMilestoneId: MVP_MILESTONE_WIP_ID,
    linkedEscrowId: MVP_MILESTONE_ESCROW_SOURCE.escrow.id,
    linkedEvidenceIds: [MVP_EVIDENCE_ID_REJECTED, "aa0e8400-e29b-41d4-a716-446655440005"],
  },
  resolutionTimeline: OPEN_TIMELINE,
};

/** Resolved dispute with escrow released (integration fixture). */
export const MVP_RESOLVED_DISPUTE_SOURCE: DisputeExperienceSource = {
  ...MVP_OPEN_DISPUTE_SOURCE,
  summary: {
    disputeId: MVP_RESOLVED_DISPUTE_ID,
    contractId: MVP_RESOLVED_DISPUTE_CONTRACT_ID,
    issueType: "delivery_dispute",
    severity: "medium",
    currentStatus: "resolved",
  },
  escrowImpact: {
    escrowStatus: "held",
    frozen: false,
    unfrozen: true,
    affectedAmountLabel: "4,500.00 SAR",
  },
  resolutionProgress: {
    open: "Yes",
    investigating: "Yes",
    mediation: "Yes",
    resolved: "Yes",
    closed: "No",
  },
  riskContext: {
    riskLevel: "medium",
    escalationIndicator: "stable",
    financialImpact: "Partial release completed",
  },
  trustContext: {
    providerTrustScore: "80",
    trustTier: "gold",
    disputeImpactIndicator: "conditional",
  },
  timelineSummary: {
    created: "2026-06-10T08:00:00.000Z",
    evidenceAdded: "2026-06-10T10:00:00.000Z",
    freeze: "2026-06-10T12:00:00.000Z",
    mediation: "2026-06-11T09:00:00.000Z",
    resolution: "2026-06-14T16:00:00.000Z",
  },
  details: {
    ...MVP_OPEN_DISPUTE_SOURCE.details,
    disputeId: MVP_RESOLVED_DISPUTE_ID,
    title: "Delivery Timeline Dispute",
    status: "resolved",
    linkedContractId: MVP_RESOLVED_DISPUTE_CONTRACT_ID,
    assignedReviewer: "reviewer-002",
  },
  resolutionTimeline: [
    timelineEvent("2026-06-10T08:00:00.000Z", "dispute_created", "Dispute created"),
    timelineEvent("2026-06-10T10:00:00.000Z", "evidence_submitted", "Evidence submitted"),
    timelineEvent("2026-06-10T11:00:00.000Z", "evidence_verified", "Evidence verified"),
    timelineEvent("2026-06-10T12:00:00.000Z", "escrow_frozen", "Escrow frozen"),
    timelineEvent("2026-06-11T09:00:00.000Z", "mediation_started", "Mediation started"),
    timelineEvent("2026-06-13T14:00:00.000Z", "recommendation_issued", "Resolution recommendation issued"),
    timelineEvent("2026-06-14T16:00:00.000Z", "dispute_resolved", "Dispute resolved", "mediation → resolved"),
    timelineEvent("2026-06-14T16:30:00.000Z", "escrow_released", "Escrow partially released"),
  ],
};

/** Closed dispute with escrow refunded (integration fixture). */
export const MVP_CLOSED_DISPUTE_SOURCE: DisputeExperienceSource = {
  ...MVP_RESOLVED_DISPUTE_SOURCE,
  summary: {
    disputeId: MVP_CLOSED_DISPUTE_ID,
    contractId: MVP_CLOSED_DISPUTE_CONTRACT_ID,
    issueType: "refund_dispute",
    severity: "high",
    currentStatus: "closed",
  },
  escrowImpact: {
    escrowStatus: "refunded",
    frozen: false,
    unfrozen: true,
    affectedAmountLabel: "9,000.00 SAR",
  },
  resolutionProgress: {
    open: "Yes",
    investigating: "Yes",
    mediation: "Yes",
    resolved: "Yes",
    closed: "Yes",
  },
  details: {
    ...MVP_RESOLVED_DISPUTE_SOURCE.details,
    disputeId: MVP_CLOSED_DISPUTE_ID,
    title: "Refund Dispute Closed",
    status: "closed",
    linkedContractId: MVP_CLOSED_DISPUTE_CONTRACT_ID,
  },
  resolutionTimeline: [
    ...MVP_RESOLVED_DISPUTE_SOURCE.resolutionTimeline,
    timelineEvent("2026-06-15T10:00:00.000Z", "escrow_refunded", "Escrow refunded to customer"),
    timelineEvent("2026-06-15T11:00:00.000Z", "dispute_closed", "Dispute closed", "resolved → closed"),
  ],
};

/** Empty timeline edge-case fixture. */
export const MVP_EMPTY_TIMELINE_DISPUTE_SOURCE: DisputeExperienceSource = {
  ...MVP_OPEN_DISPUTE_SOURCE,
  summary: {
    ...MVP_OPEN_DISPUTE_SOURCE.summary,
    disputeId: "dd0e8400-e29b-41d4-a716-446655440099",
    currentStatus: "open",
  },
  details: {
    ...MVP_OPEN_DISPUTE_SOURCE.details,
    disputeId: "dd0e8400-e29b-41d4-a716-446655440099",
    status: "open",
  },
  resolutionTimeline: [],
  timelineSummary: {
    created: "—",
    evidenceAdded: "—",
    freeze: "—",
    mediation: "—",
    resolution: "—",
  },
};

function validateUuid(field: string, value: string | undefined, required: boolean): DisputeRequestValidationResult["errors"] {
  const errors: DisputeRequestValidationResult["errors"] = [];
  const trimmed = value?.trim() ?? "";

  if (required && trimmed.length === 0) {
    errors.push({ field, message: `${field} is required` });
    return errors;
  }

  if (trimmed.length > 0 && !UUID_PATTERN.test(trimmed)) {
    errors.push({ field, message: `${field} must be a valid UUID` });
  }

  return errors;
}

export function validateDisputeDashboardRequest(
  input: DisputeDashboardRequest
): DisputeRequestValidationResult {
  const errors = [
    ...validateUuid("dispute_id", input.dispute_id, true),
    ...validateUuid("contract_id", input.contract_id, false),
  ];

  return { valid: errors.length === 0, errors };
}

export function validateDisputeDetailsRequest(
  input: DisputeDetailsRequest
): DisputeRequestValidationResult {
  return validateDisputeDashboardRequest({ dispute_id: input.dispute_id });
}

export function validateResolutionTimelineRequest(
  input: ResolutionTimelineRequest
): DisputeRequestValidationResult {
  return validateDisputeDetailsRequest({ dispute_id: input.dispute_id });
}

export function resolveDisputeFixture(disputeId: string): DisputeExperienceSource | null {
  const fixtures: Record<string, DisputeExperienceSource> = {
    [MVP_DISPUTE_ID]: MVP_OPEN_DISPUTE_SOURCE,
    [MVP_RESOLVED_DISPUTE_ID]: MVP_RESOLVED_DISPUTE_SOURCE,
    [MVP_CLOSED_DISPUTE_ID]: MVP_CLOSED_DISPUTE_SOURCE,
    ["dd0e8400-e29b-41d4-a716-446655440099"]: MVP_EMPTY_TIMELINE_DISPUTE_SOURCE,
  };

  return fixtures[disputeId] ?? null;
}

export function findDisputeSourceById(disputeId: string): DisputeExperienceSource | null {
  return resolveDisputeFixture(disputeId);
}
