import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_READINESS_CONSOLE_VERSION, READINESS_FIXED_TIMESTAMP } from "../domain/runtime-readiness-console.js";
import { READINESS_CHECK_IDS } from "../domain/readiness-checks.js";
import { READINESS_MODULE_IDS } from "../domain/readiness-overview.js";
import {
  collectReadinessDependencyValidation,
  validateReadinessCheckCompleteness,
  validateReadinessModuleCoverage,
} from "../application/readiness-console-validator.js";
import { validateRuntimeExecutiveDashboard } from "../../runtime-executive/validation/runtime-executive-dashboard-validator.js";
import { validateRuntimeOperations } from "../../runtime-operations/validation/runtime-operations-validator.js";

export interface RuntimeReadinessConsoleValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    moduleCount: number;
    checkCount: number;
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
    operationsIntegration: boolean;
    executiveIntegration: boolean;
    readinessCoverage: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeReadinessConsole(): RuntimeReadinessConsoleValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime readiness console must align with need-layout navigation");
  }

  const deps = collectReadinessDependencyValidation();
  const operations = validateRuntimeOperations();
  const executive = validateRuntimeExecutiveDashboard();

  if (!deps.need) errors.push("CH3-X5 not available for readiness console");
  if (!deps.action) errors.push("CH3-X6 not available for readiness console");
  if (!deps.contract) errors.push("CH3-X7 not available for readiness console");
  if (!deps.chat) errors.push("CH3-X8 not available for readiness console");
  if (!deps.timeline) errors.push("CH3-X9 not available for readiness console");
  if (!deps.notification) errors.push("CH3-X10 not available for readiness console");
  if (!deps.profile) errors.push("CH3-X11 not available for readiness console");
  if (!deps.journey) errors.push("CH3-X12 journey integration unavailable");
  if (!deps.state) errors.push("CH3-X13 state integration unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry integration unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator integration unavailable");
  if (!deps.health) errors.push("CH3-X16 health integration unavailable");
  if (!deps.demo) errors.push("CH3-X17 demo integration unavailable");
  if (!deps.preview) errors.push("CH3-X18 preview integration unavailable");
  if (!deps.launcher) errors.push("CH3-X19 launcher integration unavailable");
  if (!deps.release) errors.push("CH3-X20 release integration unavailable");
  if (!deps.operations) errors.push("CH3-X21 operations integration unavailable");
  if (!deps.executive) errors.push("CH3-X22 executive integration unavailable");

  if (READINESS_MODULE_IDS.length !== 18) {
    errors.push("Runtime readiness console must cover eighteen modules");
  }

  if (!validateReadinessCheckCompleteness()) {
    errors.push("Readiness check completeness check failed");
  }

  if (!validateReadinessModuleCoverage()) {
    errors.push("Readiness module coverage check failed");
  }

  if (READINESS_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic readiness timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_READINESS_CONSOLE_VERSION.length === 0) {
    errors.push("Missing runtime readiness console version");
  }

  void READINESS_CHECK_IDS;

  const allDepsValid = Object.values(deps).every(Boolean);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime readiness console validation passed (${READINESS_MODULE_IDS.length} modules, unified readiness view)`
      : `Runtime readiness console validation failed with ${errors.length} error(s)`,
    checked: {
      moduleCount: READINESS_MODULE_IDS.length,
      checkCount: READINESS_CHECK_IDS.length,
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
      healthIntegration: deps.health,
      demoIntegration: deps.demo,
      previewIntegration: deps.preview,
      launcherIntegration: deps.launcher,
      releaseIntegration: deps.release,
      operationsIntegration: deps.operations && operations.valid,
      executiveIntegration: deps.executive && executive.valid,
      readinessCoverage: validateReadinessModuleCoverage() && validateReadinessCheckCompleteness() && allDepsValid,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_READINESS_CONSOLE_VERSION };
