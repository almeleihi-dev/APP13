import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  LEARNING_INTELLIGENCE_JSON_SCHEMA,
  LEARNING_INTELLIGENCE_ROUTES,
  LEARNING_INTELLIGENCE_SCHEMA_VERSION,
  type LearningScenarioId,
} from "../domain/learning-intelligence-schema.js";
import type { LearningIntelligenceContext } from "../domain/learning-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildLearningIntelligenceHome,
  buildLearningIntelligenceSummary,
  toLearningInsightsScreen,
  toLearningAdaptationScreen,
  toLearningImprovementScreen,
  toLearningPatternsScreen,
  toLearningExplanationScreen,
  toLearningSummaryScreen,
  toLearningValidationScreen,
} from "../domain/learning-screens.js";
import {
  createLearningInsightsBuilder,
  createKnowledgeGapsBuilder,
  createLessonsLearnedBuilder,
  createAdaptationRecommendationsBuilder,
  createStrategyAdjustmentsBuilder,
  createContinuousImprovementCyclesBuilder,
  createFeedbackLoopsBuilder,
  createLearningPatternsBuilder,
  createSkillDevelopmentRecommendationsBuilder,
  createPerformanceImprovementOpportunitiesBuilder,
  createLearningConfidenceBuilder,
} from "./learning-builder.js";
import { createLearningExplanationBuilder } from "./learning-explanation-builder.js";
import { createLearningIntelligenceValidator } from "./learning-intelligence-validator.js";
import {
  createLearningIntelligenceRepository,
  type LearningIntelligenceRepository,
} from "../infrastructure/learning-intelligence-repository.js";

export interface LearningIntelligenceQuery {
  scenario_id?: LearningScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class LearningIntelligenceEngineService {
  private readonly repository: LearningIntelligenceRepository;
  private readonly insightsBuilder = createLearningInsightsBuilder();
  private readonly gapsBuilder = createKnowledgeGapsBuilder();
  private readonly lessonsBuilder = createLessonsLearnedBuilder();
  private readonly adaptationBuilder = createAdaptationRecommendationsBuilder();
  private readonly adjustmentsBuilder = createStrategyAdjustmentsBuilder();
  private readonly improvementCyclesBuilder = createContinuousImprovementCyclesBuilder();
  private readonly feedbackLoopsBuilder = createFeedbackLoopsBuilder();
  private readonly patternsBuilder = createLearningPatternsBuilder();
  private readonly skillBuilder = createSkillDevelopmentRecommendationsBuilder();
  private readonly performanceBuilder = createPerformanceImprovementOpportunitiesBuilder();
  private readonly confidenceBuilder = createLearningConfidenceBuilder();
  private readonly explanationBuilder = createLearningExplanationBuilder();
  private readonly validator = createLearningIntelligenceValidator();

  constructor(deps?: { repository?: LearningIntelligenceRepository }) {
    this.repository = deps?.repository ?? createLearningIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listLearningScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildLearningIntelligenceHome({ scenarios });
  }

  getLearning(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toLearningInsightsScreen(this.buildOutput(authContext, query));
  }

  getAdaptation(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toLearningAdaptationScreen(this.buildOutput(authContext, query));
  }

  getImprovement(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toLearningImprovementScreen(this.buildOutput(authContext, query));
  }

  getPatterns(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toLearningPatternsScreen(this.buildOutput(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toLearningExplanationScreen(this.buildOutput(authContext, query));
  }

  getSummary(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const output = this.buildOutput(authContext, query);
    return toLearningSummaryScreen(buildLearningIntelligenceSummary(output));
  }

  validate(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toLearningValidationScreen(this.validator.validateCatalogCoverage());
    }
    const output = this.buildOutput(authContext, query);
    return toLearningValidationScreen(this.validator.validateOutput(output));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: LEARNING_INTELLIGENCE_SCHEMA_VERSION,
      routes: LEARNING_INTELLIGENCE_ROUTES,
      json_schema: LEARNING_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  buildOutputForValidation(authContext: AuthContext, query: LearningIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return this.buildOutput(authContext, query);
  }

  private buildOutput(authContext: AuthContext, query: LearningIntelligenceQuery) {
    const context = toContext(query);
    const { strategy, prediction, insight, evaluation } = this.repository.resolveUpstream(
      authContext,
      context,
      toStrategyQuery(query)
    );

    const learningInsights = this.insightsBuilder.build(strategy, prediction);
    const knowledgeGaps = this.gapsBuilder.build(insight, evaluation);
    const lessonsLearned = this.lessonsBuilder.build(strategy, evaluation);
    const adaptationRecommendations = this.adaptationBuilder.build(strategy, prediction);
    const strategyAdjustments = this.adjustmentsBuilder.build(strategy);
    const continuousImprovementCycles = this.improvementCyclesBuilder.build();
    const feedbackLoops = this.feedbackLoopsBuilder.build(strategy);
    const learningPatterns = this.patternsBuilder.build(insight, prediction);
    const skillDevelopmentRecommendations = this.skillBuilder.build(evaluation, knowledgeGaps);
    const performanceImprovementOpportunities = this.performanceBuilder.build(strategy, evaluation);

    const outputId = `learning-${strategy.outputId}`;

    const learningConfidence = this.confidenceBuilder.build({
      strategy,
      insightCount: learningInsights.length,
      gapCount: knowledgeGaps.length,
    });

    const explanation = this.explanationBuilder.build({
      outputId,
      goal: strategy.goal,
      insights: learningInsights,
      gaps: knowledgeGaps,
      adaptations: adaptationRecommendations,
      cycles: continuousImprovementCycles,
      patterns: learningPatterns,
      improvements: performanceImprovementOpportunities,
      learningConfidenceScore: learningConfidence.score,
    });

    return {
      outputId,
      strategyOutputId: strategy.outputId,
      predictionOutputId: strategy.predictionOutputId,
      insightOutputId: strategy.insightOutputId,
      recommendationOutputId: strategy.recommendationOutputId,
      decisionRecommendationId: strategy.decisionRecommendationId,
      trustRecommendationId: strategy.trustRecommendationId,
      outcomeEvaluationId: strategy.outcomeEvaluationId,
      executionGuidanceId: strategy.executionGuidanceId,
      planId: strategy.planId,
      canonicalActionId: strategy.canonicalActionId,
      scenarioId: strategy.scenarioId,
      goal: strategy.goal,
      learningInsights,
      knowledgeGaps,
      lessonsLearned,
      adaptationRecommendations,
      strategyAdjustments,
      continuousImprovementCycles,
      feedbackLoops,
      learningPatterns,
      skillDevelopmentRecommendations,
      performanceImprovementOpportunities,
      learningConfidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: LearningIntelligenceQuery): LearningIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toStrategyQuery(query: LearningIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createLearningIntelligenceEngineService(
  deps?: ConstructorParameters<typeof LearningIntelligenceEngineService>[0]
): LearningIntelligenceEngineService {
  return new LearningIntelligenceEngineService(deps);
}

export function createLearningIntelligenceEngineModule(deps?: {
  repository?: LearningIntelligenceRepository;
}) {
  const learningIntelligenceEngine = createLearningIntelligenceEngineService(deps);
  return { learningIntelligenceEngine };
}

export type LearningIntelligenceEngineModule = ReturnType<
  typeof createLearningIntelligenceEngineModule
>;
