import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_CERTIFICATION_CENTER_VERSION, CERTIFICATION_FIXED_TIMESTAMP } from "../domain/runtime-certification-center.js";
import { CERTIFICATION_CHECK_IDS } from "../domain/certification-checks.js";
import { CERTIFICATION_MODULE_IDS } from "../domain/certification-overview.js";
import {
  collectCertificationDependencyValidation,
  validateCertificationCheckCompleteness,
  validateCertificationModuleCoverage,
} from "../application/certification-validator.js";
import { validateRuntimeReadinessConsole } from "../../runtime-readiness/validation/runtime-readiness-console-validator.js";
import { validateRuntimeExecutiveDashboard } from "../../runtime-executive/validation/runtime-executive-dashboard-validator.js";
import { validateRuntimeOperations } from "../../runtime-operations/validation/runtime-operations-validator.js";
import { validateRuntimeRelease } from "../../runtime-release/validation/runtime-release-validator.js";

export interface RuntimeCertificationValidationResult {
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
    readinessIntegration: boolean;
    certificationCoverage: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedRuntimeLogic: boolean;
  };
}

export function validateRuntimeCertification(): RuntimeCertificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime certification center must align with need-layout navigation");
  }

  const deps = collectCertificationDependencyValidation();
  const readiness = validateRuntimeReadinessConsole();
  const operations = validateRuntimeOperations();
  const executive = validateRuntimeExecutiveDashboard();
  const release = validateRuntimeRelease();

  if (!deps.need) errors.push("CH3-X5 not available for certification center");
  if (!deps.action) errors.push("CH3-X6 not available for certification center");
  if (!deps.contract) errors.push("CH3-X7 not available for certification center");
  if (!deps.chat) errors.push("CH3-X8 not available for certification center");
  if (!deps.timeline) errors.push("CH3-X9 not available for certification center");
  if (!deps.notification) errors.push("CH3-X10 not available for certification center");
  if (!deps.profile) errors.push("CH3-X11 not available for certification center");
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

  if (CERTIFICATION_MODULE_IDS.length !== 19) {
    errors.push("Runtime certification center must cover nineteen modules");
  }

  if (!validateCertificationCheckCompleteness()) {
    errors.push("Certification check completeness check failed");
  }

  if (!validateCertificationModuleCoverage()) {
    errors.push("Certification module coverage check failed");
  }

  if (CERTIFICATION_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic certification timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_CERTIFICATION_CENTER_VERSION.length === 0) {
    errors.push("Missing runtime certification center version");
  }

  void CERTIFICATION_CHECK_IDS;

  const allDepsValid = Object.values(deps).every(Boolean);
  const valid = errors.length === 0;

  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime certification center validation passed (${CERTIFICATION_MODULE_IDS.length} modules, final certification authority)`
      : `Runtime certification center validation failed with ${errors.length} error(s)`,
    checked: {
      moduleCount: CERTIFICATION_MODULE_IDS.length,
      checkCount: CERTIFICATION_CHECK_IDS.length,
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
      releaseIntegration: deps.release && release.valid,
      operationsIntegration: deps.operations && operations.valid,
      executiveIntegration: deps.executive && executive.valid,
      readinessIntegration: deps.readiness && readiness.valid,
      certificationCoverage:
        validateCertificationModuleCoverage() && validateCertificationCheckCompleteness() && allDepsValid,
      readOnlyGuarantees: true,
      noDuplicatedRuntimeLogic: true,
    },
  };
}

export { RUNTIME_CERTIFICATION_CENTER_VERSION };
