export {
  ACTION_PLANNING_SCHEMA_VERSION,
  ACTION_PLANNING_JSON_SCHEMA,
  ACTION_PLANNING_FIXED_TIMESTAMP,
  ACTION_PLANNING_ROUTES,
  PLANNING_SCENARIO_IDS,
  PLANNING_CHAIN,
  STAGE_PHASES,
  type PlanningScenarioId,
  type StagePhase,
} from "./domain/action-planning-schema.js";

export type {
  ActionPlan,
  ActionPlanningContext,
  ActionStage,
  ActionTask,
  ActionDependency,
  DecisionPoint,
  ParallelExecutionGroup,
  SequentialExecutionGroup,
  CompletionCriteria,
  ActionTimeline,
  ActionPlanningSummary,
  ActionPlanningValidation,
} from "./domain/action-plan.js";

export {
  PLAN_TEMPLATES,
  getPlanTemplate,
  listPlanTemplates,
  type PlanTemplate,
  type PlanTaskTemplate,
} from "./domain/plan-templates.js";

export {
  buildActionPlanningHome,
  toActionPlanScreen,
  toTimelineScreen,
  toDependencyGraphScreen,
  toCompletionCriteriaScreen,
  toPlanningSummaryScreen,
  toActionPlanningValidationScreen,
  buildPlanningSummary,
  collectActionPlanningPaths,
  type ActionPlanningHome,
  type ActionPlanScreen,
  type TimelineScreen,
  type DependencyGraphScreen,
  type CompletionCriteriaScreen,
  type PlanningSummaryScreen,
} from "./domain/action-planning-screens.js";

export {
  PLANNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPlanning,
  resolveCanonicalActionFromC1Scenario,
} from "./application/c2-planning-bridge.js";

export { ActionPlanBuilder, createActionPlanBuilder } from "./application/action-plan-builder.js";
export { DependencyResolver, createDependencyResolver } from "./application/dependency-resolver.js";
export { TimelineEstimator, createTimelineEstimator } from "./application/timeline-estimator.js";
export {
  ParallelExecutionAnalyzer,
  createParallelExecutionAnalyzer,
} from "./application/parallel-execution-analyzer.js";
export {
  CompletionCriteriaBuilder,
  createCompletionCriteriaBuilder,
} from "./application/completion-criteria-builder.js";
export {
  ActionPlanningValidator,
  createActionPlanningValidator,
} from "./application/action-planning-validator.js";

export {
  ActionPlanningService,
  createActionPlanningService,
  createActionPlanningModule,
  type ActionPlanningModule,
  type ActionPlanningQuery,
} from "./application/action-planning-service.js";

export {
  ActionPlanningRepository,
  createActionPlanningRepository,
} from "./infrastructure/action-planning-repository.js";
