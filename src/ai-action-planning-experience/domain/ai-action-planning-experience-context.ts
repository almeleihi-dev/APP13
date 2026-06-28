import type {
  ActionPlanningConfidenceLevel,
  ActionPlanningStatusLevel,
  ActionPlanningScenarioId,
} from "./ai-action-planning-experience-schema.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";

export interface AiActionPlanningExperienceContext {
  scenarioId?: ActionPlanningScenarioId;
  canonicalActionId?: string;
  urgency?: UrgencyLevel;
  distanceBand?: DistanceBand;
  rawIntent?: string;
  source?: string;
}

export interface PlanningCheck {
  checkId: string;
  label: string;
  passed: boolean;
  score: number;
  detail: string;
}

export interface ActionPlanningContext {
  contextId: string;
  decisionSupportOutputId: string;
  decisionSupportContextId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  scenarioId: ActionPlanningScenarioId | null;
  canonicalActionId: string;
  goal: string;
  experienceMode: "read_only";
}

export interface ActionPlan {
  planId: string;
  title: string;
  goal: string;
  recommendedAction: string;
  taskCount: number;
  readOnly: true;
  summary: string;
}

export interface PrioritizedTask {
  taskId: string;
  priority: number;
  title: string;
  detail: string;
  sourceOptionId: string;
}

export interface PrioritizedTasks {
  tasksId: string;
  planId: string;
  tasks: PrioritizedTask[];
  summary: string;
}

export interface Milestone {
  milestoneId: string;
  sequence: number;
  title: string;
  detail: string;
}

export interface Milestones {
  milestonesId: string;
  milestones: Milestone[];
  summary: string;
}

export interface TimelinePhase {
  phaseId: string;
  sequence: number;
  label: string;
  detail: string;
}

export interface Timeline {
  timelineId: string;
  phases: TimelinePhase[];
  summary: string;
}

export interface PlanningDependency {
  dependencyId: string;
  sequence: number;
  label: string;
  detail: string;
}

export interface PlanningDependencies {
  dependenciesId: string;
  dependencies: PlanningDependency[];
  summary: string;
}

export interface ChecklistItem {
  itemId: string;
  sequence: number;
  label: string;
  detail: string;
  completed: false;
}

export interface ExecutionChecklist {
  checklistId: string;
  items: ChecklistItem[];
  summary: string;
}

export interface ActionPlanningReadiness {
  readinessId: string;
  level: ActionPlanningStatusLevel;
  readinessScore: number;
  planningReady: boolean;
  checks: PlanningCheck[];
  summary: string;
}

export interface DelegationActionPlanning {
  delegationId: string;
  soleUpstream: string;
  noDuplicatedLogic: boolean;
  decisionSupportOutputId: string;
  checks: PlanningCheck[];
  summary: string;
}

export interface ActionPlanningConfidence {
  level: ActionPlanningConfidenceLevel;
  score: number;
  rationale: string;
  decisionSupportConfidenceScore: number;
}

export interface ActionPlanningExplanation {
  explanationId: string;
  headline: string;
  summary: string;
  planSummary: string;
  tasksSummary: string;
  readinessSummary: string;
}

export interface AiActionPlanningExperienceOutput {
  outputId: string;
  decisionSupportOutputId: string;
  guidanceOutputId: string;
  conversationOutputId: string;
  foundationOutputId: string;
  closureOutputId: string;
  canonicalActionId: string;
  scenarioId: ActionPlanningScenarioId | null;
  goal: string;
  actionPlanningContext: ActionPlanningContext;
  actionPlan: ActionPlan;
  prioritizedTasks: PrioritizedTasks;
  milestones: Milestones;
  timeline: Timeline;
  planningDependencies: PlanningDependencies;
  executionChecklist: ExecutionChecklist;
  actionPlanningReadiness: ActionPlanningReadiness;
  delegationActionPlanning: DelegationActionPlanning;
  actionPlanningConfidence: ActionPlanningConfidence;
  explanation: ActionPlanningExplanation;
  readOnly: true;
}

export interface AiActionPlanningExperienceSummary {
  schemaVersion: string;
  outputId: string;
  goal: string;
  scenarioId: ActionPlanningScenarioId | null;
  actionPlanningConfidenceLevel: ActionPlanningConfidenceLevel;
  actionPlanningConfidenceScore: number;
  planningReady: boolean;
  taskCount: number;
  milestoneCount: number;
  checklistItemCount: number;
  actionPlanningChain: readonly string[];
  readOnly: true;
  generatedAt: string;
}

export interface AiActionPlanningExperienceValidation {
  valid: boolean;
  completenessScore: number;
  missingFields: string[];
  warnings: string[];
  summary: string;
}
