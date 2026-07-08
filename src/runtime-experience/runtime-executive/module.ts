export {
  RUNTIME_EXECUTIVE_VERSION,
  EXECUTIVE_FIXED_TIMESTAMP,
  buildRuntimeExecutiveDefinition,
  type RuntimeExecutiveDefinition,
} from "./domain/runtime-executive-dashboard.js";

export {
  EXECUTIVE_MODULE_IDS,
  EXECUTIVE_MODULE_META,
  buildExecutiveOverview,
  type ExecutiveModuleId,
  type ExecutiveModuleStatus,
  type ExecutiveOverview,
  type ExecutiveStatus,
} from "./domain/executive-overview.js";

export {
  buildExecutiveKpis,
  calculateExecutiveReadinessScore,
  type ExecutiveKpi,
  type ExecutiveKpis,
} from "./domain/executive-kpis.js";

export {
  buildExecutiveInsights,
  type ExecutiveInsight,
  type ExecutiveInsightPriority,
} from "./domain/executive-insights.js";

export { buildExecutiveSummary, type ExecutiveSummary } from "./domain/executive-summary.js";

export {
  RuntimeExecutiveDashboardService,
  createRuntimeExecutiveDashboardService,
} from "./application/runtime-executive-dashboard-service.js";

export {
  ExecutiveDashboardController,
  createExecutiveDashboardController,
} from "./application/executive-dashboard-controller.js";

export {
  ExecutiveDashboardAggregator,
  createExecutiveDashboardAggregator,
} from "./application/executive-dashboard-aggregator.js";

export {
  collectExecutiveDependencyValidation,
  validateExecutiveModuleCoverage,
} from "./application/executive-dashboard-validator.js";

export { buildExecutiveDashboardHome } from "./presentation/executive-dashboard-home.js";
export { buildExecutiveDashboardScreen } from "./presentation/executive-dashboard-screen.js";
export { buildExecutiveKpiScreen } from "./presentation/executive-kpi-screen.js";
export { buildExecutiveInsightsScreen } from "./presentation/executive-insights-screen.js";
export { buildExecutiveSummaryScreen } from "./presentation/executive-summary-screen.js";
export { buildExecutiveCommandBoard } from "./presentation/executive-command-board.js";

export {
  RuntimeExecutiveDashboardRepository,
  createRuntimeExecutiveDashboardRepository,
  createExecutiveSession,
  type ExecutiveSession,
} from "./infrastructure/runtime-executive-dashboard-repository.js";

export {
  validateRuntimeExecutiveDashboard,
  type RuntimeExecutiveDashboardValidationResult,
} from "./validation/runtime-executive-dashboard-validator.js";

import { validateRuntimeExecutiveDashboard } from "./validation/runtime-executive-dashboard-validator.js";
import { RUNTIME_EXECUTIVE_VERSION } from "./domain/runtime-executive-dashboard.js";
import {
  createRuntimeExecutiveDashboardService,
  type RuntimeExecutiveDashboardService,
} from "./application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeHealthService } from "../runtime-health/application/runtime-health-service.js";
import type { RuntimeExecutiveDashboardRepository } from "./infrastructure/runtime-executive-dashboard-repository.js";

export interface AnActRuntimeExecutiveDashboardModule {
  version: typeof RUNTIME_EXECUTIVE_VERSION;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  validate: typeof validateRuntimeExecutiveDashboard;
}

export function createAnActRuntimeExecutiveDashboardModule(deps: {
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeHealth: RuntimeHealthService;
  repository?: RuntimeExecutiveDashboardRepository;
}): AnActRuntimeExecutiveDashboardModule {
  const runtimeExecutive = createRuntimeExecutiveDashboardService(deps);
  return {
    version: RUNTIME_EXECUTIVE_VERSION,
    runtimeExecutive,
    validate: validateRuntimeExecutiveDashboard,
  };
}

export const RUNTIME_EXECUTIVE_PHILOSOPHY = {
  name: "AN ACT Runtime Executive Dashboard",
  version: RUNTIME_EXECUTIVE_VERSION,
  principles: [
    "Executive command view for the complete Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X21 — never owns orchestration",
    "Read-only executive dashboard with no deployment, runtime execution, or Bubble integration",
    "Aggregates KPIs, insights, and command board from operations and release layers",
    "Official production runtime executive dashboard for AN ACT",
  ],
} as const;
