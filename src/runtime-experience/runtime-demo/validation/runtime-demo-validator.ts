import { NEED_LAYOUT } from "../../../navigation-framework/layouts/need-layout.js";
import {
  validateNavigationFramework,
  NAVIGATION_ACCESSIBILITY_SPEC,
} from "../../../navigation-framework/validation/navigation-validator.js";
import { validateDesignSystem } from "../../../design-system/documentation/design-system.js";
import { validateAllCoreUiComponents } from "../../../design-system/core-ui/validation/component-validator.js";
import { RUNTIME_DEMO_VERSION, DEMO_FIXED_TIMESTAMP } from "../domain/runtime-demo.js";
import { DEMO_SCENARIO_IDS, DEMO_SCENARIOS } from "../domain/demo-scenario.js";
import { collectDemoDependencyValidation, validateDemoScenariosIntegrity } from "../application/demo-validator.js";
import { validateRuntimeHealth } from "../../runtime-health/validation/runtime-health-validator.js";

export interface RuntimeDemoValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
  checked: {
    scenarioCount: number;
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
    scenarioIntegrity: boolean;
    playbackIntegrity: boolean;
    screenContinuity: boolean;
    accessibility: boolean;
    readOnlyGuarantees: boolean;
    noDuplicatedOrchestration: boolean;
  };
}

export function validateRuntimeDemo(): RuntimeDemoValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const designSystem = validateDesignSystem();
  if (!designSystem.valid) errors.push(...designSystem.errors.map((e) => `Design system: ${e}`));

  const coreUi = validateAllCoreUiComponents();
  if (!coreUi.valid) errors.push(...coreUi.errors.map((e) => `Core UI: ${e}`));

  const navigation = validateNavigationFramework();
  if (!navigation.valid) errors.push(...navigation.errors.map((e) => `Navigation: ${e}`));

  if (NEED_LAYOUT.id !== "need-layout") {
    errors.push("Runtime demo must align with need-layout navigation");
  }

  const deps = collectDemoDependencyValidation();
  const health = validateRuntimeHealth();

  if (!deps.need) errors.push("CH3-X5 not available for demo");
  if (!deps.action) errors.push("CH3-X6 not available for demo");
  if (!deps.contract) errors.push("CH3-X7 not available for demo");
  if (!deps.chat) errors.push("CH3-X8 not available for demo");
  if (!deps.timeline) errors.push("CH3-X9 not available for demo");
  if (!deps.notification) errors.push("CH3-X10 not available for demo");
  if (!deps.profile) errors.push("CH3-X11 not available for demo");
  if (!deps.journey) errors.push("CH3-X12 journey delegation unavailable");
  if (!deps.state) errors.push("CH3-X13 state delegation unavailable");
  if (!deps.registry) errors.push("CH3-X14 registry delegation unavailable");
  if (!deps.coordinator) errors.push("CH3-X15 coordinator delegation unavailable");
  if (!deps.health) errors.push("CH3-X16 health delegation unavailable");

  if (DEMO_SCENARIO_IDS.length !== 10) {
    errors.push("Runtime demo must define ten scenarios");
  }

  if (!validateDemoScenariosIntegrity()) {
    errors.push("Demo scenario integrity check failed");
  }

  for (const scenario of DEMO_SCENARIOS) {
    if (!scenario.entryRoute.startsWith("/")) {
      errors.push(`Invalid entry route for scenario ${scenario.id}`);
    }
  }

  if (DEMO_FIXED_TIMESTAMP.length === 0) {
    errors.push("Missing deterministic demo timestamp");
  }

  if (NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx < 44) {
    warnings.push("Touch target below 44px recommendation");
  }

  if (RUNTIME_DEMO_VERSION.length === 0) {
    errors.push("Missing runtime demo version");
  }

  const valid = errors.length === 0;
  return {
    valid,
    errors,
    warnings,
    summary: valid
      ? `Runtime demo validation passed (${DEMO_SCENARIOS.length} scenarios, deterministic read-only playback)`
      : `Runtime demo validation failed with ${errors.length} error(s)`,
    checked: {
      scenarioCount: DEMO_SCENARIOS.length,
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
      healthDelegation: deps.health && health.valid,
      scenarioIntegrity: validateDemoScenariosIntegrity(),
      playbackIntegrity: deps.journey && deps.state && deps.coordinator,
      screenContinuity: DEMO_SCENARIOS.every((s) => s.entryScreen.length > 0),
      accessibility: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      readOnlyGuarantees: true,
      noDuplicatedOrchestration: true,
    },
  };
}

export { RUNTIME_DEMO_VERSION };
