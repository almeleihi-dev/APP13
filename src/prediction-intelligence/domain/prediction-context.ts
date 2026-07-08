import type {
  PredictionConfidenceLevel,
  PredictionScenarioId,
  PredictionTrajectoryLevel,
} from "./prediction-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface PredictionIntelligenceContext {
  scenarioId?: PredictionScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface SuccessProbabilityProjection {
  projectionId: string;
  baselineScore: number;
  projectedScore: number;
  horizonDays: number;
  trajectory: PredictionTrajectoryLevel;
  rationale: string;
}

export interface TimelineForecast {
  forecastId: string;
  minHours: number;
  maxHours: number;
  projectedCompletionDate: string;
  delayRiskPercent: number;
  summary: string;
}

export interface RiskEvolutionForecast {
  forecastId: string;
  currentRiskLevel: "low" | "medium" | "high";
  projectedRiskLevel: "low" | "medium" | "high";
  horizonDays: number;
  trajectory: PredictionTrajectoryLevel;
  summary: string;
}

export interface TrustEvolutionForecast {
  forecastId: string;
  currentTrustBand: string;
  projectedTrustBand: string;
  projectedScore: number;
  horizonDays: number;
  trajectory: PredictionTrajectoryLevel;
  summary: string;
}

export interface CostProjection {
  projectionId: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  variancePercent: number;
  summary: string;
}

export interface OutcomeProjection {
  projectionId: string;
  achievementPercent: number;
  qualityScore: number;
  completionPercent: number;
  summary: string;
}

export interface OpportunityForecast {
  forecastId: string;
  title: string;
  projectedGain: string;
  probabilityPercent: number;
  horizonDays: number;
}

export interface ScenarioComparison {
  comparisonId: string;
  scenarioLabel: string;
  successProbability: number;
  timelineHours: number;
  riskLevel: string;
  recommended: boolean;
}

export interface WhatIfAnalysis {
  analysisId: string;
  variant: string;
  description: string;
  successDelta: number;
  timelineDeltaHours: number;
  riskDelta: string;
}

export interface PredictionConfidence {
  level: PredictionConfidenceLevel;
  score: number;
  rationale: string;
  insightConfidenceScore: number;
  structuralPredictionScore: number;
}

export interface PredictionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  successSummary: string;
  timelineSummary: string;
  riskSummary: string;
  trustSummary: string;
  scenarioSummary: string;
}

export interface PredictionIntelligenceOutput {
  outputId: string;
  insightOutputId: string;
  recommendationOutputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: PredictionScenarioId | null;
  goal: string;
  successProbabilityProjection: SuccessProbabilityProjection;
  timelineForecast: TimelineForecast;
  riskEvolutionForecast: RiskEvolutionForecast;
  trustEvolutionForecast: TrustEvolutionForecast;
  costProjection: CostProjection;
  outcomeProjection: OutcomeProjection;
  opportunityForecasts: OpportunityForecast[];
  scenarioComparisons: ScenarioComparison[];
  whatIfAnalysis: WhatIfAnalysis[];
  predictionConfidence: PredictionConfidence;
  explanation: PredictionExplanation;
  readOnly: true;
}

export interface PredictionIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: PredictionScenarioId | null;
  predictionConfidenceLevel: PredictionConfidenceLevel;
  predictionConfidenceScore: number;
  projectedSuccessScore: number;
  timelineMaxHours: number;
  projectedRiskLevel: string;
  scenarioComparisonCount: number;
  whatIfVariantCount: number;
  predictionChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface PredictionIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
