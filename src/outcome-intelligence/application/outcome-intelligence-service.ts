import type { AuthContext } from "../../shared/auth/index.js";
import { requireAuth } from "../../security/guards.js";
import {
  OUTCOME_INTELLIGENCE_JSON_SCHEMA,
  OUTCOME_INTELLIGENCE_ROUTES,
  OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
  type OutcomeScenarioId,
} from "../domain/outcome-intelligence-schema.js";
import type { OutcomeIntelligenceContext } from "../domain/outcome-context.js";
import type { DistanceBand, UrgencyLevel } from "../../dynamic-pricing/domain/dynamic-pricing-schema.js";
import {
  buildOutcomeIntelligenceHome,
  buildOutcomeIntelligenceSummary,
  toOutcomeCompletionScreen,
  toOutcomeEvaluationScreen,
  toOutcomeExpectedScreen,
  toOutcomeExplanationScreen,
  toOutcomeSummaryScreen,
  toOutcomeValidationScreen,
  toOutcomeVarianceScreen,
} from "../domain/outcome-screens.js";
import {
  createExpectedOutcomesBuilder,
  createCompletionOutcomeModelBuilder,
  createSuccessCriteriaEvaluator,
  createDeliverableVerificationBuilder,
  createMilestoneCompletionBuilder,
  createGoalAchievementAnalyzer,
} from "./outcome-evaluation-builder.js";
import {
  createOutcomeQualityAssessor,
  createVarianceAnalyzer,
  createImprovementRecommendationsBuilder,
  createLessonsLearnedBuilder,
  createFutureOptimizationBuilder,
} from "./outcome-analysis-builder.js";
import {
  createOutcomeConfidenceBuilder,
  createOutcomeExplanationBuilder,
} from "./outcome-explanation-builder.js";
import { createOutcomeIntelligenceValidator } from "./outcome-intelligence-validator.js";
import {
  createOutcomeIntelligenceRepository,
  type OutcomeIntelligenceRepository,
} from "../infrastructure/outcome-intelligence-repository.js";

export interface OutcomeIntelligenceQuery {
  scenario_id?: OutcomeScenarioId;
  canonical_action_id?: string;
  urgency?: UrgencyLevel;
  distance_band?: DistanceBand;
  intent?: string;
}

export class OutcomeIntelligenceEngineService {
  private readonly repository: OutcomeIntelligenceRepository;
  private readonly expectedOutcomesBuilder = createExpectedOutcomesBuilder();
  private readonly completionModelBuilder = createCompletionOutcomeModelBuilder();
  private readonly successCriteriaEvaluator = createSuccessCriteriaEvaluator();
  private readonly deliverableVerificationBuilder = createDeliverableVerificationBuilder();
  private readonly milestoneCompletionBuilder = createMilestoneCompletionBuilder();
  private readonly goalAchievementAnalyzer = createGoalAchievementAnalyzer();
  private readonly qualityAssessor = createOutcomeQualityAssessor();
  private readonly varianceAnalyzer = createVarianceAnalyzer();
  private readonly improvementBuilder = createImprovementRecommendationsBuilder();
  private readonly lessonsBuilder = createLessonsLearnedBuilder();
  private readonly optimizationBuilder = createFutureOptimizationBuilder();
  private readonly confidenceBuilder = createOutcomeConfidenceBuilder();
  private readonly explanationBuilder = createOutcomeExplanationBuilder();
  private readonly validator = createOutcomeIntelligenceValidator();

  constructor(deps?: { repository?: OutcomeIntelligenceRepository }) {
    this.repository = deps?.repository ?? createOutcomeIntelligenceRepository();
  }

  getHome(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    const scenarios = this.repository.listOutcomeScenarios().map((entry) => ({
      scenario_id: entry.scenarioId,
      canonical_action_id: entry.canonicalActionId,
      goal: entry.goal,
    }));
    return buildOutcomeIntelligenceHome({ scenarios });
  }

  getEvaluation(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOutcomeEvaluationScreen(this.buildEvaluation(authContext, query));
  }

  getExpected(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOutcomeExpectedScreen(this.buildEvaluation(authContext, query));
  }

  getCompletion(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOutcomeCompletionScreen(this.buildEvaluation(authContext, query));
  }

  getVariance(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOutcomeVarianceScreen(this.buildEvaluation(authContext, query));
  }

  getExplanation(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    return toOutcomeExplanationScreen(this.buildEvaluation(authContext, query));
  }

  getSummary(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    const evaluation = this.buildEvaluation(authContext, query);
    return toOutcomeSummaryScreen(buildOutcomeIntelligenceSummary(evaluation));
  }

  validate(authContext: AuthContext, query: OutcomeIntelligenceQuery = {}) {
    this.assertAuthenticated(authContext);
    if (!query.scenario_id && !query.canonical_action_id) {
      return toOutcomeValidationScreen(this.validator.validateCatalogCoverage());
    }
    const evaluation = this.buildEvaluation(authContext, query);
    return toOutcomeValidationScreen(this.validator.validateEvaluation(evaluation));
  }

  getSchema(authContext: AuthContext) {
    this.assertAuthenticated(authContext);
    return {
      schema_version: OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
      routes: OUTCOME_INTELLIGENCE_ROUTES,
      json_schema: OUTCOME_INTELLIGENCE_JSON_SCHEMA,
      read_only: true,
    };
  }

  private buildEvaluation(authContext: AuthContext, query: OutcomeIntelligenceQuery) {
    const context = toContext(query);
    const { guidance, contract, plan, canonicalAction } = this.repository.resolveUpstream(
      authContext,
      context,
      toExecutionQuery(query)
    );

    const expectedOutcomes = this.expectedOutcomesBuilder.build(plan, contract, canonicalAction);
    const completionOutcomeModel = this.completionModelBuilder.build({ plan, contract, execution: guidance });
    const successCriteriaEvaluations = this.successCriteriaEvaluator.build(contract, completionOutcomeModel);
    const deliverableVerificationSummaries = this.deliverableVerificationBuilder.build(
      contract,
      completionOutcomeModel
    );
    const milestoneCompletionSummaries = this.milestoneCompletionBuilder.build(
      guidance,
      completionOutcomeModel
    );
    const goalAchievementAnalysis = this.goalAchievementAnalyzer.build(
      plan,
      expectedOutcomes,
      successCriteriaEvaluations
    );
    const qualityAssessment = this.qualityAssessor.build({
      completionModel: completionOutcomeModel,
      goalAchievement: goalAchievementAnalysis,
      execution: guidance,
    });
    const varianceAnalysis = this.varianceAnalyzer.build({
      planId: plan.planId,
      completionModel: completionOutcomeModel,
      execution: guidance,
    });
    const improvementRecommendations = this.improvementBuilder.build({
      qualityAssessment,
      varianceAnalysis,
      goalAchievement: goalAchievementAnalysis,
    });
    const lessonsLearned = this.lessonsBuilder.build(contract.scenarioId);
    const futureOptimizations = this.optimizationBuilder.build(guidance);

    const evaluationId = `outcome-${plan.planId}`;

    const confidence = this.confidenceBuilder.build({
      execution: guidance,
      qualityAssessment,
      expectedOutcomeCount: expectedOutcomes.length,
    });

    const explanation = this.explanationBuilder.build({
      evaluationId,
      goal: plan.goal,
      qualityAssessment,
      varianceAnalysis,
      goalAchievement: goalAchievementAnalysis,
      improvementCount: improvementRecommendations.length,
      lessonCount: lessonsLearned.length,
      optimizationCount: futureOptimizations.length,
    });

    return {
      evaluationId,
      executionGuidanceId: guidance.guidanceId,
      contractRecommendationId: contract.recommendationId,
      planId: plan.planId,
      canonicalActionId: plan.canonicalActionId,
      scenarioId: contract.scenarioId,
      goal: plan.goal,
      expectedOutcomes,
      completionOutcomeModel,
      successCriteriaEvaluations,
      qualityAssessment,
      deliverableVerificationSummaries,
      milestoneCompletionSummaries,
      goalAchievementAnalysis,
      varianceAnalysis,
      improvementRecommendations,
      lessonsLearned,
      futureOptimizations,
      confidence,
      explanation,
      readOnly: true as const,
    };
  }

  private assertAuthenticated(authContext: AuthContext): void {
    requireAuth(authContext);
  }
}

function toContext(query: OutcomeIntelligenceQuery): OutcomeIntelligenceContext {
  return {
    scenarioId: query.scenario_id,
    canonicalActionId: query.canonical_action_id,
    urgency: query.urgency ?? "standard",
    distanceBand: query.distance_band ?? "local",
    rawIntent: query.intent,
    source: "api",
  };
}

function toExecutionQuery(query: OutcomeIntelligenceQuery) {
  return {
    scenario_id: query.scenario_id,
    canonical_action_id: query.canonical_action_id,
    urgency: query.urgency,
    distance_band: query.distance_band,
    intent: query.intent,
  };
}

export function createOutcomeIntelligenceEngineService(
  deps?: ConstructorParameters<typeof OutcomeIntelligenceEngineService>[0]
): OutcomeIntelligenceEngineService {
  return new OutcomeIntelligenceEngineService(deps);
}

export function createOutcomeIntelligenceEngineModule(deps?: {
  repository?: OutcomeIntelligenceRepository;
}) {
  const outcomeIntelligenceEngine = createOutcomeIntelligenceEngineService(deps);
  return { outcomeIntelligenceEngine };
}

export type OutcomeIntelligenceEngineModule = ReturnType<typeof createOutcomeIntelligenceEngineModule>;
