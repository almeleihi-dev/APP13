export {
  INSIGHT_INTELLIGENCE_SCHEMA_VERSION,
  INSIGHT_INTELLIGENCE_JSON_SCHEMA,
  INSIGHT_INTELLIGENCE_FIXED_TIMESTAMP,
  INSIGHT_INTELLIGENCE_ROUTES,
  INSIGHT_SCENARIO_IDS,
  INSIGHT_CHAIN,
  INSIGHT_CONFIDENCE_LEVELS,
  INSIGHT_SEVERITY_LEVELS,
  type InsightScenarioId,
  type InsightConfidenceLevel,
  type InsightSeverityLevel,
} from "./domain/insight-intelligence-schema.js";

export type {
  InsightIntelligenceContext,
  StrategicInsight,
  OperationalInsight,
  RiskInsight,
  OpportunityInsight,
  BottleneckDetection,
  PatternRecognition,
  RootCauseObservation,
  HiddenDependency,
  RecommendationConsistencyAnalysis,
  InsightConfidence,
  InsightExplanation,
  InsightIntelligenceOutput,
  InsightIntelligenceSummary,
  InsightIntelligenceValidation,
} from "./domain/insight-context.js";

export {
  buildInsightIntelligenceHome,
  buildInsightIntelligenceSummary,
  toInsightStrategicOperationalScreen,
  toInsightPatternsScreen,
  toInsightOpportunitiesScreen,
  toInsightRisksScreen,
  toInsightExplanationScreen,
  toInsightSummaryScreen,
  toInsightValidationScreen,
  type InsightIntelligenceHome,
  type InsightStrategicOperationalScreen,
  type InsightPatternsScreen,
  type InsightOpportunitiesScreen,
  type InsightRisksScreen,
  type InsightExplanationScreen,
  type InsightSummaryScreen,
  type InsightValidationScreen,
} from "./domain/insight-screens.js";

export {
  INSIGHT_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForInsight,
} from "./application/c10-insight-bridge.js";

export {
  StrategicInsightsBuilder,
  OperationalInsightsBuilder,
  RiskInsightsBuilder,
  OpportunityInsightsBuilder,
  BottleneckDetectionBuilder,
  PatternRecognitionBuilder,
  RootCauseObservationsBuilder,
  HiddenDependenciesBuilder,
  RecommendationConsistencyBuilder,
  InsightConfidenceBuilder,
  createStrategicInsightsBuilder,
  createOperationalInsightsBuilder,
  createRiskInsightsBuilder,
  createOpportunityInsightsBuilder,
  createBottleneckDetectionBuilder,
  createPatternRecognitionBuilder,
  createRootCauseObservationsBuilder,
  createHiddenDependenciesBuilder,
  createRecommendationConsistencyBuilder,
  createInsightConfidenceBuilder,
} from "./application/insight-builder.js";

export {
  InsightExplanationBuilder,
  createInsightExplanationBuilder,
} from "./application/insight-explanation-builder.js";

export {
  InsightIntelligenceValidator,
  createInsightIntelligenceValidator,
} from "./application/insight-intelligence-validator.js";

export {
  InsightIntelligenceEngineService,
  createInsightIntelligenceEngineService,
  createInsightIntelligenceEngineModule,
  type InsightIntelligenceEngineModule,
  type InsightIntelligenceQuery,
} from "./application/insight-intelligence-service.js";

export {
  InsightIntelligenceRepository,
  createInsightIntelligenceRepository,
} from "./infrastructure/insight-intelligence-repository.js";
