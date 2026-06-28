import type {
  OrchestrationConfidenceLevel,
  OrchestrationLayerStatus,
  OrchestrationScenarioId,
} from "./orchestration-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface OrchestrationIntelligenceContext {
  scenarioId?: OrchestrationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface ChainTraceEntry {
  step: number;
  engineKey: string;
  layerLabel: string;
  outputRef: string;
  status: OrchestrationLayerStatus;
  confidenceScore: number;
}

export interface OrchestrationLayer {
  layerId: string;
  engineKey: string;
  label: string;
  outputRef: string;
  status: OrchestrationLayerStatus;
  confidenceScore: number;
  upstreamRef: string | null;
}

export interface CrossEngineCoordination {
  coordinationId: string;
  sourceLayer: string;
  targetLayer: string;
  description: string;
  syncStatus: "synchronized" | "aligned" | "monitoring";
}

export interface UnifiedIntelligenceSnapshot {
  snapshotId: string;
  engineKey: string;
  label: string;
  confidenceScore: number;
  signalCount: number;
  summary: string;
}

export interface OrchestrationReadiness {
  readinessId: string;
  overallScore: number;
  layerCoverage: number;
  totalLayers: number;
  activeLayers: number;
  warnings: string[];
  summary: string;
}

export interface OrchestrationRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  affectedLayers: string[];
  priority: "critical" | "high" | "medium" | "low";
}

export interface OrchestrationConfidence {
  level: OrchestrationConfidenceLevel;
  score: number;
  rationale: string;
  evolutionConfidenceScore: number;
  chainIntegrityScore: number;
}

export interface OrchestrationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  chainSummary: string;
  coordinationSummary: string;
  readinessSummary: string;
  unifiedSummary: string;
}

export interface OrchestrationIntelligenceOutput {
  outputId: string;
  evolutionOutputId: string;
  optimizationOutputId: string;
  learningOutputId: string;
  strategyOutputId: string;
  predictionOutputId: string;
  insightOutputId: string;
  recommendationOutputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: OrchestrationScenarioId | null;
  goal: string;
  chainTrace: ChainTraceEntry[];
  orchestrationLayers: OrchestrationLayer[];
  crossEngineCoordination: CrossEngineCoordination[];
  unifiedIntelligenceSnapshots: UnifiedIntelligenceSnapshot[];
  orchestrationReadiness: OrchestrationReadiness;
  orchestrationRecommendations: OrchestrationRecommendation[];
  orchestrationConfidence: OrchestrationConfidence;
  explanation: OrchestrationExplanation;
  readOnly: true;
}

export interface OrchestrationIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: OrchestrationScenarioId | null;
  orchestrationConfidenceLevel: OrchestrationConfidenceLevel;
  orchestrationConfidenceScore: number;
  chainLayerCount: number;
  activeLayerCount: number;
  coordinationCount: number;
  readinessScore: number;
  orchestrationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface OrchestrationIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
