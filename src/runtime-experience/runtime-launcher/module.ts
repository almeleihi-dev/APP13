export {
  RUNTIME_LAUNCHER_VERSION,
  LAUNCHER_FIXED_TIMESTAMP,
  buildRuntimeLauncherDefinition,
  type RuntimeLauncherDefinition,
} from "./domain/runtime-launcher.js";

export {
  LAUNCH_MODE_IDS,
  LAUNCH_MODE_DEFINITIONS,
  getLaunchModeDefinition,
  isLaunchModeId,
  type LaunchModeId,
  type LaunchModeView,
  type LaunchReadinessStatus,
} from "./domain/launch-mode.js";

export {
  calculateMvpReadinessPercentage,
  buildLaunchReadinessSummary,
  type LaunchReadinessSummary,
} from "./domain/launch-readiness.js";

export { createLaunchSession, type LaunchSession } from "./domain/launch-session.js";

export { LAUNCH_CHECK_IDS, type LaunchCheck, type LaunchCheckId } from "./domain/launch-check.js";

export {
  RuntimeLauncherService,
  createRuntimeLauncherService,
} from "./application/runtime-launcher-service.js";

export { LaunchController, createLaunchController } from "./application/launch-controller.js";
export { ReadinessEvaluator, createReadinessEvaluator } from "./application/readiness-evaluator.js";
export {
  collectLauncherDependencyValidation,
  validateLaunchModeConsistency,
  validateLaunchCheckCompleteness,
} from "./application/launch-validator.js";

export { buildLauncherHome } from "./presentation/launcher-home.js";
export { buildLaunchSummary } from "./presentation/launch-summary.js";
export { buildReadinessScreen } from "./presentation/readiness-screen.js";
export { buildLaunchChecklist } from "./presentation/launch-checklist.js";
export { buildMvpReadinessScreen } from "./presentation/mvp-readiness-screen.js";
export { buildHandoffSummary } from "./presentation/handoff-summary.js";

export {
  RuntimeLauncherRepository,
  createRuntimeLauncherRepository,
} from "./infrastructure/runtime-launcher-repository.js";

export {
  validateRuntimeLauncher,
  type RuntimeLauncherValidationResult,
} from "./validation/runtime-launcher-validator.js";

import { validateRuntimeLauncher } from "./validation/runtime-launcher-validator.js";
import { RUNTIME_LAUNCHER_VERSION } from "./domain/runtime-launcher.js";
import {
  createRuntimeLauncherService,
  type RuntimeLauncherService,
} from "./application/runtime-launcher-service.js";
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
import type { RuntimeLauncherRepository } from "./infrastructure/runtime-launcher-repository.js";

export interface AnActRuntimeLauncherModule {
  version: typeof RUNTIME_LAUNCHER_VERSION;
  runtimeLauncher: RuntimeLauncherService;
  validate: typeof validateRuntimeLauncher;
}

export function createAnActRuntimeLauncherModule(deps: {
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
  repository?: RuntimeLauncherRepository;
}): AnActRuntimeLauncherModule {
  const runtimeLauncher = createRuntimeLauncherService(deps);
  return {
    version: RUNTIME_LAUNCHER_VERSION,
    runtimeLauncher,
    validate: validateRuntimeLauncher,
  };
}

export const RUNTIME_LAUNCHER_PHILOSOPHY = {
  name: "AN ACT Runtime Launcher & MVP Readiness",
  version: RUNTIME_LAUNCHER_VERSION,
  principles: [
    "Single runtime entry point for launch, preview, demo, and MVP handoff readiness",
    "Delegates entirely to CH3-X5 through CH3-X18 — never owns orchestration",
    "Read-only evaluation with no launch execution, deployment, or Bubble implementation",
    "Calculates MVP readiness, checklists, blockers, and handoff summaries",
    "Official production runtime launcher for AN ACT",
  ],
} as const;
