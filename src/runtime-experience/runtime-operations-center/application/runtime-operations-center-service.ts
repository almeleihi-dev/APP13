import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeFinalReadinessService } from "../../runtime-final-readiness/application/runtime-final-readiness-service.js";
import {
  RUNTIME_OPERATIONS_CENTER_VERSION,
  OPERATIONS_CENTER_FIXED_TIMESTAMP,
  buildRuntimeOperationsCenterDefinition,
} from "../domain/runtime-operations-center.js";
import { OPERATIONS_CENTER_MODULE_IDS } from "../domain/operations-center-overview.js";
import { RUNTIME_PRODUCTION_APPROVAL_VERSION } from "../../runtime-production-approval/domain/runtime-production-approval.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import { RUNTIME_FINAL_READINESS_REVIEW_VERSION } from "../../runtime-final-readiness/domain/runtime-final-readiness-review.js";
import {
  RuntimeOperationsCenterRepository,
  createRuntimeOperationsCenterRepository,
} from "../infrastructure/runtime-operations-center-repository.js";
import { createOperationsCenterAggregator } from "./operations-center-aggregator.js";
import { OperationsCenterController, createOperationsCenterController } from "./operations-center-controller.js";
import { validateRuntimeOperationsCenter } from "../validation/runtime-operations-center-validator.js";
import { buildOperationsCenterHome } from "../presentation/operations-center-home.js";
import { buildOperationsCenterDashboard } from "../presentation/operations-center-dashboard.js";
import { buildOperationsCenterHealthScreen } from "../presentation/operations-center-health-screen.js";
import { buildOperationsCenterAlertsScreen } from "../presentation/operations-center-alerts-screen.js";
import { buildOperationsCenterSummaryScreen } from "../presentation/operations-center-summary-screen.js";
import { buildOperationsCenterStatusBoard } from "../presentation/operations-center-status-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeOperationsCenterService {
  private readonly repository: RuntimeOperationsCenterRepository;
  private readonly controller: OperationsCenterController;

  constructor(deps: {
    runtimeProductionApproval: RuntimeProductionApprovalService;
    runtimeOperations: RuntimeOperationsService;
    runtimeExecutive: RuntimeExecutiveDashboardService;
    runtimeFinalReadiness: RuntimeFinalReadinessService;
    repository?: RuntimeOperationsCenterRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeOperationsCenterRepository();
    const aggregator = createOperationsCenterAggregator(deps);
    this.controller = createOperationsCenterController(this.repository, aggregator);
  }

  getOperationsCenter(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeOperationsCenterDefinition();
    return {
      version: RUNTIME_OPERATIONS_CENTER_VERSION,
      runtime_production_approval_version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      runtime_final_readiness_version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
      definition,
      module_count: OPERATIONS_CENTER_MODULE_IDS.length,
      home: buildOperationsCenterHome(
        aggregation.overview.operationalCount,
        aggregation.overview.moduleCount,
        aggregation.summary.productionApproved
      ),
      overview: aggregation.overview,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: OPERATIONS_CENTER_FIXED_TIMESTAMP,
      runtime_operations_center: true,
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
      screen: buildOperationsCenterDashboard({ ...aggregation.overview }),
    };
  }

  getHealth(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      health: aggregation.health,
      screen: buildOperationsCenterHealthScreen({ ...aggregation.health }),
    };
  }

  getAlerts(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      alerts: aggregation.alerts,
      count: aggregation.alerts.length,
      screen: buildOperationsCenterAlertsScreen(aggregation.alerts),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildOperationsCenterSummaryScreen({ ...aggregation.summary }),
    };
  }

  getStatus(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      statusBoard: aggregation.statusBoard,
      count: aggregation.statusBoard.length,
      overallStatus: aggregation.overview.overallStatus,
      screen: buildOperationsCenterStatusBoard(aggregation.statusBoard),
    };
  }

  validateRuntime() {
    return validateRuntimeOperationsCenter();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeOperationsCenterService(deps: {
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeOperations: RuntimeOperationsService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  repository?: RuntimeOperationsCenterRepository;
}) {
  return new RuntimeOperationsCenterService(deps);
}
