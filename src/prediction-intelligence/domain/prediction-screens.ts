import {
  PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP,
  PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
  PREDICTION_CHAIN,
} from "./prediction-intelligence-schema.js";
import type {
  PredictionIntelligenceOutput,
  PredictionIntelligenceSummary,
  PredictionIntelligenceValidation,
} from "./prediction-context.js";

export interface PredictionIntelligenceHome {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  prediction_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c11_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface PredictionProjectionsScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  success_probability_projection: PredictionIntelligenceOutput["successProbabilityProjection"];
  outcome_projection: PredictionIntelligenceOutput["outcomeProjection"];
  cost_projection: PredictionIntelligenceOutput["costProjection"];
  read_only: true;
}

export interface PredictionScenariosScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  scenario_comparisons: PredictionIntelligenceOutput["scenarioComparisons"];
  read_only: true;
}

export interface PredictionForecastsScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  timeline_forecast: PredictionIntelligenceOutput["timelineForecast"];
  risk_evolution_forecast: PredictionIntelligenceOutput["riskEvolutionForecast"];
  trust_evolution_forecast: PredictionIntelligenceOutput["trustEvolutionForecast"];
  opportunity_forecasts: PredictionIntelligenceOutput["opportunityForecasts"];
  read_only: true;
}

export interface PredictionWhatIfScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  what_if_analysis: PredictionIntelligenceOutput["whatIfAnalysis"];
  read_only: true;
}

export interface PredictionExplanationScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: PredictionIntelligenceOutput["explanation"];
  prediction_confidence: PredictionIntelligenceOutput["predictionConfidence"];
  read_only: true;
}

export interface PredictionSummaryScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  summary: PredictionIntelligenceSummary;
  read_only: true;
}

export interface PredictionValidationScreen {
  schema_version: typeof PREDICTION_INTELLIGENCE_SCHEMA_VERSION;
  validation: PredictionIntelligenceValidation;
  read_only: true;
}

export function buildPredictionIntelligenceHome(input: {
  scenarios: PredictionIntelligenceHome["scenarios"];
}): PredictionIntelligenceHome {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Prediction Intelligence",
    description:
      "Deterministic future projections from the complete C1–C11 intelligence chain — read-only, no mutations.",
    prediction_chain: PREDICTION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c11_integration_note:
      "Delegates to CH4-C11 insight intelligence, which chains through C10 recommendation, C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildPredictionIntelligenceSummary(
  output: PredictionIntelligenceOutput
): PredictionIntelligenceSummary {
  return {
    schemaVersion: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    predictionConfidenceLevel: output.predictionConfidence.level,
    predictionConfidenceScore: output.predictionConfidence.score,
    projectedSuccessScore: output.successProbabilityProjection.projectedScore,
    timelineMaxHours: output.timelineForecast.maxHours,
    projectedRiskLevel: output.riskEvolutionForecast.projectedRiskLevel,
    scenarioComparisonCount: output.scenarioComparisons.length,
    whatIfVariantCount: output.whatIfAnalysis.length,
    predictionChain: PREDICTION_CHAIN,
    readOnly: true,
    generatedAt: PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toPredictionProjectionsScreen(
  output: PredictionIntelligenceOutput
): PredictionProjectionsScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    success_probability_projection: output.successProbabilityProjection,
    outcome_projection: output.outcomeProjection,
    cost_projection: output.costProjection,
    read_only: true,
  };
}

export function toPredictionScenariosScreen(
  output: PredictionIntelligenceOutput
): PredictionScenariosScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    scenario_comparisons: output.scenarioComparisons,
    read_only: true,
  };
}

export function toPredictionForecastsScreen(
  output: PredictionIntelligenceOutput
): PredictionForecastsScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    timeline_forecast: output.timelineForecast,
    risk_evolution_forecast: output.riskEvolutionForecast,
    trust_evolution_forecast: output.trustEvolutionForecast,
    opportunity_forecasts: output.opportunityForecasts,
    read_only: true,
  };
}

export function toPredictionWhatIfScreen(output: PredictionIntelligenceOutput): PredictionWhatIfScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    what_if_analysis: output.whatIfAnalysis,
    read_only: true,
  };
}

export function toPredictionExplanationScreen(
  output: PredictionIntelligenceOutput
): PredictionExplanationScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    prediction_confidence: output.predictionConfidence,
    read_only: true,
  };
}

export function toPredictionSummaryScreen(
  summary: PredictionIntelligenceSummary
): PredictionSummaryScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toPredictionValidationScreen(
  validation: PredictionIntelligenceValidation
): PredictionValidationScreen {
  return {
    schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
