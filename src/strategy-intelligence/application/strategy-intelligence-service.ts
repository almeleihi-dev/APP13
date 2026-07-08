import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  STRATEGY_INTELLIGENCE_JSON_SCHEMA,
  STRATEGY_INTELLIGENCE_ROUTES,
  STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
  type StrategyScenarioId,
} from "../domain/strategy-intelligence-schema.js";
import type { StrategyIntelligenceContext } from "../domain/strategy-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildStrategyIntelligenceHome,
  buildStrategyIntelligenceSummary,
  toStrategyCoreScreen,
  toStrategyRoadmapScreen,
  toStrategyScenariosScreen,
  toStrategyOpportunitiesScreen,
  toStrategyExplanationScreen,
  toStrategySummaryScreen,
  toStrategyValidationScreen,
} from "../domain/strategy-screens.js";
import {
  createStrategicObjectivesBuilder,
  createStrategicOptionsBuilder,
  createExecutionStrategiesBuilder,
  createLongTermRoadmapBuilder,
  createResourceAllocationStrategyBuilder,
  createPriorityOptimizationBuilder,
  createContingencyStrategiesBuilder,
  createScenarioPlanningBuilder,
  createStrategicRiskMitigationBuilder,
  createStrategicOpportunityMatrixBuilder,
  createStrategicConfidenceBuilder,
} from "./strategy-builder.js";
import { createStrategyExplanationBuilder } from "./strategy-explanation-builder.js";
import { createStrategyIntelligenceValidator } from "./strategy-intelligence-validator.js";
import {
  createStrategyIntelligenceRepository,
  type StrategyIntelligenceRepository,
} from "../infrastructure/strategy-intelligence-repository.js";

export interface StrategyIntelligenceQuery {
  scenario_id?: StrategyScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class StrategyIntelligenceEngineService {
  private readonly repository: StrategyIntelligenceRepository;
  private readonly objectivesBuilder = createStrategicObjectivesBuilder();
  private readonly optionsBuilder = createStrategicOptionsBuilder();
  private readonly executionStrategiesBuilder = createExecutionStrategiesBuilder();
  private readonly roadmapBuilder = createLongTermRoadmapBuilder();
  private readonly allocationBuilder = createResourceAllocationStrategyBuilder();
  private readonly priorityBuilder = createPriorityOptimizationBuilder();
  private readonly contingencyBuilder = createContingencyStrategiesBuilder();
  private readonly scenarioPlanningBuilder = createScenarioPlanningBuilder();
  private readonly riskMitigationBuilder = createStrategicRiskMitigationBuilder();
  private readonly opportunityMatrixBuilder = createStrategicOpportunityMatrixBuilder();
  private readonly confidenceBuilder = createStrategicConfidenceBuilder();
  private readonly explanationBuilder = createStrategyExplanationBuilder();
  private readonly validator = createStrategyIntelligenceValidator();

  constructor(deps?: { repository?: StrategyIntelligenceRepository }) {
    this.repository = deps?.repository ?? createStrategyIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listStrategyScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildStrategyIntelligenceHome({ scenarios });
  }

  getStrategy(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategyCoreScreen(this.buildOutput(authContext, query));
  }

  getRoadmap(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategyRoadmapScreen(this.buildOutput(authContext, query));
  }

  getScenarios(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategyScenariosScreen(this.buildOutput(authContext, query));
  }

  getOpportunities(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategyOpportunitiesScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toStrategyExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toStrategySummaryScreen(buildStrategyIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toStrategyValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toStrategyValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: STRATEGY_INTELLIGENCE_SCHEMA_VERSION,
      routes: STRATEGY_INTELLIGENCE_ROUTES,
      json_schema: STRATEGY_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: StrategyIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: StrategyIntelligenceQuery) {
    const context = toContext(query);
    const { prediction, insight, recommendation, execution } = this.repository.resolveUpstream(
      authContext,
      context,
      toPredictionQuery(query)
    );

    const strategicObjectives = this.objectivesBuilder.build(prediction, prediction.goal);
    const strategicOptions = this.optionsBuilder.build(prediction);
    const executionStrategies = this.executionStrategiesBuilder.build(prediction, execution);
    const longTermRoadmap = this.roadmapBuilder.build(prediction, execution);
    const resourceAllocationStrategy = this.allocationBuilder.build(prediction, recommendation);
    const priorityOptimizations = this.priorityBuilder.build(recommendation);
    const contingencyStrategies = this.contingencyBuilder.build(prediction);
    const scenarioPlans = this.scenarioPlanningBuilder.build(prediction);
    const strategicRiskMitigations = this.riskMitigationBuilder.build(insight);
    const strategicOpportunityMatrix = this.opportunityMatrixBuilder.build(prediction, insight);

    const outputId = `strategy-${prediction.outputId}`;

    const strategicConfidence = this.confidenceBuilder.build({
      prediction,
      objectiveCount: strategicObjectives.length,
      scenarioCount: scenarioPlans.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: prediction.goal,
      objectives: strategicObjectives,
      roadmap: longTermRoadmap,
      scenarios: scenarioPlans,
      mitigations: strategicRiskMitigations,
      opportunities: strategicOpportunityMatrix,
      contingencies: contingencyStrategies,
      strategicConfidenceScore: strategicConfidence.score,
    });

    return {
      outputId,
      predictionOutputId: prediction.outputId,
      insightOutputId: prediction.insightOutputId,
      recommendationOutputId: prediction.recommendationOutputId,
      decisionRecommendationId: prediction.decisionRecommendationId,
      trustRecommendationId: prediction.trustRecommendationId,
      outcomeEvaluationId: prediction.outcomeEvaluationId,
      executionGuidanceId: prediction.executionGuidanceId,
      planId: prediction.planId,
      canonicalActionId: prediction.canonicalActionId,
      scenarioId: prediction.scenarioId,
      goal: prediction.goal,
      strategicObjectives,
      strategicOptions,
      executionStrategies,
      longTermRoadmap,
      resourceAllocationStrategy,
      priorityOptimizations,
      contingencyStrategies,
      scenarioPlans,
      strategicRiskMitigations,
      strategicOpportunityMatrix,
      strategicConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: StrategyIntelligenceQuery): StrategyIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toPredictionQuery(query: StrategyIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createStrategyIntelligenceEngineService(
  deps?: ConstructorParameters<typeof StrategyIntelligenceEngineService>[0]
): StrategyIntelligenceEngineService {
  return new StrategyIntelligenceEngineService(deps);
}

export function createStrategyIntelligenceEngineModule(deps?: {
  repository?: StrategyIntelligenceRepository;
}) {
  const strategyIntelligenceEngine = createStrategyIntelligenceEngineService(deps);
  return { strategyIntelligenceEngine };
}

export type StrategyIntelligenceEngineModule = ReturnType<
  typeof createStrategyIntelligenceEngineModule
>;
