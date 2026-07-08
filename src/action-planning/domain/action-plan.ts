import type { PlanningScenarioId, StagePhase } from "./action-planning-schema.js";

export interface ActionPlanningContext {
  scenarioId?: PlanningScenarioId;
  canonicalActionId?: string;
  rawIntent?: string;
  source?: string;
}

export interface ActionTask {
  taskId: string;
  stageId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: { min: number; max: number };
  requiredSkillIds: string[];
  requiredResourceIds: string[];
  parallelCapable: boolean;
}

export interface ActionStage {
  stageId: string;
  phase: StagePhase;
  order: number;
  title: string;
  description: string;
  taskIds: string[];
}

export interface ActionDependency {
  dependencyId: string;
  sourceTaskId: string;
  targetTaskId: string;
  dependencyType: "blocks" | "requires" | "enables";
  description: string;
}

export interface DecisionPoint {
  decisionId: string;
  stageId: string;
  label: string;
  description: string;
  gateType: "precondition" | "approval" | "verification";
  mandatory: boolean;
}

export interface ParallelExecutionGroup {
  groupId: string;
  stageId: string;
  taskIds: string[];
  rationale: string;
}

export interface SequentialExecutionGroup {
  groupId: string;
  stageId: string;
  taskIds: string[];
  rationale: string;
}

export interface CompletionCriteria {
  criteriaId: string;
  label: string;
  description: string;
  evidenceRequired: string[];
  mandatory: boolean;
}

export interface ActionTimeline {
  timelineId: string;
  minHours: number;
  maxHours: number;
  stageDurations: Array<{
    stageId: string;
    minMinutes: number;
    maxMinutes: number;
  }>;
  summary: string;
}

export interface ActionPlan {
  planId: string;
  goal: string;
  canonicalActionId: string;
  canonicalActionName: string;
  scenarioId: PlanningScenarioId | null;
  category: string;
  stages: ActionStage[];
  tasks: ActionTask[];
  dependencies: ActionDependency[];
  decisionPoints: DecisionPoint[];
  parallelGroups: ParallelExecutionGroup[];
  sequentialGroups: SequentialExecutionGroup[];
  completionCriteria: CompletionCriteria[];
  timeline: ActionTimeline;
  requiredSkills: Array<{ skillId: string; name: string; level: string }>;
  requiredResources: Array<{ resourceId: string; name: string; type: string }>;
  readOnly: true;
}

export interface ActionPlanningSummary {
  schemaVersion: string;
  planId: string;
  goal: string;
  canonicalActionId: string;
  scenarioId: PlanningScenarioId | null;
  stageCount: number;
  taskCount: number;
  dependencyCount: number;
  parallelGroupCount: number;
  sequentialGroupCount: number;
  decisionPointCount: number;
  completionCriteriaCount: number;
  timelineSummary: string;
  planningChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface ActionPlanningValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
