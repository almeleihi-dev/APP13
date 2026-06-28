export {
  RUNTIME_LAUNCH_CONTROL_VERSION,
  LAUNCH_CONTROL_FIXED_TIMESTAMP,
  buildRuntimeLaunchControlDefinition,
  type RuntimeLaunchControlDefinition,
} from "./domain/runtime-launch-control.js";

export {
  LAUNCH_CONTROL_MODULE_IDS,
  LAUNCH_CONTROL_MODULE_META,
  buildLaunchControlOverview,
  calculateLaunchClearancePercentage,
  type LaunchControlModuleId,
  type LaunchControlModuleOverview,
  type LaunchControlOverview,
  type LaunchControlModuleStatus,
} from "./domain/launch-control-overview.js";

export {
  LAUNCH_CONTROL_CHECK_IDS,
  type LaunchControlCheck,
  type LaunchControlCheckId,
  type LaunchControlCheckStatus,
} from "./domain/launch-control-checks.js";

export {
  buildLaunchControlReadiness,
  type LaunchControlReadiness,
  type LaunchControlReadinessDecision,
} from "./domain/launch-control-readiness.js";

export { buildLaunchControlSummary, type LaunchControlSummary } from "./domain/launch-control-summary.js";

export {
  RuntimeLaunchControlService,
  createRuntimeLaunchControlService,
} from "./application/runtime-launch-control-service.js";

export {
  LaunchControlController,
  createLaunchControlController,
} from "./application/launch-control-controller.js";

export {
  LaunchControlAggregator,
  createLaunchControlAggregator,
} from "./application/launch-control-aggregator.js";

export {
  collectLaunchControlDependencyValidation,
  validateLaunchControlCheckCompleteness,
  validateLaunchControlModuleCoverage,
} from "./application/launch-control-validator.js";

export { buildLaunchControlHome } from "./presentation/launch-control-home.js";
export { buildLaunchControlDashboard } from "./presentation/launch-control-dashboard.js";
export { buildLaunchControlChecklist } from "./presentation/launch-control-checklist.js";
export { buildLaunchControlReadinessScreen } from "./presentation/launch-control-readiness-screen.js";
export { buildLaunchControlSummaryScreen } from "./presentation/launch-control-summary-screen.js";
export { buildLaunchControlBoard } from "./presentation/launch-control-board.js";

export {
  RuntimeLaunchControlRepository,
  createRuntimeLaunchControlRepository,
  createLaunchControlSession,
  type LaunchControlSession,
} from "./infrastructure/runtime-launch-control-repository.js";

export {
  validateRuntimeLaunchControl,
  type RuntimeLaunchControlValidationResult,
} from "./validation/runtime-launch-control-validator.js";

import { validateRuntimeLaunchControl } from "./validation/runtime-launch-control-validator.js";
import { RUNTIME_LAUNCH_CONTROL_VERSION } from "./domain/runtime-launch-control.js";
import {
  createRuntimeLaunchControlService,
  type RuntimeLaunchControlService,
} from "./application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeOperationsService } from "../runtime-operations/application/runtime-operations-service.js";
import type { RuntimeLaunchControlRepository } from "./infrastructure/runtime-launch-control-repository.js";

export interface AnActRuntimeLaunchControlCenterModule {
  version: typeof RUNTIME_LAUNCH_CONTROL_VERSION;
  runtimeLaunchControl: RuntimeLaunchControlService;
  validate: typeof validateRuntimeLaunchControl;
}

export function createAnActRuntimeLaunchControlCenterModule(deps: {
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeOperations: RuntimeOperationsService;
  repository?: RuntimeLaunchControlRepository;
}): AnActRuntimeLaunchControlCenterModule {
  const runtimeLaunchControl = createRuntimeLaunchControlService(deps);
  return {
    version: RUNTIME_LAUNCH_CONTROL_VERSION,
    runtimeLaunchControl,
    validate: validateRuntimeLaunchControl,
  };
}

export const RUNTIME_LAUNCH_CONTROL_PHILOSOPHY = {
  name: "AN ACT Runtime Launch Control Center",
  version: RUNTIME_LAUNCH_CONTROL_VERSION,
  principles: [
    "Authoritative launch control layer for official runtime launch clearance",
    "Delegates entirely to CH3-X5 through CH3-X27 — never owns orchestration",
    "Read-only launch control with no deployment, runtime execution, or Bubble integration",
    "Aggregates launch readiness, checks, and board from operations center and approval layers",
    "Official runtime launch control center for AN ACT",
  ],
} as const;
