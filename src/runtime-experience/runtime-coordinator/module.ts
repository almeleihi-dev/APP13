export {
  RUNTIME_COORDINATOR_VERSION,
  COORDINATOR_DELEGATION_TARGETS,
  buildRuntimeCoordinatorDefinition,
  type CoordinatorDelegationTarget,
  type RuntimeCoordinatorDefinition,
} from "./domain/runtime-coordinator.js";

export {
  createCoordinationPlan,
  type CoordinationPlan,
  type CoordinationPlanStep,
  type CoordinationAction,
} from "./domain/coordination-plan.js";

export {
  buildCoordinationRequest,
  type CoordinationRequest,
  type CoordinationRequestInput,
  type CoordinatorRuntimeContext,
} from "./domain/coordination-request.js";

export {
  buildCoordinationResult,
  type CoordinationResult,
  type NavigationDecision,
  type TransitionDecision,
  type LifecycleDecision,
  type ContextUpdates,
} from "./domain/coordination-result.js";

export { type CoordinationSession } from "./domain/coordination-session.js";

export {
  RuntimeCoordinatorService,
  createRuntimeCoordinatorService,
} from "./application/runtime-coordinator-service.js";

export {
  ExperienceCoordinator,
  createExperienceCoordinator,
} from "./application/experience-coordinator.js";

export {
  ExperienceResolver,
  createExperienceResolver,
  type ResolvedExperience,
} from "./application/experience-resolver.js";

export { ExecutionPlanner, createExecutionPlanner } from "./application/execution-planner.js";

export { buildCoordinationSummary } from "./presentation/coordination-summary.js";
export { buildCoordinationMap } from "./presentation/coordination-map.js";
export { buildExecutionView } from "./presentation/execution-view.js";

export {
  RuntimeCoordinatorRepository,
  createRuntimeCoordinatorRepository,
} from "./infrastructure/runtime-coordinator-repository.js";

export {
  validateRuntimeCoordinator,
  type RuntimeCoordinatorValidationResult,
} from "./validation/runtime-coordinator-validator.js";

import { validateRuntimeCoordinator } from "./validation/runtime-coordinator-validator.js";
import { RUNTIME_COORDINATOR_VERSION } from "./domain/runtime-coordinator.js";
import {
  createRuntimeCoordinatorService,
  type RuntimeCoordinatorService,
} from "./application/runtime-coordinator-service.js";
import type { RuntimeJourneyService } from "../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateService } from "../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeCoordinatorRepository } from "./infrastructure/runtime-coordinator-repository.js";

export interface AnActRuntimeCoordinatorModule {
  version: typeof RUNTIME_COORDINATOR_VERSION;
  runtimeCoordinator: RuntimeCoordinatorService;
  validate: typeof validateRuntimeCoordinator;
}

export function createAnActRuntimeCoordinatorModule(deps: {
  runtimeJourney: RuntimeJourneyService;
  runtimeState: RuntimeStateService;
  runtimeRegistry: RuntimeRegistryService;
  repository?: RuntimeCoordinatorRepository;
}): AnActRuntimeCoordinatorModule {
  const runtimeCoordinator = createRuntimeCoordinatorService(deps);
  return {
    version: RUNTIME_COORDINATOR_VERSION,
    runtimeCoordinator,
    validate: validateRuntimeCoordinator,
  };
}

export const RUNTIME_COORDINATOR_PHILOSOPHY = {
  name: "AN ACT Runtime Experience Coordinator",
  version: RUNTIME_COORDINATOR_VERSION,
  principles: [
    "Central orchestration layer coordinating registered runtime experiences",
    "Delegates all behavior to CH3-X5 through CH3-X14 — never owns business logic",
    "Single orchestration path via runtime journey, state, and registry",
    "No AI, no persistence modification, no duplicated orchestration",
    "Deterministic read-only coordination",
  ],
} as const;
