import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  INTELLIGENCE_DASHBOARD_JSON_SCHEMA,
  INTELLIGENCE_DASHBOARD_ROUTES,
  INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
  type IntelligenceDashboardScenarioId,
  type DashboardOverviewKey,
} from "../domain/intelligence-dashboard-schema.js";
import type { IntelligenceDashboardContext, LayerOverview } from "../domain/intelligence-dashboard-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildIntelligenceDashboardHome,
  buildIntelligenceDashboardSummary,
  toDashboardExecutiveScreen,
  toDashboardHealthScreen,
  toDashboardJourneyScreen,
  toDashboardConfidenceScreen,
  toDashboardReadinessScreen,
  toDashboardLayerScreen,
  toDashboardTimelineScreen,
  toDashboardExecutiveSummaryScreen,
  toDashboardSummaryScreen,
  toDashboardValidationScreen,
} from "../domain/intelligence-dashboard-screens.js";
import {
  createExecutiveOverviewBuilder,
  createIntelligenceHealthBuilder,
  createJourneyProgressBuilder,
  createConfidenceMetricsBuilder,
  createReadinessMetricsBuilder,
  createLayerOverviewBuilder,
  createTimelineBuilder,
  createDashboardConfidenceBuilder,
  createExecutiveSummaryBuilder,
} from "./intelligence-dashboard-builder.js";
import { createIntelligenceDashboardValidator } from "./intelligence-dashboard-validator.js";
import {
  createIntelligenceDashboardRepository,
  type IntelligenceDashboardRepository,
} from "../infrastructure/intelligence-dashboard-repository.js";

export interface IntelligenceDashboardQuery {
  scenario_id?: IntelligenceDashboardScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class IntelligenceDashboardService {
  private readonly repository: IntelligenceDashboardRepository;
  private readonly healthBuilder = createIntelligenceHealthBuilder();
  private readonly overviewBuilder = createExecutiveOverviewBuilder();
  private readonly progressBuilder = createJourneyProgressBuilder();
  private readonly confidenceMetricsBuilder = createConfidenceMetricsBuilder();
  private readonly readinessMetricsBuilder = createReadinessMetricsBuilder();
  private readonly layerBuilder = createLayerOverviewBuilder();
  private readonly timelineBuilder = createTimelineBuilder();
  private readonly dashboardConfidenceBuilder = createDashboardConfidenceBuilder();
  private readonly executiveSummaryBuilder = createExecutiveSummaryBuilder();
  private readonly validator = createIntelligenceDashboardValidator();

  constructor(deps?: { repository?: IntelligenceDashboardRepository }) {
    this.repository = deps?.repository ?? createIntelligenceDashboardRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listDashboardScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildIntelligenceDashboardHome({ scenarios });
  }

  getExecutiveOverview(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardExecutiveScreen(this.buildOutput(authContext, query));
  }

  getHealth(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardHealthScreen(this.buildOutput(authContext, query));
  }

  getJourney(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardJourneyScreen(this.buildOutput(authContext, query));
  }

  getConfidence(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardConfidenceScreen(this.buildOutput(authContext, query));
  }

  getReadiness(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardReadinessScreen(this.buildOutput(authContext, query));
  }

  getTrust(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "trust");
  }

  getDecision(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "decision");
  }

  getRecommendation(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "recommendation");
  }

  getPrediction(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "prediction");
  }

  getStrategy(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "strategy");
  }

  getLearning(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "learning");
  }

  getOptimization(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "optimization");
  }

  getEvolution(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    return this.getLayerOverview(authContext, query, "evolution");
  }

  getTimeline(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardTimelineScreen(this.buildOutput(authContext, query));
  }

  getExecutiveSummary(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return toDashboardExecutiveSummaryScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toDashboardSummaryScreen(buildIntelligenceDashboardSummary(output));
  }

  validate(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toDashboardValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toDashboardValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
      routes: INTELLIGENCE_DASHBOARD_ROUTES,
      json_schema: INTELLIGENCE_DASHBOARD_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: IntelligenceDashboardQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private getLayerOverview(
    authContext: AuthContext,
    query: IntelligenceDashboardQuery,
    key: DashboardOverviewKey
  ) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    const overviewMap: Record<DashboardOverviewKey, LayerOverview> = {
      trust: output.trustOverview,
      decision: output.decisionOverview,
      recommendation: output.recommendationOverview,
      prediction: output.predictionOverview,
      strategy: output.strategyOverview,
      learning: output.learningOverview,
      optimization: output.optimizationOverview,
      evolution: output.evolutionOverview,
    };
    return toDashboardLayerScreen(output, overviewMap[key]);
  }

  private buildOutput(authContext: AuthContext, query: IntelligenceDashboardQuery) {
    const context = toContext(query);
    const { experience } = this.repository.resolveUpstream(
      authContext,
      context,
      toExperienceQuery(query)
    );

    const intelligenceHealth = this.healthBuilder.build(experience);
    const executiveOverview = this.overviewBuilder.build(experience, intelligenceHealth);
    const journeyProgress = this.progressBuilder.build(experience);
    const confidenceMetrics = this.confidenceMetricsBuilder.build(experience);
    const readinessMetrics = this.readinessMetricsBuilder.build(experience);
    const layerOverviews = this.layerBuilder.buildAll(experience);
    const timeline = this.timelineBuilder.build(experience);
    const dashboardConfidence = this.dashboardConfidenceBuilder.build(
      experience,
      intelligenceHealth.score
    );
    const executiveSummary = this.executiveSummaryBuilder.build(experience, executiveOverview);

    const outputId = `dashboard-${experience.outputId}`;

    return {
      outputId,
      experienceOutputId: experience.outputId,
      orchestrationOutputId: experience.orchestrationOutputId,
      evolutionOutputId: experience.evolutionOutputId,
      strategyOutputId: experience.strategyOutputId,
      predictionOutputId: experience.predictionOutputId,
      canonicalActionId: experience.canonicalActionId,
      scenarioId: experience.scenarioId,
      goal: experience.goal,
      executiveOverview,
      intelligenceHealth,
      journeyProgress,
      confidenceMetrics,
      readinessMetrics,
      trustOverview: layerOverviews.trust,
      decisionOverview: layerOverviews.decision,
      recommendationOverview: layerOverviews.recommendation,
      predictionOverview: layerOverviews.prediction,
      strategyOverview: layerOverviews.strategy,
      learningOverview: layerOverviews.learning,
      optimizationOverview: layerOverviews.optimization,
      evolutionOverview: layerOverviews.evolution,
      timeline,
      executiveSummary,
      dashboardConfidence,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: IntelligenceDashboardQuery): IntelligenceDashboardContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExperienceQuery(query: IntelligenceDashboardQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createIntelligenceDashboardService(
  deps?: ConstructorParameters<typeof IntelligenceDashboardService>[0]
): IntelligenceDashboardService {
  return new IntelligenceDashboardService(deps);
}

export function createIntelligenceDashboardModule(deps?: {
  repository?: IntelligenceDashboardRepository;
}) {
  const intelligenceDashboard = createIntelligenceDashboardService(deps);
  return { intelligenceDashboard };
}

export type IntelligenceDashboardModule = ReturnType<typeof createIntelligenceDashboardModule>;
