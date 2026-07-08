import { validateNeedExperience } from "../../need/validation/need-experience-validator.js";
import { validateActionExperience } from "../../action/validation/action-experience-validator.js";
import { validateContractExperience } from "../../contract/validation/contract-experience-validator.js";
import { validateChatExperience } from "../../chat/validation/chat-experience-validator.js";
import { validateTimelineExperience } from "../../timeline/validation/timeline-experience-validator.js";
import { validateNotificationExperience } from "../../notification/validation/notification-experience-validator.js";
import { validateProfileExperience } from "../../profile/validation/profile-experience-validator.js";
import { validateRuntimeJourney } from "../../runtime-journey/validation/runtime-journey-validator.js";
import { validateRuntimeState } from "../../runtime-state/validation/runtime-state-validator.js";
import { validateRuntimeRegistry } from "../../runtime-registry/validation/runtime-registry-validator.js";
import { validateRuntimeCoordinator } from "../../runtime-coordinator/validation/runtime-coordinator-validator.js";
import { validateRuntimeHealth } from "../../runtime-health/validation/runtime-health-validator.js";
import { validateRuntimeDemo } from "../../runtime-demo/validation/runtime-demo-validator.js";
import { validateRuntimePreview } from "../../runtime-preview/validation/runtime-preview-validator.js";
import { validateRuntimeLauncher } from "../../runtime-launcher/validation/runtime-launcher-validator.js";
import { RELEASE_CHECK_IDS } from "../domain/release-report.js";

export function collectReleaseDependencyValidation() {
  return {
    need: validateNeedExperience().valid,
    action: validateActionExperience().valid,
    contract: validateContractExperience().valid,
    chat: validateChatExperience().valid,
    timeline: validateTimelineExperience().valid,
    notification: validateNotificationExperience().valid,
    profile: validateProfileExperience().valid,
    journey: validateRuntimeJourney().valid,
    state: validateRuntimeState().valid,
    registry: validateRuntimeRegistry().valid,
    coordinator: validateRuntimeCoordinator().valid,
    health: validateRuntimeHealth().valid,
    demo: validateRuntimeDemo().valid,
    preview: validateRuntimePreview().valid,
    launcher: validateRuntimeLauncher().valid,
  };
}

export function validateReleaseCheckCompleteness(): boolean {
  return RELEASE_CHECK_IDS.length === 15;
}

export function validateReleaseCandidateConsistency(): boolean {
  const deps = collectReleaseDependencyValidation();
  return Object.values(deps).every(Boolean);
}
