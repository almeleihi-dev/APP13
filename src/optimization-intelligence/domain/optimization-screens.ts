import {
  OPTIMIZATION_INTELLIGENCE_FIXED_TIMESTAMP,
  OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
  OPTIMIZATION_CHAIN,
} from "./optimization-intelligence-schema.js";
import type {
  OptimizationIntelligenceOutput,
  OptimizationIntelligenceSummary,
  OptimizationIntelligenceValidation,
} from "./optimization-context.js";

export interface OptimizationIntelligenceHome {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  optimization_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c14_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface OptimizationEfficiencyScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  efficiency_improvements: OptimizationIntelligenceOutput["efficiencyImprovements"];
  resource_optimizations: OptimizationIntelligenceOutput["resourceOptimizations"];
  read_only: true;
}

export interface OptimizationBottlenecksScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  bottleneck_analyses: OptimizationIntelligenceOutput["bottleneckAnalyses"];
  bottleneck_elimination_plans: OptimizationIntelligenceOutput["bottleneckEliminationPlans"];
  read_only: true;
}

export interface OptimizationPerformanceScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  performance_maximization_opportunities: OptimizationIntelligenceOutput["performanceMaximizationOpportunities"];
  optimization_recommendations: OptimizationIntelligenceOutput["optimizationRecommendations"];
  read_only: true;
}

export interface OptimizationRefinementScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  system_refinement_cycles: OptimizationIntelligenceOutput["systemRefinementCycles"];
  workflow_optimizations: OptimizationIntelligenceOutput["workflowOptimizations"];
  read_only: true;
}

export interface OptimizationExplanationScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: OptimizationIntelligenceOutput["explanation"];
  optimization_confidence: OptimizationIntelligenceOutput["optimizationConfidence"];
  read_only: true;
}

export interface OptimizationSummaryScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  summary: OptimizationIntelligenceSummary;
  read_only: true;
}

export interface OptimizationValidationScreen {
  schema_version: typeof OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION;
  validation: OptimizationIntelligenceValidation;
  read_only: true;
}

export function buildOptimizationIntelligenceHome(input: {
  scenarios: OptimizationIntelligenceHome["scenarios"];
}): OptimizationIntelligenceHome {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Optimization Intelligence",
    description:
      "Deterministic optimization intelligence for continuous system refinement, efficiency improvement, resource optimization, bottleneck elimination, and performance maximization — read-only, no mutations.",
    optimization_chain: OPTIMIZATION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c14_integration_note:
      "Delegates to CH4-C14 learning intelligence, which chains through C13 strategy, C12 prediction, C11 insight, C10 recommendation, C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: OPTIMIZATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildOptimizationIntelligenceSummary(
  output: OptimizationIntelligenceOutput
): OptimizationIntelligenceSummary {
  return {
    schemaVersion: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    optimizationConfidenceLevel: output.optimizationConfidence.level,
    optimizationConfidenceScore: output.optimizationConfidence.score,
    recommendationCount: output.optimizationRecommendations.length,
    efficiencyImprovementCount: output.efficiencyImprovements.length,
    bottleneckCount: output.bottleneckAnalyses.length,
    performanceOpportunityCount: output.performanceMaximizationOpportunities.length,
    refinementCycleCount: output.systemRefinementCycles.length,
    optimizationChain: OPTIMIZATION_CHAIN,
    readOnly: true,
    generatedAt: OPTIMIZATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toOptimizationEfficiencyScreen(
  output: OptimizationIntelligenceOutput
): OptimizationEfficiencyScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    efficiency_improvements: output.efficiencyImprovements,
    resource_optimizations: output.resourceOptimizations,
    read_only: true,
  };
}

export function toOptimizationBottlenecksScreen(
  output: OptimizationIntelligenceOutput
): OptimizationBottlenecksScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    bottleneck_analyses: output.bottleneckAnalyses,
    bottleneck_elimination_plans: output.bottleneckEliminationPlans,
    read_only: true,
  };
}

export function toOptimizationPerformanceScreen(
  output: OptimizationIntelligenceOutput
): OptimizationPerformanceScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    performance_maximization_opportunities: output.performanceMaximizationOpportunities,
    optimization_recommendations: output.optimizationRecommendations,
    read_only: true,
  };
}

export function toOptimizationRefinementScreen(
  output: OptimizationIntelligenceOutput
): OptimizationRefinementScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    system_refinement_cycles: output.systemRefinementCycles,
    workflow_optimizations: output.workflowOptimizations,
    read_only: true,
  };
}

export function toOptimizationExplanationScreen(
  output: OptimizationIntelligenceOutput
): OptimizationExplanationScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    optimization_confidence: output.optimizationConfidence,
    read_only: true,
  };
}

export function toOptimizationSummaryScreen(
  summary: OptimizationIntelligenceSummary
): OptimizationSummaryScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toOptimizationValidationScreen(
  validation: OptimizationIntelligenceValidation
): OptimizationValidationScreen {
  return {
    schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
