import type { WorkflowAnalyzeInput, WorkflowAnalyzeResult } from "../../orchestrator/intelligence/types.js";
import type { RequestExecutor } from "../../integration/request-executor.js";

export type { WorkflowAnalyzeInput, WorkflowAnalyzeResult };

export interface ContractReviewContext {
  customer_id?: string;
  customer_label?: string;
  provider_id?: string;
  category?: string;
  duration_days?: number;
  requirement_text?: string;
}

export interface ContractWorkflowInput {
  request_text: string;
  budget?: number;
  preferred_days?: number;
  category?: string;
  customer_id?: string;
  customer_label?: string;
}

export interface ContractReviewInput {
  workflow: WorkflowAnalyzeResult;
  context?: ContractReviewContext;
}

export interface ContractReviewValidationError {
  field: "workflow" | "context" | "workflow_status" | "requirement";
  message: string;
}

export interface ContractReviewValidationResult {
  valid: boolean;
  errors: ContractReviewValidationError[];
}

export interface ContractClientConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type ContractWorkflowExecutor = (
  input: WorkflowAnalyzeInput
) => Promise<WorkflowAnalyzeResult>;

export interface ContractClientOptions extends ContractClientConfig {
  executor?: ContractWorkflowExecutor;
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

export interface ContractSummaryCard extends ResponseCard {
  id: "contract-summary";
}

export interface PartiesCard extends ResponseCard {
  id: "parties";
}

export interface ScopeCard extends ResponseCard {
  id: "scope";
}

export interface MilestonesCard extends ResponseCard {
  id: "milestones";
}

export interface ContractPricingCard extends ResponseCard {
  id: "pricing";
}

export interface ContractNegotiationCard extends ResponseCard {
  id: "negotiation";
}

export interface ContractTrustCard extends ResponseCard {
  id: "trust";
}

export interface EscrowCard extends ResponseCard {
  id: "escrow";
}

export interface ContractRiskCard extends ResponseCard {
  id: "risk";
}

export interface ContractSummaryView {
  workflow_status: WorkflowAnalyzeResult["workflow_status"];
  contract_summary: ContractSummaryCard;
  parties: PartiesCard;
  scope: ScopeCard;
  milestones: MilestonesCard;
  pricing: ContractPricingCard;
  negotiation: ContractNegotiationCard;
  trust: ContractTrustCard;
  escrow: EscrowCard;
  risk: ContractRiskCard;
}

export interface ContractReviewPageModel {
  page_id: "contract-review";
  title: string;
  description: string;
  workflow_status: WorkflowAnalyzeResult["workflow_status"];
  contract_readiness: string;
  view: ContractSummaryView;
}

export interface ContractSummaryPageModel {
  page_id: "contract-summary";
  title: string;
  description: string;
  view: ContractSummaryView;
}

export interface ContractReviewResult {
  workflow: WorkflowAnalyzeResult;
  context: ContractReviewContext;
  view: ContractSummaryView;
}

export interface AnalyzeContractReviewResult extends ContractReviewResult {
  request: ContractWorkflowInput;
}
