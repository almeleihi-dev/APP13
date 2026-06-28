import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  PREDICTION_INTELLIGENCE_JSON_SCHEMA,
  PREDICTION_INTELLIGENCE_ROUTES,
  PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
  type PredictionScenarioId,
} from "../domain/prediction-intelligence-schema.js";
import type { PredictionIntelligenceContext } from "../domain/prediction-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildPredictionIntelligenceHome,
  buildPredictionIntelligenceSummary,
  toPredictionProjectionsScreen,
  toPredictionScenariosScreen,
  toPredictionForecastsScreen,
  toPredictionWhatIfScreen,
  toPredictionExplanationScreen,
  toPredictionSummaryScreen,
  toPredictionValidationScreen,
} from "../domain/prediction-screens.js";
import {
  createSuccessProbabilityProjectionBuilder,
  createTimelineForecastBuilder,
  createRiskEvolutionForecastBuilder,
  createTrustEvolutionForecastBuilder,
  createCostProjectionBuilder,
  createOutcomeProjectionBuilder,
  createOpportunityForecastBuilder,
  createScenarioComparisonBuilder,
  createWhatIfAnalysisBuilder,
  createPredictionConfidenceBuilder,
} from "./prediction-builder.js";
import { createPredictionExplanationBuilder } from "./prediction-explanation-builder.js";
import { createPredictionIntelligenceValidator } from "./prediction-intelligence-validator.js";
import {
  createPredictionIntelligenceRepository,
  type PredictionIntelligenceRepository,
} from "../infrastructure/prediction-intelligence-repository.js";

export interface PredictionIntelligenceQuery {
  scenario_id?: PredictionScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class PredictionIntelligenceEngineService {
  private readonly repository: PredictionIntelligenceRepository;
  private readonly successBuilder = createSuccessProbabilityProjectionBuilder();
  private readonly timelineBuilder = createTimelineForecastBuilder();
  private readonly riskEvolutionBuilder = createRiskEvolutionForecastBuilder();
  private readonly trustEvolutionBuilder = createTrustEvolutionForecastBuilder();
  private readonly costBuilder = createCostProjectionBuilder();
  private readonly outcomeBuilder = createOutcomeProjectionBuilder();
  private readonly opportunityForecastBuilder = createOpportunityForecastBuilder();
  private readonly scenarioComparisonBuilder = createScenarioComparisonBuilder();
  private readonly whatIfBuilder = createWhatIfAnalysisBuilder();
  private readonly confidenceBuilder = createPredictionConfidenceBuilder();
  private readonly explanationBuilder = createPredictionExplanationBuilder();
  private readonly validator = createPredictionIntelligenceValidator();

  constructor(deps?: { repository?: PredictionIntelligenceRepository }) {
    this.repository = deps?.repository ?? createPredictionIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listPredictionScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildPredictionIntelligenceHome({ scenarios });
  }

  getPredictions(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictionProjectionsScreen(this.buildOutput(authContext, query));
  }

  getScenarios(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictionScenariosScreen(this.buildOutput(authContext, query));
  }

  getForecasts(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictionForecastsScreen(this.buildOutput(authContext, query));
  }

  getWhatIf(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictionWhatIfScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toPredictionExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toPredictionSummaryScreen(buildPredictionIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toPredictionValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toPredictionValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
      routes: PREDICTION_INTELLIGENCE_ROUTES,
      json_schema: PREDICTION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: PredictionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: PredictionIntelligenceQuery) {
    const context = toContext(query);
    const { insight, recommendation, decision, evaluation, execution } =
      this.repository.resolveUpstream(authContext, context, toInsightQuery(query));

    const successProbabilityProjection = this.successBuilder.build(insight, recommendation);
    const timelineForecast = this.timelineBuilder.build(insight, execution);
    const riskEvolutionForecast = this.riskEvolutionBuilder.build(insight);
    const trustEvolutionForecast = this.trustEvolutionBuilder.build(insight, decision);
    const costProjection = this.costBuilder.build(decision);
    const outcomeProjection = this.outcomeBuilder.build(evaluation);
    const opportunityForecasts = this.opportunityForecastBuilder.build(insight);
    const scenarioComparisons = this.scenarioComparisonBuilder.build({
      successProjection: successProbabilityProjection,
      timeline: timelineForecast,
      riskForecast: riskEvolutionForecast,
      decision,
    });
    const whatIfAnalysis = this.whatIfBuilder.build({
      insight,
      successProjection: successProbabilityProjection,
      timeline: timelineForecast,
      riskForecast: riskEvolutionForecast,
    });

    const outputId = `prediction-${insight.outputId}`;

    const predictionConfidence = this.confidenceBuilder.build({
      insight,
      successProjection: successProbabilityProjection,
      scenarioCount: scenarioComparisons.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: evaluation.goal,
      success: successProbabilityProjection,
      timeline: timelineForecast,
      risk: riskEvolutionForecast,
      trust: trustEvolutionForecast,
      scenarios: scenarioComparisons,
      whatIf: whatIfAnalysis,
      predictionConfidenceScore: predictionConfidence.score,
    });

    return {
      outputId,
      insightOutputId: insight.outputId,
      recommendationOutputId: insight.recommendationOutputId,
      decisionRecommendationId: insight.decisionRecommendationId,
      trustRecommendationId: insight.trustRecommendationId,
      outcomeEvaluationId: insight.outcomeEvaluationId,
      executionGuidanceId: insight.executionGuidanceId,
      planId: insight.planId,
      canonicalActionId: insight.canonicalActionId,
      scenarioId: insight.scenarioId,
      goal: evaluation.goal,
      successProbabilityProjection,
      timelineForecast,
      riskEvolutionForecast,
      trustEvolutionForecast,
      costProjection,
      outcomeProjection,
      opportunityForecasts,
      scenarioComparisons,
      whatIfAnalysis,
      predictionConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: PredictionIntelligenceQuery): PredictionIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toInsightQuery(query: PredictionIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createPredictionIntelligenceEngineService(
  deps?: ConstructorParameters<typeof PredictionIntelligenceEngineService>[0]
): PredictionIntelligenceEngineService {
  return new PredictionIntelligenceEngineService(deps);
}

export function createPredictionIntelligenceEngineModule(deps?: {
  repository?: PredictionIntelligenceRepository;
}) {
  const predictionIntelligenceEngine = createPredictionIntelligenceEngineService(deps);
  return { predictionIntelligenceEngine };
}

export type PredictionIntelligenceEngineModule = ReturnType<
  typeof createPredictionIntelligenceEngineModule
>;
