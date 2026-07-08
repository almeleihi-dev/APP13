import {
  ORCHESTRATION_INTELLIGENCE_FIXED_TIMESTAMP,
  ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
  ORCHESTRATION_CHAIN,
} from "./orchestration-intelligence-schema.js";
import type {
  OrchestrationIntelligenceOutput,
  OrchestrationIntelligenceSummary,
  OrchestrationIntelligenceValidation,
} from "./orchestration-context.js";

export interface OrchestrationIntelligenceHome {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  orchestration_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_through_c16_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface OrchestrationChainScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  chain_trace: OrchestrationIntelligenceOutput["chainTrace"];
  orchestration_layers: OrchestrationIntelligenceOutput["orchestrationLayers"];
  read_only: true;
}

export interface OrchestrationCoordinationScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  cross_engine_coordination: OrchestrationIntelligenceOutput["crossEngineCoordination"];
  orchestration_recommendations: OrchestrationIntelligenceOutput["orchestrationRecommendations"];
  read_only: true;
}

export interface OrchestrationUnifiedScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  unified_intelligence_snapshots: OrchestrationIntelligenceOutput["unifiedIntelligenceSnapshots"];
  read_only: true;
}

export interface OrchestrationReadinessScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  orchestration_readiness: OrchestrationIntelligenceOutput["orchestrationReadiness"];
  read_only: true;
}

export interface OrchestrationExplanationScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: OrchestrationIntelligenceOutput["explanation"];
  orchestration_confidence: OrchestrationIntelligenceOutput["orchestrationConfidence"];
  read_only: true;
}

export interface OrchestrationSummaryScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  summary: OrchestrationIntelligenceSummary;
  read_only: true;
}

export interface OrchestrationValidationScreen {
  schema_version: typeof ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION;
  validation: OrchestrationIntelligenceValidation;
  read_only: true;
}

export function buildOrchestrationIntelligenceHome(input: {
  scenarios: OrchestrationIntelligenceHome["scenarios"];
}): OrchestrationIntelligenceHome {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    headline: "AN ACT Orchestration Intelligence",
    description:
      "Deterministic orchestration intelligence unifying the complete C1–C16 intelligence chain into a single read-only orchestration service — no mutations.",
    orchestration_chain: ORCHESTRATION_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_through_c16_integration_note:
      "Delegates to CH4-C16 evolution intelligence, orchestrating the full chain from C15 optimization through C1 intent classification.",
    read_only: true,
    generated_at: ORCHESTRATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function buildOrchestrationIntelligenceSummary(
  output: OrchestrationIntelligenceOutput
): OrchestrationIntelligenceSummary {
  return {
    schemaVersion: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    orchestrationConfidenceLevel: output.orchestrationConfidence.level,
    orchestrationConfidenceScore: output.orchestrationConfidence.score,
    chainLayerCount: output.orchestrationLayers.length,
    activeLayerCount: output.orchestrationLayers.filter((l) => l.status === "active").length,
    coordinationCount: output.crossEngineCoordination.length,
    readinessScore: output.orchestrationReadiness.overallScore,
    orchestrationChain: ORCHESTRATION_CHAIN,
    readOnly: true,
    generatedAt: ORCHESTRATION_INTELLIGENCE_FIXED_TIMESTAMP,
  };
}

export function toOrchestrationChainScreen(
  output: OrchestrationIntelligenceOutput
): OrchestrationChainScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    chain_trace: output.chainTrace,
    orchestration_layers: output.orchestrationLayers,
    read_only: true,
  };
}

export function toOrchestrationCoordinationScreen(
  output: OrchestrationIntelligenceOutput
): OrchestrationCoordinationScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    cross_engine_coordination: output.crossEngineCoordination,
    orchestration_recommendations: output.orchestrationRecommendations,
    read_only: true,
  };
}

export function toOrchestrationUnifiedScreen(
  output: OrchestrationIntelligenceOutput
): OrchestrationUnifiedScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    unified_intelligence_snapshots: output.unifiedIntelligenceSnapshots,
    read_only: true,
  };
}

export function toOrchestrationReadinessScreen(
  output: OrchestrationIntelligenceOutput
): OrchestrationReadinessScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    orchestration_readiness: output.orchestrationReadiness,
    read_only: true,
  };
}

export function toOrchestrationExplanationScreen(
  output: OrchestrationIntelligenceOutput
): OrchestrationExplanationScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    orchestration_confidence: output.orchestrationConfidence,
    read_only: true,
  };
}

export function toOrchestrationSummaryScreen(
  summary: OrchestrationIntelligenceSummary
): OrchestrationSummaryScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toOrchestrationValidationScreen(
  validation: OrchestrationIntelligenceValidation
): OrchestrationValidationScreen {
  return {
    schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
