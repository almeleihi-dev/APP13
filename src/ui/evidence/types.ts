import type { ContractStatus } from "../../contract/domain/contract.js";
import type { EvidenceType } from "../../execution/domain/evidence.js";

export type { ContractStatus, EvidenceType };

export type VerificationStatus = "verified" | "unverified" | "pending";
export type AttestationStatus = "approved" | "pending" | "rejected" | "none";
export type EvidenceReviewStatus = "approved" | "pending" | "rejected";

export type AttestationTimelineEventType =
  | "evidence_created"
  | "evidence_uploaded"
  | "evidence_verified"
  | "attestation_created"
  | "attestation_approved"
  | "attestation_rejected";

export interface EvidenceSummarySnapshot {
  totalEvidence: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface UploadStatisticsSnapshot {
  images: number;
  videos: number;
  documents: number;
  links: number;
}

export interface VerificationStatusSnapshot {
  verifiedCount: number;
  unverifiedCount: number;
  attestedCount: number;
}

export interface EvidenceContractContextSnapshot {
  contractId: string;
  milestoneId: string | null;
  issueId: string | null;
  executionStatus: ContractStatus;
}

export interface EvidenceTrustContextSnapshot {
  providerTrustScore: string;
  trustTier: string;
  verificationLevel: string;
}

export interface EvidenceHealthSnapshot {
  completenessIndicator: string;
  missingRequirements: string[];
  reviewReadiness: string;
}

export interface EvidenceFileMetadataSnapshot {
  filename: string | null;
  contentType: string | null;
  contentHash: string | null;
  storageKey: string | null;
  sizeLabel: string | null;
}

export interface EvidenceItemSnapshot {
  evidenceId: string;
  contractId: string;
  milestoneId: string;
  type: EvidenceType | string;
  title: string;
  description: string;
  uploadedAt: string;
  uploaderId: string;
  verificationStatus: VerificationStatus;
  attestationStatus: AttestationStatus;
  reviewStatus: EvidenceReviewStatus;
  fileMetadata: EvidenceFileMetadataSnapshot;
  reviewNotes: string | null;
}

export interface AttestationTimelineEventSnapshot {
  timestamp: string;
  eventType: AttestationTimelineEventType;
  label: string;
  evidenceId?: string;
  attestationId?: string;
  statusTransition?: string;
}

export interface EvidenceExperienceSource {
  summary: EvidenceSummarySnapshot;
  uploadStatistics: UploadStatisticsSnapshot;
  verificationStatus: VerificationStatusSnapshot;
  contractContext: EvidenceContractContextSnapshot;
  trustContext: EvidenceTrustContextSnapshot;
  evidenceHealth: EvidenceHealthSnapshot;
  evidenceItems: EvidenceItemSnapshot[];
  attestationTimeline: AttestationTimelineEventSnapshot[];
}

export interface EvidenceOverviewRequest {
  contract_id: string;
  milestone_id?: string;
  issue_id?: string;
}

export interface EvidenceDetailsRequest {
  contract_id: string;
  evidence_id: string;
}

export interface AttestationTimelineRequest {
  contract_id: string;
  milestone_id?: string;
  evidence_id?: string;
}

export interface EvidenceRequestValidationError {
  field: string;
  message: string;
}

export interface EvidenceRequestValidationResult {
  valid: boolean;
  errors: EvidenceRequestValidationError[];
}

export interface EvidenceClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export type EvidenceOverviewExecutor = (
  request: EvidenceOverviewRequest
) => Promise<EvidenceExperienceSource>;

export type EvidenceDetailsExecutor = (
  request: EvidenceDetailsRequest
) => Promise<EvidenceExperienceSource>;

export type AttestationTimelineExecutor = (
  request: AttestationTimelineRequest
) => Promise<EvidenceExperienceSource>;

export interface EvidenceClientOptions extends EvidenceClientConfig {
  overviewExecutor?: EvidenceOverviewExecutor;
  detailsExecutor?: EvidenceDetailsExecutor;
  timelineExecutor?: AttestationTimelineExecutor;
}

export interface CardField {
  label: string;
  value: string;
}

export interface ResponseCard {
  id: string;
  title: string;
  summary: string;
  fields: CardField[];
}

export interface EvidenceSummaryCard extends ResponseCard {
  id: "evidence-summary";
}

export interface UploadStatisticsCard extends ResponseCard {
  id: "upload-statistics";
}

export interface VerificationStatusCard extends ResponseCard {
  id: "verification-status";
}

export interface EvidenceContractContextCard extends ResponseCard {
  id: "contract-context";
}

export interface EvidenceTrustContextCard extends ResponseCard {
  id: "trust-context";
}

export interface EvidenceHealthCard extends ResponseCard {
  id: "evidence-health";
}

export interface EvidenceOverviewView {
  evidence_summary: EvidenceSummaryCard;
  upload_statistics: UploadStatisticsCard;
  verification_status: VerificationStatusCard;
  contract_context: EvidenceContractContextCard;
  trust_context: EvidenceTrustContextCard;
  evidence_health: EvidenceHealthCard;
}

export interface EvidenceDetailField {
  label: string;
  value: string;
}

export interface EvidenceDetailsView {
  evidence_id: string;
  contract_id: string;
  fields: EvidenceDetailField[];
  file_metadata: EvidenceDetailField[];
  review_notes: string | null;
}

export interface AttestationTimelineEventView {
  timestamp: string;
  event_type: AttestationTimelineEventType;
  label: string;
  evidence_id: string;
  status_transition: string;
}

export interface AttestationTimelineView {
  contract_id: string;
  events: AttestationTimelineEventView[];
}

export interface EvidenceOverviewPageModel {
  page_id: "evidence-overview";
  title: string;
  description: string;
  view: EvidenceOverviewView;
}

export interface EvidenceDetailsPageModel {
  page_id: "evidence-details";
  title: string;
  description: string;
  view: EvidenceDetailsView;
}

export interface AttestationTimelinePageModel {
  page_id: "attestation-timeline";
  title: string;
  description: string;
  view: AttestationTimelineView;
}

export interface EvidenceOverviewResult {
  source: EvidenceExperienceSource;
  view: EvidenceOverviewView;
}

export interface EvidenceDetailsResult {
  source: EvidenceExperienceSource;
  view: EvidenceDetailsView;
}

export interface AttestationTimelineResult {
  source: EvidenceExperienceSource;
  view: AttestationTimelineView;
}
