export type NegotiationState = "likely_agreement" | "negotiable" | "difficult" | "unlikely";

export type RiskProfile = "low" | "medium" | "high";

export type RecommendedEscrow =
  | "single_release"
  | "two_stage"
  | "four_stage"
  | "milestone_based";

export interface NegotiationAnalyzeInput {
  customer_offer: number;
  provider_offer: number;
  customer_days?: number;
  provider_days?: number;
  scope_items?: number;
  trust_score?: number;
  risk_profile?: RiskProfile;
  contract_value?: number;
}

export interface NegotiationAnalyzeResult {
  negotiation_state: NegotiationState;
  agreement_probability: number;
  recommended_price: number;
  recommended_days?: number;
  recommended_escrow: RecommendedEscrow;
  compromises: string[];
  explanation: string;
}

export interface NegotiationAnalysisContext {
  price_gap_percent: number;
  days_gap: number | null;
  scope_items: number;
  trust_score: number | null;
  risk_profile: RiskProfile | null;
}
