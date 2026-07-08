import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeCertificationService } from "../../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeReadinessConsoleService } from "../../runtime-readiness/application/runtime-readiness-console-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  RUNTIME_FINAL_READINESS_REVIEW_VERSION,
  FINAL_READINESS_FIXED_TIMESTAMP,
  buildRuntimeFinalReadinessReviewDefinition,
} from "../domain/runtime-final-readiness-review.js";
import { FINAL_READINESS_MODULE_IDS } from "../domain/final-readiness-overview.js";
import { RUNTIME_CERTIFICATION_CENTER_VERSION } from "../../runtime-certification/domain/runtime-certification-center.js";
import { RUNTIME_READINESS_CONSOLE_VERSION } from "../../runtime-readiness/domain/runtime-readiness-console.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import {
  RuntimeFinalReadinessRepository,
  createRuntimeFinalReadinessRepository,
} from "../infrastructure/runtime-final-readiness-repository.js";
import { createFinalReadinessAggregator } from "./final-readiness-aggregator.js";
import { FinalReadinessController, createFinalReadinessController } from "./final-readiness-controller.js";
import { validateRuntimeFinalReadiness } from "../validation/runtime-final-readiness-validator.js";
import { buildFinalReadinessHome } from "../presentation/final-readiness-home.js";
import { buildFinalReadinessDashboard } from "../presentation/final-readiness-dashboard.js";
import { buildFinalReadinessChecklist } from "../presentation/final-readiness-checklist.js";
import { buildFinalReadinessRisksScreen } from "../presentation/final-readiness-risks-screen.js";
import { buildFinalReadinessSummaryScreen } from "../presentation/final-readiness-summary-screen.js";
import { buildFinalReadinessBoard } from "../presentation/final-readiness-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeFinalReadinessService {
  private readonly repository: RuntimeFinalReadinessRepository;
  private readonly controller: FinalReadinessController;

  constructor(deps: {
    runtimeCertification: RuntimeCertificationService;
    runtimeReadiness: RuntimeReadinessConsoleService;
    runtimeExecutive: RuntimeExecutiveDashboardService;
    runtimeOperations: RuntimeOperationsService;
    repository?: RuntimeFinalReadinessRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeFinalReadinessRepository();
    const aggregator = createFinalReadinessAggregator(deps);
    this.controller = createFinalReadinessController(this.repository, aggregator);
  }

  getFinalReadiness(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeFinalReadinessReviewDefinition();
    return {
      version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
      runtime_certification_version: RUNTIME_CERTIFICATION_CENTER_VERSION,
      runtime_readiness_version: RUNTIME_READINESS_CONSOLE_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      definition,
      module_count: FINAL_READINESS_MODULE_IDS.length,
      home: buildFinalReadinessHome(
        aggregation.overview.reviewPercentage,
        aggregation.summary.readyForProduction
      ),
      overview: aggregation.overview,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: FINAL_READINESS_FIXED_TIMESTAMP,
      runtime_final_readiness: true,
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
      screen: buildFinalReadinessDashboard({ ...aggregation.overview }),
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
      screen: buildFinalReadinessChecklist(items),
    };
  }

  getRisks(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      risks: aggregation.risks,
      count: aggregation.risks.length,
      mitigated: aggregation.risks.filter((r) => r.mitigated).length,
      screen: buildFinalReadinessRisksScreen(aggregation.risks),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildFinalReadinessSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildFinalReadinessBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeFinalReadiness();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeFinalReadinessService(deps: {
  runtimeCertification: RuntimeCertificationService;
  runtimeReadiness: RuntimeReadinessConsoleService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeFinalReadinessRepository;
}) {
  return new RuntimeFinalReadinessService(deps);
}
