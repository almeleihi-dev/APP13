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
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { RUNTIME_REGISTRY_VERSION } from "../../runtime-registry/domain/runtime-experience.js";
import { RUNTIME_COORDINATOR_VERSION } from "../../runtime-coordinator/domain/runtime-coordinator.js";
import {
  HEALTH_EXPERIENCE_IDS,
  HEALTH_EXPERIENCE_NAMES,
  type HealthExperienceId,
} from "../domain/runtime-health.js";
import { createExperienceHealthReport, type ExperienceHealthReport } from "../domain/health-check.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

interface ValidationBundle {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const VERSION_MAP: Record<HealthExperienceId, string> = {
  need: NEED_EXPERIENCE_VERSION,
  action: ACTION_EXPERIENCE_VERSION,
  contract: CONTRACT_EXPERIENCE_VERSION,
  chat: CHAT_EXPERIENCE_VERSION,
  timeline: TIMELINE_EXPERIENCE_VERSION,
  notification: NOTIFICATION_EXPERIENCE_VERSION,
  profile: PROFILE_EXPERIENCE_VERSION,
  "runtime-journey": RUNTIME_JOURNEY_VERSION,
  "runtime-state": RUNTIME_STATE_VERSION,
  "runtime-registry": RUNTIME_REGISTRY_VERSION,
  "runtime-coordinator": RUNTIME_COORDINATOR_VERSION,
};

export function runExperienceValidators(): Record<HealthExperienceId, ValidationBundle> {
  const entries: Array<[HealthExperienceId, ValidationBundle]> = [
    ["need", validateNeedExperience()],
    ["action", validateActionExperience()],
    ["contract", validateContractExperience()],
    ["chat", validateChatExperience()],
    ["timeline", validateTimelineExperience()],
    ["notification", validateNotificationExperience()],
    ["profile", validateProfileExperience()],
    ["runtime-journey", validateRuntimeJourney()],
    ["runtime-state", validateRuntimeState()],
    ["runtime-registry", validateRuntimeRegistry()],
    ["runtime-coordinator", validateRuntimeCoordinator()],
  ];
  return Object.fromEntries(entries) as Record<HealthExperienceId, ValidationBundle>;
}

export function buildExperienceHealthReports(
  validations: Record<HealthExperienceId, ValidationBundle>,
  routeAvailability: Record<HealthExperienceId, boolean>
): ExperienceHealthReport[] {
  const accessibilityOk = NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44;

  return HEALTH_EXPERIENCE_IDS.map((id) => {
    const result = validations[id];
    const warnings = [...result.warnings];
    const errors = [...result.errors];
    const recommendations: string[] = [];

    if (!routeAvailability[id]) {
      warnings.push(`Route availability check flagged for ${id}`);
      recommendations.push(`Verify primary routes for ${HEALTH_EXPERIENCE_NAMES[id]}`);
    }
    if (!accessibilityOk) {
      warnings.push("Accessibility touch target below recommended minimum");
    }
    if (result.valid && warnings.length === 0) {
      recommendations.push(`${HEALTH_EXPERIENCE_NAMES[id]} is operating within expected runtime parameters`);
    }

    return createExperienceHealthReport({
      id,
      name: HEALTH_EXPERIENCE_NAMES[id],
      version: VERSION_MAP[id],
      availability: result.valid && routeAvailability[id] !== false,
      validationStatus: result.valid ? "valid" : "invalid",
      dependencyStatus: errors.some((e) => e.includes("dependency") || e.includes("CH3-X")) ? "error" : "ok",
      routeStatus: routeAvailability[id] === false ? "error" : warnings.some((w) => w.includes("route")) ? "warning" : "ok",
      lifecycleStatus: id.includes("journey") || id.includes("state") ? (result.valid ? "ok" : "error") : "ok",
      accessibilityStatus: accessibilityOk ? "ok" : "warning",
      warnings,
      errors,
      recommendations,
    });
  });
}

export function buildRouteAvailability(): Record<HealthExperienceId, boolean> {
  const availability = {} as Record<HealthExperienceId, boolean>;
  for (const id of HEALTH_EXPERIENCE_IDS) {
    availability[id] = VERSION_MAP[id].length > 0;
  }
  return availability;
}
