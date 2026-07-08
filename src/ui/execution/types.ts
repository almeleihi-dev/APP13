import type { MilestoneStatus } from "../../execution/domain/milestone.js";
import type { ContractStatus } from "../../contract/domain/contract.js";
import type { RequestExecutor } from "../../integration/request-executor.js";

export type { MilestoneStatus, ContractStatus };

export interface ContractSnapshot {
  id: string;
  contractNumber: string;
  status: ContractStatus;
  title: string;
  category: string;
  duration: string;
}

export interface ProjectProgressSnapshot {
  totalMilestones: number;
  completedMilestones: number;
  blockingTotal: number;
  blockingCompleted: number;
  percentComplete: number;
}

export interface MilestoneSnapshot {
  id: string;
  milestoneCode: string;
  name: string;
  sequenceOrder: number;
  status: MilestoneStatus;
  responsibleParty: string;
  tekrrDimension: string | null;
  blocking: boolean;
  dueAt: string | null;
  startedAt: string | null;
  submittedAt: string | null;
  acceptedAt: string | null;
  evidenceCount: number;
}

export interface EvidenceItemSnapshot {
  id: string;
  milestoneId: string;
  evidenceType: string;
  submittedAt: string;
  contentHash: string | null;
}

export interface EvidenceSummarySnapshot {
  totalCount: number;
  byType: Record<string, number>;
  latestSubmittedAt: string | null;
  items: EvidenceItemSnapshot[];
}

export interface AcceptanceSnapshot {
  totalAttestations: number;
  resolvedAttestations: number;
  pendingAttestations: number;
  ratings: Array<{ dimension: string; rating: string }>;
}

export interface EscrowStatusSnapshot {
  escrowId: string;
  status: string;
  heldAmountLabel: string;
  releasedAmountLabel: string;
  remainingAmountLabel: string;
}

export interface ExecutionTimelineEventSnapshot {
  timestamp: string;
  eventType: string;
  label: string;
  milestoneId?: string;
  statusTransition?: string;
}

export interface RiskIndicatorSnapshot {
  frozenMilestones: number;
  disputedMilestones: number;
  pendingAttestations: number;
  escrowFrozen: boolean;
  openIssues: number;
  indicators: string[];
}

export interface EvaluationSnapshot {
  status: "pending" | "submitted";
  rating?: number;
  compositeScore?: number;
  submittedAt?: string;
  comment?: string;
}

export interface ExecutionExperienceSource {
  contract: ContractSnapshot;
  progress: ProjectProgressSnapshot;
  milestones: MilestoneSnapshot[];
  evidence: EvidenceSummarySnapshot;
  acceptance: AcceptanceSnapshot;
  escrow: EscrowStatusSnapshot;
  timeline: ExecutionTimelineEventSnapshot[];
  risk: RiskIndicatorSnapshot;
  evaluation: EvaluationSnapshot;
}

export interface ExecutionDashboardRequest {
  contract_id: string;
}

export interface MilestoneDetailsRequest {
  contract_id: string;
  milestone_id: string;
}

export interface ExecutionRequestValidationError {
  field: keyof ExecutionDashboardRequest | keyof MilestoneDetailsRequest;
  message: string;
}

export interface ExecutionRequestValidationResult {
  valid: boolean;
  errors: ExecutionRequestValidationError[];
}

export interface ExecutionClientConfig {
  baseUrl?: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type ExecutionDashboardExecutor = (
  request: ExecutionDashboardRequest
) => Promise<ExecutionExperienceSource>;

export type MilestoneDetailsExecutor = (
  request: MilestoneDetailsRequest
) => Promise<ExecutionExperienceSource>;

export interface ExecutionClientOptions extends ExecutionClientConfig {
  dashboardExecutor?: ExecutionDashboardExecutor;
  milestoneDetailsExecutor?: MilestoneDetailsExecutor;
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

export interface ProjectStatusCard extends ResponseCard {
  id: "project-status";
}

export interface ProgressCard extends ResponseCard {
  id: "progress";
}

export interface ActiveMilestonesCard extends ResponseCard {
  id: "active-milestones";
}

export interface EvidenceSummaryCard extends ResponseCard {
  id: "evidence-summary";
}

export interface AcceptanceStatusCard extends ResponseCard {
  id: "acceptance-status";
}

export interface EscrowStatusCard extends ResponseCard {
  id: "escrow-status";
}

export interface ExecutionTimelineCard extends ResponseCard {
  id: "timeline";
}

export interface RiskIndicatorsCard extends ResponseCard {
  id: "risk-indicators";
}

export interface FinalEvaluationCard extends ResponseCard {
  id: "final-evaluation";
}

export interface ExecutionDashboardView {
  contract_status: ContractStatus;
  project_status: ProjectStatusCard;
  progress: ProgressCard;
  active_milestones: ActiveMilestonesCard;
  evidence_summary: EvidenceSummaryCard;
  acceptance_status: AcceptanceStatusCard;
  escrow_status: EscrowStatusCard;
  timeline: ExecutionTimelineCard;
  risk_indicators: RiskIndicatorsCard;
  final_evaluation: FinalEvaluationCard;
}

export interface MilestoneDetailsView {
  contract_id: string;
  milestone: MilestoneSnapshot;
  evidence: EvidenceItemSnapshot[];
  acceptance_ratings: AcceptanceSnapshot["ratings"];
  escrow_status: string;
  release_allocation: string;
}

export interface ExecutionDashboardPageModel {
  page_id: "execution-dashboard";
  title: string;
  description: string;
  view: ExecutionDashboardView;
}

export interface MilestoneDetailsPageModel {
  page_id: "milestone-details";
  title: string;
  description: string;
  view: MilestoneDetailsView;
}

export interface ExecutionDashboardResult {
  source: ExecutionExperienceSource;
  view: ExecutionDashboardView;
}

export interface MilestoneDetailsResult {
  source: ExecutionExperienceSource;
  view: MilestoneDetailsView;
}
