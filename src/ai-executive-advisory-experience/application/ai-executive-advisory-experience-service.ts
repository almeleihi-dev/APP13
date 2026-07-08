import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiPredictiveForecastExperienceService,
  type AiPredictiveForecastExperienceService,
  type AiPredictiveForecastExperienceQuery,
} from "../../ai-predictive-forecast-experience/application/ai-predictive-forecast-experience-service.js";
import {
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_JSON_SCHEMA,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_ROUTES,
  AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
  type ExecutiveAdvisoryScenarioId,
} from "../domain/ai-executive-advisory-experience-schema.js";
import type { AiExecutiveAdvisoryExperienceContext } from "../domain/ai-executive-advisory-experience-context.js";
import {
  buildAiExecutiveAdvisoryExperienceHome,
  buildAiExecutiveAdvisoryExperienceSummary,
  toExecutiveAdvisoryDomainScreen,
  toExecutiveAdvisoryExplanationScreen,
  toExecutiveAdvisorySummaryScreen,
  toExecutiveAdvisoryValidationScreen,
} from "../domain/ai-executive-advisory-experience-screens.js";
import {
  createAdvisoryContextBuilder,
  createAdvisoryDashboardBuilder,
  createExecutiveBriefingBuilder,
  createAdvisoryRecommendationsBuilder,
  createActionPlanBuilder,
  createPriorityActionsBuilder,
  createRiskAdvisoryBuilder,
  createOpportunityAdvisoryBuilder,
  createAdvisoryConfidenceBuilder,
  createDelegationExecutiveAdvisoryBuilder,
  createAdvisoryExplanationBuilder,
} from "./ai-executive-advisory-experience-builder.js";
import { createAiExecutiveAdvisoryExperienceValidator } from "./ai-executive-advisory-experience-validator.js";
import {
  createAiExecutiveAdvisoryExperienceRepository,
  type AiExecutiveAdvisoryExperienceRepository,
} from "../infrastructure/ai-executive-advisory-experience-repository.js";

export interface AiExecutiveAdvisoryExperienceQuery {
  scenario_id?: ExecutiveAdvisoryScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiExecutiveAdvisoryExperienceService {
  private readonly repository: AiExecutiveAdvisoryExperienceRepository;
  private readonly aiPredictiveForecastExperience: AiPredictiveForecastExperienceService;
  private readonly contextBuilder = createAdvisoryContextBuilder();
  private readonly dashboardBuilder = createAdvisoryDashboardBuilder();
  private readonly briefingBuilder = createExecutiveBriefingBuilder();
  private readonly recommendationsBuilder = createAdvisoryRecommendationsBuilder();
  private readonly actionPlanBuilder = createActionPlanBuilder();
  private readonly priorityActionsBuilder = createPriorityActionsBuilder();
  private readonly riskAdvisoryBuilder = createRiskAdvisoryBuilder();
  private readonly opportunityAdvisoryBuilder = createOpportunityAdvisoryBuilder();
  private readonly confidenceBuilder = createAdvisoryConfidenceBuilder();
  private readonly delegationBuilder = createDelegationExecutiveAdvisoryBuilder();
  private readonly explanationBuilder = createAdvisoryExplanationBuilder();
  private readonly validator = createAiExecutiveAdvisoryExperienceValidator();

  constructor(deps?: {
    repository?: AiExecutiveAdvisoryExperienceRepository;
    aiPredictiveForecastExperience?: AiPredictiveForecastExperienceService;
  }) {
    this.aiPredictiveForecastExperience =
      deps?.aiPredictiveForecastExperience ?? createAiPredictiveForecastExperienceService();
    this.repository =
      deps?.repository ??
      createAiExecutiveAdvisoryExperienceRepository({
        aiPredictiveForecastExperience: this.aiPredictiveForecastExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const forecastHome = this.aiPredictiveForecastExperience.getHome(authContext);
    return buildAiExecutiveAdvisoryExperienceHome({ scenarios: forecastHome.scenarios });
  }

  getAdvisoryDashboard(
    authContext: AuthContext,
    query: AiExecutiveAdvisoryExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.advisoryDashboard);
  }

  getExecutiveBriefing(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.executiveBriefing);
  }

  getRecommendations(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.advisoryRecommendations);
  }

  getActionPlan(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.actionPlan);
  }

  getPriorityActions(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.priorityActions);
  }

  getRiskAdvisory(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.riskAdvisory);
  }

  getOpportunityAdvisory(
    authContext: AuthContext,
    query: AiExecutiveAdvisoryExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.opportunityAdvisory);
  }

  getConfidence(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisoryDomainScreen(output, output.advisoryConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExecutiveAdvisoryExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toExecutiveAdvisorySummaryScreen(buildAiExecutiveAdvisoryExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExecutiveAdvisoryValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toExecutiveAdvisoryValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_EXECUTIVE_ADVISORY_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_EXECUTIVE_ADVISORY_EXPERIENCE_ROUTES,
      json_schema: AI_EXECUTIVE_ADVISORY_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiExecutiveAdvisoryExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiExecutiveAdvisoryExperienceQuery) {
    const context = toContext(query);
    const forecastQuery = toPredictiveForecastQuery(query);
    const { predictiveForecast } = this.repository.resolveUpstream(
      authContext,
      context,
      forecastQuery
    );

    const advisoryContext = this.contextBuilder.build(predictiveForecast);
    const advisoryDashboard = this.dashboardBuilder.build(predictiveForecast);
    const executiveBriefing = this.briefingBuilder.build(predictiveForecast);
    const advisoryRecommendations = this.recommendationsBuilder.build(predictiveForecast);
    const actionPlan = this.actionPlanBuilder.build(predictiveForecast);
    const priorityActions = this.priorityActionsBuilder.build(predictiveForecast);
    const riskAdvisory = this.riskAdvisoryBuilder.build(predictiveForecast);
    const opportunityAdvisory = this.opportunityAdvisoryBuilder.build(predictiveForecast);
    const advisoryConfidence = this.confidenceBuilder.build(predictiveForecast);
    const delegationExecutiveAdvisory = this.delegationBuilder.build(predictiveForecast);

    const outputId = `executive-advisory-${predictiveForecast.outputId}`;

    const advisoryExplanation = this.explanationBuilder.build({
      outputId,
      goal: predictiveForecast.goal,
      dashboard: advisoryDashboard,
      briefing: executiveBriefing,
      actionPlan,
      advisoryConfidenceScore: advisoryConfidence.score,
    });

    return {
      outputId,
      predictiveForecastOutputId: predictiveForecast.outputId,
      strategicIntelligenceOutputId: predictiveForecast.strategicIntelligenceOutputId,
      decisionIntelligenceOutputId: predictiveForecast.decisionIntelligenceOutputId,
      orchestrationOutputId: predictiveForecast.orchestrationOutputId,
      foundationOutputId: predictiveForecast.foundationOutputId,
      closureOutputId: predictiveForecast.closureOutputId,
      canonicalActionId: predictiveForecast.canonicalActionId,
      scenarioId: predictiveForecast.scenarioId,
      goal: predictiveForecast.goal,
      advisoryContext,
      advisoryDashboard,
      executiveBriefing,
      advisoryRecommendations,
      actionPlan,
      priorityActions,
      riskAdvisory,
      opportunityAdvisory,
      advisoryConfidence,
      delegationExecutiveAdvisory,
      advisoryExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiExecutiveAdvisoryExperienceQuery
): AiExecutiveAdvisoryExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toPredictiveForecastQuery(
  query: AiExecutiveAdvisoryExperienceQuery
): AiPredictiveForecastExperienceQuery {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiExecutiveAdvisoryExperienceService(
  deps?: ConstructorParameters<typeof AiExecutiveAdvisoryExperienceService>[0]
): AiExecutiveAdvisoryExperienceService {
  return new AiExecutiveAdvisoryExperienceService(deps);
}

export function createAiExecutiveAdvisoryExperienceModule(deps?: {
  repository?: AiExecutiveAdvisoryExperienceRepository;
  aiPredictiveForecastExperience?: AiPredictiveForecastExperienceService;
}) {
  const aiPredictiveForecastExperience =
    deps?.aiPredictiveForecastExperience ?? createAiPredictiveForecastExperienceService();
  const aiExecutiveAdvisoryExperience = createAiExecutiveAdvisoryExperienceService({
    aiPredictiveForecastExperience,
    repository:
      deps?.repository ??
      createAiExecutiveAdvisoryExperienceRepository({ aiPredictiveForecastExperience }),
  });
  return { aiExecutiveAdvisoryExperience };
}

export type AiExecutiveAdvisoryExperienceModule = ReturnType<
  typeof createAiExecutiveAdvisoryExperienceModule
>;
