import type {
  EvolutionConfidenceLevel,
  EvolutionMaturityLevel,
  EvolutionPriorityLevel,
  EvolutionScenarioId,
} from "./evolution-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface EvolutionIntelligenceContext {
  scenarioId?: EvolutionScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface CapabilityEvolution {
  capabilityId: string;
  title: string;
  description: string;
  currentLevel: EvolutionMaturityLevel;
  targetLevel: EvolutionMaturityLevel;
  horizonDays: number;
  priority: EvolutionPriorityLevel;
}

export interface MaturityProgression {
  progressionId: string;
  domain: "execution" | "strategy" | "learning" | "optimization" | "trust";
  currentMaturity: EvolutionMaturityLevel;
  nextMilestone: EvolutionMaturityLevel;
  description: string;
  readinessScore: number;
}

export interface StrategicTransformation {
  transformationId: string;
  title: string;
  description: string;
  fromState: string;
  toState: string;
  horizonDays: number;
  priority: EvolutionPriorityLevel;
}

export interface ResilienceGrowth {
  resilienceId: string;
  label: string;
  description: string;
  growthArea: "contingency" | "adaptation" | "recovery" | "prevention";
  currentStrength: number;
  targetStrength: number;
}

export interface EvolutionaryPlanningCycle {
  cycleId: string;
  phase: "assess" | "envision" | "evolve" | "integrate";
  title: string;
  description: string;
  order: number;
}

export interface EvolutionRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  category: "capability" | "maturity" | "transformation" | "resilience" | "planning";
  priority: EvolutionPriorityLevel;
  projectedImpact: string;
}

export interface EvolutionTrajectory {
  trajectoryId: string;
  label: string;
  description: string;
  direction: "ascending" | "stable" | "transformative";
  confidence: number;
}

export interface EvolutionConfidence {
  level: EvolutionConfidenceLevel;
  score: number;
  rationale: string;
  optimizationConfidenceScore: number;
  structuralEvolutionScore: number;
}

export interface EvolutionExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  capabilitySummary: string;
  transformationSummary: string;
  resilienceSummary: string;
  planningSummary: string;
}

export interface EvolutionIntelligenceOutput {
  outputId: string;
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
  scenarioId: EvolutionScenarioId | null;
  goal: string;
  capabilityEvolutions: CapabilityEvolution[];
  maturityProgressions: MaturityProgression[];
  strategicTransformations: StrategicTransformation[];
  resilienceGrowth: ResilienceGrowth[];
  evolutionaryPlanningCycles: EvolutionaryPlanningCycle[];
  evolutionRecommendations: EvolutionRecommendation[];
  evolutionTrajectories: EvolutionTrajectory[];
  evolutionConfidence: EvolutionConfidence;
  explanation: EvolutionExplanation;
  readOnly: true;
}

export interface EvolutionIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: EvolutionScenarioId | null;
  evolutionConfidenceLevel: EvolutionConfidenceLevel;
  evolutionConfidenceScore: number;
  capabilityEvolutionCount: number;
  maturityProgressionCount: number;
  transformationCount: number;
  resilienceGrowthCount: number;
  planningCycleCount: number;
  evolutionChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface EvolutionIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
