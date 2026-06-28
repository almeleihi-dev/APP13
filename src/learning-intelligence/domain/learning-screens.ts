import {
  LEARNING_INTELLIGENCE_FIXED_TIMESTAMP,
  LEARNING_INTELLIGENCE_SCHEMA_VERSION,
  LEARNING_CHAIN,
} from "./learning-intelligence-schema.js";
import type {
  LearningIntelligenceOutput,
  LearningIntelligenceSummary,
  LearningIntelligenceValidation,
} from "./learning-context.js";

export interface LearningIntelligenceHome {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  learning_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c13_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface LearningInsightsScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  learning_insights: LearningIntelligenceOutput["learningInsights"];
  knowledge_gaps: LearningIntelligenceOutput["knowledgeGaps"];
  lessons_learned: LearningIntelligenceOutput["lessonsLearned"];
  read_only: true;
}

export interface LearningAdaptationScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  adaptation_recommendations: LearningIntelligenceOutput["adaptationRecommendations"];
  strategy_adjustments: LearningIntelligenceOutput["strategyAdjustments"];
  read_only: true;
}

export interface LearningImprovementScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  continuous_improvement_cycles: LearningIntelligenceOutput["continuousImprovementCycles"];
  feedback_loops: LearningIntelligenceOutput["feedbackLoops"];
  performance_improvement_opportunities: LearningIntelligenceOutput["performanceImprovementOpportunities"];
  read_only: true;
}

export interface LearningPatternsScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  learning_patterns: LearningIntelligenceOutput["learningPatterns"];
  skill_development_recommendations: LearningIntelligenceOutput["skillDevelopmentRecommendations"];
  read_only: true;
}

export interface LearningExplanationScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: LearningIntelligenceOutput["explanation"];
  learning_confidence: LearningIntelligenceOutput["learningConfidence"];
  read_only: true;
}

export interface LearningSummaryScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  summary: LearningIntelligenceSummary;
  read_only: true;
}

export interface LearningValidationScreen {
  schema_version: typeof LEARNING_INTELLIGENCE_SCHEMA_VERSION;
  validation: LearningIntelligenceValidation;
  read_only: true;
}

export function buildLearningIntelligenceHome(input: {
  scenarios: LearningIntelligenceHome["scenarios"];
}): LearningIntelligenceHome {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Learning Intelligence",
    description:
      "Deterministic learning, adaptation, and continuous-improvement intelligence from the complete C1–C13 chain — read-only, no mutations.",
    learning_chain: LEARNING_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c13_integration_note:
      "Delegates to CH4-C13 strategy intelligence, which chains through C12 prediction, C11 insight, C10 recommendation, C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: LEARNING_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildLearningIntelligenceSummary(
  output: LearningIntelligenceOutput
): LearningIntelligenceSummary {
  return {
    schemaVersion: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    learningConfidenceLevel: output.learningConfidence.level,
    learningConfidenceScore: output.learningConfidence.score,
    learningInsightCount: output.learningInsights.length,
    knowledgeGapCount: output.knowledgeGaps.length,
    adaptationCount: output.adaptationRecommendations.length,
    improvementCycleCount: output.continuousImprovementCycles.length,
    patternCount: output.learningPatterns.length,
    learningChain: LEARNING_CHAIN,
    readOnly: true,
    generatedAt: LEARNING_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toLearningInsightsScreen(output: LearningIntelligenceOutput): LearningInsightsScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    learning_insights: output.learningInsights,
    knowledge_gaps: output.knowledgeGaps,
    lessons_learned: output.lessonsLearned,
    read_only: true,
  };
}

export function toLearningAdaptationScreen(output: LearningIntelligenceOutput): LearningAdaptationScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    adaptation_recommendations: output.adaptationRecommendations,
    strategy_adjustments: output.strategyAdjustments,
    read_only: true,
  };
}

export function toLearningImprovementScreen(output: LearningIntelligenceOutput): LearningImprovementScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    continuous_improvement_cycles: output.continuousImprovementCycles,
    feedback_loops: output.feedbackLoops,
    performance_improvement_opportunities: output.performanceImprovementOpportunities,
    read_only: true,
  };
}

export function toLearningPatternsScreen(output: LearningIntelligenceOutput): LearningPatternsScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    learning_patterns: output.learningPatterns,
    skill_development_recommendations: output.skillDevelopmentRecommendations,
    read_only: true,
  };
}

export function toLearningExplanationScreen(output: LearningIntelligenceOutput): LearningExplanationScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    learning_confidence: output.learningConfidence,
    read_only: true,
  };
}

export function toLearningSummaryScreen(summary: LearningIntelligenceSummary): LearningSummaryScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toLearningValidationScreen(
  validation: LearningIntelligenceValidation
): LearningValidationScreen {
  return {
    schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
