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
import { PREVIEW_TARGETS } from "../domain/preview-screen.js";

export function collectPreviewDependencyValidation() {
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
  };
}

export function validatePreviewTargetsIntegrity(): boolean {
  return PREVIEW_TARGETS.every(
    (t) => t.entryScreen.length > 0 && t.delegateModule.startsWith("CH3-X") && t.validationStatus === "valid"
  );
}
