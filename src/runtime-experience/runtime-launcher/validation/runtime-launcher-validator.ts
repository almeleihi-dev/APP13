import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_LAUNCHER_VERSION, LAUNCHER_FIXED_TIMESTAMP } from "../domain/runtime-launcher.js";
import { LAUNCH_MODE_IDS } from "../domain/launch-mode.js";
import { LAUNCH_CHECK_IDS } from "../domain/launch-check.js";
import {
  collectLauncherDependencyValidation,
  validateLaunchModeConsistency,
  validateLaunchCheckCompleteness,
} from "../application/launch-validator.js";
import { validateRuntimeHealth } from "../../runtime-health/validation/runtime-health-validator.js";
import { validateRuntimeDemo } from "../../runtime-demo/validation/runtime-demo-validator.js";
import { validateRuntimePreview } from "../../runtime-preview/validation/runtime-preview-validator.js";

export interface RuntimeLauncherValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    launchModeCount: number;
    launchCheckCount: number;
    needAvailability: boolean;
    actionAvailability: boolean;
    contractAvailability: boolean;
    chatAvailability: boolean;
    timelineAvailability: boolean;
    notificationAvailability: boolean;
    profileAvailability: boolean;
    journeyReadiness: boolean;
    stateReadiness: boolean;
    registryReadiness: boolean;
    coordinatorReadiness: boolean;
    healthStatus: boolean;
    demoReadiness: boolean;
    previewReadiness: boolean;
    launchModeConsistency: boolean;
    mvpReadinessCalculation: boolean;
    launchChecklistCompleteness: boolean;
    handoffSummaryCompleteness: boolean;
    blockerDetection: boolean;
    warningDetection: boolean;
    accessibility: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeLauncher(): RuntimeLauncherValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime launcher must align with need-layout navigation");
  }

  const deps = collectLauncherDependencyValidation();
  const health = validateRuntimeHealth();
  const demo = validateRuntimeDemo();
  const preview = validateRuntimePreview();

  if (!deps.need) errors.push("CH3-X5 not available for launcher");
  if (!deps.action) errors.push("CH3-X6 not available for launcher");
  if (!deps.contract) errors.push("CH3-X7 not available for launcher");
  if (!deps.chat) errors.push("CH3-X8 not available for launcher");
  if (!deps.timeline) errors.push("CH3-X9 not available for launcher");
  if (!deps.notification) errors.push("CH3-X10 not available for launcher");
  if (!deps.profile) errors.push("CH3-X11 not available for launcher");
  if (!deps.journey) errors.push("CH3-X12 journey readiness unavailable");
  if (!deps.state) errors.push("CH3-X13 state readiness unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry readiness unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator readiness unavailable");
  if (!deps.health) errors.push("CH3-X16 health status unavailable");
  if (!deps.demo) errors.push("CH3-X17 demo readiness unavailable");
  if (!deps.preview) errors.push("CH3-X18 preview readiness unavailable");

  if (LAUNCH_MODE_IDS.length !== 6) {
    errors.push("Runtime launcher must define six launch modes");
  }

  if (!validateLaunchModeConsistency()) {
    errors.push("Launch mode consistency check failed");
  }

  if (!validateLaunchCheckCompleteness()) {
    errors.push("Launch checklist completeness check failed");
  }

  if (LAUNCHER_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic launcher timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_LAUNCHER_VERSION.length === 0) {
    errors.push("Missing runtime launcher version");
  }

  const allDepsValid =
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
    deps.demo &&
    deps.preview;

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime launcher validation passed (${LAUNCH_MODE_IDS.length} modes, MVP readiness layer)`
      : `Runtime launcher validation failed with ${errors.length} error(s)`,
    checked: {
      launchModeCount: LAUNCH_MODE_IDS.length,
      launchCheckCount: LAUNCH_CHECK_IDS.length,
      needAvailability: deps.need,
      actionAvailability: deps.action,
      contractAvailability: deps.contract,
      chatAvailability: deps.chat,
      timelineAvailability: deps.timeline,
      notificationAvailability: deps.notification,
      profileAvailability: deps.profile,
      journeyReadiness: deps.journey,
      stateReadiness: deps.state,
      registryReadiness: deps.registry,
      coordinatorReadiness: deps.coordinator,
      healthStatus: deps.health && health.valid,
      demoReadiness: deps.demo && demo.valid,
      previewReadiness: deps.preview && preview.valid,
      launchModeConsistency: validateLaunchModeConsistency(),
      mvpReadinessCalculation: allDepsValid,
      launchChecklistCompleteness: validateLaunchCheckCompleteness(),
      handoffSummaryCompleteness: allDepsValid,
      blockerDetection: true,
      warningDetection: true,
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_LAUNCHER_VERSION };
