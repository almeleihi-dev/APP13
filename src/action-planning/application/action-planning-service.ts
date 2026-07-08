import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  ACTION_PLANNING_JSON_SCHEMA,
  ACTION_PLANNING_ROUTES,
  ACTION_PLANNING_SCHEMA_VERSION,
  type PlanningScenarioId,
} from "../domain/action-planning-schema.js";
import type { ActionPlanningContext } from "../domain/action-plan.js";
import {
  buildActionPlanningHome,
  buildPlanningSummary,
  toActionPlanScreen,
  toActionPlanningValidationScreen,
  toCompletionCriteriaScreen,
  toDependencyGraphScreen,
  toPlanningSummaryScreen,
  toTimelineScreen,
} from "../domain/action-planning-screens.js";
import { createActionPlanBuilder } from "./action-plan-builder.js";
import { createActionPlanningValidator } from "./action-planning-validator.js";
import { resolveCanonicalActionIdForPlanning } from "./c2-planning-bridge.js";
import {
  createActionPlanningRepository,
  type ActionPlanningRepository,
} from "../infrastructure/action-planning-repository.js";

export interface ActionPlanningQuery {
  scenario_id?: PlanningScenarioId;
  canonical_action_id?: string;
  intent?: string;
}

export class ActionPlanningService {
  private readonly repository: ActionPlanningRepository;
  private readonly planBuilder = createActionPlanBuilder();
  private readonly validator = createActionPlanningValidator();

  constructor(deps?: { repository?: ActionPlanningRepository }) {
    this.repository = deps?.repository ?? createActionPlanningRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listPlanningScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildActionPlanningHome({ scenarios });
  }

  getPlan(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    const plan = this.buildPlan(toContext(query));
    return toActionPlanScreen(plan);
  }

  getTimeline(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    const plan = this.buildPlan(toContext(query));
    return toTimelineScreen(plan);
  }

  getDependencies(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    const plan = this.buildPlan(toContext(query));
    return toDependencyGraphScreen(plan);
  }

  getCompletion(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    const plan = this.buildPlan(toContext(query));
    return toCompletionCriteriaScreen(plan);
  }

  getSummary(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    const plan = this.buildPlan(toContext(query));
    return toPlanningSummaryScreen(buildPlanningSummary(plan));
  }

  validate(authContext: AuthContext, query: ActionPlanningQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toActionPlanningValidationScreen(this.validator.validateCatalogCoverage());
    }
    const plan = this.buildPlan(toContext(query));
    return toActionPlanningValidationScreen(this.validator.validatePlan(plan));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ACTION_PLANNING_SCHEMA_VERSION,
      routes: ACTION_PLANNING_ROUTES,
      json_schema: ACTION_PLANNING_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildPlan(context: ActionPlanningContext) {
    const resolved = resolveCanonicalActionIdForPlanning({
      scenarioId: context.scenarioId,
      canonicalActionId: context.canonicalActionId,
    });
    const canonicalAction = this.repository.getCanonicalAction(resolved.canonicalActionId);
    if (!canonicalAction) {
      throw new Error(`Canonical action not found: ${resolved.canonicalActionId}`);
    }
    return this.planBuilder.build(context, canonicalAction);
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ActionPlanningQuery): ActionPlanningContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    rawIntent: query.intent,
    source: "api",
  };
}

export function createActionPlanningService(
  deps?: ConstructorParameters<typeof ActionPlanningService>[0]
): ActionPlanningService {
  return new ActionPlanningService(deps);
}

export function createActionPlanningModule(deps?: {
  repository?: ActionPlanningRepository;
}) {
  const actionPlanning = createActionPlanningService(deps);
  return { actionPlanning };
}

export type ActionPlanningModule = ReturnType<typeof createActionPlanningModule>;
