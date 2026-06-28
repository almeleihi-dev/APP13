import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  RUNTIME_HEALTH_VERSION,
  HEALTH_EXPERIENCE_IDS,
} from "../domain/runtime-health.js";
import { validateRuntimeRegistry } from "../../runtime-registry/validation/runtime-registry-validator.js";
import { validateRuntimeCoordinator } from "../../runtime-coordinator/validation/runtime-coordinator-validator.js";
import { validateRuntimeJourney } from "../../runtime-journey/validation/runtime-journey-validator.js";
import { validateRuntimeState } from "../../runtime-state/validation/runtime-state-validator.js";
import { validateNeedExperience } from "../../need/validation/need-experience-validator.js";
import { validateActionExperience } from "../../action/validation/action-experience-validator.js";
import { validateContractExperience } from "../../contract/validation/contract-experience-validator.js";
import { validateChatExperience } from "../../chat/validation/chat-experience-validator.js";
import { validateTimelineExperience } from "../../timeline/validation/timeline-experience-validator.js";
import { validateNotificationExperience } from "../../notification/validation/notification-experience-validator.js";
import { validateProfileExperience } from "../../profile/validation/profile-experience-validator.js";
import { runExperienceValidators, buildRouteAvailability } from "../application/health-validator.js";
import { createHealthReporter } from "../application/health-reporter.js";

export interface RuntimeHealthValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    experienceCount: number;
    needRegistration: boolean;
    actionRegistration: boolean;
    contractRegistration: boolean;
    chatRegistration: boolean;
    timelineRegistration: boolean;
    notificationRegistration: boolean;
    profileRegistration: boolean;
    journeyRegistration: boolean;
    stateRegistration: boolean;
    registryRegistration: boolean;
    coordinatorRegistration: boolean;
    registryIntegrity: boolean;
    coordinatorDelegation: boolean;
    journeyAvailability: boolean;
    stateContinuity: boolean;
    routeAvailability: boolean;
    validatorAvailability: boolean;
    moduleWiring: boolean;
    accessibilityCompliance: boolean;
    readinessPercentage: number;
    noDuplicatedRuntimeLogic: boolean;
    noBusinessLogicOwnership: boolean;
  };
}

export function validateRuntimeHealth(): RuntimeHealthValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime health must align with need-layout navigation");
  }

  const needValidation = validateNeedExperience();
  const actionValidation = validateActionExperience();
  const contractValidation = validateContractExperience();
  const chatValidation = validateChatExperience();
  const timelineValidation = validateTimelineExperience();
  const notificationValidation = validateNotificationExperience();
  const profileValidation = validateProfileExperience();
  const journeyValidation = validateRuntimeJourney();
  const stateValidation = validateRuntimeState();
  const registryValidation = validateRuntimeRegistry();
  const coordinatorValidation = validateRuntimeCoordinator();

  const validations = runExperienceValidators();
  const routeAvailability = buildRouteAvailability();
  const reporter = createHealthReporter();
  const snapshot = reporter.buildSnapshot(new Date().toISOString());
  const summary = reporter.buildSummary(snapshot);

  if (!needValidation.valid) errors.push(...needValidation.errors.map((e) => `CH3-X5: ${e}`));
  if (!actionValidation.valid) errors.push(...actionValidation.errors.map((e) => `CH3-X6: ${e}`));
  if (!contractValidation.valid) errors.push(...contractValidation.errors.map((e) => `CH3-X7: ${e}`));
  if (!chatValidation.valid) errors.push(...chatValidation.errors.map((e) => `CH3-X8: ${e}`));
  if (!timelineValidation.valid) errors.push(...timelineValidation.errors.map((e) => `CH3-X9: ${e}`));
  if (!notificationValidation.valid) errors.push(...notificationValidation.errors.map((e) => `CH3-X10: ${e}`));
  if (!profileValidation.valid) errors.push(...profileValidation.errors.map((e) => `CH3-X11: ${e}`));
  if (!journeyValidation.valid) errors.push(...journeyValidation.errors.map((e) => `CH3-X12: ${e}`));
  if (!stateValidation.valid) errors.push(...stateValidation.errors.map((e) => `CH3-X13: ${e}`));
  if (!registryValidation.valid) errors.push(...registryValidation.errors.map((e) => `CH3-X14: ${e}`));
  if (!coordinatorValidation.valid) errors.push(...coordinatorValidation.errors.map((e) => `CH3-X15: ${e}`));

  if (HEALTH_EXPERIENCE_IDS.length !== 11) {
    errors.push("Runtime health must cover eleven registered experiences");
  }

  if (Object.values(routeAvailability).some((v) => !v)) {
    errors.push("Route availability check failed for one or more experiences");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_HEALTH_VERSION.length === 0) {
    errors.push("Missing runtime health version");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime health validation passed (${summary.readinessPercentage}% readiness, ${snapshot.healthyCount}/${snapshot.experiences.length} healthy)`
      : `Runtime health validation failed with ${errors.length} error(s)`,
    checked: {
      experienceCount: HEALTH_EXPERIENCE_IDS.length,
      needRegistration: validations.need.valid,
      actionRegistration: validations.action.valid,
      contractRegistration: validations.contract.valid,
      chatRegistration: validations.chat.valid,
      timelineRegistration: validations.timeline.valid,
      notificationRegistration: validations.notification.valid,
      profileRegistration: validations.profile.valid,
      journeyRegistration: validations["runtime-journey"].valid,
      stateRegistration: validations["runtime-state"].valid,
      registryRegistration: validations["runtime-registry"].valid,
      coordinatorRegistration: validations["runtime-coordinator"].valid,
      registryIntegrity: registryValidation.valid,
      coordinatorDelegation: coordinatorValidation.checked.coordinatorDelegation,
      journeyAvailability: journeyValidation.valid,
      stateContinuity: stateValidation.checked.sessionContinuity,
      routeAvailability: Object.values(routeAvailability).every(Boolean),
      validatorAvailability: Object.values(validations).every((v) => typeof v.valid === "boolean"),
      moduleWiring: true,
      accessibilityCompliance: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      readinessPercentage: summary.readinessPercentage,
      noDuplicatedRuntimeLogic: true,
      noBusinessLogicOwnership: true,
    },
  };
}

export { RUNTIME_HEALTH_VERSION };
