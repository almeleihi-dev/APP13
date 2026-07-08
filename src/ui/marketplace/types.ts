import type {
  ProviderCandidate,
  WorkflowAnalyzeInput,
  WorkflowAnalyzeResult,
} from "../../orchestrator/intelligence/types.js";
import type { RequestExecutor } from "../../integration/request-executor.js";

export type { WorkflowAnalyzeInput, WorkflowAnalyzeResult, ProviderCandidate };

export interface MarketplaceSearchInput {
  request_text: string;
  budget?: number;
  preferred_days?: number;
  category?: string;
}

export type MarketplaceSearchField = keyof MarketplaceSearchInput;

export interface MarketplaceSearchValidationError {
  field: MarketplaceSearchField;
  message: string;
}

export interface MarketplaceSearchValidationResult {
  valid: boolean;
  errors: MarketplaceSearchValidationError[];
}

export interface MarketplaceClientConfig {
  baseUrl: string;
  authToken?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  requestExecutor?: RequestExecutor;
}

export type MarketplaceWorkflowExecutor = (
  input: WorkflowAnalyzeInput
) => Promise<WorkflowAnalyzeResult>;

export interface MarketplaceClientOptions extends MarketplaceClientConfig {
  executor?: MarketplaceWorkflowExecutor;
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

export interface MarketplaceRequestSummaryCard extends ResponseCard {
  id: "request-summary";
}

export interface MarketplaceTopProviderCard extends ResponseCard {
  id: "top-provider";
}

export interface MarketplacePricingCard extends ResponseCard {
  id: "pricing";
}

export interface MarketplaceNegotiationCard extends ResponseCard {
  id: "negotiation";
}

export interface MarketplaceContractCard extends ResponseCard {
  id: "contract";
}

export interface MarketplaceMatchCard extends ResponseCard {
  id: "marketplace-match";
}

export interface ProviderCardView {
  provider_id: string;
  display_name: string;
  trust_score: string;
  trust_tier: string;
  live_frame_color: string;
  availability: string;
  price_position: string;
  ranking_position: number;
  match_score: string;
  recommendation: string;
}

export interface MarketplaceResultsView {
  workflow_status: WorkflowAnalyzeResult["workflow_status"];
  request_summary: MarketplaceRequestSummaryCard;
  top_provider: MarketplaceTopProviderCard;
  pricing: MarketplacePricingCard;
  negotiation: MarketplaceNegotiationCard;
  contract: MarketplaceContractCard;
  marketplace_match: MarketplaceMatchCard;
  provider_cards: ProviderCardView[];
}

export interface MarketplaceSearchPageModel {
  page_id: "marketplace-search";
  title: string;
  description: string;
  submit_label: string;
  fields: Array<{
    name: MarketplaceSearchField;
    label: string;
    required: boolean;
    type: "text" | "number";
    placeholder?: string;
  }>;
}

export interface MarketplaceResultsPageModel {
  page_id: "marketplace-results";
  title: string;
  description: string;
  view: MarketplaceResultsView;
}

export interface AnalyzeMarketplaceResult {
  request: MarketplaceSearchInput;
  workflow: WorkflowAnalyzeResult;
  view: MarketplaceResultsView;
}
