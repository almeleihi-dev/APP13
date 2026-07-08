import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiActionPlanningExperienceService,
  type AiActionPlanningExperienceService,
} from "../../ai-action-planning-experience/application/ai-action-planning-experience-service.js";
import {
  AI_EXECUTION_COMPANION_EXPERIENCE_JSON_SCHEMA,
  AI_EXECUTION_COMPANION_EXPERIENCE_ROUTES,
  AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
  type ExecutionCompanionScenarioId,
} from "../domain/ai-execution-companion-experience-schema.js";
import type { AiExecutionCompanionExperienceContext } from "../domain/ai-execution-companion-experience-context.js";
import {
  buildAiExecutionCompanionExperienceHome,
  buildAiExecutionCompanionExperienceSummary,
  toExecutionCompanionContextScreen,
  toExecutionCompanionDomainScreen,
  toExecutionCompanionExplanationScreen,
  toExecutionCompanionSummaryScreen,
  toExecutionCompanionValidationScreen,
} from "../domain/ai-execution-companion-experience-screens.js";
import {
  createExecutionContextBuilder,
  createCurrentStepBuilder,
  createExecutionProgressBuilder,
  createActiveChecklistBuilder,
  createNextActionsBuilder,
  createProgressTimelineBuilder,
  createCompletionForecastBuilder,
  createExecutionGuidanceBuilder,
  createExecutionCompanionReadinessBuilder,
  createDelegationExecutionCompanionBuilder,
  createExecutionCompanionConfidenceBuilder,
  createExecutionCompanionExplanationBuilder,
} from "./ai-execution-companion-experience-builder.js";
import { createAiExecutionCompanionExperienceValidator } from "./ai-execution-companion-experience-validator.js";
import {
  createAiExecutionCompanionExperienceRepository,
  type AiExecutionCompanionExperienceRepository,
} from "../infrastructure/ai-execution-companion-experience-repository.js";

export interface AiExecutionCompanionExperienceQuery {
  scenario_id?: ExecutionCompanionScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiExecutionCompanionExperienceService {
  private readonly repository: AiExecutionCompanionExperienceRepository;
  private readonly aiActionPlanningExperience: AiActionPlanningExperienceService;
  private readonly contextBuilder = createExecutionContextBuilder();
  private readonly currentStepBuilder = createCurrentStepBuilder();
  private readonly progressBuilder = createExecutionProgressBuilder();
  private readonly checklistBuilder = createActiveChecklistBuilder();
  private readonly nextActionsBuilder = createNextActionsBuilder();
  private readonly timelineBuilder = createProgressTimelineBuilder();
  private readonly forecastBuilder = createCompletionForecastBuilder();
  private readonly guidanceBuilder = createExecutionGuidanceBuilder();
  private readonly readinessBuilder = createExecutionCompanionReadinessBuilder();
  private readonly delegationBuilder = createDelegationExecutionCompanionBuilder();
  private readonly confidenceBuilder = createExecutionCompanionConfidenceBuilder();
  private readonly explanationBuilder = createExecutionCompanionExplanationBuilder();
  private readonly validator = createAiExecutionCompanionExperienceValidator();

  constructor(deps?: {
    repository?: AiExecutionCompanionExperienceRepository;
    aiActionPlanningExperience?: AiActionPlanningExperienceService;
  }) {
    this.aiActionPlanningExperience =
      deps?.aiActionPlanningExperience ?? createAiActionPlanningExperienceService();
    this.repository =
      deps?.repository ??
      createAiExecutionCompanionExperienceRepository({
        aiActionPlanningExperience: this.aiActionPlanningExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const actionPlanningHome = this.aiActionPlanningExperience.getHome(authContext);
    return buildAiExecutionCompanionExperienceHome({ scenarios: actionPlanningHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionCompanionContextScreen(this.buildOutput(authContext, query));
  }

  getCurrentStep(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.currentStep);
  }

  getProgress(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.executionProgress);
  }

  getChecklist(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.activeChecklist);
  }

  getNextActions(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.nextActions);
  }

  getTimeline(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.progressTimeline);
  }

  getForecast(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.completionForecast);
  }

  getGuidance(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.executionGuidance);
  }

  getReadiness(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.executionCompanionReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionDomainScreen(output, output.delegationExecutionCompanion);
  }

  getExplanation(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutionCompanionExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutionCompanionSummaryScreen(buildAiExecutionCompanionExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExecutionCompanionValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toExecutionCompanionValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_EXECUTION_COMPANION_EXPERIENCE_ROUTES,
      json_schema: AI_EXECUTION_COMPANION_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiExecutionCompanionExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiExecutionCompanionExperienceQuery) {
    const context = toContext(query);
    const actionPlanningQuery = toActionPlanningQuery(query);
    const { actionPlanning } = this.repository.resolveUpstream(
      authContext,
      context,
      actionPlanningQuery
    );

    const executionContext = this.contextBuilder.build(actionPlanning);
    const currentStep = this.currentStepBuilder.build(actionPlanning);
    const executionProgress = this.progressBuilder.build(actionPlanning);
    const activeChecklist = this.checklistBuilder.build(actionPlanning);
    const nextActions = this.nextActionsBuilder.build(actionPlanning);
    const progressTimeline = this.timelineBuilder.build(actionPlanning);
    const completionForecast = this.forecastBuilder.build(actionPlanning);
    const executionGuidance = this.guidanceBuilder.build(actionPlanning, currentStep);
    const executionCompanionReadiness = this.readinessBuilder.build(actionPlanning);
    const delegationExecutionCompanion = this.delegationBuilder.build(actionPlanning);
    const executionCompanionConfidence = this.confidenceBuilder.build(
      actionPlanning,
      executionCompanionReadiness.readinessScore
    );

    const outputId = `execution-companion-${actionPlanning.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: actionPlanning.goal,
      progress: executionProgress,
      guidance: executionGuidance,
      readiness: executionCompanionReadiness,
      executionCompanionConfidenceScore: executionCompanionConfidence.score,
    });

    return {
      outputId,
      actionPlanningOutputId: actionPlanning.outputId,
      decisionSupportOutputId: actionPlanning.decisionSupportOutputId,
      guidanceOutputId: actionPlanning.guidanceOutputId,
      conversationOutputId: actionPlanning.conversationOutputId,
      foundationOutputId: actionPlanning.foundationOutputId,
      closureOutputId: actionPlanning.closureOutputId,
      canonicalActionId: actionPlanning.canonicalActionId,
      scenarioId: actionPlanning.scenarioId,
      goal: actionPlanning.goal,
      executionContext,
      currentStep,
      executionProgress,
      activeChecklist,
      nextActions,
      progressTimeline,
      completionForecast,
      executionGuidance,
      executionCompanionReadiness,
      delegationExecutionCompanion,
      executionCompanionConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiExecutionCompanionExperienceQuery): AiExecutionCompanionExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toActionPlanningQuery(query: AiExecutionCompanionExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiExecutionCompanionExperienceService(
  deps?: ConstructorParameters<typeof AiExecutionCompanionExperienceService>[0]
): AiExecutionCompanionExperienceService {
  return new AiExecutionCompanionExperienceService(deps);
}

export function createAiExecutionCompanionExperienceModule(deps?: {
  repository?: AiExecutionCompanionExperienceRepository;
  aiActionPlanningExperience?: AiActionPlanningExperienceService;
}) {
  const aiActionPlanningExperience =
    deps?.aiActionPlanningExperience ?? createAiActionPlanningExperienceService();
  const aiExecutionCompanionExperience = createAiExecutionCompanionExperienceService({
    aiActionPlanningExperience,
    repository:
      deps?.repository ??
      createAiExecutionCompanionExperienceRepository({ aiActionPlanningExperience }),
  });
  return { aiExecutionCompanionExperience };
}

export type AiExecutionCompanionExperienceModule = ReturnType<
  typeof createAiExecutionCompanionExperienceModule
>;
