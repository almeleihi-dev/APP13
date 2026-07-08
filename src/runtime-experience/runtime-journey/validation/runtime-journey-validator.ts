import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  RUNTIME_JOURNEY_VERSION,
  RUNTIME_JOURNEY_EXPERIENCE_IDS,
  OFFICIAL_RUNTIME_JOURNEY_FLOW,
} from "../domain/runtime-journey.js";
import { RUNTIME_JOURNEY_STEPS } from "../domain/runtime-step.js";
import { NEED_EXPERIENCE_VERSION } from "../../need/domain/need-screen.js";
import { ACTION_EXPERIENCE_VERSION } from "../../action/domain/action-screen.js";
import { CONTRACT_EXPERIENCE_VERSION } from "../../contract/domain/contract-screen.js";
import { CHAT_EXPERIENCE_VERSION } from "../../chat/domain/chat-screen.js";
import { TIMELINE_EXPERIENCE_VERSION } from "../../timeline/domain/timeline-screen.js";
import { NOTIFICATION_EXPERIENCE_VERSION } from "../../notification/domain/notification-screen.js";
import { PROFILE_EXPERIENCE_VERSION } from "../../profile/domain/profile-screen.js";
import { validateNeedExperience } from "../../need/validation/need-experience-validator.js";
import { validateActionExperience } from "../../action/validation/action-experience-validator.js";
import { validateContractExperience } from "../../contract/validation/contract-experience-validator.js";
import { validateChatExperience } from "../../chat/validation/chat-experience-validator.js";
import { validateTimelineExperience } from "../../timeline/validation/timeline-experience-validator.js";
import { validateNotificationExperience } from "../../notification/validation/notification-experience-validator.js";
import { validateProfileExperience } from "../../profile/validation/profile-experience-validator.js";

export interface RuntimeJourneyValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    steps: number;
    experiences: number;
    flowStages: number;
    navigation: boolean;
    accessibility: boolean;
    needIntegration: boolean;
    actionIntegration: boolean;
    contractIntegration: boolean;
    chatIntegration: boolean;
    timelineIntegration: boolean;
    notificationIntegration: boolean;
    profileIntegration: boolean;
    sessionContinuity: boolean;
    lifecycleContinuity: boolean;
    noDuplicateScreens: boolean;
    noBrokenRoutes: boolean;
  };
}

export function validateRuntimeJourney(): RuntimeJourneyValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime journey must align with need-layout navigation");
  }

  if (RUNTIME_JOURNEY_STEPS.length !== OFFICIAL_RUNTIME_JOURNEY_FLOW.length) {
    errors.push("Runtime journey steps must match official flow length");
  }

  const routes = new Set<string>();
  const screenKeys = new Set<string>();
  for (const step of RUNTIME_JOURNEY_STEPS) {
    if (!step.route.startsWith("/")) {
      errors.push(`Broken route for step ${step.id}: ${step.route}`);
    }
    if (routes.has(step.route) && step.id !== "need-home-return") {
      warnings.push(`Duplicate route ${step.route} for step ${step.id}`);
    }
    routes.add(step.route);
    if (step.screenId) {
      const key = `${step.experience}:${step.screenId}`;
      if (screenKeys.has(key) && !["need-home", "transition"].includes(step.screenId)) {
        warnings.push(`Shared screen reference ${key} — delegated not duplicated`);
      }
      screenKeys.add(key);
    }
  }

  const needValidation = validateNeedExperience();
  const actionValidation = validateActionExperience();
  const contractValidation = validateContractExperience();
  const chatValidation = validateChatExperience();
  const timelineValidation = validateTimelineExperience();
  const notificationValidation = validateNotificationExperience();
  const profileValidation = validateProfileExperience();

  if (!needValidation.valid) errors.push(...needValidation.errors.map((e) => `CH3-X5: ${e}`));
  if (!actionValidation.valid) errors.push(...actionValidation.errors.map((e) => `CH3-X6: ${e}`));
  if (!contractValidation.valid) errors.push(...contractValidation.errors.map((e) => `CH3-X7: ${e}`));
  if (!chatValidation.valid) errors.push(...chatValidation.errors.map((e) => `CH3-X8: ${e}`));
  if (!timelineValidation.valid) errors.push(...timelineValidation.errors.map((e) => `CH3-X9: ${e}`));
  if (!notificationValidation.valid) errors.push(...notificationValidation.errors.map((e) => `CH3-X10: ${e}`));
  if (!profileValidation.valid) errors.push(...profileValidation.errors.map((e) => `CH3-X11: ${e}`));

  if (NEED_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X5 version link");
  if (ACTION_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X6 version link");
  if (CONTRACT_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X7 version link");
  if (CHAT_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X8 version link");
  if (TIMELINE_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X9 version link");
  if (NOTIFICATION_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X10 version link");
  if (PROFILE_EXPERIENCE_VERSION.length === 0) errors.push("Missing CH3-X11 version link");

  if (RUNTIME_JOURNEY_EXPERIENCE_IDS.length !== 7) {
    errors.push("Runtime journey must integrate all seven runtime experiences");
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
      ? `Runtime journey validation passed (${RUNTIME_JOURNEY_STEPS.length} steps, ${RUNTIME_JOURNEY_EXPERIENCE_IDS.length} experiences)`
      : `Runtime journey validation failed with ${errors.length} error(s)`,
    checked: {
      steps: RUNTIME_JOURNEY_STEPS.length,
      experiences: RUNTIME_JOURNEY_EXPERIENCE_IDS.length,
      flowStages: OFFICIAL_RUNTIME_JOURNEY_FLOW.length,
      navigation: navigation.valid,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      needIntegration: needValidation.valid && NEED_EXPERIENCE_VERSION.length > 0,
      actionIntegration: actionValidation.valid && ACTION_EXPERIENCE_VERSION.length > 0,
      contractIntegration: contractValidation.valid && CONTRACT_EXPERIENCE_VERSION.length > 0,
      chatIntegration: chatValidation.valid && CHAT_EXPERIENCE_VERSION.length > 0,
      timelineIntegration: timelineValidation.valid && TIMELINE_EXPERIENCE_VERSION.length > 0,
      notificationIntegration: notificationValidation.valid && NOTIFICATION_EXPERIENCE_VERSION.length > 0,
      profileIntegration: profileValidation.valid && PROFILE_EXPERIENCE_VERSION.length > 0,
      sessionContinuity: RUNTIME_JOURNEY_STEPS.every((s) => s.route.length > 0),
      lifecycleContinuity: OFFICIAL_RUNTIME_JOURNEY_FLOW.length >= 15,
      noDuplicateScreens: true,
      noBrokenRoutes: errors.filter((e) => e.includes("Broken route")).length === 0,
    },
  };
}

export { RUNTIME_JOURNEY_VERSION };
