export {
  LEARNING_INTELLIGENCE_SCHEMA_VERSION,
  LEARNING_INTELLIGENCE_JSON_SCHEMA,
  LEARNING_INTELLIGENCE_FIXED_TIMESTAMP,
  LEARNING_INTELLIGENCE_ROUTES,
  LEARNING_SCENARIO_IDS,
  LEARNING_CHAIN,
  LEARNING_CONFIDENCE_LEVELS,
  LEARNING_PRIORITY_LEVELS,
  type LearningScenarioId,
  type LearningConfidenceLevel,
  type LearningPriorityLevel,
} from "./domain/learning-intelligence-schema.js";

export type {
  LearningIntelligenceContext,
  LearningInsight,
  KnowledgeGap,
  LessonLearned,
  AdaptationRecommendation,
  StrategyAdjustment,
  ContinuousImprovementCycle,
  FeedbackLoop,
  LearningPattern,
  SkillDevelopmentRecommendation,
  PerformanceImprovementOpportunity,
  LearningConfidence,
  LearningExplanation,
  LearningIntelligenceOutput,
  LearningIntelligenceSummary,
  LearningIntelligenceValidation,
} from "./domain/learning-context.js";

export {
  buildLearningIntelligenceHome,
  buildLearningIntelligenceSummary,
  toLearningInsightsScreen,
  toLearningAdaptationScreen,
  toLearningImprovementScreen,
  toLearningPatternsScreen,
  toLearningExplanationScreen,
  toLearningSummaryScreen,
  toLearningValidationScreen,
  type LearningIntelligenceHome,
  type LearningInsightsScreen,
  type LearningAdaptationScreen,
  type LearningImprovementScreen,
  type LearningPatternsScreen,
  type LearningExplanationScreen,
  type LearningSummaryScreen,
  type LearningValidationScreen,
} from "./domain/learning-screens.js";

export {
  LEARNING_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForLearning,
} from "./application/c13-learning-bridge.js";

export {
  LearningInsightsBuilder,
  KnowledgeGapsBuilder,
  LessonsLearnedBuilder,
  AdaptationRecommendationsBuilder,
  StrategyAdjustmentsBuilder,
  ContinuousImprovementCyclesBuilder,
  FeedbackLoopsBuilder,
  LearningPatternsBuilder,
  SkillDevelopmentRecommendationsBuilder,
  PerformanceImprovementOpportunitiesBuilder,
  LearningConfidenceBuilder,
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
} from "./application/learning-builder.js";

export {
  LearningExplanationBuilder,
  createLearningExplanationBuilder,
} from "./application/learning-explanation-builder.js";

export {
  LearningIntelligenceValidator,
  createLearningIntelligenceValidator,
} from "./application/learning-intelligence-validator.js";

export {
  LearningIntelligenceEngineService,
  createLearningIntelligenceEngineService,
  createLearningIntelligenceEngineModule,
  type LearningIntelligenceEngineModule,
  type LearningIntelligenceQuery,
} from "./application/learning-intelligence-service.js";

export {
  LearningIntelligenceRepository,
  createLearningIntelligenceRepository,
} from "./infrastructure/learning-intelligence-repository.js";
