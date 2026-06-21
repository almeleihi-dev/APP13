import type { IssueStatus } from "../../complaint/domain/issue.js";

export type { IssueStatus };

export type DisputeStatus = "open" | "investigating" | "mediation" | "resolved" | "closed";

export type ResolutionTimelineEventType =
  | "dispute_created"
  | "evidence_submitted"
  | "evidence_verified"
  | "escrow_frozen"
  | "mediation_started"
  | "recommendation_issued"
  | "dispute_resolved"
  | "escrow_released"
  | "escrow_refunded"
  | "dispute_closed";

export interface DisputeSummarySnapshot {
  disputeId: string;
  contractId: string;
  issueType: string;
  severity: string;
  currentStatus: DisputeStatus;
}

export interface DisputePartiesSnapshot {
  customer: string;
  provider: string;
  disputeOwner: string;
  openedBy: string;
}

export interface EscrowImpactSnapshot {
  escrowStatus: string;
  frozen: boolean;
  unfrozen: boolean;
  affectedAmountLabel: string;
}

export interface DisputeEvidenceStatusSnapshot {
  totalEvidence: number;
  verifiedEvidence: number;
  pendingEvidence: number;
  attestedEvidence: number;
}

export interface ResolutionProgressSnapshot {
  open: string;
  investigating: string;
  mediation: string;
  resolved: string;
  closed: string;
}

export interface DisputeRiskContextSnapshot {
  riskLevel: string;
  escalationIndicator: string;
  financialImpact: string;
}

export interface DisputeTrustContextSnapshot {
  providerTrustScore: string;
  trustTier: string;
  disputeImpactIndicator: string;
}

export interface TimelineSummarySnapshot {
  created: string;
  evidenceAdded: string;
  freeze: string;
  mediation: string;
  resolution: string;
}

export interface DisputeDetailsSnapshot {
  disputeId: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  createdBy: string;
  createdAt: string;
  status: DisputeStatus;
  assignedReviewer: string | null;
  linkedContractId: string;
  linkedMilestoneId: string | null;
  linkedEscrowId: string | null;
  linkedEvidenceIds: string[];
}

export interface ResolutionTimelineEventSnapshot {
  timestamp: string;
  eventType: ResolutionTimelineEventType;
  label: string;
  statusTransition?: string;
}

export interface DisputeExperienceSource {
  summary: DisputeSummarySnapshot;
  parties: DisputePartiesSnapshot;
  escrowImpact: EscrowImpactSnapshot;
  evidenceStatus: DisputeEvidenceStatusSnapshot;
  resolutionProgress: ResolutionProgressSnapshot;
  riskContext: DisputeRiskContextSnapshot;
  trustContext: DisputeTrustContextSnapshot;
  timelineSummary: TimelineSummarySnapshot;
  details: DisputeDetailsSnapshot;
  resolutionTimeline: ResolutionTimelineEventSnapshot[];
}

export interface DisputeDashboardRequest {
  dispute_id: string;
  contract_id?: string;
}

export interface DisputeDetailsRequest {
  dispute_id: string;
}

export interface ResolutionTimelineRequest {
  dispute_id: string;
}

export interface DisputeRequestValidationError {
  field: string;
  message: string;
}

export interface DisputeRequestValidationResult {
  valid: boolean;
  errors: DisputeRequestValidationError[];
}

export interface DisputeClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export type DisputeDashboardExecutor = (
  request: DisputeDashboardRequest
) => Promise<DisputeExperienceSource>;

export type DisputeDetailsExecutor = (
  request: DisputeDetailsRequest
) => Promise<DisputeExperienceSource>;

export type ResolutionTimelineExecutor = (
  request: ResolutionTimelineRequest
) => Promise<DisputeExperienceSource>;

export interface DisputeClientOptions extends DisputeClientConfig {
  dashboardExecutor?: DisputeDashboardExecutor;
  detailsExecutor?: DisputeDetailsExecutor;
  timelineExecutor?: ResolutionTimelineExecutor;
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

export interface DisputeSummaryCard extends ResponseCard {
  id: "dispute-summary";
}

export interface PartiesCard extends ResponseCard {
  id: "parties";
}

export interface EscrowImpactCard extends ResponseCard {
  id: "escrow-impact";
}

export interface EvidenceStatusCard extends ResponseCard {
  id: "evidence-status";
}

export interface ResolutionProgressCard extends ResponseCard {
  id: "resolution-progress";
}

export interface RiskContextCard extends ResponseCard {
  id: "risk-context";
}

export interface TrustContextCard extends ResponseCard {
  id: "trust-context";
}

export interface TimelineSummaryCard extends ResponseCard {
  id: "timeline-summary";
}

export interface DisputeDashboardView {
  dispute_status: DisputeStatus;
  dispute_summary: DisputeSummaryCard;
  parties: PartiesCard;
  escrow_impact: EscrowImpactCard;
  evidence_status: EvidenceStatusCard;
  resolution_progress: ResolutionProgressCard;
  risk_context: RiskContextCard;
  trust_context: TrustContextCard;
  timeline_summary: TimelineSummaryCard;
}

export interface DisputeDetailField {
  label: string;
  value: string;
}

export interface DisputeDetailsView {
  dispute_id: string;
  fields: DisputeDetailField[];
  linked_evidence: string[];
}

export interface ResolutionTimelineEventView {
  timestamp: string;
  event_type: ResolutionTimelineEventType;
  label: string;
  status_transition: string;
}

export interface ResolutionTimelineView {
  dispute_id: string;
  events: ResolutionTimelineEventView[];
}

export interface DisputeDashboardPageModel {
  page_id: "dispute-dashboard";
  title: string;
  description: string;
  view: DisputeDashboardView;
}

export interface DisputeDetailsPageModel {
  page_id: "dispute-details";
  title: string;
  description: string;
  view: DisputeDetailsView;
}

export interface ResolutionTimelinePageModel {
  page_id: "resolution-timeline";
  title: string;
  description: string;
  view: ResolutionTimelineView;
}

export interface DisputeDashboardResult {
  source: DisputeExperienceSource;
  view: DisputeDashboardView;
}

export interface DisputeDetailsResult {
  source: DisputeExperienceSource;
  view: DisputeDetailsView;
}

export interface ResolutionTimelineResult {
  source: DisputeExperienceSource;
  view: ResolutionTimelineView;
}
