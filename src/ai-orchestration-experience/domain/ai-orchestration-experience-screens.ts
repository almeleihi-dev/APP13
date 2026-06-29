import {
  AI_ORCHESTRATION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
  AI_ORCHESTRATION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-orchestration-experience-schema.js";
import type {
  AiOrchestrationExperienceOutput,
  AiOrchestrationExperienceSummary,
  AiOrchestrationExperienceValidation,
} from "./ai-orchestration-experience-context.js";

export interface AiOrchestrationExperienceHome {
  schema_version: typeof AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  orchestration_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  orchestration_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface OrchestrationDomainScreen {
  schema_version: typeof AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface OrchestrationExplanationScreen {
  schema_version: typeof AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiOrchestrationExperienceOutput["orchestrationExplanation"];
  orchestration_confidence: AiOrchestrationExperienceOutput["orchestrationConfidence"];
  read_only: true;
}

export interface OrchestrationSummaryScreen {
  schema_version: typeof AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION;
  summary: AiOrchestrationExperienceSummary;
  read_only: true;
}

export interface OrchestrationValidationScreen {
  schema_version: typeof AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION;
  validation: AiOrchestrationExperienceValidation;
  read_only: true;
}

const ORCHESTRATION_VIEWS = [
  "Orchestration Dashboard",
  "Intelligence Pipeline",
  "Module Coordination",
  "Dependency Graph",
  "Execution Flow",
  "Synchronization Status",
  "System Health",
  "Orchestration Readiness",
  "Orchestration Confidence",
  "Delegation",
] as const;

export function buildAiOrchestrationExperienceHome(input: {
  scenarios: AiOrchestrationExperienceHome["scenarios"];
}): AiOrchestrationExperienceHome {
  return {
    schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Orchestration Experience",
    description:
      "Read-only AI Orchestration Experience for Chapter 5 — delegates-only via CH5-X12 AI Executive Intelligence Experience.",
    orchestration_chain: AI_ORCHESTRATION_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    orchestration_views: ORCHESTRATION_VIEWS,
    read_only: true,
    generated_at: AI_ORCHESTRATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiOrchestrationExperienceSummary(
  output: AiOrchestrationExperienceOutput
): AiOrchestrationExperienceSummary {
  return {
    schemaVersion: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    orchestrationConfidenceLevel: output.orchestrationConfidence.level,
    orchestrationConfidenceScore: output.orchestrationConfidence.score,
    orchestrationReady: output.orchestrationReadiness.orchestrationReady,
    pipelineStageCount: output.intelligencePipeline.stages.length,
    coordinationModuleCount: output.moduleCoordination.modules.length,
    dependencyNodeCount: output.dependencyGraph.nodes.length,
    healthScore: output.systemHealth.score,
    orchestrationChain: AI_ORCHESTRATION_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_ORCHESTRATION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toOrchestrationDomainScreen<T>(
  output: AiOrchestrationExperienceOutput,
  view: T
): OrchestrationDomainScreen {
  return {
    schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toOrchestrationExplanationScreen(
  output: AiOrchestrationExperienceOutput
): OrchestrationExplanationScreen {
  return {
    schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.orchestrationExplanation,
    orchestration_confidence: output.orchestrationConfidence,
    read_only: true,
  };
}

export function toOrchestrationSummaryScreen(
  summary: AiOrchestrationExperienceSummary
): OrchestrationSummaryScreen {
  return {
    schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toOrchestrationValidationScreen(
  validation: AiOrchestrationExperienceValidation
): OrchestrationValidationScreen {
  return {
    schema_version: AI_ORCHESTRATION_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
