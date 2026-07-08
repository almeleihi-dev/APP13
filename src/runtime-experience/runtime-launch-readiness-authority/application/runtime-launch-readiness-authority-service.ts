import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeLaunchControlService } from "../../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../../runtime-launcher/application/runtime-launcher-service.js";
import {
  RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
  LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP,
  buildRuntimeLaunchReadinessAuthorityDefinition,
} from "../domain/runtime-launch-readiness-authority.js";
import { LAUNCH_READINESS_MODULE_IDS } from "../domain/launch-readiness-overview.js";
import { RUNTIME_LAUNCH_CONTROL_VERSION } from "../../runtime-launch-control/domain/runtime-launch-control.js";
import { RUNTIME_OPERATIONS_CENTER_VERSION } from "../../runtime-operations-center/domain/runtime-operations-center.js";
import { RUNTIME_PRODUCTION_APPROVAL_VERSION } from "../../runtime-production-approval/domain/runtime-production-approval.js";
import { RUNTIME_LAUNCHER_VERSION } from "../../runtime-launcher/domain/runtime-launcher.js";
import {
  RuntimeLaunchReadinessAuthorityRepository,
  createRuntimeLaunchReadinessAuthorityRepository,
} from "../infrastructure/runtime-launch-readiness-authority-repository.js";
import { createLaunchReadinessAggregator } from "./launch-readiness-aggregator.js";
import {
  LaunchReadinessController,
  createLaunchReadinessController,
} from "./launch-readiness-controller.js";
import { validateRuntimeLaunchReadinessAuthority } from "../validation/runtime-launch-readiness-authority-validator.js";
import { buildLaunchReadinessHome } from "../presentation/launch-readiness-home.js";
import { buildLaunchReadinessDashboard } from "../presentation/launch-readiness-dashboard.js";
import { buildLaunchReadinessChecklist } from "../presentation/launch-readiness-checklist.js";
import { buildLaunchReadinessDecisionScreen } from "../presentation/launch-readiness-decision-screen.js";
import { buildLaunchReadinessSummaryScreen } from "../presentation/launch-readiness-summary-screen.js";
import { buildLaunchReadinessBoard } from "../presentation/launch-readiness-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeLaunchReadinessAuthorityService {
  private readonly repository: RuntimeLaunchReadinessAuthorityRepository;
  private readonly controller: LaunchReadinessController;

  constructor(deps: {
    runtimeLaunchControl: RuntimeLaunchControlService;
    runtimeOperationsCenter: RuntimeOperationsCenterService;
    runtimeProductionApproval: RuntimeProductionApprovalService;
    runtimeLauncher: RuntimeLauncherService;
    repository?: RuntimeLaunchReadinessAuthorityRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeLaunchReadinessAuthorityRepository();
    const aggregator = createLaunchReadinessAggregator(deps);
    this.controller = createLaunchReadinessController(this.repository, aggregator);
  }

  getLaunchReadinessAuthority(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeLaunchReadinessAuthorityDefinition();
    return {
      version: RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
      runtime_launch_control_version: RUNTIME_LAUNCH_CONTROL_VERSION,
      runtime_operations_center_version: RUNTIME_OPERATIONS_CENTER_VERSION,
      runtime_production_approval_version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
      runtime_launcher_version: RUNTIME_LAUNCHER_VERSION,
      definition,
      module_count: LAUNCH_READINESS_MODULE_IDS.length,
      home: buildLaunchReadinessHome(
        aggregation.overview.readinessPercentage,
        aggregation.decision.officiallyReadyForLaunch
      ),
      overview: aggregation.overview,
      decision: aggregation.decision,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP,
      runtime_launch_readiness_authority: true,
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
      screen: buildLaunchReadinessDashboard({ ...aggregation.overview }),
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
      screen: buildLaunchReadinessChecklist(items),
    };
  }

  getDecision(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      decision: aggregation.decision,
      screen: buildLaunchReadinessDecisionScreen({ ...aggregation.decision }),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildLaunchReadinessSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildLaunchReadinessBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeLaunchReadinessAuthority();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeLaunchReadinessAuthorityService(deps: {
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
  repository?: RuntimeLaunchReadinessAuthorityRepository;
}) {
  return new RuntimeLaunchReadinessAuthorityService(deps);
}
