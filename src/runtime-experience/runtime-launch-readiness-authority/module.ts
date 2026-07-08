export {
  RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
  LAUNCH_READINESS_AUTHORITY_FIXED_TIMESTAMP,
  buildRuntimeLaunchReadinessAuthorityDefinition,
  type RuntimeLaunchReadinessAuthorityDefinition,
} from "./domain/runtime-launch-readiness-authority.js";

export {
  LAUNCH_READINESS_MODULE_IDS,
  LAUNCH_READINESS_MODULE_META,
  buildLaunchReadinessOverview,
  calculateReadinessPercentage,
  type LaunchReadinessModuleId,
  type LaunchReadinessModuleOverview,
  type LaunchReadinessOverview,
  type LaunchReadinessModuleStatus,
} from "./domain/launch-readiness-overview.js";

export {
  LAUNCH_READINESS_CHECK_IDS,
  type LaunchReadinessCheck,
  type LaunchReadinessCheckId,
  type LaunchReadinessCheckStatus,
} from "./domain/launch-readiness-checks.js";

export {
  buildLaunchReadinessDecision,
  type LaunchReadinessDecision,
  type LaunchReadinessAuthorityDecision,
} from "./domain/launch-readiness-decision.js";

export { buildLaunchReadinessSummary, type LaunchReadinessSummary } from "./domain/launch-readiness-summary.js";

export {
  RuntimeLaunchReadinessAuthorityService,
  createRuntimeLaunchReadinessAuthorityService,
} from "./application/runtime-launch-readiness-authority-service.js";

export {
  LaunchReadinessController,
  createLaunchReadinessController,
} from "./application/launch-readiness-controller.js";

export {
  LaunchReadinessAggregator,
  createLaunchReadinessAggregator,
} from "./application/launch-readiness-aggregator.js";

export {
  collectLaunchReadinessDependencyValidation,
  validateLaunchReadinessCheckCompleteness,
  validateLaunchReadinessModuleCoverage,
} from "./application/launch-readiness-validator.js";

export { buildLaunchReadinessHome } from "./presentation/launch-readiness-home.js";
export { buildLaunchReadinessDashboard } from "./presentation/launch-readiness-dashboard.js";
export { buildLaunchReadinessChecklist } from "./presentation/launch-readiness-checklist.js";
export { buildLaunchReadinessDecisionScreen } from "./presentation/launch-readiness-decision-screen.js";
export { buildLaunchReadinessSummaryScreen } from "./presentation/launch-readiness-summary-screen.js";
export { buildLaunchReadinessBoard } from "./presentation/launch-readiness-board.js";

export {
  RuntimeLaunchReadinessAuthorityRepository,
  createRuntimeLaunchReadinessAuthorityRepository,
  createLaunchReadinessAuthoritySession,
  type LaunchReadinessAuthoritySession,
} from "./infrastructure/runtime-launch-readiness-authority-repository.js";

export {
  validateRuntimeLaunchReadinessAuthority,
  type RuntimeLaunchReadinessAuthorityValidationResult,
} from "./validation/runtime-launch-readiness-authority-validator.js";

import { validateRuntimeLaunchReadinessAuthority } from "./validation/runtime-launch-readiness-authority-validator.js";
import { RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION } from "./domain/runtime-launch-readiness-authority.js";
import {
  createRuntimeLaunchReadinessAuthorityService,
  type RuntimeLaunchReadinessAuthorityService,
} from "./application/runtime-launch-readiness-authority-service.js";
import type { RuntimeLaunchControlService } from "../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeLauncherService } from "../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeLaunchReadinessAuthorityRepository } from "./infrastructure/runtime-launch-readiness-authority-repository.js";

export interface AnActRuntimeLaunchReadinessAuthorityModule {
  version: typeof RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION;
  runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService;
  validate: typeof validateRuntimeLaunchReadinessAuthority;
}

export function createAnActRuntimeLaunchReadinessAuthorityModule(deps: {
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeLauncher: RuntimeLauncherService;
  repository?: RuntimeLaunchReadinessAuthorityRepository;
}): AnActRuntimeLaunchReadinessAuthorityModule {
  const runtimeLaunchReadinessAuthority = createRuntimeLaunchReadinessAuthorityService(deps);
  return {
    version: RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
    runtimeLaunchReadinessAuthority,
    validate: validateRuntimeLaunchReadinessAuthority,
  };
}

export const RUNTIME_LAUNCH_READINESS_AUTHORITY_PHILOSOPHY = {
  name: "AN ACT Runtime Launch Readiness Authority",
  version: RUNTIME_LAUNCH_READINESS_AUTHORITY_VERSION,
  principles: [
    "Authoritative launch readiness authority for official runtime launch decision",
    "Delegates entirely to CH3-X5 through CH3-X28 — never owns orchestration",
    "Read-only launch readiness with no deployment, runtime execution, or Bubble integration",
    "Aggregates launch readiness, checks, decision, and board from launch control and approval layers",
    "Official runtime launch readiness authority for AN ACT",
  ],
} as const;
