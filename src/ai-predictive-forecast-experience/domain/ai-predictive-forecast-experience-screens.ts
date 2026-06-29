import {
  AI_PREDICTIVE_FORECAST_EXPERIENCE_FIXED_TIMESTAMP,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-predictive-forecast-experience-schema.js";
import type {
  AiPredictiveForecastExperienceOutput,
  AiPredictiveForecastExperienceSummary,
  AiPredictiveForecastExperienceValidation,
} from "./ai-predictive-forecast-experience-context.js";

export interface AiPredictiveForecastExperienceHome {
  schema_version: typeof AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  predictive_forecast_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  predictive_forecast_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface PredictiveForecastDomainScreen {
  schema_version: typeof AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface PredictiveForecastExplanationScreen {
  schema_version: typeof AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiPredictiveForecastExperienceOutput["predictiveExplanation"];
  predictive_confidence: AiPredictiveForecastExperienceOutput["predictiveConfidence"];
  read_only: true;
}

export interface PredictiveForecastSummaryScreen {
  schema_version: typeof AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION;
  summary: AiPredictiveForecastExperienceSummary;
  read_only: true;
}

export interface PredictiveForecastValidationScreen {
  schema_version: typeof AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION;
  validation: AiPredictiveForecastExperienceValidation;
  read_only: true;
}

const PREDICTIVE_FORECAST_VIEWS = [
  "Prediction Dashboard",
  "Future Scenarios",
  "Trend Analysis",
  "Forecast",
  "Risk Forecast",
  "Opportunity Forecast",
  "Probability Model",
  "Predictive Confidence",
] as const;

export function buildAiPredictiveForecastExperienceHome(input: {
  scenarios: AiPredictiveForecastExperienceHome["scenarios"];
}): AiPredictiveForecastExperienceHome {
  return {
    schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Predictive Forecast Experience",
    description:
      "Read-only AI Predictive Forecast Experience (CH5-X16) for Chapter 5 — delegates-only via CH5-X15 AI Strategic Intelligence Experience.",
    predictive_forecast_chain: AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    predictive_forecast_views: PREDICTIVE_FORECAST_VIEWS,
    read_only: true,
    generated_at: AI_PREDICTIVE_FORECAST_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiPredictiveForecastExperienceSummary(
  output: AiPredictiveForecastExperienceOutput
): AiPredictiveForecastExperienceSummary {
  return {
    schemaVersion: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    predictiveConfidenceLevel: output.predictiveConfidence.level,
    predictiveConfidenceScore: output.predictiveConfidence.score,
    futureScenarioCount: output.futureScenarios.scenarios.length,
    forecastStepCount: output.forecast.steps.length,
    riskForecastCount: output.riskForecast.items.length,
    opportunityForecastCount: output.opportunityForecast.opportunities.length,
    probabilityScore: output.probabilityModel.score,
    predictiveForecastChain: AI_PREDICTIVE_FORECAST_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_PREDICTIVE_FORECAST_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toPredictiveForecastDomainScreen<T>(
  output: AiPredictiveForecastExperienceOutput,
  view: T
): PredictiveForecastDomainScreen {
  return {
    schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toPredictiveForecastExplanationScreen(
  output: AiPredictiveForecastExperienceOutput
): PredictiveForecastExplanationScreen {
  return {
    schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.predictiveExplanation,
    predictive_confidence: output.predictiveConfidence,
    read_only: true,
  };
}

export function toPredictiveForecastSummaryScreen(
  summary: AiPredictiveForecastExperienceSummary
): PredictiveForecastSummaryScreen {
  return {
    schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toPredictiveForecastValidationScreen(
  validation: AiPredictiveForecastExperienceValidation
): PredictiveForecastValidationScreen {
  return {
    schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
