export {
  AI_EXPERIENCE_FOUNDATION_SCHEMA_VERSION,
  AI_EXPERIENCE_FOUNDATION_JSON_SCHEMA,
  AI_EXPERIENCE_FOUNDATION_FIXED_TIMESTAMP,
  AI_EXPERIENCE_FOUNDATION_ROUTES,
  AI_EXPERIENCE_SCENARIO_IDS,
  AI_EXPERIENCE_FOUNDATION_CHAIN,
  FOUNDATION_STATUS_LEVELS,
  FOUNDATION_CONFIDENCE_LEVELS,
  CHAPTER_NUMBER,
  UPSTREAM_CHAPTER_NUMBER,
  UPSTREAM_MODULE_ID,
  type AiExperienceScenarioId,
  type FoundationStatusLevel,
  type FoundationConfidenceLevel,
} from "./domain/ai-experience-foundation-schema.js";

export type {
  AiExperienceFoundationContext,
  FoundationCheck,
  AiExperienceSharedContext,
  FoundationStatus,
  ChapterHandoffIntegration,
  IntelligenceLineage,
  FoundationReadiness,
  DelegationFoundation,
  FoundationConfidence,
  FoundationExplanation,
  AiExperienceFoundationOutput,
  AiExperienceFoundationSummary,
  AiExperienceFoundationValidation,
} from "./domain/ai-experience-foundation-context.js";

export {
  buildAiExperienceFoundationHome,
  buildAiExperienceFoundationSummary,
  toAiExperienceContextScreen,
  toAiExperienceFoundationDomainScreen,
  toAiExperienceExplanationScreen,
  toAiExperienceSummaryScreen,
  toAiExperienceValidationScreen,
  type AiExperienceFoundationHome,
  type AiExperienceContextScreen,
  type AiExperienceFoundationDomainScreen,
  type AiExperienceExplanationScreen,
  type AiExperienceSummaryScreen,
  type AiExperienceValidationScreen,
} from "./domain/ai-experience-foundation-screens.js";

export {
  AI_EXPERIENCE_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForAiExperience,
} from "./application/c22-ai-experience-bridge.js";

export {
  AiExperienceSharedContextBuilder,
  FoundationStatusBuilder,
  ChapterHandoffIntegrationBuilder,
  IntelligenceLineageBuilder,
  FoundationReadinessBuilder,
  DelegationFoundationBuilder,
  FoundationConfidenceBuilder,
  FoundationExplanationBuilder,
  createAiExperienceSharedContextBuilder,
  createFoundationStatusBuilder,
  createChapterHandoffIntegrationBuilder,
  createIntelligenceLineageBuilder,
  createFoundationReadinessBuilder,
  createDelegationFoundationBuilder,
  createFoundationConfidenceBuilder,
  createFoundationExplanationBuilder,
} from "./application/ai-experience-foundation-builder.js";

export {
  AiExperienceFoundationValidator,
  createAiExperienceFoundationValidator,
} from "./application/ai-experience-foundation-validator.js";

export {
  AiExperienceFoundationService,
  createAiExperienceFoundationService,
  createAiExperienceFoundationModule,
  type AiExperienceFoundationModule,
  type AiExperienceFoundationQuery,
} from "./application/ai-experience-foundation-service.js";

export {
  AiExperienceFoundationRepository,
  createAiExperienceFoundationRepository,
} from "./infrastructure/ai-experience-foundation-repository.js";
