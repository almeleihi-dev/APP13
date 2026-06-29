import type {
  PredictiveForecastConfidenceLevel,
  PredictiveForecastScenarioId,
} from "./ai-predictive-forecast-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiPredictiveForecastExperienceContext {
  scenarioId?: PredictiveForecastScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface PredictiveForecastCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface PredictiveForecastContext {
  contextId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  foundationOutputId: string;
  scenarioId: PredictiveForecastScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface PredictionDashboard {
  dashboardId: string;
  headline: string;
  goal: string;
  healthScore: number;
  scenarioCount: number;
  forecastStepCount: number;
  probabilityScore: number;
  readOnly: true;
  summary: string;
}

export interface FutureScenario {
  scenarioId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface FutureScenarios {
  scenariosId: string;
  scenarios: FutureScenario[];
  summary: string;
}

export interface TrendItem {
  trendId: string;
  sequence: number;
  label: string;
  detail: string;
  direction: "up" | "stable" | "down";
}

export interface TrendAnalysis {
  analysisId: string;
  trends: TrendItem[];
  summary: string;
}

export interface ForecastStep {
  stepId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface Forecast {
  forecastId: string;
  steps: ForecastStep[];
  summary: string;
}

export interface RiskForecastItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface RiskForecast {
  forecastId: string;
  items: RiskForecastItem[];
  riskScore: number;
  summary: string;
}

export interface OpportunityForecastItem {
  itemId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface OpportunityForecast {
  forecastId: string;
  opportunities: OpportunityForecastItem[];
  opportunityScore: number;
  summary: string;
}

export interface ProbabilityModel {
  modelId: string;
  score: number;
  level: PredictiveForecastConfidenceLevel;
  successProbability: number;
  summary: string;
}

export interface PredictiveConfidence {
  level: PredictiveForecastConfidenceLevel;
  score: number;
  rationale: string;
  strategicConfidenceScore: number;
}

export interface DelegationPredictiveForecast {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  strategicIntelligenceOutputId: string;
  checks: PredictiveForecastCheck[];
  summary: string;
}

export interface PredictiveExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  dashboardSummary: string;
  scenariosSummary: string;
  forecastSummary: string;
}

export interface AiPredictiveForecastExperienceOutput {
  outputId: string;
  strategicIntelligenceOutputId: string;
  decisionIntelligenceOutputId: string;
  orchestrationOutputId: string;
  executiveIntelligenceOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: PredictiveForecastScenarioId | null;
  goal: string;
  predictiveForecastContext: PredictiveForecastContext;
  predictionDashboard: PredictionDashboard;
  futureScenarios: FutureScenarios;
  trendAnalysis: TrendAnalysis;
  forecast: Forecast;
  riskForecast: RiskForecast;
  opportunityForecast: OpportunityForecast;
  probabilityModel: ProbabilityModel;
  predictiveConfidence: PredictiveConfidence;
  delegationPredictiveForecast: DelegationPredictiveForecast;
  predictiveExplanation: PredictiveExplanation;
  readOnly: true;
}

export interface AiPredictiveForecastExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: PredictiveForecastScenarioId | null;
  predictiveConfidenceLevel: PredictiveForecastConfidenceLevel;
  predictiveConfidenceScore: number;
  futureScenarioCount: number;
  forecastStepCount: number;
  riskForecastCount: number;
  opportunityForecastCount: number;
  probabilityScore: number;
  predictiveForecastChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiPredictiveForecastExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
