import {
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-predictive-intelligence-experience-schema.js";
import type {
  AiPredictiveIntelligenceExperienceOutput,
  AiPredictiveIntelligenceExperienceSummary,
  AiPredictiveIntelligenceExperienceValidation,
} from "./ai-predictive-intelligence-experience-context.js";

export interface AiPredictiveIntelligenceExperienceHome {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  predictive_intelligence_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  predictive_intelligence_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface PredictiveIntelligenceContextScreen {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  prediction_context: AiPredictiveIntelligenceExperienceOutput["predictionContext"];
  prediction_confidence: AiPredictiveIntelligenceExperienceOutput["predictionConfidence"];
  read_only: true;
}

export interface PredictiveIntelligenceDomainScreen {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface PredictiveIntelligenceExplanationScreen {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiPredictiveIntelligenceExperienceOutput["predictionExplanation"];
  prediction_confidence: AiPredictiveIntelligenceExperienceOutput["predictionConfidence"];
  read_only: true;
}

export interface PredictiveIntelligenceSummaryScreen {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  summary: AiPredictiveIntelligenceExperienceSummary;
  read_only: true;
}

export interface PredictiveIntelligenceValidationScreen {
  schema_version: typeof AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION;
  validation: AiPredictiveIntelligenceExperienceValidation;
  read_only: true;
}

const PREDICTIVE_INTELLIGENCE_VIEWS = [
  "Prediction Context",
  "Outcome Predictions",
  "Success Probability",
  "Future Scenarios",
  "Early Warning Signals",
  "Predictive Opportunities",
  "Predictive Risks",
  "Prediction Confidence",
  "Prediction Readiness",
  "Delegation",
] as const;

export function buildAiPredictiveIntelligenceExperienceHome(input: {
  scenarios: AiPredictiveIntelligenceExperienceHome["scenarios"];
}): AiPredictiveIntelligenceExperienceHome {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Predictive Intelligence Experience",
    description:
      "Read-only AI Predictive Intelligence Experience for Chapter 5 — delegates-only via CH5-X10 AI Recommendation Intelligence Experience.",
    predictive_intelligence_chain: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    predictive_intelligence_views: PREDICTIVE_INTELLIGENCE_VIEWS,
    read_only: true,
    generated_at: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiPredictiveIntelligenceExperienceSummary(
  output: AiPredictiveIntelligenceExperienceOutput
): AiPredictiveIntelligenceExperienceSummary {
  return {
    schemaVersion: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    predictionConfidenceLevel: output.predictionConfidence.level,
    predictionConfidenceScore: output.predictionConfidence.score,
    predictionReady: output.predictionReadiness.predictionReady,
    outcomePredictionCount: output.outcomePredictions.predictions.length,
    futureScenarioCount: output.futureScenarios.scenarios.length,
    warningSignalCount: output.earlyWarningSignals.signals.length,
    opportunityCount: output.predictiveOpportunities.opportunities.length,
    riskCount: output.predictiveRisks.risks.length,
    successProbabilityScore: output.successProbability.score,
    predictiveIntelligenceChain: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toPredictiveIntelligenceContextScreen(
  output: AiPredictiveIntelligenceExperienceOutput
): PredictiveIntelligenceContextScreen {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    prediction_context: output.predictionContext,
    prediction_confidence: output.predictionConfidence,
    read_only: true,
  };
}

export function toPredictiveIntelligenceDomainScreen<T>(
  output: AiPredictiveIntelligenceExperienceOutput,
  view: T
): PredictiveIntelligenceDomainScreen {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toPredictiveIntelligenceExplanationScreen(
  output: AiPredictiveIntelligenceExperienceOutput
): PredictiveIntelligenceExplanationScreen {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.predictionExplanation,
    prediction_confidence: output.predictionConfidence,
    read_only: true,
  };
}

export function toPredictiveIntelligenceSummaryScreen(
  summary: AiPredictiveIntelligenceExperienceSummary
): PredictiveIntelligenceSummaryScreen {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toPredictiveIntelligenceValidationScreen(
  validation: AiPredictiveIntelligenceExperienceValidation
): PredictiveIntelligenceValidationScreen {
  return {
    schema_version: AI_PREDICTIVE_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
