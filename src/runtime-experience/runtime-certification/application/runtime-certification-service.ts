import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeReadinessConsoleService } from "../../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeReleaseService } from "../../runtime-release/application/runtime-release-service.js";
import {
  RUNTIME_CERTIFICATION_CENTER_VERSION,
  CERTIFICATION_FIXED_TIMESTAMP,
  buildRuntimeCertificationCenterDefinition,
} from "../domain/runtime-certification-center.js";
import { CERTIFICATION_MODULE_IDS } from "../domain/certification-overview.js";
import { RUNTIME_READINESS_CONSOLE_VERSION } from "../../runtime-readiness/domain/runtime-readiness-console.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import { RUNTIME_RELEASE_VERSION } from "../../runtime-release/domain/runtime-release.js";
import {
  RuntimeCertificationRepository,
  createRuntimeCertificationRepository,
} from "../infrastructure/runtime-certification-repository.js";
import { createCertificationAggregator } from "./certification-aggregator.js";
import { CertificationController, createCertificationController } from "./certification-controller.js";
import { validateRuntimeCertification } from "../validation/runtime-certification-validator.js";
import { buildCertificationHome } from "../presentation/certification-home.js";
import { buildCertificationDashboard } from "../presentation/certification-dashboard.js";
import { buildCertificationStatusScreen } from "../presentation/certification-status-screen.js";
import { buildCertificationChecklistScreen } from "../presentation/certification-checklist-screen.js";
import { buildCertificationSummaryScreen } from "../presentation/certification-summary-screen.js";
import { buildCertificationBoard } from "../presentation/certification-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeCertificationService {
  private readonly repository: RuntimeCertificationRepository;
  private readonly controller: CertificationController;

  constructor(deps: {
    runtimeReadiness: RuntimeReadinessConsoleService;
    runtimeExecutive: RuntimeExecutiveDashboardService;
    runtimeOperations: RuntimeOperationsService;
    runtimeRelease: RuntimeReleaseService;
    repository?: RuntimeCertificationRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeCertificationRepository();
    const aggregator = createCertificationAggregator(deps);
    this.controller = createCertificationController(this.repository, aggregator);
  }

  getCertification(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeCertificationCenterDefinition();
    return {
      version: RUNTIME_CERTIFICATION_CENTER_VERSION,
      runtime_readiness_version: RUNTIME_READINESS_CONSOLE_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      runtime_release_version: RUNTIME_RELEASE_VERSION,
      definition,
      module_count: CERTIFICATION_MODULE_IDS.length,
      home: buildCertificationHome(
        aggregation.overview.certificationPercentage,
        aggregation.status.readyForProductionApproval
      ),
      overview: aggregation.overview,
      status: aggregation.status,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: CERTIFICATION_FIXED_TIMESTAMP,
      runtime_certification: true,
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
      screen: buildCertificationDashboard({ ...aggregation.overview }),
    };
  }

  getStatus(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      status: aggregation.status,
      screen: buildCertificationStatusScreen({ ...aggregation.status }),
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
      screen: buildCertificationChecklistScreen(items),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildCertificationSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildCertificationBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeCertification();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeCertificationService(deps: {
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  runtimeRelease: RuntimeReleaseService;
  repository?: RuntimeCertificationRepository;
}) {
  return new RuntimeCertificationService(deps);
}
