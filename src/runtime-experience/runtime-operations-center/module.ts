export {
  RUNTIME_OPERATIONS_CENTER_VERSION,
  OPERATIONS_CENTER_FIXED_TIMESTAMP,
  buildRuntimeOperationsCenterDefinition,
  type RuntimeOperationsCenterDefinition,
} from "./domain/runtime-operations-center.js";

export {
  OPERATIONS_CENTER_MODULE_IDS,
  OPERATIONS_CENTER_MODULE_META,
  buildOperationsCenterOverview,
  calculateOperationalPercentage,
  type OperationsCenterModuleId,
  type OperationsCenterModuleOverview,
  type OperationsCenterOverview,
  type OperationsCenterModuleStatus,
} from "./domain/operations-center-overview.js";

export { buildOperationsCenterHealth, type OperationsCenterHealth } from "./domain/operations-center-health.js";
export {
  buildOperationsCenterAlerts,
  type OperationsCenterAlert,
  type OperationsCenterAlertSeverity,
} from "./domain/operations-center-alerts.js";
export { buildOperationsCenterSummary, type OperationsCenterSummary } from "./domain/operations-center-summary.js";

export {
  RuntimeOperationsCenterService,
  createRuntimeOperationsCenterService,
} from "./application/runtime-operations-center-service.js";

export {
  OperationsCenterController,
  createOperationsCenterController,
} from "./application/operations-center-controller.js";

export {
  OperationsCenterAggregator,
  createOperationsCenterAggregator,
} from "./application/operations-center-aggregator.js";

export {
  collectOperationsCenterDependencyValidation,
  validateOperationsCenterModuleCoverage,
} from "./application/operations-center-validator.js";

export { buildOperationsCenterHome } from "./presentation/operations-center-home.js";
export { buildOperationsCenterDashboard } from "./presentation/operations-center-dashboard.js";
export { buildOperationsCenterHealthScreen } from "./presentation/operations-center-health-screen.js";
export { buildOperationsCenterAlertsScreen } from "./presentation/operations-center-alerts-screen.js";
export { buildOperationsCenterSummaryScreen } from "./presentation/operations-center-summary-screen.js";
export { buildOperationsCenterStatusBoard } from "./presentation/operations-center-status-board.js";

export {
  RuntimeOperationsCenterRepository,
  createRuntimeOperationsCenterRepository,
  createOperationsCenterSession,
  type OperationsCenterSession,
} from "./infrastructure/runtime-operations-center-repository.js";

export {
  validateRuntimeOperationsCenter,
  type RuntimeOperationsCenterValidationResult,
} from "./validation/runtime-operations-center-validator.js";

import { validateRuntimeOperationsCenter } from "./validation/runtime-operations-center-validator.js";
import { RUNTIME_OPERATIONS_CENTER_VERSION } from "./domain/runtime-operations-center.js";
import {
  createRuntimeOperationsCenterService,
  type RuntimeOperationsCenterService,
} from "./application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeFinalReadinessService } from "../runtime-final-readiness/application/runtime-final-readiness-service.js";
import type { RuntimeOperationsCenterRepository } from "./infrastructure/runtime-operations-center-repository.js";

export interface AnActRuntimeOperationsCenterModule {
  version: typeof RUNTIME_OPERATIONS_CENTER_VERSION;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  validate: typeof validateRuntimeOperationsCenter;
}

export function createAnActRuntimeOperationsCenterModule(deps: {
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeOperations: RuntimeOperationsService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  runtimeFinalReadiness: RuntimeFinalReadinessService;
  repository?: RuntimeOperationsCenterRepository;
}): AnActRuntimeOperationsCenterModule {
  const runtimeOperationsCenter = createRuntimeOperationsCenterService(deps);
  return {
    version: RUNTIME_OPERATIONS_CENTER_VERSION,
    runtimeOperationsCenter,
    validate: validateRuntimeOperationsCenter,
  };
}

export const RUNTIME_OPERATIONS_CENTER_PHILOSOPHY = {
  name: "AN ACT Runtime Operations Center",
  version: RUNTIME_OPERATIONS_CENTER_VERSION,
  principles: [
    "Post-production operational command center for the approved Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X26 — never owns orchestration",
    "Read-only operations center with no deployment, runtime execution, or Bubble integration",
    "Aggregates health, alerts, status, and summary across all approved runtime modules",
    "Official post-approval runtime operations center for AN ACT",
  ],
} as const;
