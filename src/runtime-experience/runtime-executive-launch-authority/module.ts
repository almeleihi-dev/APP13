export {
  RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
  EXECUTIVE_LAUNCH_AUTHORITY_FIXED_TIMESTAMP,
  buildRuntimeExecutiveLaunchAuthorityDefinition,
  type RuntimeExecutiveLaunchAuthorityDefinition,
} from "./domain/runtime-executive-launch-authority.js";

export {
  EXECUTIVE_LAUNCH_MODULE_IDS,
  EXECUTIVE_LAUNCH_MODULE_META,
  buildExecutiveLaunchOverview,
  calculateAuthorizationPercentage,
  type ExecutiveLaunchModuleId,
  type ExecutiveLaunchModuleOverview,
  type ExecutiveLaunchOverview,
  type ExecutiveLaunchModuleStatus,
} from "./domain/executive-launch-overview.js";

export {
  EXECUTIVE_LAUNCH_CHECK_IDS,
  type ExecutiveLaunchCheck,
  type ExecutiveLaunchCheckId,
  type ExecutiveLaunchCheckStatus,
} from "./domain/executive-launch-checks.js";

export {
  buildExecutiveLaunchReadiness,
  type ExecutiveLaunchReadiness,
  type ExecutiveLaunchReadinessDecision,
} from "./domain/executive-launch-readiness.js";

export {
  buildExecutiveLaunchDecision,
  type ExecutiveLaunchDecision,
  type ExecutiveLaunchAuthorityDecision,
} from "./domain/executive-launch-decision.js";

export { buildExecutiveLaunchSummary, type ExecutiveLaunchSummary } from "./domain/executive-launch-summary.js";

export {
  RuntimeExecutiveLaunchAuthorityService,
  createRuntimeExecutiveLaunchAuthorityService,
} from "./application/runtime-executive-launch-authority-service.js";

export {
  ExecutiveLaunchController,
  createExecutiveLaunchController,
} from "./application/executive-launch-controller.js";

export {
  ExecutiveLaunchAggregator,
  createExecutiveLaunchAggregator,
} from "./application/executive-launch-aggregator.js";

export {
  collectExecutiveLaunchDependencyValidation,
  validateExecutiveLaunchCheckCompleteness,
  validateExecutiveLaunchModuleCoverage,
} from "./application/executive-launch-validator.js";

export { buildExecutiveLaunchHome } from "./presentation/executive-launch-home.js";
export { buildExecutiveLaunchDashboard } from "./presentation/executive-launch-dashboard.js";
export { buildExecutiveLaunchReadinessScreen } from "./presentation/executive-launch-readiness-screen.js";
export { buildExecutiveLaunchDecisionScreen } from "./presentation/executive-launch-decision-screen.js";
export { buildExecutiveLaunchSummaryScreen } from "./presentation/executive-launch-summary-screen.js";
export { buildExecutiveLaunchBoard } from "./presentation/executive-launch-board.js";

export {
  RuntimeExecutiveLaunchAuthorityRepository,
  createRuntimeExecutiveLaunchAuthorityRepository,
  createExecutiveLaunchAuthoritySession,
  type ExecutiveLaunchAuthoritySession,
} from "./infrastructure/runtime-executive-launch-authority-repository.js";

export {
  validateRuntimeExecutiveLaunchAuthority,
  type RuntimeExecutiveLaunchAuthorityValidationResult,
} from "./validation/runtime-executive-launch-authority-validator.js";

import { validateRuntimeExecutiveLaunchAuthority } from "./validation/runtime-executive-launch-authority-validator.js";
import { RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION } from "./domain/runtime-executive-launch-authority.js";
import {
  createRuntimeExecutiveLaunchAuthorityService,
  type RuntimeExecutiveLaunchAuthorityService,
} from "./application/runtime-executive-launch-authority-service.js";
import type { RuntimeLaunchReadinessAuthorityService } from "../runtime-launch-readiness-authority/application/runtime-launch-readiness-authority-service.js";
import type { RuntimeLaunchControlService } from "../runtime-launch-control/application/runtime-launch-control-service.js";
import type { RuntimeOperationsCenterService } from "../runtime-operations-center/application/runtime-operations-center-service.js";
import type { RuntimeProductionApprovalService } from "../runtime-production-approval/application/runtime-production-approval-service.js";
import type { RuntimeExecutiveDashboardService } from "../runtime-executive/application/runtime-executive-dashboard-service.js";
import type { RuntimeExecutiveLaunchAuthorityRepository } from "./infrastructure/runtime-executive-launch-authority-repository.js";

export interface AnActRuntimeExecutiveLaunchAuthorityModule {
  version: typeof RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION;
  runtimeExecutiveLaunchAuthority: RuntimeExecutiveLaunchAuthorityService;
  validate: typeof validateRuntimeExecutiveLaunchAuthority;
}

export function createAnActRuntimeExecutiveLaunchAuthorityModule(deps: {
  runtimeLaunchReadinessAuthority: RuntimeLaunchReadinessAuthorityService;
  runtimeLaunchControl: RuntimeLaunchControlService;
  runtimeOperationsCenter: RuntimeOperationsCenterService;
  runtimeProductionApproval: RuntimeProductionApprovalService;
  runtimeExecutive: RuntimeExecutiveDashboardService;
  repository?: RuntimeExecutiveLaunchAuthorityRepository;
}): AnActRuntimeExecutiveLaunchAuthorityModule {
  const runtimeExecutiveLaunchAuthority = createRuntimeExecutiveLaunchAuthorityService(deps);
  return {
    version: RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
    runtimeExecutiveLaunchAuthority,
    validate: validateRuntimeExecutiveLaunchAuthority,
  };
}

export const RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_PHILOSOPHY = {
  name: "AN ACT Runtime Executive Launch Authority",
  version: RUNTIME_EXECUTIVE_LAUNCH_AUTHORITY_VERSION,
  principles: [
    "Highest authoritative executive launch layer for official runtime launch authorization",
    "Delegates entirely to CH3-X5 through CH3-X29 — never owns orchestration",
    "Read-only executive launch authority with no deployment, runtime execution, or external integration",
    "Aggregates executive readiness, decision, and status board from launch readiness and approval layers",
    "Official runtime executive launch authority for AN ACT",
  ],
} as const;
