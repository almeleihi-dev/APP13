export {
  PREDICTION_INTELLIGENCE_SCHEMA_VERSION,
  PREDICTION_INTELLIGENCE_JSON_SCHEMA,
  PREDICTION_INTELLIGENCE_FIXED_TIMESTAMP,
  PREDICTION_INTELLIGENCE_ROUTES,
  PREDICTION_SCENARIO_IDS,
  PREDICTION_CHAIN,
  PREDICTION_CONFIDENCE_LEVELS,
  PREDICTION_TRAJECTORY_LEVELS,
  type PredictionScenarioId,
  type PredictionConfidenceLevel,
  type PredictionTrajectoryLevel,
} from "./domain/prediction-intelligence-schema.js";

export type {
  PredictionIntelligenceContext,
  SuccessProbabilityProjection,
  TimelineForecast,
  RiskEvolutionForecast,
  TrustEvolutionForecast,
  CostProjection,
  OutcomeProjection,
  OpportunityForecast,
  ScenarioComparison,
  WhatIfAnalysis,
  PredictionConfidence,
  PredictionExplanation,
  PredictionIntelligenceOutput,
  PredictionIntelligenceSummary,
  PredictionIntelligenceValidation,
} from "./domain/prediction-context.js";

export {
  buildPredictionIntelligenceHome,
  buildPredictionIntelligenceSummary,
  toPredictionProjectionsScreen,
  toPredictionScenariosScreen,
  toPredictionForecastsScreen,
  toPredictionWhatIfScreen,
  toPredictionExplanationScreen,
  toPredictionSummaryScreen,
  toPredictionValidationScreen,
  type PredictionIntelligenceHome,
  type PredictionProjectionsScreen,
  type PredictionScenariosScreen,
  type PredictionForecastsScreen,
  type PredictionWhatIfScreen,
  type PredictionExplanationScreen,
  type PredictionSummaryScreen,
  type PredictionValidationScreen,
} from "./domain/prediction-screens.js";

export {
  PREDICTION_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForPrediction,
} from "./application/c11-prediction-bridge.js";

export {
  SuccessProbabilityProjectionBuilder,
  TimelineForecastBuilder,
  RiskEvolutionForecastBuilder,
  TrustEvolutionForecastBuilder,
  CostProjectionBuilder,
  OutcomeProjectionBuilder,
  OpportunityForecastBuilder,
  ScenarioComparisonBuilder,
  WhatIfAnalysisBuilder,
  PredictionConfidenceBuilder,
  createSuccessProbabilityProjectionBuilder,
  createTimelineForecastBuilder,
  createRiskEvolutionForecastBuilder,
  createTrustEvolutionForecastBuilder,
  createCostProjectionBuilder,
  createOutcomeProjectionBuilder,
  createOpportunityForecastBuilder,
  createScenarioComparisonBuilder,
  createWhatIfAnalysisBuilder,
  createPredictionConfidenceBuilder,
} from "./application/prediction-builder.js";

export {
  PredictionExplanationBuilder,
  createPredictionExplanationBuilder,
} from "./application/prediction-explanation-builder.js";

export {
  PredictionIntelligenceValidator,
  createPredictionIntelligenceValidator,
} from "./application/prediction-intelligence-validator.js";

export {
  PredictionIntelligenceEngineService,
  createPredictionIntelligenceEngineService,
  createPredictionIntelligenceEngineModule,
  type PredictionIntelligenceEngineModule,
  type PredictionIntelligenceQuery,
} from "./application/prediction-intelligence-service.js";

export {
  PredictionIntelligenceRepository,
  createPredictionIntelligenceRepository,
} from "./infrastructure/prediction-intelligence-repository.js";
