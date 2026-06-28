import {
  AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP,
  AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
  AI_ACTION_PLANNING_EXPERIENCE_CHAIN,
  UPSTREAM_MODULE_ID,
} from "./ai-action-planning-experience-schema.js";
import type {
  AiActionPlanningExperienceOutput,
  AiActionPlanningExperienceSummary,
  AiActionPlanningExperienceValidation,
} from "./ai-action-planning-experience-context.js";

export interface AiActionPlanningExperienceHome {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  headline: string;
  description: string;
  action_planning_chain: readonly string[];
  upstream_module: typeof UPSTREAM_MODULE_ID;
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  action_planning_views: readonly string[];
  read_only: true;
  generated_at: string;
}

export interface ActionPlanningContextScreen {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  action_planning_context: AiActionPlanningExperienceOutput["actionPlanningContext"];
  action_planning_confidence: AiActionPlanningExperienceOutput["actionPlanningConfidence"];
  read_only: true;
}

export interface ActionPlanningDomainScreen {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  view: unknown;
  read_only: true;
}

export interface ActionPlanningExplanationScreen {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  output_id: string;
  explanation: AiActionPlanningExperienceOutput["explanation"];
  action_planning_confidence: AiActionPlanningExperienceOutput["actionPlanningConfidence"];
  read_only: true;
}

export interface ActionPlanningSummaryScreen {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  summary: AiActionPlanningExperienceSummary;
  read_only: true;
}

export interface ActionPlanningValidationScreen {
  schema_version: typeof AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION;
  validation: AiActionPlanningExperienceValidation;
  read_only: true;
}

const ACTION_PLANNING_VIEWS = [
  "Action Planning Context",
  "Action Plan",
  "Prioritized Tasks",
  "Milestones",
  "Timeline",
  "Dependencies",
  "Execution Checklist",
  "Readiness",
  "Delegation",
] as const;

export function buildAiActionPlanningExperienceHome(input: {
  scenarios: AiActionPlanningExperienceHome["scenarios"];
}): AiActionPlanningExperienceHome {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    headline: "AN ACT AI Action Planning Experience",
    description:
      "Read-only AI Action Planning Experience for Chapter 5 — delegates-only via CH5-X4 AI Decision Support Experience.",
    action_planning_chain: AI_ACTION_PLANNING_EXPERIENCE_CHAIN,
    upstream_module: UPSTREAM_MODULE_ID,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    action_planning_views: ACTION_PLANNING_VIEWS,
    read_only: true,
    generated_at: AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function buildAiActionPlanningExperienceSummary(
  output: AiActionPlanningExperienceOutput
): AiActionPlanningExperienceSummary {
  return {
    schemaVersion: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    outputId: output.outputId,
    goal: output.goal,
    scenarioId: output.scenarioId,
    actionPlanningConfidenceLevel: output.actionPlanningConfidence.level,
    actionPlanningConfidenceScore: output.actionPlanningConfidence.score,
    planningReady: output.actionPlanningReadiness.planningReady,
    taskCount: output.prioritizedTasks.tasks.length,
    milestoneCount: output.milestones.milestones.length,
    checklistItemCount: output.executionChecklist.items.length,
    actionPlanningChain: AI_ACTION_PLANNING_EXPERIENCE_CHAIN,
    readOnly: true,
    generatedAt: AI_ACTION_PLANNING_EXPERIENCE_FIXED_TIMESTAMP,
  };
}

export function toActionPlanningContextScreen(
  output: AiActionPlanningExperienceOutput
): ActionPlanningContextScreen {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    action_planning_context: output.actionPlanningContext,
    action_planning_confidence: output.actionPlanningConfidence,
    read_only: true,
  };
}

export function toActionPlanningDomainScreen<T>(
  output: AiActionPlanningExperienceOutput,
  view: T
): ActionPlanningDomainScreen {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    view,
    read_only: true,
  };
}

export function toActionPlanningExplanationScreen(
  output: AiActionPlanningExperienceOutput
): ActionPlanningExplanationScreen {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    output_id: output.outputId,
    explanation: output.explanation,
    action_planning_confidence: output.actionPlanningConfidence,
    read_only: true,
  };
}

export function toActionPlanningSummaryScreen(
  summary: AiActionPlanningExperienceSummary
): ActionPlanningSummaryScreen {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toActionPlanningValidationScreen(
  validation: AiActionPlanningExperienceValidation
): ActionPlanningValidationScreen {
  return {
    schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}
