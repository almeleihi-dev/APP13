import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeFinalReadinessService } from "../../runtime-final-readiness/application/runtime-final-readiness-service.js";
import type { RuntimeCertificationService } from "../../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeExecutiveDashboardService } from "../../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../../runtime-operations/application/runtime-operations-service.js";
import {
  RUNTIME_PRODUCTION_APPROVAL_VERSION,
  APPROVAL_FIXED_TIMESTAMP,
  buildRuntimeProductionApprovalDefinition,
} from "../domain/runtime-production-approval.js";
import { APPROVAL_MODULE_IDS } from "../domain/approval-overview.js";
import { RUNTIME_FINAL_READINESS_REVIEW_VERSION } from "../../runtime-final-readiness/domain/runtime-final-readiness-review.js";
import { RUNTIME_CERTIFICATION_CENTER_VERSION } from "../../runtime-certification/domain/runtime-certification-center.js";
import { RUNTIME_EXECUTIVE_VERSION } from "../../runtime-executive/domain/runtime-executive-dashboard.js";
import { RUNTIME_OPERATIONS_VERSION } from "../../runtime-operations/domain/runtime-operations-center.js";
import {
  RuntimeProductionApprovalRepository,
  createRuntimeProductionApprovalRepository,
} from "../infrastructure/runtime-production-approval-repository.js";
import { createApprovalAggregator } from "./approval-aggregator.js";
import { ApprovalController, createApprovalController } from "./approval-controller.js";
import { validateRuntimeProductionApproval } from "../validation/runtime-production-approval-validator.js";
import { buildApprovalHome } from "../presentation/approval-home.js";
import { buildApprovalDashboard } from "../presentation/approval-dashboard.js";
import { buildApprovalChecklist } from "../presentation/approval-checklist.js";
import { buildApprovalDecisionScreen } from "../presentation/approval-decision-screen.js";
import { buildApprovalSummaryScreen } from "../presentation/approval-summary-screen.js";
import { buildApprovalBoard } from "../presentation/approval-board.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

export class RuntimeProductionApprovalService {
  private readonly repository: RuntimeProductionApprovalRepository;
  private readonly controller: ApprovalController;

  constructor(deps: {
    runtimeFinalReadiness: RuntimeFinalReadinessService;
    runtimeCertification: RuntimeCertificationService;
    runtimeExecutive: RuntimeExecutiveDashboardService;
    runtimeOperations: RuntimeOperationsService;
    repository?: RuntimeProductionApprovalRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeProductionApprovalRepository();
    const aggregator = createApprovalAggregator(deps);
    this.controller = createApprovalController(this.repository, aggregator);
  }

  getApproval(authContext: AuthContext) {
    requireAuth(authContext);
    const { session, aggregation } = this.controller.getSession(authContext);
    const definition = buildRuntimeProductionApprovalDefinition();
    return {
      version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
      runtime_final_readiness_version: RUNTIME_FINAL_READINESS_REVIEW_VERSION,
      runtime_certification_version: RUNTIME_CERTIFICATION_CENTER_VERSION,
      runtime_executive_version: RUNTIME_EXECUTIVE_VERSION,
      runtime_operations_version: RUNTIME_OPERATIONS_VERSION,
      definition,
      module_count: APPROVAL_MODULE_IDS.length,
      home: buildApprovalHome(
        aggregation.overview.approvalPercentage,
        aggregation.decision.officiallyApprovedForProduction
      ),
      overview: aggregation.overview,
      decision: aggregation.decision,
      summary: aggregation.summary,
      session,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: APPROVAL_FIXED_TIMESTAMP,
      runtime_production_approval: true,
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
      screen: buildApprovalDashboard({ ...aggregation.overview }),
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
      screen: buildApprovalChecklist(items),
    };
  }

  getDecision(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      decision: aggregation.decision,
      screen: buildApprovalDecisionScreen({ ...aggregation.decision }),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      summary: aggregation.summary,
      screen: buildApprovalSummaryScreen({ ...aggregation.summary }),
    };
  }

  getBoard(authContext: AuthContext) {
    requireAuth(authContext);
    const aggregation = this.controller.getAggregation(authContext);
    return {
      board: aggregation.board,
      count: aggregation.board.length,
      screen: buildApprovalBoard(aggregation.board),
    };
  }

  validateRuntime() {
    return validateRuntimeProductionApproval();
  }

  refresh(authContext: AuthContext) {
    requireAuth(authContext);
    return this.controller.refresh(authContext);
  }
}

export function createRuntimeProductionApprovalService(deps: {
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  runtimeCertification: RuntimeCertificationService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeProductionApprovalRepository;
}) {
  return new RuntimeProductionApprovalService(deps);
}
