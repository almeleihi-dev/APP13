import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  INSIGHT_INTELLIGENCE_JSON_SCHEMA,
  INSIGHT_INTELLIGENCE_ROUTES,
  INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
  type InsightScenarioId,
} from "../domain/insight-intelligence-schema.js";
import type { InsightIntelligenceContext } from "../domain/insight-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildInsightIntelligenceHome,
  buildInsightIntelligenceSummary,
  toInsightStrategicOperationalScreen,
  toInsightPatternsScreen,
  toInsightOpportunitiesScreen,
  toInsightRisksScreen,
  toInsightExplanationScreen,
  toInsightSummaryScreen,
  toInsightValidationScreen,
} from "../domain/insight-screens.js";
import {
  createStrategicInsightsBuilder,
  createOperationalInsightsBuilder,
  createRiskInsightsBuilder,
  createOpportunityInsightsBuilder,
  createBottleneckDetectionBuilder,
  createPatternRecognitionBuilder,
  createRootCauseObservationsBuilder,
  createHiddenDependenciesBuilder,
  createRecommendationConsistencyBuilder,
  createInsightConfidenceBuilder,
} from "./insight-builder.js";
import { createInsightExplanationBuilder } from "./insight-explanation-builder.js";
import { createInsightIntelligenceValidator } from "./insight-intelligence-validator.js";
import {
  createInsightIntelligenceRepository,
  type InsightIntelligenceRepository,
} from "../infrastructure/insight-intelligence-repository.js";

export interface InsightIntelligenceQuery {
  scenario_id?: InsightScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class InsightIntelligenceEngineService {
  private readonly repository: InsightIntelligenceRepository;
  private readonly strategicBuilder = createStrategicInsightsBuilder();
  private readonly operationalBuilder = createOperationalInsightsBuilder();
  private readonly riskBuilder = createRiskInsightsBuilder();
  private readonly opportunityBuilder = createOpportunityInsightsBuilder();
  private readonly bottleneckBuilder = createBottleneckDetectionBuilder();
  private readonly patternBuilder = createPatternRecognitionBuilder();
  private readonly rootCauseBuilder = createRootCauseObservationsBuilder();
  private readonly hiddenDepsBuilder = createHiddenDependenciesBuilder();
  private readonly consistencyBuilder = createRecommendationConsistencyBuilder();
  private readonly confidenceBuilder = createInsightConfidenceBuilder();
  private readonly explanationBuilder = createInsightExplanationBuilder();
  private readonly validator = createInsightIntelligenceValidator();

  constructor(deps?: { repository?: InsightIntelligenceRepository }) {
    this.repository = deps?.repository ?? createInsightIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listInsightScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildInsightIntelligenceHome({ scenarios });
  }

  getInsights(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightStrategicOperationalScreen(this.buildOutput(authContext, query));
  }

  getPatterns(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightPatternsScreen(this.buildOutput(authContext, query));
  }

  getOpportunities(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightOpportunitiesScreen(this.buildOutput(authContext, query));
  }

  getRisks(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightRisksScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toInsightExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toInsightSummaryScreen(buildInsightIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toInsightValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toInsightValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
      routes: INSIGHT_INTELLIGENCE_ROUTES,
      json_schema: INSIGHT_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: InsightIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: InsightIntelligenceQuery) {
    const context = toContext(query);
    const { recommendation, decision, evaluation, execution } = this.repository.resolveUpstream(
      authContext,
      context,
      toRecommendationQuery(query)
    );

    const strategicInsights = this.strategicBuilder.build(recommendation, decision, evaluation);
    const operationalInsights = this.operationalBuilder.build(recommendation);
    const riskInsights = this.riskBuilder.build(recommendation, decision);
    const opportunityInsights = this.opportunityBuilder.build(recommendation);
    const bottleneckDetections = this.bottleneckBuilder.build(recommendation, decision, execution);
    const patternRecognitions = this.patternBuilder.build(recommendation, decision, evaluation);
    const rootCauseObservations = this.rootCauseBuilder.build(decision);
    const optimizationOpportunities = recommendation.optimizationOpportunities;
    const hiddenDependencies = this.hiddenDepsBuilder.build(recommendation, execution);
    const recommendationConsistencyAnalysis = this.consistencyBuilder.build(recommendation, decision);

    const outputId = `insight-${recommendation.outputId}`;

    const insightConfidence = this.confidenceBuilder.build({
      recommendation,
      consistency: recommendationConsistencyAnalysis,
      patternCount: patternRecognitions.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: evaluation.goal,
      strategic: strategicInsights,
      operational: operationalInsights,
      risks: riskInsights,
      opportunities: opportunityInsights,
      patterns: patternRecognitions,
      bottlenecks: bottleneckDetections,
      consistency: recommendationConsistencyAnalysis,
      insightConfidenceScore: insightConfidence.score,
    });

    return {
      outputId,
      recommendationOutputId: recommendation.outputId,
      decisionRecommendationId: recommendation.decisionRecommendationId,
      trustRecommendationId: recommendation.trustRecommendationId,
      outcomeEvaluationId: recommendation.outcomeEvaluationId,
      executionGuidanceId: recommendation.executionGuidanceId,
      planId: recommendation.planId,
      canonicalActionId: recommendation.canonicalActionId,
      scenarioId: recommendation.scenarioId,
      goal: evaluation.goal,
      strategicInsights,
      operationalInsights,
      riskInsights,
      opportunityInsights,
      bottleneckDetections,
      patternRecognitions,
      rootCauseObservations,
      optimizationOpportunities,
      hiddenDependencies,
      recommendationConsistencyAnalysis,
      insightConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: InsightIntelligenceQuery): InsightIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toRecommendationQuery(query: InsightIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createInsightIntelligenceEngineService(
  deps?: ConstructorParameters<typeof InsightIntelligenceEngineService>[0]
): InsightIntelligenceEngineService {
  return new InsightIntelligenceEngineService(deps);
}

export function createInsightIntelligenceEngineModule(deps?: {
  repository?: InsightIntelligenceRepository;
}) {
  const insightIntelligenceEngine = createInsightIntelligenceEngineService(deps);
  return { insightIntelligenceEngine };
}

export type InsightIntelligenceEngineModule = ReturnType<
  typeof createInsightIntelligenceEngineModule
>;
