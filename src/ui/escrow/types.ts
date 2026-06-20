import type { EscrowStatus } from "../../financial/domain/escrow.js";
import type { WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";

export type { EscrowStatus, WorkflowAnalyzeResult };

export type EscrowReleaseStrategyDisplay =
  | "single_release"
  | "two_stage"
  | "four_stage"
  | "milestone_based"
  | "multi_stage";

export type EscrowTimelineEventType =
  | "escrow_created"
  | "funded"
  | "held"
  | "release"
  | "refund"
  | "freeze"
  | "unfreeze";

export interface EscrowAgreementSnapshot {
  id: string;
  contractId: string;
  status: EscrowStatus;
  grossAmountMinor: number;
  platformFeeMinor: number;
  currencyCode: string;
  createdAt: string;
}

export interface EscrowFinancialSnapshot {
  contractValueMinor: number;
  heldAmountMinor: number;
  releasedAmountMinor: number;
  refundedAmountMinor: number;
  remainingAmountMinor: number;
  currencyCode: string;
}

export interface EscrowStatusHistorySnapshot {
  timestamp: string;
  fromStatus: EscrowStatus | null;
  toStatus: EscrowStatus;
  amountMinor?: number;
  journalId?: string | null;
  reason?: string | null;
}

export interface EscrowMilestoneSnapshot {
  total: number;
  completed: number;
  pending: number;
  releaseAllocation: string;
}

export interface EscrowTrustContext {
  providerTrustScore: string;
  providerTrustTier: string;
  riskLevel: string;
}

export interface EscrowContractContext {
  category: string;
  duration: string;
  readiness: string;
}

export interface EscrowExperienceSource {
  escrow: EscrowAgreementSnapshot;
  financial: EscrowFinancialSnapshot;
  history: EscrowStatusHistorySnapshot[];
  releaseStrategy: EscrowReleaseStrategyDisplay;
  milestones: EscrowMilestoneSnapshot;
  trust: EscrowTrustContext;
  contract: EscrowContractContext;
}

export interface EscrowOverviewRequest {
  escrow_id: string;
  contract_id?: string;
}

export interface EscrowHistoryRequest {
  escrow_id: string;
}

export interface EscrowRequestValidationError {
  field: keyof EscrowOverviewRequest | keyof EscrowHistoryRequest;
  message: string;
}

export interface EscrowRequestValidationResult {
  valid: boolean;
  errors: EscrowRequestValidationError[];
}

export interface EscrowClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export type EscrowOverviewExecutor = (
  request: EscrowOverviewRequest
) => Promise<EscrowExperienceSource>;

export type EscrowHistoryExecutor = (
  request: EscrowHistoryRequest
) => Promise<EscrowExperienceSource>;

export interface EscrowClientOptions extends EscrowClientConfig {
  overviewExecutor?: EscrowOverviewExecutor;
  historyExecutor?: EscrowHistoryExecutor;
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

export interface EscrowSummaryCard extends ResponseCard {
  id: "escrow-summary";
}

export interface FinancialStatusCard extends ResponseCard {
  id: "financial-status";
}

export interface EscrowStateCard extends ResponseCard {
  id: "escrow-state";
}

export interface ReleaseStrategyCard extends ResponseCard {
  id: "release-strategy";
}

export interface EscrowMilestonesCard extends ResponseCard {
  id: "milestones";
}

export interface EscrowTrustCard extends ResponseCard {
  id: "trust-context";
}

export interface EscrowContractCard extends ResponseCard {
  id: "contract-context";
}

export interface EscrowOverviewView {
  escrow_status: EscrowStatus;
  escrow_summary: EscrowSummaryCard;
  financial_status: FinancialStatusCard;
  escrow_state: EscrowStateCard;
  release_strategy: ReleaseStrategyCard;
  milestones: EscrowMilestonesCard;
  trust_context: EscrowTrustCard;
  contract_context: EscrowContractCard;
}

export interface EscrowTimelineEventView {
  timestamp: string;
  event_type: EscrowTimelineEventType;
  amount: string;
  status_transition: string;
  label: string;
}

export interface EscrowHistoryView {
  escrow_id: string;
  events: EscrowTimelineEventView[];
}

export interface EscrowOverviewPageModel {
  page_id: "escrow-overview";
  title: string;
  description: string;
  view: EscrowOverviewView;
}

export interface EscrowHistoryPageModel {
  page_id: "escrow-history";
  title: string;
  description: string;
  view: EscrowHistoryView;
}

export interface EscrowOverviewResult {
  source: EscrowExperienceSource;
  view: EscrowOverviewView;
}

export interface EscrowHistoryResult {
  source: EscrowExperienceSource;
  view: EscrowHistoryView;
}
