import {
  TRUST_INTELLIGENCE_FIXED_TIMESTAMP,
  TRUST_INTELLIGENCE_SCHEMA_VERSION,
  TRUST_CHAIN,
} from "./trust-intelligence-schema.js";
import type {
  TrustIntelligenceRecommendation,
  TrustIntelligenceSummary,
  TrustIntelligenceValidation,
} from "./trust-context.js";

export interface TrustIntelligenceHome {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  trust_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c7_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface TrustRecommendationScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  recommendation: TrustIntelligenceRecommendation;
  read_only: true;
}

export interface TrustReadinessScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  trust_readiness: TrustIntelligenceRecommendation["trustReadiness"];
  verification_confidence: TrustIntelligenceRecommendation["verificationConfidence"];
  evidence_completeness: TrustIntelligenceRecommendation["evidenceCompleteness"];
  read_only: true;
}

export interface TrustScoreScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  trust_score_recommendation: TrustIntelligenceRecommendation["trustScoreRecommendation"];
  risk_confidence: TrustIntelligenceRecommendation["riskConfidence"];
  read_only: true;
}

export interface TrustReputationScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  reputation_projection: TrustIntelligenceRecommendation["reputationProjection"];
  provider_reliability_projection: TrustIntelligenceRecommendation["providerReliabilityProjection"];
  customer_reliability_projection: TrustIntelligenceRecommendation["customerReliabilityProjection"];
  platform_trust_recommendation: TrustIntelligenceRecommendation["platformTrustRecommendation"];
  read_only: true;
}

export interface TrustExplanationScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  explanation: TrustIntelligenceRecommendation["explanation"];
  trust_confidence: TrustIntelligenceRecommendation["trustConfidence"];
  read_only: true;
}

export interface TrustSummaryScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  summary: TrustIntelligenceSummary;
  read_only: true;
}

export interface TrustValidationScreen {
  schema_version: typeof TRUST_INTELLIGENCE_SCHEMA_VERSION;
  validation: TrustIntelligenceValidation;
  read_only: true;
}

export function buildTrustIntelligenceHome(input: {
  scenarios: TrustIntelligenceHome["scenarios"];
}): TrustIntelligenceHome {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Trust Intelligence",
    description:
      "Deterministic, explainable trust recommendations from the complete C1–C7 intelligence chain — read-only, no trust mutations.",
    trust_chain: TRUST_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c7_integration_note:
      "Delegates to CH4-C7 outcome intelligence, which chains through C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: TRUST_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildTrustIntelligenceSummary(
  recommendation: TrustIntelligenceRecommendation
): TrustIntelligenceSummary {
  return {
    schemaVersion: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendationId: recommendation.recommendationId,
    goal: recommendation.goal,
    scenarioId: recommendation.scenarioId,
    trustReadinessLevel: recommendation.trustReadiness.level,
    recommendedTrustScore: recommendation.trustScoreRecommendation.recommendedScore,
    reputationTier: recommendation.reputationProjection.projectedTier,
    evidenceCompletenessScore: recommendation.evidenceCompleteness.score,
    trustConfidenceLevel: recommendation.trustConfidence.level,
    trustChain: TRUST_CHAIN,
    readOnly: true,
    generatedAt: TRUST_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toTrustRecommendationScreen(
  recommendation: TrustIntelligenceRecommendation
): TrustRecommendationScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendation,
    read_only: true,
  };
}

export function toTrustReadinessScreen(
  recommendation: TrustIntelligenceRecommendation
): TrustReadinessScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    trust_readiness: recommendation.trustReadiness,
    verification_confidence: recommendation.verificationConfidence,
    evidence_completeness: recommendation.evidenceCompleteness,
    read_only: true,
  };
}

export function toTrustScoreScreen(
  recommendation: TrustIntelligenceRecommendation
): TrustScoreScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    trust_score_recommendation: recommendation.trustScoreRecommendation,
    risk_confidence: recommendation.riskConfidence,
    read_only: true,
  };
}

export function toTrustReputationScreen(
  recommendation: TrustIntelligenceRecommendation
): TrustReputationScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    reputation_projection: recommendation.reputationProjection,
    provider_reliability_projection: recommendation.providerReliabilityProjection,
    customer_reliability_projection: recommendation.customerReliabilityProjection,
    platform_trust_recommendation: recommendation.platformTrustRecommendation,
    read_only: true,
  };
}

export function toTrustExplanationScreen(
  recommendation: TrustIntelligenceRecommendation
): TrustExplanationScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    explanation: recommendation.explanation,
    trust_confidence: recommendation.trustConfidence,
    read_only: true,
  };
}

export function toTrustSummaryScreen(summary: TrustIntelligenceSummary): TrustSummaryScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toTrustValidationScreen(
  validation: TrustIntelligenceValidation
): TrustValidationScreen {
  return {
    schema_version: TRUST_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
