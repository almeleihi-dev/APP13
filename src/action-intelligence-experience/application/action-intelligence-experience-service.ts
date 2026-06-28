import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  ACTION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  ACTION_INTELLIGENCE_EXPERIENCE_ROUTES,
  ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  EXPERIENCE_LAYER_KEYS,
  type ActionIntelligenceExperienceScenarioId,
  type ExperienceLayerRouteKey,
} from "../domain/action-intelligence-experience-schema.js";
import type { ActionIntelligenceExperienceContext } from "../domain/action-intelligence-experience-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildActionIntelligenceExperienceHome,
  buildActionIntelligenceExperienceSummary,
  toExperienceLayerScreen,
  toExperienceOrchestrationScreen,
  toExperienceJourneyScreen,
  toExperienceExplanationScreen,
  toExperienceSummaryScreen,
  toExperienceValidationScreen,
} from "../domain/action-intelligence-experience-screens.js";
import {
  createExperienceJourneyStepsBuilder,
  createExperienceLayerPresentationsBuilder,
  createExperienceConfidenceBuilder,
} from "./action-intelligence-experience-builder.js";
import { createExperienceExplanationBuilder } from "./action-intelligence-experience-explanation-builder.js";
import { createActionIntelligenceExperienceValidator } from "./action-intelligence-experience-validator.js";
import {
  createActionIntelligenceExperienceRepository,
  type ActionIntelligenceExperienceRepository,
} from "../infrastructure/action-intelligence-experience-repository.js";
import type { OrchestrationIntelligenceOutput } from "../../orchestration-intelligence/domain/orchestration-context.js";

export interface ActionIntelligenceExperienceQuery {
  scenario_id?: ActionIntelligenceExperienceScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class ActionIntelligenceExperienceService {
  private readonly repository: ActionIntelligenceExperienceRepository;
  private readonly journeyBuilder = createExperienceJourneyStepsBuilder();
  private readonly layerBuilder = createExperienceLayerPresentationsBuilder();
  private readonly confidenceBuilder = createExperienceConfidenceBuilder();
  private readonly explanationBuilder = createExperienceExplanationBuilder();
  private readonly validator = createActionIntelligenceExperienceValidator();

  constructor(deps?: { repository?: ActionIntelligenceExperienceRepository }) {
    this.repository = deps?.repository ?? createActionIntelligenceExperienceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listExperienceScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildActionIntelligenceExperienceHome({ scenarios });
  }

  getIntent(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "intent");
  }

  getPlanning(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "planning");
  }

  getPricing(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "pricing");
  }

  getContract(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "contract");
  }

  getExecution(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "execution");
  }

  getOutcome(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "outcome");
  }

  getTrust(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "trust");
  }

  getDecision(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "decision");
  }

  getRecommendation(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "recommendation");
  }

  getInsights(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "insights");
  }

  getPredictions(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "predictions");
  }

  getStrategy(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "strategy");
  }

  getLearning(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "learning");
  }

  getOptimization(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "optimization");
  }

  getEvolution(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    return this.getLayerScreen(authContext, query, "evolution");
  }

  getOrchestration(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const { output, orchestration } = this.buildWithOrchestration(authContext, query);
    return toExperienceOrchestrationScreen(
      output,
      orchestration.orchestrationReadiness.overallScore,
      orchestration.crossEngineCoordination.length
    );
  }

  getJourney(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExperienceJourneyScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toExperienceExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    const { output, orchestration } = this.buildWithOrchestration(authContext, query);
    return toExperienceSummaryScreen(
      buildActionIntelligenceExperienceSummary(
        output,
        orchestration.orchestrationReadiness.overallScore
      )
    );
  }

  validate(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toExperienceValidationScreen(this.validator.validateCatalogCoverage());
    }
    return toExperienceValidationScreen(
      this.validator.validateOutput(this.buildOutput(authContext, query))
    );
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: ACTION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
      routes: ACTION_INTELLIGENCE_EXPERIENCE_ROUTES,
      json_schema: ACTION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: ActionIntelligenceExperienceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private getLayerScreen(
    authContext: AuthContext,
    query: ActionIntelligenceExperienceQuery,
    routeKey: ExperienceLayerRouteKey
  ) {
    this.assertAuthenticated(authContext);
    const engineKey = EXPERIENCE_LAYER_KEYS[routeKey];
    return toExperienceLayerScreen(this.buildOutput(authContext, query), engineKey);
  }

  private buildWithOrchestration(authContext: AuthContext, query: ActionIntelligenceExperienceQuery) {
    const context = toContext(query);
    const orchestrationQuery = toOrchestrationQuery(query);
    const { orchestration } = this.repository.resolveUpstream(
      authContext,
      context,
      orchestrationQuery
    );
    return { output: this.composeOutput(orchestration), orchestration };
  }

  private buildOutput(authContext: AuthContext, query: ActionIntelligenceExperienceQuery) {
    return this.buildWithOrchestration(authContext, query).output;
  }

  private composeOutput(orchestration: OrchestrationIntelligenceOutput) {
    const journeySteps = this.journeyBuilder.build(orchestration, orchestration.goal);
    const layerPresentations = this.layerBuilder.build(orchestration, orchestration.goal);
    const outputId = `experience-${orchestration.outputId}`;

    const experienceConfidence = this.confidenceBuilder.build(orchestration, journeySteps.length);

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: orchestration.goal,
      journeySteps,
      layers: layerPresentations,
      orchestration,
      experienceConfidenceScore: experienceConfidence.score,
    });

    return {
      outputId,
      orchestrationOutputId: orchestration.outputId,
      evolutionOutputId: orchestration.evolutionOutputId,
      optimizationOutputId: orchestration.optimizationOutputId,
      learningOutputId: orchestration.learningOutputId,
      strategyOutputId: orchestration.strategyOutputId,
      predictionOutputId: orchestration.predictionOutputId,
      canonicalActionId: orchestration.canonicalActionId,
      scenarioId: orchestration.scenarioId,
      goal: orchestration.goal,
      journeySteps,
      layerPresentations,
      experienceConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: ActionIntelligenceExperienceQuery): ActionIntelligenceExperienceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toOrchestrationQuery(query: ActionIntelligenceExperienceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createActionIntelligenceExperienceService(
  deps?: ConstructorParameters<typeof ActionIntelligenceExperienceService>[0]
): ActionIntelligenceExperienceService {
  return new ActionIntelligenceExperienceService(deps);
}

export function createActionIntelligenceExperienceModule(deps?: {
  repository?: ActionIntelligenceExperienceRepository;
}) {
  const actionIntelligenceExperience = createActionIntelligenceExperienceService(deps);
  return { actionIntelligenceExperience };
}

export type ActionIntelligenceExperienceModule = ReturnType<
  typeof createActionIntelligenceExperienceModule
>;
