export {
  OUTCOME_INTELLIGENCE_SCHEMA_VERSION,
  OUTCOME_INTELLIGENCE_JSON_SCHEMA,
  OUTCOME_INTELLIGENCE_FIXED_TIMESTAMP,
  OUTCOME_INTELLIGENCE_ROUTES,
  OUTCOME_SCENARIO_IDS,
  OUTCOME_CHAIN,
  OUTCOME_CONFIDENCE_LEVELS,
  OUTCOME_QUALITY_LEVELS,
  type OutcomeScenarioId,
  type OutcomeConfidenceLevel,
  type OutcomeQualityLevel,
} from "./domain/outcome-intelligence-schema.js";

export type {
  OutcomeIntelligenceContext,
  ExpectedOutcome,
  CompletionOutcomeModel,
  SuccessCriteriaEvaluation,
  OutcomeQualityAssessment,
  DeliverableVerificationSummary,
  MilestoneCompletionSummary,
  GoalAchievementAnalysis,
  VarianceAnalysis,
  ImprovementRecommendation,
  LessonLearned,
  FutureOptimization,
  OutcomeConfidence,
  OutcomeExplanation,
  OutcomeIntelligenceEvaluation,
  OutcomeIntelligenceSummary,
  OutcomeIntelligenceValidation,
} from "./domain/outcome-context.js";

export { LESSON_TEMPLATES, OPTIMIZATION_TEMPLATES } from "./domain/outcome-reference-values.js";

export {
  buildOutcomeIntelligenceHome,
  toOutcomeEvaluationScreen,
  toOutcomeExpectedScreen,
  toOutcomeCompletionScreen,
  toOutcomeVarianceScreen,
  toOutcomeExplanationScreen,
  toOutcomeSummaryScreen,
  toOutcomeValidationScreen,
  buildOutcomeIntelligenceSummary,
  type OutcomeIntelligenceHome,
  type OutcomeEvaluationScreen,
  type OutcomeExpectedScreen,
  type OutcomeCompletionScreen,
  type OutcomeVarianceScreen,
  type OutcomeExplanationScreen,
  type OutcomeSummaryScreen,
  type OutcomeValidationScreen,
} from "./domain/outcome-screens.js";

export {
  OUTCOME_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForOutcome,
} from "./application/c6-outcome-bridge.js";

export {
  ExpectedOutcomesBuilder,
  CompletionOutcomeModelBuilder,
  SuccessCriteriaEvaluator,
  DeliverableVerificationBuilder,
  MilestoneCompletionBuilder,
  GoalAchievementAnalyzer,
  createExpectedOutcomesBuilder,
  createCompletionOutcomeModelBuilder,
  createSuccessCriteriaEvaluator,
  createDeliverableVerificationBuilder,
  createMilestoneCompletionBuilder,
  createGoalAchievementAnalyzer,
} from "./application/outcome-evaluation-builder.js";

export {
  OutcomeQualityAssessor,
  VarianceAnalyzer,
  ImprovementRecommendationsBuilder,
  LessonsLearnedBuilder,
  FutureOptimizationBuilder,
  createOutcomeQualityAssessor,
  createVarianceAnalyzer,
  createImprovementRecommendationsBuilder,
  createLessonsLearnedBuilder,
  createFutureOptimizationBuilder,
} from "./application/outcome-analysis-builder.js";

export {
  OutcomeConfidenceBuilder,
  OutcomeExplanationBuilder,
  createOutcomeConfidenceBuilder,
  createOutcomeExplanationBuilder,
} from "./application/outcome-explanation-builder.js";

export {
  OutcomeIntelligenceValidator,
  createOutcomeIntelligenceValidator,
} from "./application/outcome-intelligence-validator.js";

export {
  OutcomeIntelligenceEngineService,
  createOutcomeIntelligenceEngineService,
  createOutcomeIntelligenceEngineModule,
  type OutcomeIntelligenceEngineModule,
  type OutcomeIntelligenceQuery,
} from "./application/outcome-intelligence-service.js";

export {
  OutcomeIntelligenceRepository,
  createOutcomeIntelligenceRepository,
} from "./infrastructure/outcome-intelligence-repository.js";
