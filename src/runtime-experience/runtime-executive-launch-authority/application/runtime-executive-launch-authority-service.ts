import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeLaunchReadinessAuthorityService } from "../../runtime-launch-readiness-authority/application/runtime-launch-readiness-authority-service.js";
import type { RuntimeLaunchControlService } from "../../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import {
  RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
  EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP,
  buildRuntimeExecutiveLaunchAuthorityDefinition,
} from "../domain/runtime-executive-launch-authority.js";
import { EXECUTIVE_LAUNCH_MODULE_IDS } from "../domain/executive-launch-overview.js";
import { RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION } from "../../runtime-launch-readiness-authority/domain/runtime-launch-readiness-authority.js";
import { RUNTIME_LAUNCH_CONTROL_VERSION } from "../../runtime-launch-control/domain/runtime-launch-control.js";
import { RUNTIME_OPERATIONS_CENTER_VERSION } from "../../runtime-operations-center/domain/runtime-operations-center.js";
import { RUNTIME_PRODUCTION_APPROVAL_VERSION } from "../../runtime-production-approval/domain/runtime-production-approval.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import {
  RuntimeExecutiveLaunchAuthorityRepository,
  createRuntimeExecutiveLaunchAuthorityRepository,
} from "../infrastructure/runtime-executive-launch-authority-repository.js";
import { createExecutiveLaunchAggregator } from "./executive-launch-aggregator.js";
import { ExecutiveLaunchController, createExecutiveLaunchController } from "./executive-launch-controller.js";
import { validateRuntimeExecutiveLaunchAuthority } from "../validation/runtime-executive-launch-authority-validator.js";
import { buildExecutiveLaunchHome } from "../presentation/executive-launch-home.js";
import { buildExecutiveLaunchDashboard } from "../presentation/executive-launch-dashboard.js";
import { buildExecutiveLaunchReadinessScreen } from "../presentation/executive-launch-readiness-screen.js";
import { buildExecutiveLaunchDecisionScreen } from "../presentation/executive-launch-decision-screen.js";
import { buildExecutiveLaunchSummaryScreen } from "../presentation/executive-launch-summary-screen.js";
import { buildExecutiveLaunchBoard } from "../presentation/executive-launch-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeExecutiveLaunchAuthorityService {
  private readonly repository: RuntimeExecutiveLaunchAuthorityRepository;
  private readonly controller: ExecutiveLaunchController;

  constructor(deps: {
    runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService;
    runtimeLaunchControl: RuntimeLaunchControlService;
    runtimeOperationsCenter: RuntimeOperationsCenterService;
    runtimeProductionApproval: RuntimeProductionApprovalService;
    runtimeExecutive: RuntimeExecutiveDashboardService;
    repository?: RuntimeExecutiveLaunchAuthorityRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeExecutiveLaunchAuthorityRepository();
    const aggregator = createExecutiveLaunchAggregator(deps);
    this.controller = createExecutiveLaunchController(this.repository, aggregator);
  }

  getExecutiveLaunchAuthority(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeExecutiveLaunchAuthorityDefinition();
    return {
      version: RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
      runtime_launch_readiness_authority_version: RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
      runtime_launch_control_version: RUNTIME_LAUNCH_CONTROL_VERSION,
      runtime_operations_center_version: RUNTIME_OPERATIONS_CENTER_VERSION,
      runtime_production_approval_version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      definition,
      module_count: EXECUTIVE_LAUNCH_MODULE_IDS.length,
      home: buildExecutiveLaunchHome(
        aggregation.overview.authorizationPercentage,
        aggregation.decision.officialExecutiveLaunchApproval
      ),
      overview: aggregation.overview,
      readiness: aggregation.readiness,
      decision: aggregation.decision,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP,
      runtime_executive_launch_authority: true,
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
      screen: buildExecutiveLaunchDashboard({ ...aggregation.overview }),
    };
  }

  getReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      readiness: aggregation.readiness,
      screen: buildExecutiveLaunchReadinessScreen({ ...aggregation.readiness }),
    };
  }

  getDecision(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      decision: aggregation.decision,
      screen: buildExecutiveLaunchDecisionScreen({ ...aggregation.decision }),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildExecutiveLaunchSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildExecutiveLaunchBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeExecutiveLaunchAuthority();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeExecutiveLaunchAuthorityService(deps: {
  runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService;
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  repository?: RuntimeExecutiveLaunchAuthorityRepository;
}) {
  return new RuntimeExecutiveLaunchAuthorityService(deps);
}
