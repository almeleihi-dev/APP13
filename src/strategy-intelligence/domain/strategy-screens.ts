import {
  STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP,
  STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
  STRATEGY_CHAIN,
} from "./strategy-intelligence-schema.js";
import type {
  StrategyIntelligenceOutput,
  StrategyIntelligenceSummary,
  StrategyIntelligenceValidation,
} from "./strategy-context.js";

export interface StrategyIntelligenceHome {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  strategy_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c12_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface StrategyCoreScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  strategic_objectives: StrategyIntelligenceOutput["strategicObjectives"];
  strategic_options: StrategyIntelligenceOutput["strategicOptions"];
  execution_strategies: StrategyIntelligenceOutput["executionStrategies"];
  resource_allocation_strategy: StrategyIntelligenceOutput["resourceAllocationStrategy"];
  priority_optimizations: StrategyIntelligenceOutput["priorityOptimizations"];
  read_only: true;
}

export interface StrategyRoadmapScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  long_term_roadmap: StrategyIntelligenceOutput["longTermRoadmap"];
  read_only: true;
}

export interface StrategyScenariosScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  scenario_plans: StrategyIntelligenceOutput["scenarioPlans"];
  contingency_strategies: StrategyIntelligenceOutput["contingencyStrategies"];
  read_only: true;
}

export interface StrategyOpportunitiesScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  strategic_opportunity_matrix: StrategyIntelligenceOutput["strategicOpportunityMatrix"];
  strategic_risk_mitigations: StrategyIntelligenceOutput["strategicRiskMitigations"];
  read_only: true;
}

export interface StrategyExplanationScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: StrategyIntelligenceOutput["explanation"];
  strategic_confidence: StrategyIntelligenceOutput["strategicConfidence"];
  read_only: true;
}

export interface StrategySummaryScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  summary: StrategyIntelligenceSummary;
  read_only: true;
}

export interface StrategyValidationScreen {
  schema_version: typeof STRATEGY_INTELLIGENCE_SCHEMA_VERSION;
  validation: StrategyIntelligenceValidation;
  read_only: true;
}

export function buildStrategyIntelligenceHome(input: {
  scenarios: StrategyIntelligenceHome["scenarios"];
}): StrategyIntelligenceHome {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Strategy Intelligence",
    description:
      "Deterministic strategic planning from the complete C1–C12 intelligence chain — read-only, no mutations.",
    strategy_chain: STRATEGY_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c12_integration_note:
      "Delegates to CH4-C12 prediction intelligence, which chains through C11 insight, C10 recommendation, C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildStrategyIntelligenceSummary(
  output: StrategyIntelligenceOutput
): StrategyIntelligenceSummary {
  return {
    schemaVersion: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    strategicConfidenceLevel: output.strategicConfidence.level,
    strategicConfidenceScore: output.strategicConfidence.score,
    objectiveCount: output.strategicObjectives.length,
    strategicOptionCount: output.strategicOptions.length,
    scenarioPlanCount: output.scenarioPlans.length,
    contingencyCount: output.contingencyStrategies.length,
    roadmapHorizonDays: output.longTermRoadmap.horizonDays,
    strategyChain: STRATEGY_CHAIN,
    readOnly: true,
    generatedAt: STRATEGY_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toStrategyCoreScreen(output: StrategyIntelligenceOutput): StrategyCoreScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    strategic_objectives: output.strategicObjectives,
    strategic_options: output.strategicOptions,
    execution_strategies: output.executionStrategies,
    resource_allocation_strategy: output.resourceAllocationStrategy,
    priority_optimizations: output.priorityOptimizations,
    read_only: true,
  };
}

export function toStrategyRoadmapScreen(output: StrategyIntelligenceOutput): StrategyRoadmapScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    long_term_roadmap: output.longTermRoadmap,
    read_only: true,
  };
}

export function toStrategyScenariosScreen(output: StrategyIntelligenceOutput): StrategyScenariosScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    scenario_plans: output.scenarioPlans,
    contingency_strategies: output.contingencyStrategies,
    read_only: true,
  };
}

export function toStrategyOpportunitiesScreen(
  output: StrategyIntelligenceOutput
): StrategyOpportunitiesScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    strategic_opportunity_matrix: output.strategicOpportunityMatrix,
    strategic_risk_mitigations: output.strategicRiskMitigations,
    read_only: true,
  };
}

export function toStrategyExplanationScreen(output: StrategyIntelligenceOutput): StrategyExplanationScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    strategic_confidence: output.strategicConfidence,
    read_only: true,
  };
}

export function toStrategySummaryScreen(summary: StrategyIntelligenceSummary): StrategySummaryScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toStrategyValidationScreen(
  validation: StrategyIntelligenceValidation
): StrategyValidationScreen {
  return {
    schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
