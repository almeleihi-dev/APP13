export {
  EVOLUTION_INTELLIGENCE_SCHEMA_VERSION,
  EVOLUTION_INTELLIGENCE_JSON_SCHEMA,
  EVOLUTION_INTELLIGENCE_FIXED_TIMESTAMP,
  EVOLUTION_INTELLIGENCE_ROUTES,
  EVOLUTION_SCENARIO_IDS,
  EVOLUTION_CHAIN,
  EVOLUTION_CONFIDENCE_LEVELS,
  EVOLUTION_PRIORITY_LEVELS,
  EVOLUTION_MATURITY_LEVELS,
  type EvolutionScenarioId,
  type EvolutionConfidenceLevel,
  type EvolutionPriorityLevel,
  type EvolutionMaturityLevel,
} from "./domain/evolution-intelligence-schema.js";

export type {
  EvolutionIntelligenceContext,
  CapabilityEvolution,
  MaturityProgression,
  StrategicTransformation,
  ResilienceGrowth,
  EvolutionaryPlanningCycle,
  EvolutionRecommendation,
  EvolutionTrajectory,
  EvolutionConfidence,
  EvolutionExplanation,
  EvolutionIntelligenceOutput,
  EvolutionIntelligenceSummary,
  EvolutionIntelligenceValidation,
} from "./domain/evolution-context.js";

export {
  buildEvolutionIntelligenceHome,
  buildEvolutionIntelligenceSummary,
  toEvolutionCapabilityScreen,
  toEvolutionTransformationScreen,
  toEvolutionResilienceScreen,
  toEvolutionPlanningScreen,
  toEvolutionExplanationScreen,
  toEvolutionSummaryScreen,
  toEvolutionValidationScreen,
  type EvolutionIntelligenceHome,
  type EvolutionCapabilityScreen,
  type EvolutionTransformationScreen,
  type EvolutionResilienceScreen,
  type EvolutionPlanningScreen,
  type EvolutionExplanationScreen,
  type EvolutionSummaryScreen,
  type EvolutionValidationScreen,
} from "./domain/evolution-screens.js";

export {
  EVOLUTION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForEvolution,
} from "./application/c15-evolution-bridge.js";

export {
  CapabilityEvolutionsBuilder,
  MaturityProgressionsBuilder,
  StrategicTransformationsBuilder,
  ResilienceGrowthBuilder,
  EvolutionaryPlanningCyclesBuilder,
  EvolutionRecommendationsBuilder,
  EvolutionTrajectoriesBuilder,
  EvolutionConfidenceBuilder,
  createCapabilityEvolutionsBuilder,
  createMaturityProgressionsBuilder,
  createStrategicTransformationsBuilder,
  createResilienceGrowthBuilder,
  createEvolutionaryPlanningCyclesBuilder,
  createEvolutionRecommendationsBuilder,
  createEvolutionTrajectoriesBuilder,
  createEvolutionConfidenceBuilder,
} from "./application/evolution-builder.js";

export {
  EvolutionExplanationBuilder,
  createEvolutionExplanationBuilder,
} from "./application/evolution-explanation-builder.js";

export {
  EvolutionIntelligenceValidator,
  createEvolutionIntelligenceValidator,
} from "./application/evolution-intelligence-validator.js";

export {
  EvolutionIntelligenceEngineService,
  createEvolutionIntelligenceEngineService,
  createEvolutionIntelligenceEngineModule,
  type EvolutionIntelligenceEngineModule,
  type EvolutionIntelligenceQuery,
} from "./application/evolution-intelligence-service.js";

export {
  EvolutionIntelligenceRepository,
  createEvolutionIntelligenceRepository,
} from "./infrastructure/evolution-intelligence-repository.js";
