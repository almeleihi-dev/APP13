import {
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-recommendation-intelligence-experience-schema.js";
import type {
  AiRecommendationIntelligenceExperienceOutput,
  AiRecommendationIntelligenceExperienceSummary,
  AiRecommendationIntelligenceExperienceValidation,
} from "./ai-recommendation-intelligence-experience-context.js";

export interface AiRecommendationIntelligenceExperienceHome {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  recommendation_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  recommendation_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface RecommendationIntelligenceContextScreen {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  recommendation_context: AiRecommendationIntelligenceExperienceOutput["recommendationContext"];
  recommendation_confidence: AiRecommendationIntelligenceExperienceOutput["recommendationConfidence"];
  read_only: true;
}

export interface RecommendationIntelligenceDomainScreen {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface RecommendationIntelligenceExplanationScreen {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiRecommendationIntelligenceExperienceOutput["recommendationExplanation"];
  recommendation_confidence: AiRecommendationIntelligenceExperienceOutput["recommendationConfidence"];
  read_only: true;
}

export interface RecommendationIntelligenceSummaryScreen {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiRecommendationIntelligenceExperienceSummary;
  read_only: true;
}

export interface RecommendationIntelligenceValidationScreen {
  schema_version: typeof AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiRecommendationIntelligenceExperienceValidation;
  read_only: true;
}

const RECOMMENDATION_INTELLIGENCE_VIEWS = [
  "Recommendation Context",
  "Personalized Recommendations",
  "Priority Recommendations",
  "Opportunity Recommendations",
  "Risk Mitigation Recommendations",
  "Strategic Recommendations",
  "Recommendation Confidence",
  "Recommendation Readiness",
  "Delegation",
] as const;

export function buildAiRecommendationIntelligenceExperienceHome(input: {
  scenarios: AiRecommendationIntelligenceExperienceHome["scenarios"];
}): AiRecommendationIntelligenceExperienceHome {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Recommendation Intelligence Experience",
    description:
      "Read-only AI Recommendation Intelligence Experience for Chapter 5 — delegates-only via CH5-X9 AI Insight Generation Experience.",
    recommendation_intelligence_chain: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    recommendation_intelligence_views: RECOMMENDATION_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiRecommendationIntelligenceExperienceSummary(
  output: AiRecommendationIntelligenceExperienceOutput
): AiRecommendationIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    recommendationConfidenceLevel: output.recommendationConfidence.level,
    recommendationConfidenceScore: output.recommendationConfidence.score,
    recommendationReady: output.recommendationReadiness.recommendationReady,
    personalizedCount: output.personalizedRecommendations.recommendations.length,
    priorityCount: output.priorityRecommendations.recommendations.length,
    opportunityCount: output.opportunityRecommendations.recommendations.length,
    mitigationCount: output.riskMitigationRecommendations.recommendations.length,
    strategicCount: output.strategicRecommendations.recommendations.length,
    recommendationIntelligenceChain: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toRecommendationIntelligenceContextScreen(
  output: AiRecommendationIntelligenceExperienceOutput
): RecommendationIntelligenceContextScreen {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    recommendation_context: output.recommendationContext,
    recommendation_confidence: output.recommendationConfidence,
    read_only: true,
  };
}

export function toRecommendationIntelligenceDomainScreen<T>(
  output: AiRecommendationIntelligenceExperienceOutput,
  view: T
): RecommendationIntelligenceDomainScreen {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toRecommendationIntelligenceExplanationScreen(
  output: AiRecommendationIntelligenceExperienceOutput
): RecommendationIntelligenceExplanationScreen {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.recommendationExplanation,
    recommendation_confidence: output.recommendationConfidence,
    read_only: true,
  };
}

export function toRecommendationIntelligenceSummaryScreen(
  summary: AiRecommendationIntelligenceExperienceSummary
): RecommendationIntelligenceSummaryScreen {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toRecommendationIntelligenceValidationScreen(
  validation: AiRecommendationIntelligenceExperienceValidation
): RecommendationIntelligenceValidationScreen {
  return {
    schema_version: AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
