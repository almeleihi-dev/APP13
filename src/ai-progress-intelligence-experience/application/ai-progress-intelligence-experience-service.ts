import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiExecutionCompanionExperienceService,
  type AiExecutionCompanionExperienceService,
} from "../../ai-execution-companion-experience/application/ai-execution-companion-experience-service.js";
import {
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_ROUTES,
  AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  type ProgressIntelligenceScenarioId,
} from "../domain/ai-progress-intelligence-experience-schema.js";
import type { AiProgressIntelligenceExperienceContext } from "../domain/ai-progress-intelligence-experience-context.js";
import {
  buildAiProgressIntelligenceExperienceHome,
  buildAiProgressIntelligenceExperienceSummary,
  toProgressIntelligenceContextScreen,
  toProgressIntelligenceDomainScreen,
  toProgressIntelligenceExplanationScreen,
  toProgressIntelligenceSummaryScreen,
  toProgressIntelligenceValidationScreen,
} from "../domain/ai-progress-intelligence-experience-screens.js";
import {
  createProgressContextBuilder,
  createProgressOverviewBuilder,
  createCompletedActivitiesBuilder,
  createRemainingActivitiesBuilder,
  createProgressMetricsBuilder,
  createTimelineStatusBuilder,
  createRiskIndicatorsBuilder,
  createSuggestedNextActionsBuilder,
  createProgressIntelligenceReadinessBuilder,
  createDelegationProgressIntelligenceBuilder,
  createProgressIntelligenceConfidenceBuilder,
  createProgressIntelligenceExplanationBuilder,
} from "./ai-progress-intelligence-experience-builder.js";
import { createAiProgressIntelligenceExperienceValidator } from "./ai-progress-intelligence-experience-validator.js";
import {
  createAiProgressIntelligenceExperienceRepository,
  type AiProgressIntelligenceExperienceRepository,
} from "../infrastructure/ai-progress-intelligence-experience-repository.js";

export interface AiProgressIntelligenceExperienceQuery {
  scenario_id?: ProgressIntelligenceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiProgressIntelligenceExperienceService {
  private readonly repository: AiProgressIntelligenceExperienceRepository;
  private readonly aiExecutionCompanionExperience: AiExecutionCompanionExperienceService;
  private readonly contextBuilder = createProgressContextBuilder();
  private readonly overviewBuilder = createProgressOverviewBuilder();
  private readonly completedBuilder = createCompletedActivitiesBuilder();
  private readonly remainingBuilder = createRemainingActivitiesBuilder();
  private readonly metricsBuilder = createProgressMetricsBuilder();
  private readonly timelineBuilder = createTimelineStatusBuilder();
  private readonly risksBuilder = createRiskIndicatorsBuilder();
  private readonly nextActionsBuilder = createSuggestedNextActionsBuilder();
  private readonly readinessBuilder = createProgressIntelligenceReadinessBuilder();
  private readonly delegationBuilder = createDelegationProgressIntelligenceBuilder();
  private readonly confidenceBuilder = createProgressIntelligenceConfidenceBuilder();
  private readonly explanationBuilder = createProgressIntelligenceExplanationBuilder();
  private readonly validator = createAiProgressIntelligenceExperienceValidator();

  constructor(deps?: {
    repository?: AiProgressIntelligenceExperienceRepository;
    aiExecutionCompanionExperience?: AiExecutionCompanionExperienceService;
  }) {
    this.aiExecutionCompanionExperience =
      deps?.aiExecutionCompanionExperience ?? createAiExecutionCompanionExperienceService();
    this.repository =
      deps?.repository ??
      createAiProgressIntelligenceExperienceRepository({
        aiExecutionCompanionExperience: this.aiExecutionCompanionExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const companionHome = this.aiExecutionCompanionExperience.getHome(authContext);
    return buildAiProgressIntelligenceExperienceHome({ scenarios: companionHome.scenarios });
  }

  getContext(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toProgressIntelligenceContextScreen(this.buildOutput(authContext, query));
  }

  getOverview(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.progressOverview);
  }

  getCompleted(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.completedActivities);
  }

  getRemaining(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.remainingActivities);
  }

  getMetrics(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.progressMetrics);
  }

  getTimeline(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.timelineStatus);
  }

  getRisks(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.riskIndicators);
  }

  getNextActions(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.suggestedNextActions);
  }

  getReadiness(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.progressIntelligenceReadiness);
  }

  getDelegation(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceDomainScreen(output, output.delegationProgressIntelligence);
  }

  getExplanation(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toProgressIntelligenceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toProgressIntelligenceSummaryScreen(buildAiProgressIntelligenceExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toProgressIntelligenceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toProgressIntelligenceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: AI_PROGRESS_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiProgressIntelligenceExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiProgressIntelligenceExperienceQuery) {
    const context = toContext(query);
    const companionQuery = toExecutionCompanionQuery(query);
    const { executionCompanion } = this.repository.resolveUpstream(
      authContext,
      context,
      companionQuery
    );

    const progressContext = this.contextBuilder.build(executionCompanion);
    const progressOverview = this.overviewBuilder.build(executionCompanion);
    const completedActivities = this.completedBuilder.build(executionCompanion);
    const remainingActivities = this.remainingBuilder.build(executionCompanion);
    const progressMetrics = this.metricsBuilder.build(executionCompanion);
    const timelineStatus = this.timelineBuilder.build(executionCompanion);
    const riskIndicators = this.risksBuilder.build(executionCompanion);
    const suggestedNextActions = this.nextActionsBuilder.build(executionCompanion);
    const progressIntelligenceReadiness = this.readinessBuilder.build(executionCompanion);
    const delegationProgressIntelligence = this.delegationBuilder.build(executionCompanion);
    const progressIntelligenceConfidence = this.confidenceBuilder.build(
      executionCompanion,
      progressIntelligenceReadiness.readinessScore
    );

    const outputId = `progress-intelligence-${executionCompanion.outputId}`;

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: executionCompanion.goal,
      overview: progressOverview,
      metrics: progressMetrics,
      readiness: progressIntelligenceReadiness,
      progressIntelligenceConfidenceScore: progressIntelligenceConfidence.score,
    });

    return {
      outputId,
      executionCompanionOutputId: executionCompanion.outputId,
      actionPlanningOutputId: executionCompanion.actionPlanningOutputId,
      decisionSupportOutputId: executionCompanion.decisionSupportOutputId,
      guidanceOutputId: executionCompanion.guidanceOutputId,
      conversationOutputId: executionCompanion.conversationOutputId,
      foundationOutputId: executionCompanion.foundationOutputId,
      closureOutputId: executionCompanion.closureOutputId,
      canonicalActionId: executionCompanion.canonicalActionId,
      scenarioId: executionCompanion.scenarioId,
      goal: executionCompanion.goal,
      progressContext,
      progressOverview,
      completedActivities,
      remainingActivities,
      progressMetrics,
      timelineStatus,
      riskIndicators,
      suggestedNextActions,
      progressIntelligenceReadiness,
      delegationProgressIntelligence,
      progressIntelligenceConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: AiProgressIntelligenceExperienceQuery): AiProgressIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExecutionCompanionQuery(query: AiProgressIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiProgressIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof AiProgressIntelligenceExperienceService>[0]
): AiProgressIntelligenceExperienceService {
  return new AiProgressIntelligenceExperienceService(deps);
}

export function createAiProgressIntelligenceExperienceModule(deps?: {
  repository?: AiProgressIntelligenceExperienceRepository;
  aiExecutionCompanionExperience?: AiExecutionCompanionExperienceService;
}) {
  const aiExecutionCompanionExperience =
    deps?.aiExecutionCompanionExperience ?? createAiExecutionCompanionExperienceService();
  const aiProgressIntelligenceExperience = createAiProgressIntelligenceExperienceService({
    aiExecutionCompanionExperience,
    repository:
      deps?.repository ??
      createAiProgressIntelligenceExperienceRepository({ aiExecutionCompanionExperience }),
  });
  return { aiProgressIntelligenceExperience };
}

export type AiProgressIntelligenceExperienceModule = ReturnType<
  typeof createAiProgressIntelligenceExperienceModule
>;
