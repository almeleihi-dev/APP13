import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  RUNTIME_LAUNCH_CONTROL_VERSION,
  LAUNCH_CONTROL_FIXED_TIMESTAMP,
  buildRuntimeLaunchControlDefinition,
} from "../domain/runtime-launch-control.js";
import { LAUNCH_CONTROL_MODULE_IDS } from "../domain/launch-control-overview.js";
import { RUNTIME_OPERATIONS_CENTER_VERSION } from "../../runtime-operations-center/domain/runtime-operations-center.js";
import { RUNTIME_PRODUCTION_APPROVAL_VERSION } from "../../runtime-production-approval/domain/runtime-production-approval.js";
import { RUNTIME_LAUNCHER_VERSION } from "../../runtime-launcher/domain/runtime-launcher.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import {
  RuntimeLaunchControlRepository,
  createRuntimeLaunchControlRepository,
} from "../infrastructure/runtime-launch-control-repository.js";
import { createLaunchControlAggregator } from "./launch-control-aggregator.js";
import { LaunchControlController, createLaunchControlController } from "./launch-control-controller.js";
import { validateRuntimeLaunchControl } from "../validation/runtime-launch-control-validator.js";
import { buildLaunchControlHome } from "../presentation/launch-control-home.js";
import { buildLaunchControlDashboard } from "../presentation/launch-control-dashboard.js";
import { buildLaunchControlChecklist } from "../presentation/launch-control-checklist.js";
import { buildLaunchControlReadinessScreen } from "../presentation/launch-control-readiness-screen.js";
import { buildLaunchControlSummaryScreen } from "../presentation/launch-control-summary-screen.js";
import { buildLaunchControlBoard } from "../presentation/launch-control-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeLaunchControlService {
  private readonly repository: RuntimeLaunchControlRepository;
  private readonly controller: LaunchControlController;

  constructor(deps: {
    runtimeOperationsCenter: RuntimeOperationsCenterService;
    runtimeProductionApproval: RuntimeProductionApprovalService;
    runtimeLauncher: RuntimeLauncherService;
    runtimeOperations: RuntimeOperationsService;
    repository?: RuntimeLaunchControlRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeLaunchControlRepository();
    const aggregator = createLaunchControlAggregator(deps);
    this.controller = createLaunchControlController(this.repository, aggregator);
  }

  getLaunchControl(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeLaunchControlDefinition();
    return {
      version: RUNTIME_LAUNCH_CONTROL_VERSION,
      runtime_operations_center_version: RUNTIME_OPERATIONS_CENTER_VERSION,
      runtime_production_approval_version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
      runtime_launcher_version: RUNTIME_LAUNCHER_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      definition,
      module_count: LAUNCH_CONTROL_MODULE_IDS.length,
      home: buildLaunchControlHome(
        aggregation.overview.launchClearancePercentage,
        aggregation.readiness.officiallyClearedForLaunch
      ),
      overview: aggregation.overview,
      readiness: aggregation.readiness,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: LAUNCH_CONTROL_FIXED_TIMESTAMP,
      runtime_launch_control: true,
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
      screen: buildLaunchControlDashboard({ ...aggregation.overview }),
    };
  }

  getChecks(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    const items = aggregation.checks.map((c) => ({
      id: c.id,
      label: c.label,
      status: c.status,
      delegateModule: c.delegateModule,
      required: c.required,
    }));
    return {
      checks: items,
      count: items.length,
      passed: items.filter((c) => c.status === "passed").length,
      screen: buildLaunchControlChecklist(items),
    };
  }

  getReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      readiness: aggregation.readiness,
      screen: buildLaunchControlReadinessScreen({ ...aggregation.readiness }),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildLaunchControlSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildLaunchControlBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeLaunchControl();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeLaunchControlService(deps: {
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeLaunchControlRepository;
}) {
  return new RuntimeLaunchControlService(deps);
}
