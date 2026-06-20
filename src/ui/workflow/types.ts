import type {
  ProviderCandidate,
  WorkflowAnalyzeInput,
  WorkflowAnalyzeResult,
} from "../../orchestrator/intelligence/types.js";

export type { WorkflowAnalyzeResult, ProviderCandidate };

export interface CustomerRequestInput {
  request_text: string;
  budget?: number;
  preferred_days?: number;
}

export interface CustomerRequestValidationError {
  field: keyof CustomerRequestInput | "request_text";
  message: string;
}

export interface CustomerRequestValidationResult {
  valid: boolean;
  errors: CustomerRequestValidationError[];
}

export interface WorkflowClientConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
}

export type WorkflowAnalyzeExecutor = (
  input: WorkflowAnalyzeInput
) => Promise<WorkflowAnalyzeResult>;

export interface WorkflowClientOptions extends WorkflowClientConfig {
  executor?: WorkflowAnalyzeExecutor;
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

export interface RequestSummaryCard extends ResponseCard {
  id: "request";
}

export interface ProviderResponseCard extends ResponseCard {
  id: "provider";
}

export interface TrustResponseCard extends ResponseCard {
  id: "trust";
}

export interface PricingResponseCard extends ResponseCard {
  id: "pricing";
}

export interface NegotiationResponseCard extends ResponseCard {
  id: "negotiation";
}

export interface ContractResponseCard extends ResponseCard {
  id: "contract";
}

export interface WorkflowResultView {
  workflow_status: WorkflowAnalyzeResult["workflow_status"];
  request_summary: RequestSummaryCard;
  requirement_classification: CardField[];
  provider: ProviderResponseCard;
  trust: TrustResponseCard;
  pricing: PricingResponseCard;
  negotiation: NegotiationResponseCard;
  contract: ContractResponseCard;
}

export interface RequestAnalysisPageModel {
  page_id: "request-analysis";
  title: string;
  description: string;
  submit_label: string;
  fields: Array<{
    name: keyof CustomerRequestInput;
    label: string;
    required: boolean;
    type: "text" | "number";
    placeholder?: string;
  }>;
}

export interface RequestResultPageModel {
  page_id: "request-result";
  title: string;
  description: string;
  view: WorkflowResultView;
}

export interface AnalyzeRequestResult {
  request: CustomerRequestInput;
  workflow: WorkflowAnalyzeResult;
  view: WorkflowResultView;
}
