import type { LiveFrameColor, TrustRecommendation, TrustTier } from "../../trust/intelligence/types.js";
import type { RequestExecutor } from "../../integration/request-executor.js";

export type { LiveFrameColor, TrustRecommendation, TrustTier };

export type TrustTimelineEventType =
  | "provider_registered"
  | "verification_completed"
  | "license_added"
  | "contract_completed"
  | "evidence_verified"
  | "attestation_approved"
  | "dispute_opened"
  | "dispute_resolved"
  | "escrow_released"
  | "trust_updated";

export interface TrustSummarySnapshot {
  trustScore: string;
  trustTier: TrustTier | string;
  confidence: string;
  liveFrame: LiveFrameColor | string;
}

export interface VerificationProfileSnapshot {
  verificationLevel: string;
  identityStatus: string;
  licenses: string[];
  certifications: string[];
}

export interface PerformanceProfileSnapshot {
  completionRate: string;
  acceptedMilestones: number;
  rejectedMilestones: number;
  activeContracts: number;
}

export interface TrustEvidenceProfileSnapshot {
  evidenceCount: number;
  verifiedEvidence: number;
  attestedEvidence: number;
  evidenceHealth: string;
}

export interface TrustEscrowProfileSnapshot {
  escrowCount: number;
  funded: string;
  released: string;
  refunded: string;
}

export interface TrustDisputeProfileSnapshot {
  disputeCount: number;
  resolvedDisputes: number;
  openDisputes: number;
  disputeImpact: string;
}

export interface AvailabilityProfileSnapshot {
  availableNow: string;
  responseSpeed: string;
  workload: string;
  startDelay: string;
}

export interface FinancialProfileSnapshot {
  averageContractValue: string;
  pricingPosition: string;
  budgetBand: string;
  marketBand: string;
  premiumBand: string;
}

export interface MatchingProfileSnapshot {
  categories: string[];
  specializations: string[];
  actionCodes: string[];
  matchingStrength: string;
}

export interface TrustTimelineSummarySnapshot {
  verificationEvents: string;
  milestoneCompletions: string;
  evidenceVerification: string;
  disputes: string;
  trustChanges: string;
}

export interface TrustTimelineEventSnapshot {
  timestamp: string;
  eventType: TrustTimelineEventType;
  label: string;
  detail?: string;
}

export interface ProviderRiskProfileSnapshot {
  riskLevel: string;
  lateDeliveryRisk: string;
  disputeRisk: string;
  qualityRisk: string;
}

export interface ProviderEscrowHistorySnapshot {
  totalEscrows: number;
  fundedLabel: string;
  releasedLabel: string;
  refundedLabel: string;
}

export interface ProviderDisputeHistorySnapshot {
  totalDisputes: number;
  resolvedLabel: string;
  openLabel: string;
  impactLabel: string;
}

export interface ProviderExecutionProfileSnapshot {
  activeContracts: number;
  acceptedMilestones: number;
  rejectedMilestones: number;
  completionRate: string;
}

export interface ProviderTrustReportSnapshot {
  providerId: string;
  profession: string;
  capabilityLevel: string;
  trustScore: string;
  trustTier: TrustTier | string;
  verificationProfile: VerificationProfileSnapshot;
  riskProfile: ProviderRiskProfileSnapshot;
  escrowHistory: ProviderEscrowHistorySnapshot;
  disputeHistory: ProviderDisputeHistorySnapshot;
  evidenceProfile: TrustEvidenceProfileSnapshot;
  executionProfile: ProviderExecutionProfileSnapshot;
}

export interface TrustExperienceSource {
  providerId: string;
  trustSummary: TrustSummarySnapshot;
  verificationProfile: VerificationProfileSnapshot;
  performanceProfile: PerformanceProfileSnapshot;
  evidenceProfile: TrustEvidenceProfileSnapshot;
  escrowProfile: TrustEscrowProfileSnapshot;
  disputeProfile: TrustDisputeProfileSnapshot;
  availabilityProfile: AvailabilityProfileSnapshot;
  financialProfile: FinancialProfileSnapshot;
  matchingProfile: MatchingProfileSnapshot;
  timelineSummary: TrustTimelineSummarySnapshot;
  providerReport: ProviderTrustReportSnapshot;
  trustTimeline: TrustTimelineEventSnapshot[];
}

export interface TrustCenterRequest {
  provider_id: string;
}

export interface ProviderTrustReportRequest {
  provider_id: string;
}

export interface TrustTimelineRequest {
  provider_id: string;
}

export interface TrustRequestValidationError {
  field: string;
  message: string;
}

export interface TrustRequestValidationResult {
  valid: boolean;
  errors: TrustRequestValidationError[];
}

export interface TrustClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type TrustCenterExecutor = (request: TrustCenterRequest) => Promise<TrustExperienceSource>;
export type ProviderTrustReportExecutor = (
  request: ProviderTrustReportRequest
) => Promise<TrustExperienceSource>;
export type TrustTimelineExecutor = (request: TrustTimelineRequest) => Promise<TrustExperienceSource>;

export interface TrustClientOptions extends TrustClientConfig {
  centerExecutor?: TrustCenterExecutor;
  reportExecutor?: ProviderTrustReportExecutor;
  timelineExecutor?: TrustTimelineExecutor;
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

export interface TrustSummaryCard extends ResponseCard {
  id: "trust-summary";
}

export interface VerificationProfileCard extends ResponseCard {
  id: "verification-profile";
}

export interface PerformanceProfileCard extends ResponseCard {
  id: "performance-profile";
}

export interface EvidenceProfileCard extends ResponseCard {
  id: "evidence-profile";
}

export interface EscrowProfileCard extends ResponseCard {
  id: "escrow-profile";
}

export interface DisputeProfileCard extends ResponseCard {
  id: "dispute-profile";
}

export interface AvailabilityProfileCard extends ResponseCard {
  id: "availability-profile";
}

export interface FinancialProfileCard extends ResponseCard {
  id: "financial-profile";
}

export interface MatchingProfileCard extends ResponseCard {
  id: "matching-profile";
}

export interface TrustTimelineSummaryCard extends ResponseCard {
  id: "trust-timeline";
}

export interface TrustCenterView {
  provider_id: string;
  trust_tier: string;
  trust_summary: TrustSummaryCard;
  verification_profile: VerificationProfileCard;
  performance_profile: PerformanceProfileCard;
  evidence_profile: EvidenceProfileCard;
  escrow_profile: EscrowProfileCard;
  dispute_profile: DisputeProfileCard;
  availability_profile: AvailabilityProfileCard;
  financial_profile: FinancialProfileCard;
  matching_profile: MatchingProfileCard;
  trust_timeline: TrustTimelineSummaryCard;
}

export interface ProviderTrustReportField {
  label: string;
  value: string;
}

export interface ProviderTrustReportSection {
  id: string;
  title: string;
  fields: ProviderTrustReportField[];
}

export interface ProviderTrustReportView {
  provider_id: string;
  header_fields: ProviderTrustReportField[];
  sections: ProviderTrustReportSection[];
}

export interface TrustTimelineEventView {
  timestamp: string;
  event_type: TrustTimelineEventType;
  label: string;
  detail: string;
}

export interface TrustTimelineView {
  provider_id: string;
  events: TrustTimelineEventView[];
}

export interface TrustCenterPageModel {
  page_id: "trust-center";
  title: string;
  description: string;
  view: TrustCenterView;
}

export interface ProviderTrustReportPageModel {
  page_id: "provider-trust-report";
  title: string;
  description: string;
  view: ProviderTrustReportView;
}

export interface TrustTimelinePageModel {
  page_id: "trust-timeline";
  title: string;
  description: string;
  view: TrustTimelineView;
}

export interface TrustCenterResult {
  source: TrustExperienceSource;
  view: TrustCenterView;
}

export interface ProviderTrustReportResult {
  source: TrustExperienceSource;
  view: ProviderTrustReportView;
}

export interface TrustTimelineResult {
  source: TrustExperienceSource;
  view: TrustTimelineView;
}
