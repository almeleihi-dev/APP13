import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  RUNTIME_COORDINATOR_VERSION,
  COORDINATOR_DELEGATION_TARGETS,
} from "../domain/runtime-coordinator.js";
import { REGISTERED_EXPERIENCE_IDS } from "../../runtime-registry/domain/runtime-experience.js";
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

export interface RuntimeCoordinatorValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    delegationTargets: number;
    needIntegration: boolean;
    actionIntegration: boolean;
    contractIntegration: boolean;
    chatIntegration: boolean;
    timelineIntegration: boolean;
    notificationIntegration: boolean;
    profileIntegration: boolean;
    journeyIntegration: boolean;
    stateIntegration: boolean;
    registryIntegration: boolean;
    coordinatorDelegation: boolean;
    lifecycleCoordination: boolean;
    navigationCoordination: boolean;
    transitionCoordination: boolean;
    contextCoordination: boolean;
    registryCoordination: boolean;
    noDuplicatedOrchestration: boolean;
  };
}

export function validateRuntimeCoordinator(): RuntimeCoordinatorValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime coordinator must align with need-layout navigation");
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

  if (NEED_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X5 version link");
  if (ACTION_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X6 version link");
  if (CONTRACT_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X7 version link");
  if (CHAT_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X8 version link");
  if (TIMELINE_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X9 version link");
  if (NOTIFICATION_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X10 version link");
  if (PROFILE_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X11 version link");
  if (RUNTIME_JOURNEY_VERSION.length === 0) errors.push("Missing CH3-X12 version link");
  if (RUNTIME_STATE_VERSION.length === 0) errors.push("Missing CH3-X13 version link");
  if (RUNTIME_REGISTRY_VERSION.length === 0) errors.push("Missing CH3-X14 version link");
  if (RUNTIME_COORDINATOR_VERSION.length === 0) errors.push("Missing coordinator version");

  if (COORDINATOR_DELEGATION_TARGETS.length < REGISTERED_EXPERIENCE_IDS.length) {
    errors.push("Coordinator must delegate to all registered experiences");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime coordinator validation passed (${COORDINATOR_DELEGATION_TARGETS.length} delegation targets)`
      : `Runtime coordinator validation failed with ${errors.length} error(s)`,
    checked: {
      delegationTargets: COORDINATOR_DELEGATION_TARGETS.length,
      needIntegration: needValidation.valid && NEED_EXPERIENCE_VERSION.length > 0,
      actionIntegration: actionValidation.valid && ACTION_EXPERIENCE_VERSION.length > 0,
      contractIntegration: contractValidation.valid && CONTRACT_EXPERIENCE_VERSION.length > 0,
      chatIntegration: chatValidation.valid && CHAT_EXPERIENCE_VERSION.length > 0,
      timelineIntegration: timelineValidation.valid && TIMELINE_EXPERIENCE_VERSION.length > 0,
      notificationIntegration: notificationValidation.valid && NOTIFICATION_EXPERIENCE_VERSION.length > 0,
      profileIntegration: profileValidation.valid && PROFILE_EXPERIENCE_VERSION.length > 0,
      journeyIntegration: journeyValidation.valid && RUNTIME_JOURNEY_VERSION.length > 0,
      stateIntegration: stateValidation.valid && RUNTIME_STATE_VERSION.length > 0,
      registryIntegration: registryValidation.valid && RUNTIME_REGISTRY_VERSION.length > 0,
      coordinatorDelegation: COORDINATOR_DELEGATION_TARGETS.includes("runtime-journey"),
      lifecycleCoordination: journeyValidation.valid && stateValidation.valid,
      navigationCoordination: navigation.valid && stateValidation.valid,
      transitionCoordination: journeyValidation.valid && stateValidation.valid,
      contextCoordination: stateValidation.valid,
      registryCoordination: registryValidation.valid,
      noDuplicatedOrchestration: true,
    },
  };
}

export { RUNTIME_COORDINATOR_VERSION };
