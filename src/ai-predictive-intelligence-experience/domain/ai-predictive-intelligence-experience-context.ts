import type {
  PredictiveIntelligenceConfidenceLevel,
  PredictiveIntelligenceStatusLevel,
  PredictiveIntelligenceScenarioId,
} from "./ai-predictive-intelligence-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiPredictiveIntelligenceExperienceContext {
  scenarioId?: PredictiveIntelligenceScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface PredictiveCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface PredictionContext {
  contextId: string;
  recommendationIntelligenceOutputId: string;
  insightGenerationOutputId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: PredictiveIntelligenceScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface OutcomePrediction {
  predictionId: string;
  sequence: number;
  title: string;
  detail: string;
  sourceRecommendationId: string;
}

export interface OutcomePredictions {
  predictionsId: string;
  predictions: OutcomePrediction[];
  summary: string;
}

export interface SuccessProbability {
  probabilityId: string;
  score: number;
  level: PredictiveIntelligenceConfidenceLevel;
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

export interface EarlyWarningSignal {
  signalId: string;
  sequence: number;
  label: string;
  detail: string;
  severity: "low" | "medium" | "high";
}

export interface EarlyWarningSignals {
  signalsId: string;
  signals: EarlyWarningSignal[];
  summary: string;
}

export interface PredictiveOpportunity {
  opportunityId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface PredictiveOpportunities {
  opportunitiesId: string;
  opportunities: PredictiveOpportunity[];
  summary: string;
}

export interface PredictiveRisk {
  riskId: string;
  sequence: number;
  title: string;
  detail: string;
  level: "low" | "medium" | "high";
}

export interface PredictiveRisks {
  risksId: string;
  risks: PredictiveRisk[];
  summary: string;
}

export interface PredictionConfidence {
  level: PredictiveIntelligenceConfidenceLevel;
  score: number;
  rationale: string;
  recommendationConfidenceScore: number;
}

export interface PredictionReadiness {
  readinessId: string;
  level: PredictiveIntelligenceStatusLevel;
  readinessScore: number;
  predictionReady: boolean;
  checks: PredictiveCheck[];
  summary: string;
}

export interface DelegationPredictiveIntelligence {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  recommendationIntelligenceOutputId: string;
  checks: PredictiveCheck[];
  summary: string;
}

export interface PredictionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  outcomesSummary: string;
  probabilitySummary: string;
  readinessSummary: string;
}

export interface AiPredictiveIntelligenceExperienceOutput {
  outputId: string;
  recommendationIntelligenceOutputId: string;
  insightGenerationOutputId: string;
  adaptiveCoachingOutputId: string;
  progressIntelligenceOutputId: string;
  executionCompanionOutputId: string;
  actionPlanningOutputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: PredictiveIntelligenceScenarioId | null;
  goal: string;
  predictionContext: PredictionContext;
  outcomePredictions: OutcomePredictions;
  successProbability: SuccessProbability;
  futureScenarios: FutureScenarios;
  earlyWarningSignals: EarlyWarningSignals;
  predictiveOpportunities: PredictiveOpportunities;
  predictiveRisks: PredictiveRisks;
  predictionConfidence: PredictionConfidence;
  predictionReadiness: PredictionReadiness;
  delegationPredictiveIntelligence: DelegationPredictiveIntelligence;
  predictionExplanation: PredictionExplanation;
  readOnly: true;
}

export interface AiPredictiveIntelligenceExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: PredictiveIntelligenceScenarioId | null;
  predictionConfidenceLevel: PredictiveIntelligenceConfidenceLevel;
  predictionConfidenceScore: number;
  predictionReady: boolean;
  outcomePredictionCount: number;
  futureScenarioCount: number;
  warningSignalCount: number;
  opportunityCount: number;
  riskCount: number;
  successProbabilityScore: number;
  predictiveIntelligenceChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiPredictiveIntelligenceExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
