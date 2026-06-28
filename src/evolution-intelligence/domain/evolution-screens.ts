import {
  EVOLUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
  EVOLUTION_CHAIN,
} from "./evolution-intelligence-schema.js";
import type {
  EvolutionIntelligenceOutput,
  EvolutionIntelligenceSummary,
  EvolutionIntelligenceValidation,
} from "./evolution-context.js";

export interface EvolutionIntelligenceHome {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  evolution_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c15_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface EvolutionCapabilityScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  capability_evolutions: EvolutionIntelligenceOutput["capabilityEvolutions"];
  maturity_progressions: EvolutionIntelligenceOutput["maturityProgressions"];
  read_only: true;
}

export interface EvolutionTransformationScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  strategic_transformations: EvolutionIntelligenceOutput["strategicTransformations"];
  evolution_trajectories: EvolutionIntelligenceOutput["evolutionTrajectories"];
  read_only: true;
}

export interface EvolutionResilienceScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  resilience_growth: EvolutionIntelligenceOutput["resilienceGrowth"];
  evolution_recommendations: EvolutionIntelligenceOutput["evolutionRecommendations"];
  read_only: true;
}

export interface EvolutionPlanningScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  evolutionary_planning_cycles: EvolutionIntelligenceOutput["evolutionaryPlanningCycles"];
  read_only: true;
}

export interface EvolutionExplanationScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: EvolutionIntelligenceOutput["explanation"];
  evolution_confidence: EvolutionIntelligenceOutput["evolutionConfidence"];
  read_only: true;
}

export interface EvolutionSummaryScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  summary: EvolutionIntelligenceSummary;
  read_only: true;
}

export interface EvolutionValidationScreen {
  schema_version: typeof EVOLUTION_INTELLIGENCE_SCHEMA_VERSION;
  validation: EvolutionIntelligenceValidation;
  read_only: true;
}

export function buildEvolutionIntelligenceHome(input: {
  scenarios: EvolutionIntelligenceHome["scenarios"];
}): EvolutionIntelligenceHome {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Evolution Intelligence",
    description:
      "Deterministic evolution intelligence for long-term capability evolution, adaptive maturity progression, strategic transformation, resilience growth, and continuous evolutionary planning — read-only, no mutations.",
    evolution_chain: EVOLUTION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c15_integration_note:
      "Delegates to CH4-C15 optimization intelligence, which chains through C14 learning, C13 strategy, C12 prediction, C11 insight, C10 recommendation, C9 decision, C8 trust, C7 outcome, C6 execution, C5 contract, C4 pricing, C3 planning, C2 ontology, and C1 classifications.",
    read_only: true,
    generated_at: EVOLUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildEvolutionIntelligenceSummary(
  output: EvolutionIntelligenceOutput
): EvolutionIntelligenceSummary {
  return {
    schemaVersion: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    evolutionConfidenceLevel: output.evolutionConfidence.level,
    evolutionConfidenceScore: output.evolutionConfidence.score,
    capabilityEvolutionCount: output.capabilityEvolutions.length,
    maturityProgressionCount: output.maturityProgressions.length,
    transformationCount: output.strategicTransformations.length,
    resilienceGrowthCount: output.resilienceGrowth.length,
    planningCycleCount: output.evolutionaryPlanningCycles.length,
    evolutionChain: EVOLUTION_CHAIN,
    readOnly: true,
    generatedAt: EVOLUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toEvolutionCapabilityScreen(
  output: EvolutionIntelligenceOutput
): EvolutionCapabilityScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    capability_evolutions: output.capabilityEvolutions,
    maturity_progressions: output.maturityProgressions,
    read_only: true,
  };
}

export function toEvolutionTransformationScreen(
  output: EvolutionIntelligenceOutput
): EvolutionTransformationScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    strategic_transformations: output.strategicTransformations,
    evolution_trajectories: output.evolutionTrajectories,
    read_only: true,
  };
}

export function toEvolutionResilienceScreen(
  output: EvolutionIntelligenceOutput
): EvolutionResilienceScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    resilience_growth: output.resilienceGrowth,
    evolution_recommendations: output.evolutionRecommendations,
    read_only: true,
  };
}

export function toEvolutionPlanningScreen(
  output: EvolutionIntelligenceOutput
): EvolutionPlanningScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    evolutionary_planning_cycles: output.evolutionaryPlanningCycles,
    read_only: true,
  };
}

export function toEvolutionExplanationScreen(
  output: EvolutionIntelligenceOutput
): EvolutionExplanationScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    evolution_confidence: output.evolutionConfidence,
    read_only: true,
  };
}

export function toEvolutionSummaryScreen(summary: EvolutionIntelligenceSummary): EvolutionSummaryScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toEvolutionValidationScreen(
  validation: EvolutionIntelligenceValidation
): EvolutionValidationScreen {
  return {
    schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
