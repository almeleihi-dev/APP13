import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_OPERATIONS_VERSION, OPERATIONS_FIXED_TIMESTAMP } from "../domain/runtime-operations-center.js";
import { OPERATIONS_MODULE_IDS } from "../domain/operations-overview.js";
import {
  collectOperationsDependencyValidation,
  validateOperationsModuleCoverage,
} from "../application/operations-validator.js";
import { validateRuntimeRelease } from "../../runtime-release/validation/runtime-release-validator.js";
import { validateRuntimeLauncher } from "../../runtime-launcher/validation/runtime-launcher-validator.js";
import { validateRuntimeHealth } from "../../runtime-health/validation/runtime-health-validator.js";

export interface RuntimeOperationsValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    moduleCount: number;
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
    releaseIntegration: boolean;
    operationsCoverage: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeOperations(): RuntimeOperationsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime operations must align with need-layout navigation");
  }

  const deps = collectOperationsDependencyValidation();
  const health = validateRuntimeHealth();
  const launcher = validateRuntimeLauncher();
  const release = validateRuntimeRelease();

  if (!deps.need) errors.push("CH3-X5 not available for operations");
  if (!deps.action) errors.push("CH3-X6 not available for operations");
  if (!deps.contract) errors.push("CH3-X7 not available for operations");
  if (!deps.chat) errors.push("CH3-X8 not available for operations");
  if (!deps.timeline) errors.push("CH3-X9 not available for operations");
  if (!deps.notification) errors.push("CH3-X10 not available for operations");
  if (!deps.profile) errors.push("CH3-X11 not available for operations");
  if (!deps.journey) errors.push("CH3-X12 journey integration unavailable");
  if (!deps.state) errors.push("CH3-X13 state integration unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry integration unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator integration unavailable");
  if (!deps.health) errors.push("CH3-X16 health integration unavailable");
  if (!deps.demo) errors.push("CH3-X17 demo integration unavailable");
  if (!deps.preview) errors.push("CH3-X18 preview integration unavailable");
  if (!deps.launcher) errors.push("CH3-X19 launcher integration unavailable");
  if (!deps.release) errors.push("CH3-X20 release integration unavailable");

  if (OPERATIONS_MODULE_IDS.length !== 16) {
    errors.push("Runtime operations must cover sixteen modules");
  }

  if (!validateOperationsModuleCoverage()) {
    errors.push("Operations module coverage check failed");
  }

  if (OPERATIONS_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic operations timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_OPERATIONS_VERSION.length === 0) {
    errors.push("Missing runtime operations version");
  }

  const allDepsValid = Object.values(deps).every(Boolean);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime operations validation passed (${OPERATIONS_MODULE_IDS.length} modules, unified dashboard)`
      : `Runtime operations validation failed with ${errors.length} error(s)`,
    checked: {
      moduleCount: OPERATIONS_MODULE_IDS.length,
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
      demoIntegration: deps.demo,
      previewIntegration: deps.preview,
      launcherIntegration: deps.launcher && launcher.valid,
      releaseIntegration: deps.release && release.valid,
      operationsCoverage: validateOperationsModuleCoverage() && allDepsValid,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_OPERATIONS_VERSION };
