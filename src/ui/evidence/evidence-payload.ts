import {
  MVP_EXECUTION_CONTRACT_ID,
  MVP_MILESTONE_ACCESS_ID,
  MVP_MILESTONE_WIP_ID,
} from "../execution/execution-payload.js";
import type {
  AttestationTimelineRequest,
  EvidenceDetailsRequest,
  EvidenceExperienceSource,
  EvidenceItemSnapshot,
  EvidenceOverviewRequest,
  EvidenceRequestValidationResult,
} from "./types.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const MVP_EVIDENCE_CONTRACT_ID = MVP_EXECUTION_CONTRACT_ID;
export const MVP_EMPTY_EVIDENCE_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440010";
export const MVP_REJECTED_EVIDENCE_CONTRACT_ID = "880e8400-e29b-41d4-a716-446655440011";
export { MVP_MILESTONE_ACCESS_ID, MVP_MILESTONE_WIP_ID } from "../execution/execution-payload.js";
export const MVP_EVIDENCE_ID_DOC = "aa0e8400-e29b-41d4-a716-446655440001";
export const MVP_EVIDENCE_ID_PHOTO = "aa0e8400-e29b-41d4-a716-446655440002";
export const MVP_EVIDENCE_ID_NOTE = "aa0e8400-e29b-41d4-a716-446655440003";
export const MVP_EVIDENCE_ID_REJECTED = "aa0e8400-e29b-41d4-a716-446655440004";

const BASE_ITEMS: EvidenceItemSnapshot[] = [
  {
    evidenceId: MVP_EVIDENCE_ID_DOC,
    contractId: MVP_EXECUTION_CONTRACT_ID,
    milestoneId: MVP_MILESTONE_ACCESS_ID,
    type: "EV-DOC",
    title: "Kickoff Scope Document",
    description: "Signed scope document for access milestone",
    uploadedAt: "2026-06-05T12:00:00.000Z",
    uploaderId: "user-provider-001",
    verificationStatus: "verified",
    attestationStatus: "approved",
    reviewStatus: "approved",
    fileMetadata: {
      filename: "kickoff-scope.pdf",
      contentType: "application/pdf",
      contentHash: "sha256:abc123",
      storageKey: "contracts/880e8400/milestones/990e8400/kickoff-scope.pdf",
      sizeLabel: "245 KB",
    },
    reviewNotes: "Scope verified against contract deliverables",
  },
  {
    evidenceId: MVP_EVIDENCE_ID_PHOTO,
    contractId: MVP_EXECUTION_CONTRACT_ID,
    milestoneId: MVP_MILESTONE_ACCESS_ID,
    type: "EV-PHOTO",
    title: "Site Access Photo",
    description: "Photo confirming workspace access",
    uploadedAt: "2026-06-05T12:05:00.000Z",
    uploaderId: "user-provider-001",
    verificationStatus: "verified",
    attestationStatus: "approved",
    reviewStatus: "approved",
    fileMetadata: {
      filename: "access-photo.jpg",
      contentType: "image/jpeg",
      contentHash: "sha256:def456",
      storageKey: "contracts/880e8400/milestones/990e8400/access-photo.jpg",
      sizeLabel: "1.2 MB",
    },
    reviewNotes: null,
  },
  {
    evidenceId: MVP_EVIDENCE_ID_NOTE,
    contractId: MVP_EXECUTION_CONTRACT_ID,
    milestoneId: MVP_MILESTONE_WIP_ID,
    type: "EV-NOTE",
    title: "Progress Update Note",
    description: "Weekly progress summary for work in progress milestone",
    uploadedAt: "2026-06-07T11:30:00.000Z",
    uploaderId: "user-provider-001",
    verificationStatus: "unverified",
    attestationStatus: "pending",
    reviewStatus: "pending",
    fileMetadata: {
      filename: null,
      contentType: "text/plain",
      contentHash: "sha256:ghi789",
      storageKey: null,
      sizeLabel: null,
    },
    reviewNotes: "Awaiting customer review",
  },
];

/** Mixed verified and pending evidence fixture. */
export const MVP_EVIDENCE_OVERVIEW_SOURCE: EvidenceExperienceSource = {
  summary: {
    totalEvidence: 3,
    approved: 2,
    pending: 1,
    rejected: 0,
  },
  uploadStatistics: {
    images: 1,
    videos: 0,
    documents: 1,
    links: 0,
  },
  verificationStatus: {
    verifiedCount: 2,
    unverifiedCount: 1,
    attestedCount: 2,
  },
  contractContext: {
    contractId: MVP_EXECUTION_CONTRACT_ID,
    milestoneId: MVP_MILESTONE_WIP_ID,
    issueId: null,
    executionStatus: "active",
  },
  trustContext: {
    providerTrustScore: "92",
    trustTier: "emerald",
    verificationLevel: "iron",
  },
  evidenceHealth: {
    completenessIndicator: "67%",
    missingRequirements: ["Progress photo for M-WIP"],
    reviewReadiness: "partial",
  },
  evidenceItems: BASE_ITEMS,
  attestationTimeline: [
    {
      timestamp: "2026-06-05T11:55:00.000Z",
      eventType: "evidence_created",
      label: "Kickoff Scope Document created",
      evidenceId: MVP_EVIDENCE_ID_DOC,
    },
    {
      timestamp: "2026-06-05T12:00:00.000Z",
      eventType: "evidence_uploaded",
      label: "Kickoff Scope Document uploaded",
      evidenceId: MVP_EVIDENCE_ID_DOC,
      statusTransition: "draft → uploaded",
    },
    {
      timestamp: "2026-06-05T12:10:00.000Z",
      eventType: "evidence_verified",
      label: "Kickoff Scope Document verified",
      evidenceId: MVP_EVIDENCE_ID_DOC,
      statusTransition: "unverified → verified",
    },
    {
      timestamp: "2026-06-05T12:15:00.000Z",
      eventType: "attestation_created",
      label: "Attestation created for kickoff evidence",
      evidenceId: MVP_EVIDENCE_ID_DOC,
      attestationId: "bb0e8400-e29b-41d4-a716-446655440001",
    },
    {
      timestamp: "2026-06-06T10:00:00.000Z",
      eventType: "attestation_approved",
      label: "Kickoff attestation approved",
      evidenceId: MVP_EVIDENCE_ID_DOC,
      attestationId: "bb0e8400-e29b-41d4-a716-446655440001",
      statusTransition: "pending → approved",
    },
    {
      timestamp: "2026-06-07T11:30:00.000Z",
      eventType: "evidence_uploaded",
      label: "Progress Update Note uploaded",
      evidenceId: MVP_EVIDENCE_ID_NOTE,
      statusTransition: "draft → uploaded",
    },
  ],
};

/** Empty evidence state fixture. */
export const MVP_EMPTY_EVIDENCE_SOURCE: EvidenceExperienceSource = {
  summary: { totalEvidence: 0, approved: 0, pending: 0, rejected: 0 },
  uploadStatistics: { images: 0, videos: 0, documents: 0, links: 0 },
  verificationStatus: { verifiedCount: 0, unverifiedCount: 0, attestedCount: 0 },
  contractContext: {
    contractId: MVP_EMPTY_EVIDENCE_CONTRACT_ID,
    milestoneId: null,
    issueId: null,
    executionStatus: "active",
  },
  trustContext: {
    providerTrustScore: "92",
    trustTier: "emerald",
    verificationLevel: "iron",
  },
  evidenceHealth: {
    completenessIndicator: "0%",
    missingRequirements: ["All required evidence"],
    reviewReadiness: "not_ready",
  },
  evidenceItems: [],
  attestationTimeline: [],
};

/** Rejected attestation scenario fixture. */
export const MVP_REJECTED_EVIDENCE_SOURCE: EvidenceExperienceSource = {
  ...MVP_EVIDENCE_OVERVIEW_SOURCE,
  summary: { totalEvidence: 1, approved: 0, pending: 0, rejected: 1 },
  verificationStatus: { verifiedCount: 0, unverifiedCount: 1, attestedCount: 0 },
  evidenceItems: [
    {
      evidenceId: MVP_EVIDENCE_ID_REJECTED,
      contractId: MVP_REJECTED_EVIDENCE_CONTRACT_ID,
      milestoneId: MVP_MILESTONE_WIP_ID,
      type: "EV-PHOTO",
      title: "Incomplete Deliverable Photo",
      description: "Photo rejected due to missing acceptance criteria",
      uploadedAt: "2026-06-18T09:00:00.000Z",
      uploaderId: "user-provider-001",
      verificationStatus: "unverified",
      attestationStatus: "rejected",
      reviewStatus: "rejected",
      fileMetadata: {
        filename: "wip-photo.jpg",
        contentType: "image/jpeg",
        contentHash: "sha256:rej001",
        storageKey: "contracts/880e8400/milestones/990e8400/wip-photo.jpg",
        sizeLabel: "890 KB",
      },
      reviewNotes: "Missing required checklist items",
    },
  ],
  attestationTimeline: [
    {
      timestamp: "2026-06-18T09:00:00.000Z",
      eventType: "evidence_uploaded",
      label: "Incomplete Deliverable Photo uploaded",
      evidenceId: MVP_EVIDENCE_ID_REJECTED,
    },
    {
      timestamp: "2026-06-18T10:00:00.000Z",
      eventType: "attestation_created",
      label: "Attestation created for WIP evidence",
      evidenceId: MVP_EVIDENCE_ID_REJECTED,
      attestationId: "bb0e8400-e29b-41d4-a716-446655440002",
    },
    {
      timestamp: "2026-06-18T14:00:00.000Z",
      eventType: "attestation_rejected",
      label: "WIP attestation rejected",
      evidenceId: MVP_EVIDENCE_ID_REJECTED,
      attestationId: "bb0e8400-e29b-41d4-a716-446655440002",
      statusTransition: "pending → rejected",
    },
  ],
  contractContext: {
    contractId: MVP_REJECTED_EVIDENCE_CONTRACT_ID,
    milestoneId: MVP_MILESTONE_WIP_ID,
    issueId: "cc0e8400-e29b-41d4-a716-446655440001",
    executionStatus: "disputed",
  },
};

function validateUuid(field: string, value: string | undefined, required: boolean): EvidenceRequestValidationResult["errors"] {
  const errors: EvidenceRequestValidationResult["errors"] = [];
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

export function validateEvidenceOverviewRequest(
  input: EvidenceOverviewRequest
): EvidenceRequestValidationResult {
  const errors = [
    ...validateUuid("contract_id", input.contract_id, true),
    ...validateUuid("milestone_id", input.milestone_id, false),
    ...validateUuid("issue_id", input.issue_id, false),
  ];

  return { valid: errors.length === 0, errors };
}

export function validateEvidenceDetailsRequest(
  input: EvidenceDetailsRequest
): EvidenceRequestValidationResult {
  const errors = [
    ...validateUuid("contract_id", input.contract_id, true),
    ...validateUuid("evidence_id", input.evidence_id, true),
  ];

  return { valid: errors.length === 0, errors };
}

export function validateAttestationTimelineRequest(
  input: AttestationTimelineRequest
): EvidenceRequestValidationResult {
  const errors = [
    ...validateUuid("contract_id", input.contract_id, true),
    ...validateUuid("milestone_id", input.milestone_id, false),
    ...validateUuid("evidence_id", input.evidence_id, false),
  ];

  return { valid: errors.length === 0, errors };
}

export function resolveEvidenceFixture(contractId: string): EvidenceExperienceSource | null {
  const fixtures: Record<string, EvidenceExperienceSource> = {
    [MVP_EVIDENCE_CONTRACT_ID]: MVP_EVIDENCE_OVERVIEW_SOURCE,
    [MVP_EMPTY_EVIDENCE_CONTRACT_ID]: MVP_EMPTY_EVIDENCE_SOURCE,
    [MVP_REJECTED_EVIDENCE_CONTRACT_ID]: MVP_REJECTED_EVIDENCE_SOURCE,
  };

  return fixtures[contractId] ?? null;
}

export function findEvidenceItem(
  source: EvidenceExperienceSource,
  evidenceId: string
): EvidenceItemSnapshot | null {
  return source.evidenceItems.find((item) => item.evidenceId === evidenceId) ?? null;
}

export function filterEvidenceSource(
  source: EvidenceExperienceSource,
  filters: { milestoneId?: string; issueId?: string }
): EvidenceExperienceSource {
  let items = source.evidenceItems;

  if (filters.milestoneId) {
    items = items.filter((item) => item.milestoneId === filters.milestoneId);
  }

  const timeline = filters.milestoneId
    ? source.attestationTimeline.filter(
        (event) =>
          !event.evidenceId || items.some((item) => item.evidenceId === event.evidenceId)
      )
    : source.attestationTimeline;

  if (items === source.evidenceItems && timeline === source.attestationTimeline) {
    return {
      ...source,
      contractContext: {
        ...source.contractContext,
        milestoneId: filters.milestoneId ?? source.contractContext.milestoneId,
        issueId: filters.issueId ?? source.contractContext.issueId,
      },
    };
  }

  return {
    ...source,
    summary: {
      totalEvidence: items.length,
      approved: items.filter((item) => item.reviewStatus === "approved").length,
      pending: items.filter((item) => item.reviewStatus === "pending").length,
      rejected: items.filter((item) => item.reviewStatus === "rejected").length,
    },
    uploadStatistics: source.uploadStatistics,
    verificationStatus: {
      verifiedCount: items.filter((item) => item.verificationStatus === "verified").length,
      unverifiedCount: items.filter((item) => item.verificationStatus === "unverified").length,
      attestedCount: items.filter((item) => item.attestationStatus === "approved").length,
    },
    contractContext: {
      ...source.contractContext,
      milestoneId: filters.milestoneId ?? source.contractContext.milestoneId,
      issueId: filters.issueId ?? source.contractContext.issueId,
    },
    evidenceItems: items,
    attestationTimeline: timeline,
  };
}
