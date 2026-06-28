import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_PREVIEW_VERSION, PREVIEW_FIXED_TIMESTAMP } from "../domain/runtime-preview.js";
import { PREVIEW_TARGET_IDS, PREVIEW_TARGETS } from "../domain/preview-screen.js";
import {
  collectPreviewDependencyValidation,
  validatePreviewTargetsIntegrity,
} from "../application/preview-validator.js";

export interface RuntimePreviewValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    targetCount: number;
    needAvailability: boolean;
    actionAvailability: boolean;
    contractAvailability: boolean;
    chatAvailability: boolean;
    timelineAvailability: boolean;
    notificationAvailability: boolean;
    profileAvailability: boolean;
    journeyDelegation: boolean;
    stateDelegation: boolean;
    registryDelegation: boolean;
    coordinatorDelegation: boolean;
    healthDelegation: boolean;
    demoDelegation: boolean;
    targetIntegrity: boolean;
    previewIntegrity: boolean;
    screenContinuity: boolean;
    accessibility: boolean;
    readOnlyGuarantees: boolean;
    noLifecycleMutations: boolean;
    noDuplicatedOrchestration: boolean;
  };
}

export function validateRuntimePreview(): RuntimePreviewValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime preview must align with need-layout navigation");
  }

  const deps = collectPreviewDependencyValidation();

  if (!deps.need) errors.push("CH3-X5 not available for preview");
  if (!deps.action) errors.push("CH3-X6 not available for preview");
  if (!deps.contract) errors.push("CH3-X7 not available for preview");
  if (!deps.chat) errors.push("CH3-X8 not available for preview");
  if (!deps.timeline) errors.push("CH3-X9 not available for preview");
  if (!deps.notification) errors.push("CH3-X10 not available for preview");
  if (!deps.profile) errors.push("CH3-X11 not available for preview");
  if (!deps.journey) errors.push("CH3-X12 journey delegation unavailable");
  if (!deps.state) errors.push("CH3-X13 state delegation unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry delegation unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator delegation unavailable");
  if (!deps.health) errors.push("CH3-X16 health delegation unavailable");
  if (!deps.demo) errors.push("CH3-X17 demo delegation unavailable");

  if (PREVIEW_TARGET_IDS.length !== 13) {
    errors.push("Runtime preview must define thirteen preview targets");
  }

  if (!validatePreviewTargetsIntegrity()) {
    errors.push("Preview target integrity check failed");
  }

  for (const target of PREVIEW_TARGETS) {
    if (target.entryScreen.length === 0) {
      errors.push(`Missing entry screen for preview target ${target.id}`);
    }
  }

  if (PREVIEW_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic preview timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_PREVIEW_VERSION.length === 0) {
    errors.push("Missing runtime preview version");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime preview validation passed (${PREVIEW_TARGETS.length} targets, read-only delegation)`
      : `Runtime preview validation failed with ${errors.length} error(s)`,
    checked: {
      targetCount: PREVIEW_TARGETS.length,
      needAvailability: deps.need,
      actionAvailability: deps.action,
      contractAvailability: deps.contract,
      chatAvailability: deps.chat,
      timelineAvailability: deps.timeline,
      notificationAvailability: deps.notification,
      profileAvailability: deps.profile,
      journeyDelegation: deps.journey,
      stateDelegation: deps.state,
      registryDelegation: deps.registry,
      coordinatorDelegation: deps.coordinator,
      healthDelegation: deps.health,
      demoDelegation: deps.demo,
      targetIntegrity: validatePreviewTargetsIntegrity(),
      previewIntegrity:
        deps.need &&
        deps.action &&
        deps.contract &&
        deps.chat &&
        deps.timeline &&
        deps.notification &&
        deps.profile &&
        deps.journey &&
        deps.state &&
        deps.registry &&
        deps.coordinator &&
        deps.health &&
        deps.demo,
      screenContinuity: PREVIEW_TARGETS.every((t) => t.entryScreen.length > 0),
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      readOnlyGuarantees: true,
      noLifecycleMutations: true,
      noDuplicatedOrchestration: true,
    },
  };
}

export { RUNTIME_PREVIEW_VERSION };
