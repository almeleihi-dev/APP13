import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  createAiStrategicIntelligenceExperienceService,
  type AiStrategicIntelligenceExperienceService,
} from "../../ai-strategic-intelligence-experience/application/ai-strategic-intelligence-experience-service.js";
import {
  AI_PREDICTIVE_FORECAST_EXPERIENCE_JSON_SCHEMA,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_ROUTES,
  AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
  type PredictiveForecastScenarioId,
} from "../domain/ai-predictive-forecast-experience-schema.js";
import type { AiPredictiveForecastExperienceContext } from "../domain/ai-predictive-forecast-experience-context.js";
import {
  buildAiPredictiveForecastExperienceHome,
  buildAiPredictiveForecastExperienceSummary,
  toPredictiveForecastDomainScreen,
  toPredictiveForecastExplanationScreen,
  toPredictiveForecastSummaryScreen,
  toPredictiveForecastValidationScreen,
} from "../domain/ai-predictive-forecast-experience-screens.js";
import {
  createPredictiveForecastContextBuilder,
  createPredictionDashboardBuilder,
  createFutureScenariosBuilder,
  createTrendAnalysisBuilder,
  createForecastBuilder,
  createRiskForecastBuilder,
  createOpportunityForecastBuilder,
  createProbabilityModelBuilder,
  createPredictiveConfidenceBuilder,
  createDelegationPredictiveForecastBuilder,
  createPredictiveExplanationBuilder,
} from "./ai-predictive-forecast-experience-builder.js";
import { createAiPredictiveForecastExperienceValidator } from "./ai-predictive-forecast-experience-validator.js";
import {
  createAiPredictiveForecastExperienceRepository,
  type AiPredictiveForecastExperienceRepository,
} from "../infrastructure/ai-predictive-forecast-experience-repository.js";

export interface AiPredictiveForecastExperienceQuery {
  scenario_id?: PredictiveForecastScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class AiPredictiveForecastExperienceService {
  private readonly repository: AiPredictiveForecastExperienceRepository;
  private readonly aiStrategicIntelligenceExperience: AiStrategicIntelligenceExperienceService;
  private readonly contextBuilder = createPredictiveForecastContextBuilder();
  private readonly dashboardBuilder = createPredictionDashboardBuilder();
  private readonly scenariosBuilder = createFutureScenariosBuilder();
  private readonly trendBuilder = createTrendAnalysisBuilder();
  private readonly forecastBuilder = createForecastBuilder();
  private readonly riskForecastBuilder = createRiskForecastBuilder();
  private readonly opportunityForecastBuilder = createOpportunityForecastBuilder();
  private readonly probabilityBuilder = createProbabilityModelBuilder();
  private readonly confidenceBuilder = createPredictiveConfidenceBuilder();
  private readonly delegationBuilder = createDelegationPredictiveForecastBuilder();
  private readonly explanationBuilder = createPredictiveExplanationBuilder();
  private readonly validator = createAiPredictiveForecastExperienceValidator();

  constructor(deps?: {
    repository?: AiPredictiveForecastExperienceRepository;
    aiStrategicIntelligenceExperience?: AiStrategicIntelligenceExperienceService;
  }) {
    this.aiStrategicIntelligenceExperience =
      deps?.aiStrategicIntelligenceExperience ?? createAiStrategicIntelligenceExperienceService();
    this.repository =
      deps?.repository ??
      createAiPredictiveForecastExperienceRepository({
        aiStrategicIntelligenceExperience: this.aiStrategicIntelligenceExperience,
      });
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const strategicHome = this.aiStrategicIntelligenceExperience.getHome(authContext);
    return buildAiPredictiveForecastExperienceHome({ scenarios: strategicHome.scenarios });
  }

  getPredictionDashboard(
    authContext: AuthContext,
    query: AiPredictiveForecastExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.predictionDashboard);
  }

  getFutureScenarios(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.futureScenarios);
  }

  getTrendAnalysis(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.trendAnalysis);
  }

  getForecast(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.forecast);
  }

  getRiskForecast(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.riskForecast);
  }

  getOpportunityForecast(
    authContext: AuthContext,
    query: AiPredictiveForecastExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.opportunityForecast);
  }

  getProbabilityModel(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.probabilityModel);
  }

  getConfidence(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastDomainScreen(output, output.predictiveConfidence);
  }

  getExplanation(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictiveForecastExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictiveForecastSummaryScreen(buildAiPredictiveForecastExperienceSummary(output));
  }

  validate(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toPredictiveForecastValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toPredictiveForecastValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: AI_PREDICTIVE_FORECAST_EXPERIENCE_SCHEMA_VERSION,
      routes: AI_PREDICTIVE_FORECAST_EXPERIENCE_ROUTES,
      json_schema: AI_PREDICTIVE_FORECAST_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(
    authContext: AuthContext,
    query: AiPredictiveForecastExperienceQuery = {}
  ) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: AiPredictiveForecastExperienceQuery) {
    const context = toContext(query);
    const strategicQuery = toStrategicIntelligenceQuery(query);
    const { strategicIntelligence } = this.repository.resolveUpstream(
      authContext,
      context,
      strategicQuery
    );

    const predictiveForecastContext = this.contextBuilder.build(strategicIntelligence);
    const predictionDashboard = this.dashboardBuilder.build(strategicIntelligence);
    const futureScenarios = this.scenariosBuilder.build(strategicIntelligence);
    const trendAnalysis = this.trendBuilder.build(strategicIntelligence);
    const forecast = this.forecastBuilder.build(strategicIntelligence);
    const riskForecast = this.riskForecastBuilder.build(strategicIntelligence);
    const opportunityForecast = this.opportunityForecastBuilder.build(strategicIntelligence);
    const probabilityModel = this.probabilityBuilder.build(strategicIntelligence);
    const predictiveConfidence = this.confidenceBuilder.build(strategicIntelligence);
    const delegationPredictiveForecast = this.delegationBuilder.build(strategicIntelligence);

    const outputId = `predictive-forecast-${strategicIntelligence.outputId}`;

    const predictiveExplanation = this.explanationBuilder.build({
      outputId,
      goal: strategicIntelligence.goal,
      dashboard: predictionDashboard,
      scenarios: futureScenarios,
      forecast,
      predictiveConfidenceScore: predictiveConfidence.score,
    });

    return {
      outputId,
      strategicIntelligenceOutputId: strategicIntelligence.outputId,
      decisionIntelligenceOutputId: strategicIntelligence.decisionIntelligenceOutputId,
      orchestrationOutputId: strategicIntelligence.orchestrationOutputId,
      executiveIntelligenceOutputId: strategicIntelligence.executiveIntelligenceOutputId,
      foundationOutputId: strategicIntelligence.foundationOutputId,
      closureOutputId: strategicIntelligence.closureOutputId,
      canonicalActionId: strategicIntelligence.canonicalActionId,
      scenarioId: strategicIntelligence.scenarioId,
      goal: strategicIntelligence.goal,
      predictiveForecastContext,
      predictionDashboard,
      futureScenarios,
      trendAnalysis,
      forecast,
      riskForecast,
      opportunityForecast,
      probabilityModel,
      predictiveConfidence,
      delegationPredictiveForecast,
      predictiveExplanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(
  query: AiPredictiveForecastExperienceQuery
): AiPredictiveForecastExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toStrategicIntelligenceQuery(query: AiPredictiveForecastExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createAiPredictiveForecastExperienceService(
  deps?: ConstructorParameters<typeof AiPredictiveForecastExperienceService>[0]
): AiPredictiveForecastExperienceService {
  return new AiPredictiveForecastExperienceService(deps);
}

export function createAiPredictiveForecastExperienceModule(deps?: {
  repository?: AiPredictiveForecastExperienceRepository;
  aiStrategicIntelligenceExperience?: AiStrategicIntelligenceExperienceService;
}) {
  const aiStrategicIntelligenceExperience =
    deps?.aiStrategicIntelligenceExperience ?? createAiStrategicIntelligenceExperienceService();
  const aiPredictiveForecastExperience = createAiPredictiveForecastExperienceService({
    aiStrategicIntelligenceExperience,
    repository:
      deps?.repository ??
      createAiPredictiveForecastExperienceRepository({ aiStrategicIntelligenceExperience }),
  });
  return { aiPredictiveForecastExperience };
}

export type AiPredictiveForecastExperienceModule = ReturnType<
  typeof createAiPredictiveForecastExperienceModule
>;
