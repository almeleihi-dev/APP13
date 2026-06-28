import type {
  StrategyConfidenceLevel,
  StrategyPriorityLevel,
  StrategyScenarioId,
} from "./strategy-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface StrategyIntelligenceContext {
  scenarioId?: StrategyScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface StrategicObjective {
  objectiveId: string;
  title: string;
  description: string;
  priority: StrategyPriorityLevel;
  horizonDays: number;
  successMetric: string;
}

export interface StrategicOption {
  optionId: string;
  label: string;
  description: string;
  successProbability: number;
  recommended: boolean;
  tradeoffs: string[];
}

export interface ExecutionStrategy {
  strategyId: string;
  title: string;
  description: string;
  phaseCount: number;
  estimatedHours: number;
  priority: StrategyPriorityLevel;
}

export interface LongTermRoadmapPhase {
  phaseId: string;
  order: number;
  title: string;
  description: string;
  horizonDays: number;
  milestone: string;
}

export interface LongTermRoadmap {
  roadmapId: string;
  totalPhases: number;
  horizonDays: number;
  phases: LongTermRoadmapPhase[];
  summary: string;
}

export interface ResourceAllocationStrategy {
  allocationId: string;
  customerSharePercent: number;
  providerSharePercent: number;
  platformSharePercent: number;
  costRangeSummary: string;
  summary: string;
}

export interface PriorityOptimization {
  optimizationId: string;
  title: string;
  description: string;
  rank: number;
  impactScore: number;
}

export interface ContingencyStrategy {
  contingencyId: string;
  trigger: string;
  response: string;
  priority: StrategyPriorityLevel;
}

export interface ScenarioPlan {
  planId: string;
  scenarioLabel: string;
  successProbability: number;
  timelineHours: number;
  riskLevel: string;
  strategicFit: "primary" | "alternative" | "fallback";
}

export interface StrategicRiskMitigation {
  mitigationId: string;
  title: string;
  description: string;
  addressesRisk: string;
  priority: StrategyPriorityLevel;
}

export interface StrategicOpportunityMatrixEntry {
  entryId: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: "high" | "medium" | "low";
  quadrant: "pursue" | "evaluate" | "defer" | "monitor";
}

export interface StrategicConfidence {
  level: StrategyConfidenceLevel;
  score: number;
  rationale: string;
  predictionConfidenceScore: number;
  structuralStrategyScore: number;
}

export interface StrategyExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  objectiveSummary: string;
  roadmapSummary: string;
  riskSummary: string;
  opportunitySummary: string;
  scenarioSummary: string;
}

export interface StrategyIntelligenceOutput {
  outputId: string;
  predictionOutputId: string;
  insightOutputId: string;
  recommendationOutputId: string;
  decisionRecommendationId: string;
  trustRecommendationId: string;
  outcomeEvaluationId: string;
  executionGuidanceId: string;
  planId: string;
  canonicalActionId: string;
  scenarioId: StrategyScenarioId | null;
  goal: string;
  strategicObjectives: StrategicObjective[];
  strategicOptions: StrategicOption[];
  executionStrategies: ExecutionStrategy[];
  longTermRoadmap: LongTermRoadmap;
  resourceAllocationStrategy: ResourceAllocationStrategy;
  priorityOptimizations: PriorityOptimization[];
  contingencyStrategies: ContingencyStrategy[];
  scenarioPlans: ScenarioPlan[];
  strategicRiskMitigations: StrategicRiskMitigation[];
  strategicOpportunityMatrix: StrategicOpportunityMatrixEntry[];
  strategicConfidence: StrategicConfidence;
  explanation: StrategyExplanation;
  readOnly: true;
}

export interface StrategyIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: StrategyScenarioId | null;
  strategicConfidenceLevel: StrategyConfidenceLevel;
  strategicConfidenceScore: number;
  objectiveCount: number;
  strategicOptionCount: number;
  scenarioPlanCount: number;
  contingencyCount: number;
  roadmapHorizonDays: number;
  strategyChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface StrategyIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
