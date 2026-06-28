import {
  DECISION_INTELLIGENCE_FIXED_TIMESTAMP,
  DECISION_INTELLIGENCE_SCHEMA_VERSION,
  DECISION_CHAIN,
} from "./decision-intelligence-schema.js";
import type {
  DecisionIntelligenceRecommendation,
  DecisionIntelligenceSummary,
  DecisionIntelligenceValidation,
} from "./decision-context.js";

export interface DecisionIntelligenceHome {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  decision_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c8_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface DecisionRecommendationScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation: DecisionIntelligenceRecommendation;
  read_only: true;
}

export interface DecisionReadinessScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  decision_readiness: DecisionIntelligenceRecommendation["decisionReadiness"];
  recommended_decision: DecisionIntelligenceRecommendation["recommendedDecision"];
  decision_confidence: DecisionIntelligenceRecommendation["decisionConfidence"];
  read_only: true;
}

export interface DecisionFactorsScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  blocking_factors: DecisionIntelligenceRecommendation["blockingFactors"];
  supporting_factors: DecisionIntelligenceRecommendation["supportingFactors"];
  required_approvals: DecisionIntelligenceRecommendation["requiredApprovals"];
  decision_rationale: string;
  read_only: true;
}

export interface DecisionAlternativesScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  alternative_options: DecisionIntelligenceRecommendation["alternativeOptions"];
  mitigation_recommendations: DecisionIntelligenceRecommendation["mitigationRecommendations"];
  expected_impact_analysis: DecisionIntelligenceRecommendation["expectedImpactAnalysis"];
  read_only: true;
}

export interface DecisionExplanationScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation_id: string;
  explanation: DecisionIntelligenceRecommendation["explanation"];
  read_only: true;
}

export interface DecisionSummaryScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  summary: DecisionIntelligenceSummary;
  read_only: true;
}

export interface DecisionValidationScreen {
  schema_version: typeof DECISION_INTELLIGENCE_SCHEMA_VERSION;
  validation: DecisionIntelligenceValidation;
  read_only: true;
}

export function buildDecisionIntelligenceHome(input: {
  scenarios: DecisionIntelligenceHome["scenarios"];
}): DecisionIntelligenceHome {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Decision Intelligence",
    description:
      "Deterministic decision recommendations from the complete C1–C8 intelligence chain — read-only, no mutations.",
    decision_chain: DECISION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c8_integration_note:
      "Delegates to CH4-C8 trust intelligence, which chains through C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: DECISION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildDecisionIntelligenceSummary(
  recommendation: DecisionIntelligenceRecommendation
): DecisionIntelligenceSummary {
  return {
    schemaVersion: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendationId: recommendation.recommendationId,
    goal: recommendation.goal,
    scenarioId: recommendation.scenarioId,
    recommendedDecision: recommendation.recommendedDecision,
    decisionReadinessLevel: recommendation.decisionReadiness.level,
    decisionConfidenceLevel: recommendation.decisionConfidence.level,
    blockingFactorCount: recommendation.blockingFactors.length,
    supportingFactorCount: recommendation.supportingFactors.length,
    decisionChain: DECISION_CHAIN,
    readOnly: true,
    generatedAt: DECISION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toDecisionRecommendationScreen(
  recommendation: DecisionIntelligenceRecommendation
): DecisionRecommendationScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation,
    read_only: true,
  };
}

export function toDecisionReadinessScreen(
  recommendation: DecisionIntelligenceRecommendation
): DecisionReadinessScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    decision_readiness: recommendation.decisionReadiness,
    recommended_decision: recommendation.recommendedDecision,
    decision_confidence: recommendation.decisionConfidence,
    read_only: true,
  };
}

export function toDecisionFactorsScreen(
  recommendation: DecisionIntelligenceRecommendation
): DecisionFactorsScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    blocking_factors: recommendation.blockingFactors,
    supporting_factors: recommendation.supportingFactors,
    required_approvals: recommendation.requiredApprovals,
    decision_rationale: recommendation.decisionRationale,
    read_only: true,
  };
}

export function toDecisionAlternativesScreen(
  recommendation: DecisionIntelligenceRecommendation
): DecisionAlternativesScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    alternative_options: recommendation.alternativeOptions,
    mitigation_recommendations: recommendation.mitigationRecommendations,
    expected_impact_analysis: recommendation.expectedImpactAnalysis,
    read_only: true,
  };
}

export function toDecisionExplanationScreen(
  recommendation: DecisionIntelligenceRecommendation
): DecisionExplanationScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation_id: recommendation.recommendationId,
    explanation: recommendation.explanation,
    read_only: true,
  };
}

export function toDecisionSummaryScreen(summary: DecisionIntelligenceSummary): DecisionSummaryScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toDecisionValidationScreen(
  validation: DecisionIntelligenceValidation
): DecisionValidationScreen {
  return {
    schema_version: DECISION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
