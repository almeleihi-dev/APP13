import { validateNeedExperience } from "../../need/validation/need-experience-validator.js";
import { validateActionExperience } from "../../action/validation/action-experience-validator.js";
import { validateContractExperience } from "../../contract/validation/contract-experience-validator.js";
import { validateChatExperience } from "../../chat/validation/chat-experience-validator.js";
import { validateTimelineExperience } from "../../timeline/validation/timeline-experience-validator.js";
import { validateNotificationExperience } from "../../notification/validation/notification-experience-validator.js";
import { validateProfileExperience } from "../../profile/validation/profile-experience-validator.js";
import { validateRuntimeJourney } from "../../runtime-journey/validation/runtime-journey-validator.js";
import { validateRuntimeState } from "../../runtime-state/validation/runtime-state-validator.js";

export function collectExperienceValidationStatus(): Record<string, "valid" | "invalid"> {
  const validators = [
    ["need", validateNeedExperience()],
    ["action", validateActionExperience()],
    ["contract", validateContractExperience()],
    ["chat", validateChatExperience()],
    ["timeline", validateTimelineExperience()],
    ["notification", validateNotificationExperience()],
    ["profile", validateProfileExperience()],
    ["runtime-journey", validateRuntimeJourney()],
    ["runtime-state", validateRuntimeState()],
  ] as const;

  const status: Record<string, "valid" | "invalid"> = {};
  for (const [id, result] of validators) {
    status[id] = result.valid ? "valid" : "invalid";
  }
  return status;
}

export function validateRegistrationIntegrity(
  experienceId: string,
  validationStatus: Record<string, "valid" | "invalid">
): boolean {
  return validationStatus[experienceId] === "valid";
}
