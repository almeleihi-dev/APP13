export type IdentityVerificationLevel =
  | "unknown"
  | "bronze"
  | "silver"
  | "gold"
  | "iron";

export type TrustTier = "platinum" | "emerald" | "gold" | "silver" | "restricted";

export type LiveFrameColor = "platinum" | "emerald" | "gold" | "silver" | "gray";

export type TrustRecommendation = "trusted" | "conditional" | "restricted";

export interface TrustBehaviorMetrics {
  completed_contracts: number;
  completion_rate: number;
  average_rating: number;
  refund_rate: number;
  issue_rate: number;
  evidence_quality_score: number;
  identity_verification_level: IdentityVerificationLevel | string;
}

export interface TrustCalculateInput {
  provider_id: string;
  metrics: TrustBehaviorMetrics;
}

export interface TrustComponentScores {
  verification: number;
  rating: number;
  completion: number;
  issues: number;
  refunds: number;
  evidence: number;
}

export interface TrustCalculateResult {
  trust_score: number;
  trust_tier: TrustTier;
  live_frame_color: LiveFrameColor;
  component_scores: TrustComponentScores;
  recommendation: TrustRecommendation;
  restrictions: string[];
}

export interface TrustScoreWeights {
  verification: number;
  completion: number;
  rating: number;
  issues: number;
  refunds: number;
  evidence: number;
}
