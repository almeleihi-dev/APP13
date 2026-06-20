import type { RequirementExtractResult } from "../../action/intelligence/requirement/types.js";
import type { ContractGenerateResult } from "../../contract/intelligence/types.js";
import type { MatchingRankResult } from "../../matching/intelligence/types.js";
import type { NegotiationAnalyzeResult } from "../../negotiation/intelligence/types.js";
import type { PricingCalculateResult } from "../../pricing/intelligence/types.js";
import type { TrustCalculateResult } from "../../trust/intelligence/types.js";

export type WorkflowStatus = "ready" | "needs_clarification" | "no_provider_match";

export interface ProviderCandidate {
  provider_id: string;
  action_codes: string[];
  skills: string[];
  trust_score: number;
  rating: number;
  price_offer?: number;
  estimated_days?: number;
  latitude?: number;
  longitude?: number;
}

export interface WorkflowAnalyzeInput {
  profession?: string;
  requirement_text: string;
  customer_budget?: number;
  customer_days?: number;
  providers: ProviderCandidate[];
}

export interface WorkflowMatchingResult extends MatchingRankResult {
  selected_provider_id: string | null;
}

export interface WorkflowSummary {
  provider_id: string | null;
  recommended_price: number | null;
  trust_score: number | null;
  negotiation_state: string | null;
}

export interface WorkflowAnalyzeResult {
  workflow_status: WorkflowStatus;
  requirement: RequirementExtractResult;
  matching: WorkflowMatchingResult;
  pricing: PricingCalculateResult | null;
  negotiation: NegotiationAnalyzeResult | null;
  contract: ContractGenerateResult | null;
  trust: TrustCalculateResult | null;
  summary: WorkflowSummary;
}
