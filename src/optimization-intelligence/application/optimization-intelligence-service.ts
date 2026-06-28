import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  OPTIMIZATION_INTELLIGENCE_JSON_SCHEMA,
  OPTIMIZATION_INTELLIGENCE_ROUTES,
  OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
  type OptimizationScenarioId,
} from "../domain/optimization-intelligence-schema.js";
import type { OptimizationIntelligenceContext } from "../domain/optimization-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildOptimizationIntelligenceHome,
  buildOptimizationIntelligenceSummary,
  toOptimizationEfficiencyScreen,
  toOptimizationBottlenecksScreen,
  toOptimizationPerformanceScreen,
  toOptimizationRefinementScreen,
  toOptimizationExplanationScreen,
  toOptimizationSummaryScreen,
  toOptimizationValidationScreen,
} from "../domain/optimization-screens.js";
import {
  createOptimizationRecommendationsBuilder,
  createEfficiencyImprovementsBuilder,
  createResourceOptimizationsBuilder,
  createBottleneckAnalysesBuilder,
  createBottleneckEliminationPlansBuilder,
  createPerformanceMaximizationOpportunitiesBuilder,
  createSystemRefinementCyclesBuilder,
  createWorkflowOptimizationsBuilder,
  createOptimizationConfidenceBuilder,
} from "./optimization-builder.js";
import { createOptimizationExplanationBuilder } from "./optimization-explanation-builder.js";
import { createOptimizationIntelligenceValidator } from "./optimization-intelligence-validator.js";
import {
  createOptimizationIntelligenceRepository,
  type OptimizationIntelligenceRepository,
} from "../infrastructure/optimization-intelligence-repository.js";

export interface OptimizationIntelligenceQuery {
  scenario_id?: OptimizationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class OptimizationIntelligenceEngineService {
  private readonly repository: OptimizationIntelligenceRepository;
  private readonly recommendationsBuilder = createOptimizationRecommendationsBuilder();
  private readonly efficiencyBuilder = createEfficiencyImprovementsBuilder();
  private readonly resourceBuilder = createResourceOptimizationsBuilder();
  private readonly bottleneckBuilder = createBottleneckAnalysesBuilder();
  private readonly eliminationBuilder = createBottleneckEliminationPlansBuilder();
  private readonly performanceBuilder = createPerformanceMaximizationOpportunitiesBuilder();
  private readonly refinementCyclesBuilder = createSystemRefinementCyclesBuilder();
  private readonly workflowBuilder = createWorkflowOptimizationsBuilder();
  private readonly confidenceBuilder = createOptimizationConfidenceBuilder();
  private readonly explanationBuilder = createOptimizationExplanationBuilder();
  private readonly validator = createOptimizationIntelligenceValidator();

  constructor(deps?: { repository?: OptimizationIntelligenceRepository }) {
    this.repository = deps?.repository ?? createOptimizationIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listOptimizationScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildOptimizationIntelligenceHome({ scenarios });
  }

  getEfficiency(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOptimizationEfficiencyScreen(this.buildOutput(authContext, query));
  }

  getBottlenecks(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOptimizationBottlenecksScreen(this.buildOutput(authContext, query));
  }

  getPerformance(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOptimizationPerformanceScreen(this.buildOutput(authContext, query));
  }

  getRefinement(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOptimizationRefinementScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOptimizationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOptimizationSummaryScreen(buildOptimizationIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toOptimizationValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toOptimizationValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: OPTIMIZATION_INTELLIGENCE_SCHEMA_VERSION,
      routes: OPTIMIZATION_INTELLIGENCE_ROUTES,
      json_schema: OPTIMIZATION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: OptimizationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: OptimizationIntelligenceQuery) {
    const context = toContext(query);
    const { learning, strategy, prediction, evaluation } = this.repository.resolveUpstream(
      authContext,
      context,
      toLearningQuery(query)
    );

    const optimizationRecommendations = this.recommendationsBuilder.build(learning, strategy);
    const efficiencyImprovements = this.efficiencyBuilder.build(learning, strategy);
    const resourceOptimizations = this.resourceBuilder.build(strategy, evaluation);
    const bottleneckAnalyses = this.bottleneckBuilder.build(learning, prediction);
    const bottleneckEliminationPlans = this.eliminationBuilder.build(bottleneckAnalyses);
    const performanceMaximizationOpportunities = this.performanceBuilder.build(
      learning,
      strategy,
      prediction
    );
    const systemRefinementCycles = this.refinementCyclesBuilder.build();
    const workflowOptimizations = this.workflowBuilder.build(learning, strategy);

    const outputId = `optimization-${learning.outputId}`;

    const optimizationConfidence = this.confidenceBuilder.build({
      learning,
      recommendationCount: optimizationRecommendations.length,
      bottleneckCount: bottleneckAnalyses.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: learning.goal,
      recommendations: optimizationRecommendations,
      efficiency: efficiencyImprovements,
      bottlenecks: bottleneckAnalyses,
      performance: performanceMaximizationOpportunities,
      cycles: systemRefinementCycles,
      workflows: workflowOptimizations,
      optimizationConfidenceScore: optimizationConfidence.score,
    });

    return {
      outputId,
      learningOutputId: learning.outputId,
      strategyOutputId: learning.strategyOutputId,
      predictionOutputId: learning.predictionOutputId,
      insightOutputId: learning.insightOutputId,
      recommendationOutputId: learning.recommendationOutputId,
      decisionRecommendationId: learning.decisionRecommendationId,
      trustRecommendationId: learning.trustRecommendationId,
      outcomeEvaluationId: learning.outcomeEvaluationId,
      executionGuidanceId: learning.executionGuidanceId,
      planId: learning.planId,
      canonicalActionId: learning.canonicalActionId,
      scenarioId: learning.scenarioId,
      goal: learning.goal,
      optimizationRecommendations,
      efficiencyImprovements,
      resourceOptimizations,
      bottleneckAnalyses,
      bottleneckEliminationPlans,
      performanceMaximizationOpportunities,
      systemRefinementCycles,
      workflowOptimizations,
      optimizationConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: OptimizationIntelligenceQuery): OptimizationIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toLearningQuery(query: OptimizationIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createOptimizationIntelligenceEngineService(
  deps?: ConstructorParameters<typeof OptimizationIntelligenceEngineService>[0]
): OptimizationIntelligenceEngineService {
  return new OptimizationIntelligenceEngineService(deps);
}

export function createOptimizationIntelligenceEngineModule(deps?: {
  repository?: OptimizationIntelligenceRepository;
}) {
  const optimizationIntelligenceEngine = createOptimizationIntelligenceEngineService(deps);
  return { optimizationIntelligenceEngine };
}

export type OptimizationIntelligenceEngineModule = ReturnType<
  typeof createOptimizationIntelligenceEngineModule
>;
