import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import {
  RUNTIME_EXECUTIVE_VERSION,
  EXECUTIVE_FIXED_TIMESTAMP,
  buildRuntimeExecutiveDefinition,
} from "../domain/runtime-executive-dashboard.js";
import { EXECUTIVE_MODULE_IDS } from "../domain/executive-overview.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import { RUNTIME_RELEASE_VERSION } from "../../runtime-release/domain/runtime-release.js";
import { RUNTIME_LAUNCHER_VERSION } from "../../runtime-launcher/domain/runtime-launcher.js";
import { RUNTIME_HEALTH_VERSION } from "../../runtime-health/domain/runtime-health.js";
import {
  RuntimeExecutiveDashboardRepository,
  createRuntimeExecutiveDashboardRepository,
} from "../infrastructure/runtime-executive-dashboard-repository.js";
import { createExecutiveDashboardAggregator } from "./executive-dashboard-aggregator.js";
import { ExecutiveDashboardController, createExecutiveDashboardController } from "./executive-dashboard-controller.js";
import { validateRuntimeExecutiveDashboard } from "../validation/runtime-executive-dashboard-validator.js";
import { buildExecutiveDashboardHome } from "../presentation/executive-dashboard-home.js";
import { buildExecutiveDashboardScreen } from "../presentation/executive-dashboard-screen.js";
import { buildExecutiveKpiScreen } from "../presentation/executive-kpi-screen.js";
import { buildExecutiveInsightsScreen } from "../presentation/executive-insights-screen.js";
import { buildExecutiveSummaryScreen } from "../presentation/executive-summary-screen.js";
import { buildExecutiveCommandBoard } from "../presentation/executive-command-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeExecutiveDashboardService {
  private readonly repository: RuntimeExecutiveDashboardRepository;
  private readonly controller: ExecutiveDashboardController;

  constructor(deps: {
    runtimeOperations: RuntimeOperationsService;
    runtimeRelease: RuntimeReleaseService;
    runtimeLauncher: RuntimeLauncherService;
    runtimeHealth: RuntimeHealthService;
    repository?: RuntimeExecutiveDashboardRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeExecutiveDashboardRepository();
    const aggregator = createExecutiveDashboardAggregator(deps);
    this.controller = createExecutiveDashboardController(this.repository, aggregator);
  }

  getExecutive(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeExecutiveDefinition();
    return {
      version: RUNTIME_EXECUTIVE_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      runtime_release_version: RUNTIME_RELEASE_VERSION,
      runtime_launcher_version: RUNTIME_LAUNCHER_VERSION,
      runtime_health_version: RUNTIME_HEALTH_VERSION,
      definition,
      module_count: EXECUTIVE_MODULE_IDS.length,
      home: buildExecutiveDashboardHome(
        aggregation.kpis.executiveReadinessScore,
        aggregation.overview.moduleCount
      ),
      overview: aggregation.overview,
      kpis: aggregation.kpis,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: EXECUTIVE_FIXED_TIMESTAMP,
      runtime_executive: true,
      read_only: true,
      delegates_only: true,
      no_runtime_execution: true,
    };
  }

  getDashboard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      dashboard: aggregation.overview,
      screen: buildExecutiveDashboardScreen({ ...aggregation.overview }),
    };
  }

  getKpis(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      kpis: aggregation.kpis,
      screen: buildExecutiveKpiScreen({ ...aggregation.kpis }),
    };
  }

  getInsights(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      insights: aggregation.insights,
      count: aggregation.insights.length,
      screen: buildExecutiveInsightsScreen(aggregation.insights),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildExecutiveSummaryScreen({ ...aggregation.summary }),
    };
  }

  getCommandBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      commandBoard: aggregation.commandBoard,
      count: aggregation.commandBoard.length,
      screen: buildExecutiveCommandBoard(aggregation.commandBoard),
    };
  }

  validateRuntime() {
    return validateRuntimeExecutiveDashboard();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeExecutiveDashboardService(deps: {
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeHealth: RuntimeHealthService;
  repository?: RuntimeExecutiveDashboardRepository;
}) {
  return new RuntimeExecutiveDashboardService(deps);
}
