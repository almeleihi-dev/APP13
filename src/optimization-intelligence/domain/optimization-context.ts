import type {
  OptimizationConfidenceLevel,
  OptimizationPriorityLevel,
  OptimizationScenarioId,
} from "./optimization-intelligence-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface OptimizationIntelligenceContext {
  scenarioId?: OptimizationScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  title: string;
  description: string;
  category: "efficiency" | "resource" | "bottleneck" | "performance" | "refinement";
  priority: OptimizationPriorityLevel;
  projectedImpact: string;
}

export interface EfficiencyImprovement {
  improvementId: string;
  title: string;
  description: string;
  targetArea: "execution" | "planning" | "coordination" | "verification";
  efficiencyGain: string;
  priority: OptimizationPriorityLevel;
}

export interface ResourceOptimization {
  resourceId: string;
  label: string;
  description: string;
  resourceType: "time" | "capacity" | "cost" | "attention";
  optimizationAction: string;
  savingsEstimate: string;
}

export interface BottleneckAnalysis {
  bottleneckId: string;
  label: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedPhase: string;
  rootCause: string;
}

export interface BottleneckEliminationPlan {
  planId: string;
  title: string;
  description: string;
  targetBottleneckId: string;
  steps: string[];
  expectedResolution: string;
}

export interface PerformanceMaximizationOpportunity {
  opportunityId: string;
  title: string;
  description: string;
  metric: string;
  projectedGain: string;
  priority: OptimizationPriorityLevel;
}

export interface SystemRefinementCycle {
  cycleId: string;
  phase: "measure" | "identify" | "optimize" | "sustain";
  title: string;
  description: string;
  order: number;
}

export interface WorkflowOptimization {
  workflowId: string;
  label: string;
  description: string;
  currentState: string;
  optimizedState: string;
  impactScore: number;
}

export interface OptimizationConfidence {
  level: OptimizationConfidenceLevel;
  score: number;
  rationale: string;
  learningConfidenceScore: number;
  structuralOptimizationScore: number;
}

export interface OptimizationExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  efficiencySummary: string;
  bottleneckSummary: string;
  performanceSummary: string;
  refinementSummary: string;
}

export interface OptimizationIntelligenceOutput {
  outputId: string;
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
  scenarioId: OptimizationScenarioId | null;
  goal: string;
  optimizationRecommendations: OptimizationRecommendation[];
  efficiencyImprovements: EfficiencyImprovement[];
  resourceOptimizations: ResourceOptimization[];
  bottleneckAnalyses: BottleneckAnalysis[];
  bottleneckEliminationPlans: BottleneckEliminationPlan[];
  performanceMaximizationOpportunities: PerformanceMaximizationOpportunity[];
  systemRefinementCycles: SystemRefinementCycle[];
  workflowOptimizations: WorkflowOptimization[];
  optimizationConfidence: OptimizationConfidence;
  explanation: OptimizationExplanation;
  readOnly: true;
}

export interface OptimizationIntelligenceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: OptimizationScenarioId | null;
  optimizationConfidenceLevel: OptimizationConfidenceLevel;
  optimizationConfidenceScore: number;
  recommendationCount: number;
  efficiencyImprovementCount: number;
  bottleneckCount: number;
  performanceOpportunityCount: number;
  refinementCycleCount: number;
  optimizationChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface OptimizationIntelligenceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
