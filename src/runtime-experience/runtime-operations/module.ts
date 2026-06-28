export {
  RUNTIME_OPERATIONS_VERSION,
  OPERATIONS_FIXED_TIMESTAMP,
  buildRuntimeOperationsDefinition,
  type RuntimeOperationsDefinition,
} from "./domain/runtime-operations-center.js";

export {
  OPERATIONS_MODULE_IDS,
  OPERATIONS_MODULE_META,
  buildOperationsOverview,
  type OperationsModuleId,
  type OperationsModuleOverview,
  type OperationsOverview,
} from "./domain/operations-overview.js";

export { buildOperationsHealth, type OperationsHealth } from "./domain/operations-health.js";
export { buildOperationsAlerts, type OperationsAlert, type OperationsAlertSeverity } from "./domain/operations-alerts.js";
export { buildOperationsSummary, type OperationsSummary } from "./domain/operations-summary.js";

export {
  RuntimeOperationsService,
  createRuntimeOperationsService,
} from "./application/runtime-operations-service.js";

export { OperationsController, createOperationsController } from "./application/operations-controller.js";
export { OperationsAggregator, createOperationsAggregator } from "./application/operations-aggregator.js";
export {
  collectOperationsDependencyValidation,
  validateOperationsModuleCoverage,
} from "./application/operations-validator.js";

export { buildOperationsHome } from "./presentation/operations-home.js";
export { buildOperationsDashboard } from "./presentation/operations-dashboard.js";
export { buildOperationsHealthScreen } from "./presentation/operations-health-screen.js";
export { buildOperationsAlertsScreen } from "./presentation/operations-alerts-screen.js";
export { buildOperationsSummaryScreen } from "./presentation/operations-summary-screen.js";
export { buildOperationsStatusBoard } from "./presentation/operations-status-board.js";

export {
  RuntimeOperationsRepository,
  createRuntimeOperationsRepository,
  createOperationsSession,
  type OperationsSession,
} from "./infrastructure/runtime-operations-repository.js";

export {
  validateRuntimeOperations,
  type RuntimeOperationsValidationResult,
} from "./validation/runtime-operations-validator.js";

import { validateRuntimeOperations } from "./validation/runtime-operations-validator.js";
import { RUNTIME_OPERATIONS_VERSION } from "./domain/runtime-operations-center.js";
import {
  createRuntimeOperationsService,
  type RuntimeOperationsService,
} from "./application/runtime-operations-service.js";
import type { NeedExperienceService } from "../need/application/need-experience-service.js";
import type { ActionExperienceService } from "../action/application/action-experience-service.js";
import type { ContractExperienceService } from "../contract/application/contract-experience-service.js";
import type { ChatExperienceService } from "../chat/application/chat-experience-service.js";
import type { TimelineExperienceService } from "../timeline/application/timeline-experience-service.js";
import type { NotificationExperienceService } from "../notification/application/notification-experience-service.js";
import type { ProfileExperienceService } from "../profile/application/profile-experience-service.js";
import type { RuntimeJourneyService } from "../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeCoordinatorService } from "../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeHealthService } from "../runtime-health/application/runtime-health-service.js";
import type { RuntimeDemoService } from "../runtime-demo/application/runtime-demo-service.js";
import type { RuntimePreviewService } from "../runtime-preview/application/runtime-preview-service.js";
import type { RuntimeLauncherService } from "../runtime-launcher/application/runtime-launcher-service.js";
import type { RuntimeReleaseService } from "../runtime-release/application/runtime-release-service.js";
import type { RuntimeOperationsRepository } from "./infrastructure/runtime-operations-repository.js";

export interface AnActRuntimeOperationsModule {
  version: typeof RUNTIME_OPERATIONS_VERSION;
  runtimeOperations: RuntimeOperationsService;
  validate: typeof validateRuntimeOperations;
}

export function createAnActRuntimeOperationsModule(deps: {
  needExperience: NeedExperienceService;
  actionExperience: ActionExperienceService;
  contractExperience: ContractExperienceService;
  chatExperience: ChatExperienceService;
  timelineExperience: TimelineExperienceService;
  notificationExperience: NotificationExperienceService;
  profileExperience: ProfileExperienceService;
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  runtimeCoordinator: RuntimeCoordinatorService;
  runtimeHealth: RuntimeHealthService;
  runtimeDemo: RuntimeDemoService;
  runtimePreview: RuntimePreviewService;
  runtimeLauncher: RuntimeLauncherService;
  runtimeRelease: RuntimeReleaseService;
  repository?: RuntimeOperationsRepository;
}): AnActRuntimeOperationsModule {
  const runtimeOperations = createRuntimeOperationsService(deps);
  return {
    version: RUNTIME_OPERATIONS_VERSION,
    runtimeOperations,
    validate: validateRuntimeOperations,
  };
}

export const RUNTIME_OPERATIONS_PHILOSOPHY = {
  name: "AN ACT Runtime Operations Center",
  version: RUNTIME_OPERATIONS_VERSION,
  principles: [
    "Unified operational dashboard for the entire Runtime Experience",
    "Delegates entirely to CH3-X5 through CH3-X20 — never owns orchestration",
    "Read-only operations with no deployment, runtime execution, or Bubble integration",
    "Aggregates health, alerts, status, and summary across all runtime modules",
    "Official production runtime operations center for AN ACT",
  ],
} as const;
