import {
  RECOMMENDATION_INTELLIGENCE_FIXED_TIMESTAMP,
  RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
  RECOMMENDATION_CHAIN,
} from "./recommendation-intelligence-schema.js";
import type {
  RecommendationIntelligenceOutput,
  RecommendationIntelligenceSummary,
  RecommendationIntelligenceValidation,
} from "./recommendation-context.js";

export interface RecommendationIntelligenceHome {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  recommendation_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c9_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface RecommendationOutputScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  recommendation: RecommendationIntelligenceOutput;
  read_only: true;
}

export interface RecommendationPrioritizedScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  prioritized_recommendations: RecommendationIntelligenceOutput["prioritizedRecommendations"];
  recommendation_score: number;
  recommendation_confidence: RecommendationIntelligenceOutput["recommendationConfidence"];
  action_priority: RecommendationIntelligenceOutput["actionPriority"];
  read_only: true;
}

export interface RecommendationRoadmapScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  implementation_roadmap: RecommendationIntelligenceOutput["implementationRoadmap"];
  prerequisites: RecommendationIntelligenceOutput["prerequisites"];
  read_only: true;
}

export interface RecommendationOutcomesScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  expected_benefits: RecommendationIntelligenceOutput["expectedBenefits"];
  expected_trade_offs: RecommendationIntelligenceOutput["expectedTradeOffs"];
  success_probability: RecommendationIntelligenceOutput["successProbability"];
  read_only: true;
}

export interface RecommendationFallbacksScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  fallback_recommendations: RecommendationIntelligenceOutput["fallbackRecommendations"];
  optimization_opportunities: RecommendationIntelligenceOutput["optimizationOpportunities"];
  read_only: true;
}

export interface RecommendationExplanationScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: RecommendationIntelligenceOutput["explanation"];
  read_only: true;
}

export interface RecommendationSummaryScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  summary: RecommendationIntelligenceSummary;
  read_only: true;
}

export interface RecommendationValidationScreen {
  schema_version: typeof RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION;
  validation: RecommendationIntelligenceValidation;
  read_only: true;
}

export function buildRecommendationIntelligenceHome(input: {
  scenarios: RecommendationIntelligenceHome["scenarios"];
}): RecommendationIntelligenceHome {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Recommendation Intelligence",
    description:
      "Ranked actionable recommendations from the complete C1–C9 intelligence chain — read-only, no mutations.",
    recommendation_chain: RECOMMENDATION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c9_integration_note:
      "Delegates to CH4-C9 decision intelligence, which chains through C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: RECOMMENDATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildRecommendationIntelligenceSummary(
  output: RecommendationIntelligenceOutput
): RecommendationIntelligenceSummary {
  return {
    schemaVersion: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    recommendationScore: output.recommendationScore,
    recommendationConfidenceLevel: output.recommendationConfidence.level,
    actionPriority: output.actionPriority,
    prioritizedCount: output.prioritizedRecommendations.length,
    prerequisiteCount: output.prerequisites.length,
    successProbabilityScore: output.successProbability.score,
    recommendationChain: RECOMMENDATION_CHAIN,
    readOnly: true,
    generatedAt: RECOMMENDATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toRecommendationOutputScreen(
  output: RecommendationIntelligenceOutput
): RecommendationOutputScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    recommendation: output,
    read_only: true,
  };
}

export function toRecommendationPrioritizedScreen(
  output: RecommendationIntelligenceOutput
): RecommendationPrioritizedScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    prioritized_recommendations: output.prioritizedRecommendations,
    recommendation_score: output.recommendationScore,
    recommendation_confidence: output.recommendationConfidence,
    action_priority: output.actionPriority,
    read_only: true,
  };
}

export function toRecommendationRoadmapScreen(
  output: RecommendationIntelligenceOutput
): RecommendationRoadmapScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    implementation_roadmap: output.implementationRoadmap,
    prerequisites: output.prerequisites,
    read_only: true,
  };
}

export function toRecommendationOutcomesScreen(
  output: RecommendationIntelligenceOutput
): RecommendationOutcomesScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    expected_benefits: output.expectedBenefits,
    expected_trade_offs: output.expectedTradeOffs,
    success_probability: output.successProbability,
    read_only: true,
  };
}

export function toRecommendationFallbacksScreen(
  output: RecommendationIntelligenceOutput
): RecommendationFallbacksScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    fallback_recommendations: output.fallbackRecommendations,
    optimization_opportunities: output.optimizationOpportunities,
    read_only: true,
  };
}

export function toRecommendationExplanationScreen(
  output: RecommendationIntelligenceOutput
): RecommendationExplanationScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    read_only: true,
  };
}

export function toRecommendationSummaryScreen(
  summary: RecommendationIntelligenceSummary
): RecommendationSummaryScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toRecommendationValidationScreen(
  validation: RecommendationIntelligenceValidation
): RecommendationValidationScreen {
  return {
    schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
