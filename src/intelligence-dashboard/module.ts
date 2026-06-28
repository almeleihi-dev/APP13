export {
  INTELLIGENCE_DASHBOARD_SCHEMA_VERSION,
  INTELLIGENCE_DASHBOARD_JSON_SCHEMA,
  INTELLIGENCE_DASHBOARD_FIXED_TIMESTAMP,
  INTELLIGENCE_DASHBOARD_ROUTES,
  INTELLIGENCE_DASHBOARD_SCENARIO_IDS,
  INTELLIGENCE_DASHBOARD_CHAIN,
  DASHBOARD_CONFIDENCE_LEVELS,
  DASHBOARD_HEALTH_STATUS,
  DASHBOARD_LAYER_KEYS,
  type IntelligenceDashboardScenarioId,
  type DashboardConfidenceLevel,
  type DashboardHealthStatus,
  type DashboardOverviewKey,
} from "./domain/intelligence-dashboard-schema.js";

export type {
  IntelligenceDashboardContext,
  ExecutiveOverview,
  IntelligenceHealth,
  JourneyProgress,
  ConfidenceMetrics,
  ReadinessMetrics,
  LayerOverview,
  TimelineEvent,
  DashboardConfidence,
  ExecutiveSummary,
  IntelligenceDashboardOutput,
  IntelligenceDashboardSummary,
  IntelligenceDashboardValidation,
} from "./domain/intelligence-dashboard-context.js";

export {
  buildIntelligenceDashboardHome,
  buildIntelligenceDashboardSummary,
  toDashboardExecutiveScreen,
  toDashboardHealthScreen,
  toDashboardJourneyScreen,
  toDashboardConfidenceScreen,
  toDashboardReadinessScreen,
  toDashboardLayerScreen,
  toDashboardTimelineScreen,
  toDashboardExecutiveSummaryScreen,
  toDashboardSummaryScreen,
  toDashboardValidationScreen,
  type IntelligenceDashboardHome,
  type DashboardExecutiveScreen,
  type DashboardHealthScreen,
  type DashboardJourneyScreen,
  type DashboardConfidenceScreen,
  type DashboardReadinessScreen,
  type DashboardLayerScreen,
  type DashboardTimelineScreen,
  type DashboardExecutiveSummaryScreen,
  type DashboardSummaryScreen,
  type DashboardValidationScreen,
} from "./domain/intelligence-dashboard-screens.js";

export {
  INTELLIGENCE_DASHBOARD_SCENARIO_TO_CANONICAL,
  resolveCanonicalActionIdForDashboard,
} from "./application/c18-dashboard-bridge.js";

export {
  ExecutiveOverviewBuilder,
  IntelligenceHealthBuilder,
  JourneyProgressBuilder,
  ConfidenceMetricsBuilder,
  ReadinessMetricsBuilder,
  LayerOverviewBuilder,
  TimelineBuilder,
  DashboardConfidenceBuilder,
  ExecutiveSummaryBuilder,
  createExecutiveOverviewBuilder,
  createIntelligenceHealthBuilder,
  createJourneyProgressBuilder,
  createConfidenceMetricsBuilder,
  createReadinessMetricsBuilder,
  createLayerOverviewBuilder,
  createTimelineBuilder,
  createDashboardConfidenceBuilder,
  createExecutiveSummaryBuilder,
} from "./application/intelligence-dashboard-builder.js";

export {
  IntelligenceDashboardValidator,
  createIntelligenceDashboardValidator,
} from "./application/intelligence-dashboard-validator.js";

export {
  IntelligenceDashboardService,
  createIntelligenceDashboardService,
  createIntelligenceDashboardModule,
  type IntelligenceDashboardModule,
  type IntelligenceDashboardQuery,
} from "./application/intelligence-dashboard-service.js";

export {
  IntelligenceDashboardRepository,
  createIntelligenceDashboardRepository,
} from "./infrastructure/intelligence-dashboard-repository.js";
