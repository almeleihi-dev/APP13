import {
  ACTION_PLANNING_FIXED_TIMESTAMP,
  ACTION_PLANNING_SCHEMA_VERSION,
  PLANNING_CHAIN,
  PLANNING_SCENARIO_IDS,
} from "./action-planning-schema.js";
import type {
  ActionPlan,
  ActionPlanningSummary,
  ActionPlanningValidation,
} from "./action-plan.js";

export interface ActionPlanningHome {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  headline: string;
  description: string;
  planning_chain: readonly string[];
  scenario_count: number;
  scenarios: Array<{ scenario_id: string; canonical_action_id: string; goal: string }>;
  c1_c2_integration_note: string;
  read_only: true;
  generated_at: string;
}

export interface ActionPlanScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  plan: ActionPlan;
  read_only: true;
}

export interface TimelineScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  plan_id: string;
  timeline: ActionPlan["timeline"];
  read_only: true;
}

export interface DependencyGraphScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  plan_id: string;
  dependency_count: number;
  dependencies: ActionPlan["dependencies"];
  parallel_groups: ActionPlan["parallelGroups"];
  sequential_groups: ActionPlan["sequentialGroups"];
  read_only: true;
}

export interface CompletionCriteriaScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  plan_id: string;
  decision_points: ActionPlan["decisionPoints"];
  completion_criteria: ActionPlan["completionCriteria"];
  read_only: true;
}

export interface PlanningSummaryScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  summary: ActionPlanningSummary;
  read_only: true;
}

export interface ActionPlanningValidationScreen {
  schema_version: typeof ACTION_PLANNING_SCHEMA_VERSION;
  validation: ActionPlanningValidation;
  read_only: true;
}

export function buildActionPlanningHome(input: {
  scenarios: ActionPlanningHome["scenarios"];
}): ActionPlanningHome {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    headline: "AN ACT Action Planning",
    description:
      "Transforms canonical actions into read-only executable plans with stages, dependencies, timeline, and completion criteria.",
    planning_chain: PLANNING_CHAIN,
    scenario_count: input.scenarios.length,
    scenarios: input.scenarios,
    c1_c2_integration_note:
      "Plans are built from CH4-C2 canonical actions; scenario_id reuses CH4-C1 classifications.",
    read_only: true,
    generated_at: ACTION_PLANNING_FIXED_TIMESTAMP,
  };
}

export function toActionPlanScreen(plan: ActionPlan): ActionPlanScreen {
  return { schema_version: ACTION_PLANNING_SCHEMA_VERSION, plan, read_only: true };
}

export function toTimelineScreen(plan: ActionPlan): TimelineScreen {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    plan_id: plan.planId,
    timeline: plan.timeline,
    read_only: true,
  };
}

export function toDependencyGraphScreen(plan: ActionPlan): DependencyGraphScreen {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    plan_id: plan.planId,
    dependency_count: plan.dependencies.length,
    dependencies: plan.dependencies,
    parallel_groups: plan.parallelGroups,
    sequential_groups: plan.sequentialGroups,
    read_only: true,
  };
}

export function toCompletionCriteriaScreen(plan: ActionPlan): CompletionCriteriaScreen {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    plan_id: plan.planId,
    decision_points: plan.decisionPoints,
    completion_criteria: plan.completionCriteria,
    read_only: true,
  };
}

export function toPlanningSummaryScreen(summary: ActionPlanningSummary): PlanningSummaryScreen {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    summary,
    read_only: true,
  };
}

export function toActionPlanningValidationScreen(
  validation: ActionPlanningValidation
): ActionPlanningValidationScreen {
  return {
    schema_version: ACTION_PLANNING_SCHEMA_VERSION,
    validation,
    read_only: true,
  };
}

export function buildPlanningSummary(plan: ActionPlan): ActionPlanningSummary {
  return {
    schemaVersion: ACTION_PLANNING_SCHEMA_VERSION,
    planId: plan.planId,
    goal: plan.goal,
    canonicalActionId: plan.canonicalActionId,
    scenarioId: plan.scenarioId,
    stageCount: plan.stages.length,
    taskCount: plan.tasks.length,
    dependencyCount: plan.dependencies.length,
    parallelGroupCount: plan.parallelGroups.length,
    sequentialGroupCount: plan.sequentialGroups.length,
    decisionPointCount: plan.decisionPoints.length,
    completionCriteriaCount: plan.completionCriteria.length,
    timelineSummary: plan.timeline.summary,
    planningChain: PLANNING_CHAIN,
    readOnly: true,
    generatedAt: ACTION_PLANNING_FIXED_TIMESTAMP,
  };
}

export function collectActionPlanningPaths(): string[] {
  return [
    "docs/action-intelligence/CH4-C3-Action-Planning-Engine.md",
    "src/action-planning/module.ts",
    "src/api/routes/action-planning.ts",
    "src/bootstrap/intelligence.ts",
    "src/bootstrap/routes.ts",
    "test/ch4-c3-action-planning.test.ts",
    "scripts/verify-ch4-c3.sh",
  ];
}

export { PLANNING_SCENARIO_IDS };
