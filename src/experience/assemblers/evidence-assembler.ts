import type { ContractStatus } from "../../contract/domain/contract.js";
import type { EvidenceExperienceSource } from "../../ui/evidence/types.js";

export interface EvidenceAssemblyInput {
  contractId: string;
  contractStatus: ContractStatus;
  milestoneId?: string | null;
  issueId?: string | null;
  evidenceItems: Array<{
    id: string;
    contract_id: string;
    milestone_id: string;
    evidence_type: string;
    content_hash: string | null;
    created_at: string;
  }>;
  providerTrustScore?: string;
  trustTier?: string;
  verificationLevel?: string;
}

export function assembleEvidenceExperienceSource(
  input: EvidenceAssemblyInput
): EvidenceExperienceSource {
  const filtered = input.milestoneId
    ? input.evidenceItems.filter((item) => item.milestone_id === input.milestoneId)
    : input.evidenceItems;

  const uploadStatistics = {
    images: filtered.filter((item) => item.evidence_type === "photo").length,
    videos: filtered.filter((item) => item.evidence_type === "video").length,
    documents: filtered.filter((item) => item.evidence_type === "document").length,
    links: filtered.filter((item) => item.evidence_type === "link").length,
  };

  return {
    summary: {
      totalEvidence: filtered.length,
      approved: filtered.length,
      pending: 0,
      rejected: 0,
    },
    uploadStatistics,
    verificationStatus: {
      verifiedCount: filtered.length,
      unverifiedCount: 0,
      attestedCount: 0,
    },
    contractContext: {
      contractId: input.contractId,
      milestoneId: input.milestoneId ?? null,
      issueId: input.issueId ?? null,
      executionStatus: input.contractStatus,
    },
    trustContext: {
      providerTrustScore: input.providerTrustScore ?? "—",
      trustTier: input.trustTier ?? "—",
      verificationLevel: input.verificationLevel ?? "—",
    },
    evidenceHealth: {
      completenessIndicator: filtered.length > 0 ? "complete" : "missing",
      missingRequirements: filtered.length > 0 ? [] : ["evidence_required"],
      reviewReadiness: filtered.length > 0 ? "ready" : "pending",
    },
    evidenceItems: filtered.map((item) => ({
      evidenceId: item.id,
      contractId: item.contract_id,
      milestoneId: item.milestone_id,
      type: item.evidence_type,
      title: item.evidence_type,
      description: item.content_hash ?? "—",
      uploadedAt: item.created_at,
      uploaderId: "—",
      verificationStatus: "verified",
      attestationStatus: "none",
      reviewStatus: "approved",
      fileMetadata: {
        filename: null,
        contentType: null,
        contentHash: item.content_hash,
        storageKey: null,
        sizeLabel: null,
      },
      reviewNotes: null,
    })),
    attestationTimeline: filtered.map((item) => ({
      timestamp: item.created_at,
      eventType: "evidence_created" as const,
      label: `${item.evidence_type} evidence recorded`,
      evidenceId: item.id,
    })),
  };
}

export function assembleEvidenceItemSource(
  input: EvidenceAssemblyInput,
  evidenceId: string
): EvidenceExperienceSource | null {
  const item = input.evidenceItems.find((row) => row.id === evidenceId);
  if (!item) return null;
  return assembleEvidenceExperienceSource({
    ...input,
    milestoneId: item.milestone_id,
    evidenceItems: [item],
  });
}

export function assembleEvidenceTimelineSource(
  input: EvidenceTimelineAssemblyInput
): EvidenceExperienceSource {
  const source = assembleEvidenceExperienceSource(input);
  if (input.evidenceIdFilter) {
    source.attestationTimeline = source.attestationTimeline.filter(
      (event) => event.evidenceId === input.evidenceIdFilter
    );
  }
  if (input.milestoneId) {
    source.attestationTimeline = source.attestationTimeline.filter((event) =>
      source.evidenceItems.some(
        (item) => item.evidenceId === event.evidenceId && item.milestoneId === input.milestoneId
      )
    );
  }
  return source;
}

export interface EvidenceTimelineAssemblyInput extends EvidenceAssemblyInput {
  evidenceIdFilter?: string;
}
