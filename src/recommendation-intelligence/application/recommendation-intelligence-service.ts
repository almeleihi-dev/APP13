import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  RECOMMENDATION_INTELLIGENCE_JSON_SCHEMA,
  RECOMMENDATION_INTELLIGENCE_ROUTES,
  RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
  type RecommendationScenarioId,
} from "../domain/recommendation-intelligence-schema.js";
import type { RecommendationIntelligenceContext } from "../domain/recommendation-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildRecommendationIntelligenceHome,
  buildRecommendationIntelligenceSummary,
  toRecommendationOutputScreen,
  toRecommendationPrioritizedScreen,
  toRecommendationRoadmapScreen,
  toRecommendationOutcomesScreen,
  toRecommendationFallbacksScreen,
  toRecommendationExplanationScreen,
  toRecommendationSummaryScreen,
  toRecommendationValidationScreen,
} from "../domain/recommendation-screens.js";
import {
  createPrioritizedRecommendationsBuilder,
  createRecommendationScoreBuilder,
  createActionPriorityResolver,
  createImplementationRoadmapBuilder,
  createPrerequisitesBuilder,
  createExpectedBenefitsBuilder,
  createExpectedTradeOffsBuilder,
  createSuccessProbabilityBuilder,
  createFallbackRecommendationsBuilder,
  createOptimizationOpportunitiesBuilder,
  createRecommendationConfidenceBuilder,
} from "./recommendation-builder.js";
import { createRecommendationExplanationBuilder } from "./recommendation-explanation-builder.js";
import { createRecommendationIntelligenceValidator } from "./recommendation-intelligence-validator.js";
import {
  createRecommendationIntelligenceRepository,
  type RecommendationIntelligenceRepository,
} from "../infrastructure/recommendation-intelligence-repository.js";

export interface RecommendationIntelligenceQuery {
  scenario_id?: RecommendationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class RecommendationIntelligenceEngineService {
  private readonly repository: RecommendationIntelligenceRepository;
  private readonly prioritizedBuilder = createPrioritizedRecommendationsBuilder();
  private readonly scoreBuilder = createRecommendationScoreBuilder();
  private readonly priorityResolver = createActionPriorityResolver();
  private readonly roadmapBuilder = createImplementationRoadmapBuilder();
  private readonly prerequisitesBuilder = createPrerequisitesBuilder();
  private readonly benefitsBuilder = createExpectedBenefitsBuilder();
  private readonly tradeOffsBuilder = createExpectedTradeOffsBuilder();
  private readonly successBuilder = createSuccessProbabilityBuilder();
  private readonly fallbackBuilder = createFallbackRecommendationsBuilder();
  private readonly optimizationBuilder = createOptimizationOpportunitiesBuilder();
  private readonly confidenceBuilder = createRecommendationConfidenceBuilder();
  private readonly explanationBuilder = createRecommendationExplanationBuilder();
  private readonly validator = createRecommendationIntelligenceValidator();

  constructor(deps?: { repository?: RecommendationIntelligenceRepository }) {
    this.repository = deps?.repository ?? createRecommendationIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listRecommendationScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildRecommendationIntelligenceHome({ scenarios });
  }

  getRecommendation(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationOutputScreen(this.buildOutput(authContext, query));
  }

  getPrioritized(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationPrioritizedScreen(this.buildOutput(authContext, query));
  }

  getRoadmap(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationRoadmapScreen(this.buildOutput(authContext, query));
  }

  getOutcomes(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationOutcomesScreen(this.buildOutput(authContext, query));
  }

  getFallbacks(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationFallbacksScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toRecommendationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toRecommendationSummaryScreen(buildRecommendationIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: RecommendationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toRecommendationValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toRecommendationValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
      routes: RECOMMENDATION_INTELLIGENCE_ROUTES,
      json_schema: RECOMMENDATION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildOutput(authContext: AuthContext, query: RecommendationIntelligenceQuery) {
    const context = toContext(query);
    const { decision, evaluation, execution } = this.repository.resolveUpstream(
      authContext,
      context,
      toDecisionQuery(query)
    );

    const prioritizedRecommendations = this.prioritizedBuilder.build(decision);
    const recommendationScore = this.scoreBuilder.build(prioritizedRecommendations, decision);
    const actionPriority = this.priorityResolver.resolve(decision);
    const implementationRoadmap = this.roadmapBuilder.build(decision, execution);
    const prerequisites = this.prerequisitesBuilder.build(decision);
    const expectedBenefits = this.benefitsBuilder.build(decision, evaluation);
    const expectedTradeOffs = this.tradeOffsBuilder.build(decision);
    const successProbability = this.successBuilder.build(decision, evaluation);
    const fallbackRecommendations = this.fallbackBuilder.build(decision);
    const optimizationOpportunities = this.optimizationBuilder.build(decision, evaluation);

    const outputId = `recommendation-${decision.recommendationId}`;

    const recommendationConfidence = this.confidenceBuilder.build({
      decision,
      recommendationScore,
      prioritizedCount: prioritizedRecommendations.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: evaluation.goal,
      decision,
      prioritized: prioritizedRecommendations,
      roadmap: implementationRoadmap,
      benefits: expectedBenefits,
      tradeOffs: expectedTradeOffs,
      fallbacks: fallbackRecommendations,
      optimizations: optimizationOpportunities,
      recommendationScore,
    });

    return {
      outputId,
      decisionRecommendationId: decision.recommendationId,
      trustRecommendationId: decision.trustRecommendationId,
      outcomeEvaluationId: decision.outcomeEvaluationId,
      executionGuidanceId: decision.executionGuidanceId,
      planId: decision.planId,
      canonicalActionId: decision.canonicalActionId,
      scenarioId: decision.scenarioId,
      goal: evaluation.goal,
      prioritizedRecommendations,
      recommendationScore,
      recommendationConfidence,
      actionPriority,
      implementationRoadmap,
      prerequisites,
      expectedBenefits,
      expectedTradeOffs,
      successProbability,
      fallbackRecommendations,
      optimizationOpportunities,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: RecommendationIntelligenceQuery): RecommendationIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toDecisionQuery(query: RecommendationIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createRecommendationIntelligenceEngineService(
  deps?: ConstructorParameters<typeof RecommendationIntelligenceEngineService>[0]
): RecommendationIntelligenceEngineService {
  return new RecommendationIntelligenceEngineService(deps);
}

export function createRecommendationIntelligenceEngineModule(deps?: {
  repository?: RecommendationIntelligenceRepository;
}) {
  const recommendationIntelligenceEngine = createRecommendationIntelligenceEngineService(deps);
  return { recommendationIntelligenceEngine };
}

export type RecommendationIntelligenceEngineModule = ReturnType<
  typeof createRecommendationIntelligenceEngineModule
>;
