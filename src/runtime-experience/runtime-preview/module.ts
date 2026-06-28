export {
  RUNTIME_PREVIEW_VERSION,
  PREVIEW_FIXED_TIMESTAMP,
  buildRuntimePreviewDefinition,
  type RuntimePreviewDefinition,
} from "./domain/runtime-preview.js";

export { createPreviewSession, type PreviewSession } from "./domain/preview-session.js";

export {
  PREVIEW_TARGET_IDS,
  PREVIEW_TARGETS,
  getPreviewTarget,
  isPreviewTargetId,
  type PreviewTargetId,
  type PreviewTarget,
  type PreviewTargetCategory,
} from "./domain/preview-screen.js";

export {
  createInitialPreviewState,
  previewCoveragePercentage,
  type PreviewState,
} from "./domain/preview-state.js";

export {
  RuntimePreviewService,
  createRuntimePreviewService,
} from "./application/runtime-preview-service.js";

export { PreviewBuilder, createPreviewBuilder } from "./application/preview-builder.js";
export { PreviewController, createPreviewController } from "./application/preview-controller.js";
export {
  collectPreviewDependencyValidation,
  validatePreviewTargetsIntegrity,
} from "./application/preview-validator.js";

export { buildPreviewHome } from "./presentation/preview-home.js";
export { buildPreviewNeed } from "./presentation/preview-need.js";
export { buildPreviewAction } from "./presentation/preview-action.js";
export { buildPreviewContract } from "./presentation/preview-contract.js";
export { buildPreviewChat } from "./presentation/preview-chat.js";
export { buildPreviewTimeline } from "./presentation/preview-timeline.js";
export { buildPreviewNotification } from "./presentation/preview-notification.js";
export { buildPreviewProfile } from "./presentation/preview-profile.js";
export { buildPreviewSummary } from "./presentation/preview-summary.js";

export {
  RuntimePreviewRepository,
  createRuntimePreviewRepository,
} from "./infrastructure/runtime-preview-repository.js";

export {
  validateRuntimePreview,
  type RuntimePreviewValidationResult,
} from "./validation/runtime-preview-validator.js";

import { validateRuntimePreview } from "./validation/runtime-preview-validator.js";
import { RUNTIME_PREVIEW_VERSION } from "./domain/runtime-preview.js";
import {
  createRuntimePreviewService,
  type RuntimePreviewService,
} from "./application/runtime-preview-service.js";
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
import type { RuntimePreviewRepository } from "./infrastructure/runtime-preview-repository.js";

export interface AnActRuntimePreviewModule {
  version: typeof RUNTIME_PREVIEW_VERSION;
  runtimePreview: RuntimePreviewService;
  validate: typeof validateRuntimePreview;
}

export function createAnActRuntimePreviewModule(deps: {
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
  repository?: RuntimePreviewRepository;
}): AnActRuntimePreviewModule {
  const runtimePreview = createRuntimePreviewService(deps);
  return {
    version: RUNTIME_PREVIEW_VERSION,
    runtimePreview,
    validate: validateRuntimePreview,
  };
}

export const RUNTIME_PREVIEW_PHILOSOPHY = {
  name: "AN ACT Runtime Preview Engine",
  version: RUNTIME_PREVIEW_VERSION,
  principles: [
    "Read-only preview layer for every runtime experience before execution",
    "Delegates entirely to CH3-X5 through CH3-X17 — never owns orchestration",
    "Deterministic preview with fixed timestamp — no lifecycle mutations",
    "No AI, no persistence, no networking, no business logic",
    "Official production runtime preview engine for AN ACT",
  ],
} as const;
