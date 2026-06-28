import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  ORCHESTRATION_INTELLIGENCE_JSON_SCHEMA,
  ORCHESTRATION_INTELLIGENCE_ROUTES,
  ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
  type OrchestrationScenarioId,
} from "../domain/orchestration-intelligence-schema.js";
import type { OrchestrationIntelligenceContext } from "../domain/orchestration-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildOrchestrationIntelligenceHome,
  buildOrchestrationIntelligenceSummary,
  toOrchestrationChainScreen,
  toOrchestrationCoordinationScreen,
  toOrchestrationUnifiedScreen,
  toOrchestrationReadinessScreen,
  toOrchestrationExplanationScreen,
  toOrchestrationSummaryScreen,
  toOrchestrationValidationScreen,
} from "../domain/orchestration-screens.js";
import {
  createChainTraceBuilder,
  createOrchestrationLayersBuilder,
  createCrossEngineCoordinationBuilder,
  createUnifiedIntelligenceSnapshotsBuilder,
  createOrchestrationReadinessBuilder,
  createOrchestrationRecommendationsBuilder,
  createOrchestrationConfidenceBuilder,
} from "./orchestration-builder.js";
import { createOrchestrationExplanationBuilder } from "./orchestration-explanation-builder.js";
import { createOrchestrationIntelligenceValidator } from "./orchestration-intelligence-validator.js";
import {
  createOrchestrationIntelligenceRepository,
  type OrchestrationIntelligenceRepository,
} from "../infrastructure/orchestration-intelligence-repository.js";

export interface OrchestrationIntelligenceQuery {
  scenario_id?: OrchestrationScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class OrchestrationIntelligenceEngineService {
  private readonly repository: OrchestrationIntelligenceRepository;
  private readonly chainTraceBuilder = createChainTraceBuilder();
  private readonly layersBuilder = createOrchestrationLayersBuilder();
  private readonly coordinationBuilder = createCrossEngineCoordinationBuilder();
  private readonly snapshotsBuilder = createUnifiedIntelligenceSnapshotsBuilder();
  private readonly readinessBuilder = createOrchestrationReadinessBuilder();
  private readonly recommendationsBuilder = createOrchestrationRecommendationsBuilder();
  private readonly confidenceBuilder = createOrchestrationConfidenceBuilder();
  private readonly explanationBuilder = createOrchestrationExplanationBuilder();
  private readonly validator = createOrchestrationIntelligenceValidator();

  constructor(deps?: { repository?: OrchestrationIntelligenceRepository }) {
    this.repository = deps?.repository ?? createOrchestrationIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listOrchestrationScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildOrchestrationIntelligenceHome({ scenarios });
  }

  getChain(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationChainScreen(this.buildOutput(authContext, query));
  }

  getCoordination(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationCoordinationScreen(this.buildOutput(authContext, query));
  }

  getUnified(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationUnifiedScreen(this.buildOutput(authContext, query));
  }

  getReadiness(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationReadinessScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOrchestrationExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toOrchestrationSummaryScreen(buildOrchestrationIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toOrchestrationValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toOrchestrationValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ORCHESTRATION_INTELLIGENCE_SCHEMA_VERSION,
      routes: ORCHESTRATION_INTELLIGENCE_ROUTES,
      json_schema: ORCHESTRATION_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: OrchestrationIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: OrchestrationIntelligenceQuery) {
    const context = toContext(query);
    const { evolution, optimization, learning, strategy, prediction } =
      this.repository.resolveUpstream(authContext, context, toEvolutionQuery(query));

    const chainTrace = this.chainTraceBuilder.build(
      evolution,
      strategy,
      learning,
      optimization,
      prediction
    );
    const orchestrationLayers = this.layersBuilder.build(chainTrace);
    const crossEngineCoordination = this.coordinationBuilder.build(chainTrace);
    const unifiedIntelligenceSnapshots = this.snapshotsBuilder.build(
      evolution,
      optimization,
      learning,
      strategy,
      prediction
    );
    const orchestrationReadiness = this.readinessBuilder.build(orchestrationLayers, chainTrace);
    const orchestrationRecommendations = this.recommendationsBuilder.build(
      evolution,
      optimization,
      orchestrationReadiness
    );

    const outputId = `orchestration-${evolution.outputId}`;

    const orchestrationConfidence = this.confidenceBuilder.build({
      evolution,
      readiness: orchestrationReadiness,
      chainLayerCount: chainTrace.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: evolution.goal,
      chainTrace,
      coordinations: crossEngineCoordination,
      snapshots: unifiedIntelligenceSnapshots,
      readiness: orchestrationReadiness,
      recommendations: orchestrationRecommendations,
      orchestrationConfidenceScore: orchestrationConfidence.score,
    });

    return {
      outputId,
      evolutionOutputId: evolution.outputId,
      optimizationOutputId: evolution.optimizationOutputId,
      learningOutputId: evolution.learningOutputId,
      strategyOutputId: evolution.strategyOutputId,
      predictionOutputId: evolution.predictionOutputId,
      insightOutputId: evolution.insightOutputId,
      recommendationOutputId: evolution.recommendationOutputId,
      decisionRecommendationId: evolution.decisionRecommendationId,
      trustRecommendationId: evolution.trustRecommendationId,
      outcomeEvaluationId: evolution.outcomeEvaluationId,
      executionGuidanceId: evolution.executionGuidanceId,
      planId: evolution.planId,
      canonicalActionId: evolution.canonicalActionId,
      scenarioId: evolution.scenarioId,
      goal: evolution.goal,
      chainTrace,
      orchestrationLayers,
      crossEngineCoordination,
      unifiedIntelligenceSnapshots,
      orchestrationReadiness,
      orchestrationRecommendations,
      orchestrationConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: OrchestrationIntelligenceQuery): OrchestrationIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toEvolutionQuery(query: OrchestrationIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createOrchestrationIntelligenceEngineService(
  deps?: ConstructorParameters<typeof OrchestrationIntelligenceEngineService>[0]
): OrchestrationIntelligenceEngineService {
  return new OrchestrationIntelligenceEngineService(deps);
}

export function createOrchestrationIntelligenceEngineModule(deps?: {
  repository?: OrchestrationIntelligenceRepository;
}) {
  const orchestrationIntelligenceEngine = createOrchestrationIntelligenceEngineService(deps);
  return { orchestrationIntelligenceEngine };
}

export type OrchestrationIntelligenceEngineModule = ReturnType<
  typeof createOrchestrationIntelligenceEngineModule
>;
