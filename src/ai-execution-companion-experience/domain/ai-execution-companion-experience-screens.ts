import {
  AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-execution-companion-experience-schema.js";
import type {
  AiExecutionCompanionExperienceOutput,
  AiExecutionCompanionExperienceSummary,
  AiExecutionCompanionExperienceValidation,
} from "./ai-execution-companion-experience-context.js";

export interface AiExecutionCompanionExperienceHome {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  execution_companion_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  execution_companion_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ExecutionCompanionContextScreen {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  execution_context: AiExecutionCompanionExperienceOutput["executionContext"];
  execution_companion_confidence: AiExecutionCompanionExperienceOutput["executionCompanionConfidence"];
  read_only: true;
}

export interface ExecutionCompanionDomainScreen {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ExecutionCompanionExplanationScreen {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiExecutionCompanionExperienceOutput["explanation"];
  execution_companion_confidence: AiExecutionCompanionExperienceOutput["executionCompanionConfidence"];
  read_only: true;
}

export interface ExecutionCompanionSummaryScreen {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  summary: AiExecutionCompanionExperienceSummary;
  read_only: true;
}

export interface ExecutionCompanionValidationScreen {
  schema_version: typeof AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION;
  validation: AiExecutionCompanionExperienceValidation;
  read_only: true;
}

const EXECUTION_COMPANION_VIEWS = [
  "Execution Context",
  "Current Step",
  "Execution Progress",
  "Active Checklist",
  "Next Actions",
  "Progress Timeline",
  "Completion Forecast",
  "Execution Guidance",
  "Readiness",
  "Delegation",
] as const;

export function buildAiExecutionCompanionExperienceHome(input: {
  scenarios: AiExecutionCompanionExperienceHome["scenarios"];
}): AiExecutionCompanionExperienceHome {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Execution Companion Experience",
    description:
      "Read-only AI Execution Companion Experience for Chapter 5 — delegates-only via CH5-X5 AI Action Planning Experience.",
    execution_companion_chain: AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    execution_companion_views: EXECUTION_COMPANION_VIEWS,
    read_only: true,
    generated_at: AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiExecutionCompanionExperienceSummary(
  output: AiExecutionCompanionExperienceOutput
): AiExecutionCompanionExperienceSummary {
  return {
    schemaVersion: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    executionCompanionConfidenceLevel: output.executionCompanionConfidence.level,
    executionCompanionConfidenceScore: output.executionCompanionConfidence.score,
    companionReady: output.executionCompanionReadiness.companionReady,
    totalSteps: output.executionProgress.totalSteps,
    completedSteps: output.executionProgress.completedSteps,
    nextActionCount: output.nextActions.actions.length,
    checklistItemCount: output.activeChecklist.items.length,
    executionCompanionChain: AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toExecutionCompanionContextScreen(
  output: AiExecutionCompanionExperienceOutput
): ExecutionCompanionContextScreen {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    execution_context: output.executionContext,
    execution_companion_confidence: output.executionCompanionConfidence,
    read_only: true,
  };
}

export function toExecutionCompanionDomainScreen<T>(
  output: AiExecutionCompanionExperienceOutput,
  view: T
): ExecutionCompanionDomainScreen {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toExecutionCompanionExplanationScreen(
  output: AiExecutionCompanionExperienceOutput
): ExecutionCompanionExplanationScreen {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    execution_companion_confidence: output.executionCompanionConfidence,
    read_only: true,
  };
}

export function toExecutionCompanionSummaryScreen(
  summary: AiExecutionCompanionExperienceSummary
): ExecutionCompanionSummaryScreen {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toExecutionCompanionValidationScreen(
  validation: AiExecutionCompanionExperienceValidation
): ExecutionCompanionValidationScreen {
  return {
    schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
