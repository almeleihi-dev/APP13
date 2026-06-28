import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiDecisionSupportExperienceService,
  type AiDecisionSupportExperienceService,
} from "../../ai-decision-support-experience/application/ai-decision-support-experience-service.js";
import {
  AI_ACTION_PLANNING_EXPERIENCE_JSON_SCHEMA,
  AI_ACTION_PLANNING_EXPERIENCE_ROUTES,
  AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
  type ActionPlanningScenarioId,
} from "../domain/ai-action-planning-experience-schema.js";
import type { AiActionPlanningExperienceContext } from "../domain/ai-action-planning-experience-context.js";
import {
  buildAiActionPlanningExperienceHome,
  buildAiActionPlanningExperienceSummary,
  toActionPlanningContextScreen,
  toActionPlanningDomainScreen,
  toActionPlanningExplanationScreen,
  toActionPlanningSummaryScreen,
  toActionPlanningValidationScreen,
} from "../domain/ai-action-planning-experience-screens.js";
import {
  createActionPlanningContextBuilder,
  createActionPlanBuilder,
  createPrioritizedTasksBuilder,
  createMilestonesBuilder,
  createTimelineBuilder,
  createPlanningDependenciesBuilder,
  createExecutionChecklistBuilder,
  createActionPlanningReadinessBuilder,
  createDelegationActionPlanningBuilder,
  createActionPlanningConfidenceBuilder,
  createActionPlanningExplanationBuilder,
} from "./ai-action-planning-experience-builder.js";
import { createAiActionPlanningExperienceValidator } from "./ai-action-planning-experience-validator.js";
import {
  createAiActionPlanningExperienceRepository,
  type AiActionPlanningExperienceRepository,
} from "../infrastructure/ai-action-planning-experience-repository.js";

export interface AiActionPlanningExperienceQuery {
  scenario_id?: ActionPlanningScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiActionPlanningExperienceService {
  private readonly repository: AiActionPlanningExperienceRepository;
  private readonly aiDecisionSupportExperience: AiDecisionSupportExperienceService;
  private readonly contextBuilder = createActionPlanningContextBuilder();
  private readonly planBuilder = createActionPlanBuilder();
  private readonly tasksBuilder = createPrioritizedTasksBuilder();
  private readonly milestonesBuilder = createMilestonesBuilder();
  private readonly timelineBuilder = createTimelineBuilder();
  private readonly dependenciesBuilder = createPlanningDependenciesBuilder();
  private readonly checklistBuilder = createExecutionChecklistBuilder();
  private readonly readinessBuilder = createActionPlanningReadinessBuilder();
  private readonly delegationBuilder = createDelegationActionPlanningBuilder();
  private readonly confidenceBuilder = createActionPlanningConfidenceBuilder();
  private readonly explanationBuilder = createActionPlanningExplanationBuilder();
  private readonly validator = createAiActionPlanningExperienceValidator();

  constructor(deps?: {
    repository?: AiActionPlanningExperienceRepository;
    aiDecisionSupportExperience?: AiDecisionSupportExperienceService;
  }) {
    this.aiDecisionSupportExperience =
      deps?.aiDecisionSupportExperience ?? createAiDecisionSupportExperienceService();
    this.repository =
      deps?.repository ??
      createAiActionPlanningExperienceRepository({
        aiDecisionSupportExperience: this.aiDecisionSupportExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const decisionSupportHome = this.aiDecisionSupportExperience.getHome(authContext);
    return buildAiActionPlanningExperienceHome({ scenarios: decisionSupportHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toActionPlanningContextScreen(this.buildOutput(authContext, query));
  }

  getPlan(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.actionPlan);
  }

  getTasks(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.prioritizedTasks);
  }

  getMilestones(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.milestones);
  }

  getTimeline(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.timeline);
  }

  getDependencies(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.planningDependencies);
  }

  getChecklist(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.executionChecklist);
  }

  getReadiness(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.actionPlanningReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningDomainScreen(output, output.delegationActionPlanning);
  }

  getExplanation(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toActionPlanningExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toActionPlanningSummaryScreen(buildAiActionPlanningExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toActionPlanningValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toActionPlanningValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_ACTION_PLANNING_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_ACTION_PLANNING_EXPERIENCE_ROUTES,
      json_schema: AI_ACTION_PLANNING_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: AiActionPlanningExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiActionPlanningExperienceQuery) {
    const context = toContext(query);
    const decisionSupportQuery = toDecisionSupportQuery(query);
    const { decisionSupport } = this.repository.resolveUpstream(
      authContext,
      context,
      decisionSupportQuery
    );

    const actionPlanningContext = this.contextBuilder.build(decisionSupport);
    const actionPlan = this.planBuilder.build(decisionSupport);
    const prioritizedTasks = this.tasksBuilder.build(decisionSupport, actionPlan);
    const milestones = this.milestonesBuilder.build(decisionSupport);
    const timeline = this.timelineBuilder.build(decisionSupport);
    const planningDependencies = this.dependenciesBuilder.build(decisionSupport);
    const executionChecklist = this.checklistBuilder.build(prioritizedTasks);
    const actionPlanningReadiness = this.readinessBuilder.build(decisionSupport);
    const delegationActionPlanning = this.delegationBuilder.build(decisionSupport);
    const actionPlanningConfidence = this.confidenceBuilder.build(
      decisionSupport,
      actionPlanningReadiness.readinessScore
    );

    const outputId = `action-planning-${decisionSupport.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: decisionSupport.goal,
      plan: actionPlan,
      tasks: prioritizedTasks,
      milestones,
      readiness: actionPlanningReadiness,
      actionPlanningConfidenceScore: actionPlanningConfidence.score,
    });

    return {
      outputId,
      decisionSupportOutputId: decisionSupport.outputId,
      guidanceOutputId: decisionSupport.guidanceOutputId,
      conversationOutputId: decisionSupport.conversationOutputId,
      foundationOutputId: decisionSupport.foundationOutputId,
      closureOutputId: decisionSupport.closureOutputId,
      canonicalActionId: decisionSupport.canonicalActionId,
      scenarioId: decisionSupport.scenarioId,
      goal: decisionSupport.goal,
      actionPlanningContext,
      actionPlan,
      prioritizedTasks,
      milestones,
      timeline,
      planningDependencies,
      executionChecklist,
      actionPlanningReadiness,
      delegationActionPlanning,
      actionPlanningConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiActionPlanningExperienceQuery): AiActionPlanningExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toDecisionSupportQuery(query: AiActionPlanningExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiActionPlanningExperienceService(
  deps?: ConstructorParameters<typeof AiActionPlanningExperienceService>[0]
): AiActionPlanningExperienceService {
  return new AiActionPlanningExperienceService(deps);
}

export function createAiActionPlanningExperienceModule(deps?: {
  repository?: AiActionPlanningExperienceRepository;
  aiDecisionSupportExperience?: AiDecisionSupportExperienceService;
}) {
  const aiDecisionSupportExperience =
    deps?.aiDecisionSupportExperience ?? createAiDecisionSupportExperienceService();
  const aiActionPlanningExperience = createAiActionPlanningExperienceService({
    aiDecisionSupportExperience,
    repository:
      deps?.repository ??
      createAiActionPlanningExperienceRepository({ aiDecisionSupportExperience }),
  });
  return { aiActionPlanningExperience };
}

export type AiActionPlanningExperienceModule = ReturnType<
  typeof createAiActionPlanningExperienceModule
>;
