export {
  RUNTIME_RELEASE_VERSION,
  RELEASE_FIXED_TIMESTAMP,
  buildRuntimeReleaseDefinition,
  type RuntimeReleaseDefinition,
} from "./domain/runtime-release.js";

export {
  buildReleaseCandidate,
  resolveReleaseCandidateDecision,
  type ReleaseCandidate,
  type ReleaseCandidateDecision,
} from "./domain/release-candidate.js";

export {
  calculateReleaseReadinessPercentage,
  calculateRuntimeQualityScore,
  buildReleaseReadiness,
  type ReleaseReadiness,
} from "./domain/release-readiness.js";

export {
  RELEASE_CHECK_IDS,
  KNOWN_RELEASE_LIMITATIONS,
  type ReleaseCheckItem,
  type ReleaseReport,
  type ReleaseCheckId,
} from "./domain/release-report.js";

export { buildReleaseSummary, type ReleaseSummary } from "./domain/release-summary.js";

export {
  RuntimeReleaseService,
  createRuntimeReleaseService,
} from "./application/runtime-release-service.js";

export { ReleaseEvaluator, createReleaseEvaluator } from "./application/release-evaluator.js";
export { ReleaseController, createReleaseController } from "./application/release-controller.js";
export {
  collectReleaseDependencyValidation,
  validateReleaseCheckCompleteness,
  validateReleaseCandidateConsistency,
} from "./application/release-validator.js";

export { buildReleaseHome } from "./presentation/release-home.js";
export { buildReleaseSummaryScreen } from "./presentation/release-summary-screen.js";
export { buildReleaseChecklist } from "./presentation/release-checklist.js";
export { buildReleaseReportScreen } from "./presentation/release-report-screen.js";
export { buildReleaseCandidateScreen } from "./presentation/release-candidate-screen.js";
export { buildCertificationScreen } from "./presentation/certification-screen.js";

export {
  RuntimeReleaseRepository,
  createRuntimeReleaseRepository,
  createReleaseSession,
  type ReleaseSession,
} from "./infrastructure/runtime-release-repository.js";

export {
  validateRuntimeRelease,
  type RuntimeReleaseValidationResult,
} from "./validation/runtime-release-validator.js";

import { validateRuntimeRelease } from "./validation/runtime-release-validator.js";
import { RUNTIME_RELEASE_VERSION } from "./domain/runtime-release.js";
import {
  createRuntimeReleaseService,
  type RuntimeReleaseService,
} from "./application/runtime-release-service.js";
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
import type { RuntimeReleaseRepository } from "./infrastructure/runtime-release-repository.js";

export interface AnActRuntimeReleaseModule {
  version: typeof RUNTIME_RELEASE_VERSION;
  runtimeRelease: RuntimeReleaseService;
  validate: typeof validateRuntimeRelease;
}

export function createAnActRuntimeReleaseModule(deps: {
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
  repository?: RuntimeReleaseRepository;
}): AnActRuntimeReleaseModule {
  const runtimeRelease = createRuntimeReleaseService(deps);
  return {
    version: RUNTIME_RELEASE_VERSION,
    runtimeRelease,
    validate: validateRuntimeRelease,
  };
}

export const RUNTIME_RELEASE_PHILOSOPHY = {
  name: "AN ACT Runtime Release Candidate",
  version: RUNTIME_RELEASE_VERSION,
  principles: [
    "Final runtime certification layer before MVP implementation",
    "Delegates entirely to CH3-X5 through CH3-X19 — never owns orchestration",
    "Read-only certification with no release execution, deployment, or Bubble implementation",
    "Generates release readiness, checklist, report, and certification summary",
    "Official production runtime release candidate for AN ACT",
  ],
} as const;
