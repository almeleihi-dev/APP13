export {
  RUNTIME_DEMO_VERSION,
  DEMO_FIXED_TIMESTAMP,
  buildRuntimeDemoDefinition,
  type DemoPlaybackStatus,
  type RuntimeDemoDefinition,
} from "./domain/runtime-demo.js";

export { createDemoSession, type DemoSession } from "./domain/demo-session.js";

export {
  DEMO_SCENARIO_IDS,
  DEMO_SCENARIOS,
  getDemoScenario,
  isDemoScenarioId,
  scenarioProgress,
  type DemoScenarioId,
  type DemoScenario,
  type DemoRuntimeMode,
} from "./domain/demo-scenario.js";

export { createInitialDemoState, type DemoState } from "./domain/demo-state.js";

export {
  RuntimeDemoService,
  createRuntimeDemoService,
} from "./application/runtime-demo-service.js";

export { DemoOrchestrator, createDemoOrchestrator } from "./application/demo-orchestrator.js";
export { DemoController, createDemoController } from "./application/demo-controller.js";
export {
  collectDemoDependencyValidation,
  validateDemoScenariosIntegrity,
} from "./application/demo-validator.js";

export { buildDemoHome } from "./presentation/demo-home.js";
export { buildDemoJourney } from "./presentation/demo-journey.js";
export { buildDemoStep } from "./presentation/demo-step.js";
export { buildDemoSummary } from "./presentation/demo-summary.js";
export { buildDemoControls } from "./presentation/demo-controls.js";

export {
  RuntimeDemoRepository,
  createRuntimeDemoRepository,
} from "./infrastructure/runtime-demo-repository.js";

export {
  validateRuntimeDemo,
  type RuntimeDemoValidationResult,
} from "./validation/runtime-demo-validator.js";

import { validateRuntimeDemo } from "./validation/runtime-demo-validator.js";
import { RUNTIME_DEMO_VERSION } from "./domain/runtime-demo.js";
import {
  createRuntimeDemoService,
  type RuntimeDemoService,
} from "./application/runtime-demo-service.js";
import type { RuntimeStateService } from "../runtime-state/application/runtime-state-service.js";
import type { RuntimeCoordinatorService } from "../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeRegistryService } from "../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeHealthService } from "../runtime-health/application/runtime-health-service.js";
import type { RuntimeDemoRepository } from "./infrastructure/runtime-demo-repository.js";

export interface AnActRuntimeDemoModule {
  version: typeof RUNTIME_DEMO_VERSION;
  runtimeDemo: RuntimeDemoService;
  validate: typeof validateRuntimeDemo;
}

export function createAnActRuntimeDemoModule(deps: {
  runtimeState: RuntimeStateService;
  runtimeCoordinator: RuntimeCoordinatorService;
  runtimeRegistry: RuntimeRegistryService;
  runtimeHealth: RuntimeHealthService;
  repository?: RuntimeDemoRepository;
}): AnActRuntimeDemoModule {
  const runtimeDemo = createRuntimeDemoService(deps);
  return {
    version: RUNTIME_DEMO_VERSION,
    runtimeDemo,
    validate: validateRuntimeDemo,
  };
}

export const RUNTIME_DEMO_PHILOSOPHY = {
  name: "AN ACT Runtime Demo Mode",
  version: RUNTIME_DEMO_VERSION,
  principles: [
    "Deterministic read-only demonstration of the complete AN ACT journey",
    "Delegates playback to CH3-X12 through CH3-X16 — never owns orchestration",
    "Simulated read-only data with fixed deterministic timestamp",
    "No AI, no business logic, no persistence modification",
    "Official production runtime demo for AN ACT",
  ],
} as const;
