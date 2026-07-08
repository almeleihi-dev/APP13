export {
  RUNTIME_PRODUCTION_APPROVAL_VERSION,
  APPROVAL_FIXED_TIMESTAMP,
  buildRuntimeProductionApprovalDefinition,
  type RuntimeProductionApprovalDefinition,
} from "./domain/runtime-production-approval.js";

export {
  APPROVAL_MODULE_IDS,
  APPROVAL_MODULE_META,
  buildApprovalOverview,
  calculateApprovalPercentage,
  type ApprovalModuleId,
  type ApprovalModuleOverview,
  type ApprovalOverview,
  type ApprovalModuleStatus,
} from "./domain/approval-overview.js";

export {
  APPROVAL_CHECK_IDS,
  type ApprovalCheck,
  type ApprovalCheckId,
  type ApprovalCheckStatus,
} from "./domain/approval-checks.js";

export {
  buildApprovalDecision,
  type ApprovalDecision,
  type ProductionApprovalDecision,
} from "./domain/approval-decision.js";

export { buildApprovalSummary, type ApprovalSummary } from "./domain/approval-summary.js";

export {
  RuntimeProductionApprovalService,
  createRuntimeProductionApprovalService,
} from "./application/runtime-production-approval-service.js";

export {
  ApprovalController,
  createApprovalController,
} from "./application/approval-controller.js";

export {
  ApprovalAggregator,
  createApprovalAggregator,
} from "./application/approval-aggregator.js";

export {
  collectApprovalDependencyValidation,
  validateApprovalCheckCompleteness,
  validateApprovalModuleCoverage,
} from "./application/approval-validator.js";

export { buildApprovalHome } from "./presentation/approval-home.js";
export { buildApprovalDashboard } from "./presentation/approval-dashboard.js";
export { buildApprovalChecklist } from "./presentation/approval-checklist.js";
export { buildApprovalDecisionScreen } from "./presentation/approval-decision-screen.js";
export { buildApprovalSummaryScreen } from "./presentation/approval-summary-screen.js";
export { buildApprovalBoard } from "./presentation/approval-board.js";

export {
  RuntimeProductionApprovalRepository,
  createRuntimeProductionApprovalRepository,
  createProductionApprovalSession,
  type ProductionApprovalSession,
} from "./infrastructure/runtime-production-approval-repository.js";

export {
  validateRuntimeProductionApproval,
  type RuntimeProductionApprovalValidationResult,
} from "./validation/runtime-production-approval-validator.js";

import { validateRuntimeProductionApproval } from "./validation/runtime-production-approval-validator.js";
import { RUNTIME_PRODUCTION_APPROVAL_VERSION } from "./domain/runtime-production-approval.js";
import {
  createRuntimeProductionApprovalService,
  type RuntimeProductionApprovalService,
} from "./application/runtime-production-approval-service.js";
import type { RuntimeFinalReadinessService } from "../runtime-final-readiness/application/runtime-final-readiness-service.js";
import type { RuntimeCertificationService } from "../runtime-certification/application/runtime-certification-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeProductionApprovalRepository } from "./infrastructure/runtime-production-approval-repository.js";

export interface AnActRuntimeProductionApprovalCenterModule {
  version: typeof RUNTIME_PRODUCTION_APPROVAL_VERSION;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  validate: typeof validateRuntimeProductionApproval;
}

export function createAnActRuntimeProductionApprovalCenterModule(deps: {
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  runtimeCertification: RuntimeCertificationService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeProductionApprovalRepository;
}): AnActRuntimeProductionApprovalCenterModule {
  const runtimeProductionApproval = createRuntimeProductionApprovalService(deps);
  return {
    version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
    runtimeProductionApproval,
    validate: validateRuntimeProductionApproval,
  };
}

export const RUNTIME_PRODUCTION_APPROVAL_PHILOSOPHY = {
  name: "AN ACT Runtime Production Approval Center",
  version: RUNTIME_PRODUCTION_APPROVAL_VERSION,
  principles: [
    "Authoritative approval layer for official production handoff of the Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X25 — never owns orchestration",
    "Read-only production approval with no deployment, runtime execution, or Bubble integration",
    "Aggregates approval decision, checks, and board from final readiness and certification layers",
    "Official production approval center for AN ACT",
  ],
} as const;
