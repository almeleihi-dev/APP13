export {
  AI_EXECUTION_COMPANION_EXPERIENCE_SCHEMA_VERSION,
  AI_EXECUTION_COMPANION_EXPERIENCE_JSON_SCHEMA,
  AI_EXECUTION_COMPANION_EXPERIENCE_FIXED_TIMESTAMP,
  AI_EXECUTION_COMPANION_EXPERIENCE_ROUTES,
  EXECUTION_COMPANION_SCENARIO_IDS,
  AI_EXECUTION_COMPANION_EXPERIENCE_CHAIN,
  EXECUTION_COMPANION_STATUS_LEVELS,
  EXECUTION_COMPANION_CONFIDENCE_LEVELS,
  UPSTREAM_MODULE_ID,
  type ExecutionCompanionScenarioId,
  type ExecutionCompanionStatusLevel,
  type ExecutionCompanionConfidenceLevel,
} from "./domain/ai-execution-companion-experience-schema.js";

export type {
  AiExecutionCompanionExperienceContext,
  CompanionCheck,
  ExecutionContext,
  CurrentStep,
  ExecutionProgress,
  ActiveChecklistItem,
  ActiveChecklist,
  NextAction,
  NextActions,
  ProgressTimelinePhase,
  ProgressTimeline,
  CompletionForecast,
  ExecutionGuidance,
  ExecutionCompanionReadiness,
  DelegationExecutionCompanion,
  ExecutionCompanionConfidence,
  ExecutionCompanionExplanation,
  AiExecutionCompanionExperienceOutput,
  AiExecutionCompanionExperienceSummary,
  AiExecutionCompanionExperienceValidation,
} from "./domain/ai-execution-companion-experience-context.js";

export {
  buildAiExecutionCompanionExperienceHome,
  buildAiExecutionCompanionExperienceSummary,
  toExecutionCompanionContextScreen,
  toExecutionCompanionDomainScreen,
  toExecutionCompanionExplanationScreen,
  toExecutionCompanionSummaryScreen,
  toExecutionCompanionValidationScreen,
  type AiExecutionCompanionExperienceHome,
  type ExecutionCompanionContextScreen,
  type ExecutionCompanionDomainScreen,
  type ExecutionCompanionExplanationScreen,
  type ExecutionCompanionSummaryScreen,
  type ExecutionCompanionValidationScreen,
} from "./domain/ai-execution-companion-experience-screens.js";

export {
  EXECUTION_COMPANION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForExecutionCompanion,
} from "./application/x5-execution-companion-bridge.js";

export {
  ExecutionContextBuilder,
  CurrentStepBuilder,
  ExecutionProgressBuilder,
  ActiveChecklistBuilder,
  NextActionsBuilder,
  ProgressTimelineBuilder,
  CompletionForecastBuilder,
  ExecutionGuidanceBuilder,
  ExecutionCompanionReadinessBuilder,
  DelegationExecutionCompanionBuilder,
  ExecutionCompanionConfidenceBuilder,
  ExecutionCompanionExplanationBuilder,
  createExecutionContextBuilder,
  createCurrentStepBuilder,
  createExecutionProgressBuilder,
  createActiveChecklistBuilder,
  createNextActionsBuilder,
  createProgressTimelineBuilder,
  createCompletionForecastBuilder,
  createExecutionGuidanceBuilder,
  createExecutionCompanionReadinessBuilder,
  createDelegationExecutionCompanionBuilder,
  createExecutionCompanionConfidenceBuilder,
  createExecutionCompanionExplanationBuilder,
} from "./application/ai-execution-companion-experience-builder.js";

export {
  AiExecutionCompanionExperienceValidator,
  createAiExecutionCompanionExperienceValidator,
} from "./application/ai-execution-companion-experience-validator.js";

export {
  AiExecutionCompanionExperienceService,
  createAiExecutionCompanionExperienceService,
  createAiExecutionCompanionExperienceModule,
  type AiExecutionCompanionExperienceModule,
  type AiExecutionCompanionExperienceQuery,
} from "./application/ai-execution-companion-experience-service.js";

export {
  AiExecutionCompanionExperienceRepository,
  createAiExecutionCompanionExperienceRepository,
} from "./infrastructure/ai-execution-companion-experience-repository.js";
