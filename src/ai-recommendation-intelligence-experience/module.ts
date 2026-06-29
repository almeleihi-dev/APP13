export {
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_SCHEMA_VERSION,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_JSON_SCHEMA,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_FIXED_TIMESTAMP,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_ROUTES,
  RECOMMENDATION_INTELLIGENCE_SCENARIO_IDS,
  AI_RECOMMENDATION_INTELLIGENCE_EXPERIENCE_CHAIN,
  RECOMMENDATION_INTELLIGENCE_STATUS_LEVELS,
  RECOMMENDATION_INTELLIGENCE_CONFIDENCE_LEVELS,
  UPSTREAM_MODULE_ID,
  type RecommendationIntelligenceScenarioId,
  type RecommendationIntelligenceStatusLevel,
  type RecommendationIntelligenceConfidenceLevel,
} from "./domain/ai-recommendation-intelligence-experience-schema.js";

export type {
  AiRecommendationIntelligenceExperienceContext,
  RecommendationCheck,
  RecommendationContext,
  RecommendationItem,
  PersonalizedRecommendations,
  PriorityRecommendations,
  OpportunityRecommendations,
  RiskMitigationRecommendations,
  StrategicRecommendations,
  RecommendationConfidence,
  RecommendationReadiness,
  DelegationRecommendationIntelligence,
  RecommendationExplanation,
  AiRecommendationIntelligenceExperienceOutput,
  AiRecommendationIntelligenceExperienceSummary,
  AiRecommendationIntelligenceExperienceValidation,
} from "./domain/ai-recommendation-intelligence-experience-context.js";

export {
  buildAiRecommendationIntelligenceExperienceHome,
  buildAiRecommendationIntelligenceExperienceSummary,
  toRecommendationIntelligenceContextScreen,
  toRecommendationIntelligenceDomainScreen,
  toRecommendationIntelligenceExplanationScreen,
  toRecommendationIntelligenceSummaryScreen,
  toRecommendationIntelligenceValidationScreen,
  type AiRecommendationIntelligenceExperienceHome,
  type RecommendationIntelligenceContextScreen,
  type RecommendationIntelligenceDomainScreen,
  type RecommendationIntelligenceExplanationScreen,
  type RecommendationIntelligenceSummaryScreen,
  type RecommendationIntelligenceValidationScreen,
} from "./domain/ai-recommendation-intelligence-experience-screens.js";

export {
  RECOMMENDATION_INTELLIGENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForRecommendationIntelligence,
} from "./application/x9-recommendation-intelligence-bridge.js";

export {
  RecommendationContextBuilder,
  PersonalizedRecommendationsBuilder,
  PriorityRecommendationsBuilder,
  OpportunityRecommendationsBuilder,
  RiskMitigationRecommendationsBuilder,
  StrategicRecommendationsBuilder,
  RecommendationConfidenceBuilder,
  RecommendationReadinessBuilder,
  DelegationRecommendationIntelligenceBuilder,
  RecommendationExplanationBuilder,
  createRecommendationContextBuilder,
  createPersonalizedRecommendationsBuilder,
  createPriorityRecommendationsBuilder,
  createOpportunityRecommendationsBuilder,
  createRiskMitigationRecommendationsBuilder,
  createStrategicRecommendationsBuilder,
  createRecommendationConfidenceBuilder,
  createRecommendationReadinessBuilder,
  createDelegationRecommendationIntelligenceBuilder,
  createRecommendationExplanationBuilder,
} from "./application/ai-recommendation-intelligence-experience-builder.js";

export {
  AiRecommendationIntelligenceExperienceValidator,
  createAiRecommendationIntelligenceExperienceValidator,
} from "./application/ai-recommendation-intelligence-experience-validator.js";

export {
  AiRecommendationIntelligenceExperienceService,
  createAiRecommendationIntelligenceExperienceService,
  createAiRecommendationIntelligenceExperienceModule,
  type AiRecommendationIntelligenceExperienceModule,
  type AiRecommendationIntelligenceExperienceQuery,
} from "./application/ai-recommendation-intelligence-experience-service.js";

export {
  AiRecommendationIntelligenceExperienceRepository,
  createAiRecommendationIntelligenceExperienceRepository,
} from "./infrastructure/ai-recommendation-intelligence-experience-repository.js";
