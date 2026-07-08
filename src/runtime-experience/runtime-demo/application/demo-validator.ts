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
import { DEMO_SCENARIOS } from "../domain/demo-scenario.js";

export function collectDemoDependencyValidation() {
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
  };
}

export function validateDemoScenariosIntegrity(): boolean {
  return DEMO_SCENARIOS.every(
    (s) => s.stepIndices.length > 0 && s.entryRoute.startsWith("/") && s.validationStatus === "valid"
  );
}
