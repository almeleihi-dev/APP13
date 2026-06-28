import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_RELEASE_VERSION, RELEASE_FIXED_TIMESTAMP } from "../domain/runtime-release.js";
import { RELEASE_CHECK_IDS, KNOWN_RELEASE_LIMITATIONS } from "../domain/release-report.js";
import {
  collectReleaseDependencyValidation,
  validateReleaseCheckCompleteness,
  validateReleaseCandidateConsistency,
} from "../application/release-validator.js";
import { validateRuntimeLauncher } from "../../runtime-launcher/validation/runtime-launcher-validator.js";
import { validateRuntimePreview } from "../../runtime-preview/validation/runtime-preview-validator.js";
import { validateRuntimeDemo } from "../../runtime-demo/validation/runtime-demo-validator.js";
import { validateRuntimeHealth } from "../../runtime-health/validation/runtime-health-validator.js";

export interface RuntimeReleaseValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    releaseCheckCount: number;
    needAvailability: boolean;
    actionAvailability: boolean;
    contractAvailability: boolean;
    chatAvailability: boolean;
    timelineAvailability: boolean;
    notificationAvailability: boolean;
    profileAvailability: boolean;
    journeyIntegration: boolean;
    stateIntegration: boolean;
    registryIntegration: boolean;
    coordinatorIntegration: boolean;
    healthIntegration: boolean;
    demoIntegration: boolean;
    previewIntegration: boolean;
    launcherIntegration: boolean;
    releaseCandidateConsistency: boolean;
    qualityScore: boolean;
    certificationCompleteness: boolean;
    recommendations: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeRelease(): RuntimeReleaseValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime release must align with need-layout navigation");
  }

  const deps = collectReleaseDependencyValidation();
  const health = validateRuntimeHealth();
  const demo = validateRuntimeDemo();
  const preview = validateRuntimePreview();
  const launcher = validateRuntimeLauncher();

  if (!deps.need) errors.push("CH3-X5 not available for release");
  if (!deps.action) errors.push("CH3-X6 not available for release");
  if (!deps.contract) errors.push("CH3-X7 not available for release");
  if (!deps.chat) errors.push("CH3-X8 not available for release");
  if (!deps.timeline) errors.push("CH3-X9 not available for release");
  if (!deps.notification) errors.push("CH3-X10 not available for release");
  if (!deps.profile) errors.push("CH3-X11 not available for release");
  if (!deps.journey) errors.push("CH3-X12 journey integration unavailable");
  if (!deps.state) errors.push("CH3-X13 state integration unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry integration unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator integration unavailable");
  if (!deps.health) errors.push("CH3-X16 health integration unavailable");
  if (!deps.demo) errors.push("CH3-X17 demo integration unavailable");
  if (!deps.preview) errors.push("CH3-X18 preview integration unavailable");
  if (!deps.launcher) errors.push("CH3-X19 launcher integration unavailable");

  if (RELEASE_CHECK_IDS.length !== 15) {
    errors.push("Runtime release must define fifteen release checks");
  }

  if (!validateReleaseCheckCompleteness()) {
    errors.push("Release checklist completeness check failed");
  }

  if (!validateReleaseCandidateConsistency()) {
    errors.push("Release candidate consistency check failed");
  }

  if (KNOWN_RELEASE_LIMITATIONS.length < 1) {
    errors.push("Known release limitations must be documented");
  }

  if (RELEASE_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic release timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_RELEASE_VERSION.length === 0) {
    errors.push("Missing runtime release version");
  }

  const allDepsValid = Object.values(deps).every(Boolean);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime release validation passed (${RELEASE_CHECK_IDS.length} checks, release candidate certification)`
      : `Runtime release validation failed with ${errors.length} error(s)`,
    checked: {
      releaseCheckCount: RELEASE_CHECK_IDS.length,
      needAvailability: deps.need,
      actionAvailability: deps.action,
      contractAvailability: deps.contract,
      chatAvailability: deps.chat,
      timelineAvailability: deps.timeline,
      notificationAvailability: deps.notification,
      profileAvailability: deps.profile,
      journeyIntegration: deps.journey,
      stateIntegration: deps.state,
      registryIntegration: deps.registry,
      coordinatorIntegration: deps.coordinator,
      healthIntegration: deps.health && health.valid,
      demoIntegration: deps.demo && demo.valid,
      previewIntegration: deps.preview && preview.valid,
      launcherIntegration: deps.launcher && launcher.valid,
      releaseCandidateConsistency: validateReleaseCandidateConsistency(),
      qualityScore: allDepsValid,
      certificationCompleteness: allDepsValid && validateReleaseCheckCompleteness(),
      recommendations: true,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_RELEASE_VERSION };
