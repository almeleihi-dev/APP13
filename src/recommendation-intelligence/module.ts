export {
  RECOMMENDATION_INTELLIGENCE_SCHEMA_VERSION,
  RECOMMENDATION_INTELLIGENCE_JSON_SCHEMA,
  RECOMMENDATION_INTELLIGENCE_FIXED_TIMESTAMP,
  RECOMMENDATION_INTELLIGENCE_ROUTES,
  RECOMMENDATION_SCENARIO_IDS,
  RECOMMENDATION_CHAIN,
  ACTION_PRIORITY_LEVELS,
  RECOMMENDATION_CONFIDENCE_LEVELS,
  type RecommendationScenarioId,
  type ActionPriorityLevel,
  type RecommendationConfidenceLevel,
} from "./domain/recommendation-intelligence-schema.js";

export type {
  RecommendationIntelligenceContext,
  PrioritizedRecommendation,
  RecommendationConfidence,
  ImplementationRoadmap,
  ImplementationRoadmapPhase,
  Prerequisite,
  ExpectedBenefit,
  ExpectedTradeOff,
  SuccessProbability,
  FallbackRecommendation,
  OptimizationOpportunity,
  RecommendationExplanation,
  RecommendationIntelligenceOutput,
  RecommendationIntelligenceSummary,
  RecommendationIntelligenceValidation,
} from "./domain/recommendation-context.js";

export {
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
  type RecommendationIntelligenceHome,
  type RecommendationOutputScreen,
  type RecommendationPrioritizedScreen,
  type RecommendationRoadmapScreen,
  type RecommendationOutcomesScreen,
  type RecommendationFallbacksScreen,
  type RecommendationExplanationScreen,
  type RecommendationSummaryScreen,
  type RecommendationValidationScreen,
} from "./domain/recommendation-screens.js";

export {
  RECOMMENDATION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForRecommendation,
} from "./application/c9-recommendation-bridge.js";

export {
  PrioritizedRecommendationsBuilder,
  RecommendationScoreBuilder,
  ActionPriorityResolver,
  ImplementationRoadmapBuilder,
  PrerequisitesBuilder,
  ExpectedBenefitsBuilder,
  ExpectedTradeOffsBuilder,
  SuccessProbabilityBuilder,
  FallbackRecommendationsBuilder,
  OptimizationOpportunitiesBuilder,
  RecommendationConfidenceBuilder,
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
} from "./application/recommendation-builder.js";

export {
  RecommendationExplanationBuilder,
  createRecommendationExplanationBuilder,
} from "./application/recommendation-explanation-builder.js";

export {
  RecommendationIntelligenceValidator,
  createRecommendationIntelligenceValidator,
} from "./application/recommendation-intelligence-validator.js";

export {
  RecommendationIntelligenceEngineService,
  createRecommendationIntelligenceEngineService,
  createRecommendationIntelligenceEngineModule,
  type RecommendationIntelligenceEngineModule,
  type RecommendationIntelligenceQuery,
} from "./application/recommendation-intelligence-service.js";

export {
  RecommendationIntelligenceRepository,
  createRecommendationIntelligenceRepository,
} from "./infrastructure/recommendation-intelligence-repository.js";
