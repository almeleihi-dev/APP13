import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  EVOLUTION_INTELLIGENCE_JSON_SCHEMA,
  EVOLUTION_INTELLIGENCE_ROUTES,
  EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
  type EvolutionScenarioId,
} from "../domain/evolution-intelligence-schema.js";
import type { EvolutionIntelligenceContext } from "../domain/evolution-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildEvolutionIntelligenceHome,
  buildEvolutionIntelligenceSummary,
  toEvolutionCapabilityScreen,
  toEvolutionTransformationScreen,
  toEvolutionResilienceScreen,
  toEvolutionPlanningScreen,
  toEvolutionExplanationScreen,
  toEvolutionSummaryScreen,
  toEvolutionValidationScreen,
} from "../domain/evolution-screens.js";
import {
  createCapabilityEvolutionsBuilder,
  createMaturityProgressionsBuilder,
  createStrategicTransformationsBuilder,
  createResilienceGrowthBuilder,
  createEvolutionaryPlanningCyclesBuilder,
  createEvolutionRecommendationsBuilder,
  createEvolutionTrajectoriesBuilder,
  createEvolutionConfidenceBuilder,
} from "./evolution-builder.js";
import { createEvolutionExplanationBuilder } from "./evolution-explanation-builder.js";
import { createEvolutionIntelligenceValidator } from "./evolution-intelligence-validator.js";
import {
  createEvolutionIntelligenceRepository,
  type EvolutionIntelligenceRepository,
} from "../infrastructure/evolution-intelligence-repository.js";

export interface EvolutionIntelligenceQuery {
  scenario_id?: EvolutionScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class EvolutionIntelligenceEngineService {
  private readonly repository: EvolutionIntelligenceRepository;
  private readonly capabilityBuilder = createCapabilityEvolutionsBuilder();
  private readonly maturityBuilder = createMaturityProgressionsBuilder();
  private readonly transformationBuilder = createStrategicTransformationsBuilder();
  private readonly resilienceBuilder = createResilienceGrowthBuilder();
  private readonly planningCyclesBuilder = createEvolutionaryPlanningCyclesBuilder();
  private readonly recommendationsBuilder = createEvolutionRecommendationsBuilder();
  private readonly trajectoriesBuilder = createEvolutionTrajectoriesBuilder();
  private readonly confidenceBuilder = createEvolutionConfidenceBuilder();
  private readonly explanationBuilder = createEvolutionExplanationBuilder();
  private readonly validator = createEvolutionIntelligenceValidator();

  constructor(deps?: { repository?: EvolutionIntelligenceRepository }) {
    this.repository = deps?.repository ?? createEvolutionIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listEvolutionScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildEvolutionIntelligenceHome({ scenarios });
  }

  getCapability(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toEvolutionCapabilityScreen(this.buildOutput(authContext, query));
  }

  getTransformation(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toEvolutionTransformationScreen(this.buildOutput(authContext, query));
  }

  getResilience(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toEvolutionResilienceScreen(this.buildOutput(authContext, query));
  }

  getPlanning(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toEvolutionPlanningScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toEvolutionExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toEvolutionSummaryScreen(buildEvolutionIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toEvolutionValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toEvolutionValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
      routes: EVOLUTION_INTELLIGENCE_ROUTES,
      json_schema: EVOLUTION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: EvolutionIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: EvolutionIntelligenceQuery) {
    const context = toContext(query);
    const { optimization, learning, strategy, prediction } = this.repository.resolveUpstream(
      authContext,
      context,
      toOptimizationQuery(query)
    );

    const capabilityEvolutions = this.capabilityBuilder.build(optimization, strategy);
    const maturityProgressions = this.maturityBuilder.build(optimization, learning);
    const strategicTransformations = this.transformationBuilder.build(
      optimization,
      strategy,
      prediction
    );
    const resilienceGrowth = this.resilienceBuilder.build(optimization, strategy, learning);
    const evolutionaryPlanningCycles = this.planningCyclesBuilder.build();
    const evolutionRecommendations = this.recommendationsBuilder.build(optimization);
    const evolutionTrajectories = this.trajectoriesBuilder.build(optimization, prediction);

    const outputId = `evolution-${optimization.outputId}`;

    const evolutionConfidence = this.confidenceBuilder.build({
      optimization,
      capabilityCount: capabilityEvolutions.length,
      transformationCount: strategicTransformations.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: optimization.goal,
      capabilities: capabilityEvolutions,
      maturity: maturityProgressions,
      transformations: strategicTransformations,
      resilience: resilienceGrowth,
      cycles: evolutionaryPlanningCycles,
      trajectories: evolutionTrajectories,
      evolutionConfidenceScore: evolutionConfidence.score,
    });

    return {
      outputId,
      optimizationOutputId: optimization.outputId,
      learningOutputId: optimization.learningOutputId,
      strategyOutputId: optimization.strategyOutputId,
      predictionOutputId: optimization.predictionOutputId,
      insightOutputId: optimization.insightOutputId,
      recommendationOutputId: optimization.recommendationOutputId,
      decisionRecommendationId: optimization.decisionRecommendationId,
      trustRecommendationId: optimization.trustRecommendationId,
      outcomeEvaluationId: optimization.outcomeEvaluationId,
      executionGuidanceId: optimization.executionGuidanceId,
      planId: optimization.planId,
      canonicalActionId: optimization.canonicalActionId,
      scenarioId: optimization.scenarioId,
      goal: optimization.goal,
      capabilityEvolutions,
      maturityProgressions,
      strategicTransformations,
      resilienceGrowth,
      evolutionaryPlanningCycles,
      evolutionRecommendations,
      evolutionTrajectories,
      evolutionConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: EvolutionIntelligenceQuery): EvolutionIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toOptimizationQuery(query: EvolutionIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createEvolutionIntelligenceEngineService(
  deps?: ConstructorParameters<typeof EvolutionIntelligenceEngineService>[0]
): EvolutionIntelligenceEngineService {
  return new EvolutionIntelligenceEngineService(deps);
}

export function createEvolutionIntelligenceEngineModule(deps?: {
  repository?: EvolutionIntelligenceRepository;
}) {
  const evolutionIntelligenceEngine = createEvolutionIntelligenceEngineService(deps);
  return { evolutionIntelligenceEngine };
}

export type EvolutionIntelligenceEngineModule = ReturnType<
  typeof createEvolutionIntelligenceEngineModule
>;
