import {
  OUTCOME_INTELLIGENCE_FIXED_TIMESTAMP,
  OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
  OUTCOME_CHAIN,
} from "./outcome-intelligence-schema.js";
import type {
  OutcomeIntelligenceEvaluation,
  OutcomeIntelligenceSummary,
  OutcomeIntelligenceValidation,
} from "./outcome-context.js";

export interface OutcomeIntelligenceHome {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  outcome_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c6_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface OutcomeEvaluationScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  evaluation: OutcomeIntelligenceEvaluation;
  read_only: true;
}

export interface OutcomeExpectedScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  evaluation_id: string;
  expected_outcomes: OutcomeIntelligenceEvaluation["expectedOutcomes"];
  success_criteria_evaluations: OutcomeIntelligenceEvaluation["successCriteriaEvaluations"];
  read_only: true;
}

export interface OutcomeCompletionScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  evaluation_id: string;
  completion_outcome_model: OutcomeIntelligenceEvaluation["completionOutcomeModel"];
  deliverable_verification_summaries: OutcomeIntelligenceEvaluation["deliverableVerificationSummaries"];
  milestone_completion_summaries: OutcomeIntelligenceEvaluation["milestoneCompletionSummaries"];
  goal_achievement_analysis: OutcomeIntelligenceEvaluation["goalAchievementAnalysis"];
  read_only: true;
}

export interface OutcomeVarianceScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  evaluation_id: string;
  variance_analysis: OutcomeIntelligenceEvaluation["varianceAnalysis"];
  quality_assessment: OutcomeIntelligenceEvaluation["qualityAssessment"];
  improvement_recommendations: OutcomeIntelligenceEvaluation["improvementRecommendations"];
  read_only: true;
}

export interface OutcomeExplanationScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  evaluation_id: string;
  explanation: OutcomeIntelligenceEvaluation["explanation"];
  confidence: OutcomeIntelligenceEvaluation["confidence"];
  lessons_learned: OutcomeIntelligenceEvaluation["lessonsLearned"];
  future_optimizations: OutcomeIntelligenceEvaluation["futureOptimizations"];
  read_only: true;
}

export interface OutcomeSummaryScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  summary: OutcomeIntelligenceSummary;
  read_only: true;
}

export interface OutcomeValidationScreen {
  schema_version: typeof OUTCOME_INTELLIGENCE_SCHEMA_VERSION;
  validation: OutcomeIntelligenceValidation;
  read_only: true;
}

export function buildOutcomeIntelligenceHome(input: {
  scenarios: OutcomeIntelligenceHome["scenarios"];
}): OutcomeIntelligenceHome {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Outcome Intelligence",
    description:
      "Evaluates expected and projected completion outcomes from the full C1–C6 intelligence chain — read-only, closes the primary AN ACT loop.",
    outcome_chain: OUTCOME_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c6_integration_note:
      "Delegates to CH4-C6 execution intelligence, which chains through C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: OUTCOME_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildOutcomeIntelligenceSummary(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeIntelligenceSummary {
  return {
    schemaVersion: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluationId: evaluation.evaluationId,
    goal: evaluation.goal,
    scenarioId: evaluation.scenarioId,
    qualityLevel: evaluation.qualityAssessment.level,
    projectedCompletionPercent: evaluation.completionOutcomeModel.projectedCompletionPercent,
    achievementScore: evaluation.goalAchievementAnalysis.achievementScore,
    variancePercent: evaluation.varianceAnalysis.variancePercent,
    confidenceLevel: evaluation.confidence.level,
    outcomeChain: OUTCOME_CHAIN,
    readOnly: true,
    generatedAt: OUTCOME_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toOutcomeEvaluationScreen(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeEvaluationScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluation,
    read_only: true,
  };
}

export function toOutcomeExpectedScreen(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeExpectedScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluation_id: evaluation.evaluationId,
    expected_outcomes: evaluation.expectedOutcomes,
    success_criteria_evaluations: evaluation.successCriteriaEvaluations,
    read_only: true,
  };
}

export function toOutcomeCompletionScreen(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeCompletionScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluation_id: evaluation.evaluationId,
    completion_outcome_model: evaluation.completionOutcomeModel,
    deliverable_verification_summaries: evaluation.deliverableVerificationSummaries,
    milestone_completion_summaries: evaluation.milestoneCompletionSummaries,
    goal_achievement_analysis: evaluation.goalAchievementAnalysis,
    read_only: true,
  };
}

export function toOutcomeVarianceScreen(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeVarianceScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluation_id: evaluation.evaluationId,
    variance_analysis: evaluation.varianceAnalysis,
    quality_assessment: evaluation.qualityAssessment,
    improvement_recommendations: evaluation.improvementRecommendations,
    read_only: true,
  };
}

export function toOutcomeExplanationScreen(
  evaluation: OutcomeIntelligenceEvaluation
): OutcomeExplanationScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    evaluation_id: evaluation.evaluationId,
    explanation: evaluation.explanation,
    confidence: evaluation.confidence,
    lessons_learned: evaluation.lessonsLearned,
    future_optimizations: evaluation.futureOptimizations,
    read_only: true,
  };
}

export function toOutcomeSummaryScreen(summary: OutcomeIntelligenceSummary): OutcomeSummaryScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toOutcomeValidationScreen(
  validation: OutcomeIntelligenceValidation
): OutcomeValidationScreen {
  return {
    schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
