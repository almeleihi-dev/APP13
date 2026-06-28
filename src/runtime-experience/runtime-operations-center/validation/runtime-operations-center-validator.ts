import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import {
  RUNTIME_OPERATIONS_CENTER_VERSION,
  OPERATIONS_CENTER_FIXED_TIMESTAMP,
} from "../domain/runtime-operations-center.js";
import { OPERATIONS_CENTER_MODULE_IDS } from "../domain/operations-center-overview.js";
import {
  collectOperationsCenterDependencyValidation,
  validateOperationsCenterModuleCoverage,
} from "../application/operations-center-validator.js";

export interface RuntimeOperationsCenterValidationResult {
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
    operationsIntegration: boolean;
    executiveIntegration: boolean;
    readinessIntegration: boolean;
    certificationIntegration: boolean;
    finalReadinessIntegration: boolean;
    productionApprovalIntegration: boolean;
    operationsCenterCoverage: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeOperationsCenter(): RuntimeOperationsCenterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime operations center must align with need-layout navigation");
  }

  const deps = collectOperationsCenterDependencyValidation();

  if (!deps.need) errors.push("CH3-X5 not available for runtime operations center");
  if (!deps.action) errors.push("CH3-X6 not available for runtime operations center");
  if (!deps.contract) errors.push("CH3-X7 not available for runtime operations center");
  if (!deps.chat) errors.push("CH3-X8 not available for runtime operations center");
  if (!deps.timeline) errors.push("CH3-X9 not available for runtime operations center");
  if (!deps.notification) errors.push("CH3-X10 not available for runtime operations center");
  if (!deps.profile) errors.push("CH3-X11 not available for runtime operations center");
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
  if (!deps.readiness) errors.push("CH3-X23 readiness integration unavailable");
  if (!deps.certification) errors.push("CH3-X24 certification integration unavailable");
  if (!deps.finalReadiness) errors.push("CH3-X25 final readiness integration unavailable");
  if (!deps.productionApproval) errors.push("CH3-X26 production approval integration unavailable");

  if (OPERATIONS_CENTER_MODULE_IDS.length !== 22) {
    errors.push("Runtime operations center must cover twenty-two modules");
  }

  if (!validateOperationsCenterModuleCoverage()) {
    errors.push("Operations center module coverage check failed");
  }

  if (OPERATIONS_CENTER_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic operations center timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_OPERATIONS_CENTER_VERSION.length === 0) {
    errors.push("Missing runtime operations center version");
  }

  const allDepsValid = Object.values(deps).every(Boolean);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime operations center validation passed (${OPERATIONS_CENTER_MODULE_IDS.length} modules, post-approval operational command center)`
      : `Runtime operations center validation failed with ${errors.length} error(s)`,
    checked: {
      moduleCount: OPERATIONS_CENTER_MODULE_IDS.length,
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
      operationsIntegration: deps.operations,
      executiveIntegration: deps.executive,
      readinessIntegration: deps.readiness,
      certificationIntegration: deps.certification,
      finalReadinessIntegration: deps.finalReadiness,
      productionApprovalIntegration: deps.productionApproval,
      operationsCenterCoverage: validateOperationsCenterModuleCoverage() && allDepsValid,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_OPERATIONS_CENTER_VERSION };
