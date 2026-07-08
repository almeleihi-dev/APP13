export {
  RUNTIME_JOURNEY_VERSION,
  RUNTIME_JOURNEY_EXPERIENCE_IDS,
  OFFICIAL_RUNTIME_JOURNEY_FLOW,
  buildRuntimeJourneyDefinition,
  type RuntimeJourneyExperienceId,
  type RuntimeJourneyDefinition,
} from "./domain/runtime-journey.js";

export {
  RUNTIME_JOURNEY_STEPS,
  getRuntimeStep,
  getRuntimeStepByIndex,
  getRuntimeStepIndex,
  isRuntimeStepId,
  type RuntimeStep,
  type RuntimeStepId,
} from "./domain/runtime-step.js";

export {
  createInitialRuntimeJourneyState,
  resolveLifecyclePhase,
  type RuntimeJourneyState,
  type RuntimeLifecyclePhase,
  type RuntimeHandoffContext,
  type RuntimeReturnContext,
} from "./domain/runtime-state.js";

export {
  createRuntimeJourneySession,
  appendHistoryEntry,
  updateSessionHandoff,
  updateReturnContext,
  type RuntimeJourneySession,
  type RuntimeJourneyHistoryEntry,
} from "./domain/runtime-session.js";

export {
  RuntimeJourneyService,
  createRuntimeJourneyService,
} from "./application/runtime-journey-service.js";

export {
  RuntimeOrchestrator,
  type RuntimeExperienceDeps,
  type RuntimeStepResult,
} from "./application/runtime-orchestrator.js";

export {
  buildRuntimeJourneyNavigation,
  buildRuntimeNavigationAccessibility,
  type RuntimeJourneyNavigationView,
} from "./application/runtime-navigation.js";

export {
  buildRuntimeJourneyPresentation,
  buildFirstUserJourneySections,
  buildReturnJourneySections,
  buildSessionSummarySections,
} from "./presentation/runtime-builder.js";

export {
  RuntimeJourneyRepository,
  createRuntimeJourneyRepository,
} from "./infrastructure/runtime-journey-repository.js";

export {
  validateRuntimeJourney,
  type RuntimeJourneyValidationResult,
} from "./validation/runtime-journey-validator.js";

import { validateRuntimeJourney } from "./validation/runtime-journey-validator.js";
import { RUNTIME_JOURNEY_VERSION } from "./domain/runtime-journey.js";
import {
  createRuntimeJourneyService,
  type RuntimeJourneyService,
} from "./application/runtime-journey-service.js";
import type { RuntimeExperienceDeps } from "./application/runtime-orchestrator.js";

export interface AnActRuntimeJourneyModule {
  version: typeof RUNTIME_JOURNEY_VERSION;
  runtimeJourney: RuntimeJourneyService;
  validate: typeof validateRuntimeJourney;
}

export function createAnActRuntimeJourneyModule(
  deps: RuntimeExperienceDeps & { repository?: import("./infrastructure/runtime-journey-repository.js").RuntimeJourneyRepository }
): AnActRuntimeJourneyModule {
  const runtimeJourney = createRuntimeJourneyService(deps);
  return {
    version: RUNTIME_JOURNEY_VERSION,
    runtimeJourney,
    validate: validateRuntimeJourney,
  };
}

export const RUNTIME_JOURNEY_PHILOSOPHY = {
  name: "AN ACT Complete Runtime Journey",
  version: RUNTIME_JOURNEY_VERSION,
  principles: [
    "Deterministic orchestration of CH3-X5 through CH3-X11 runtime experiences",
    "Delegates to existing experiences — never duplicates screens",
    "Preserves navigation, transition, session, handoff, return, and lifecycle state",
    "No AI, no business logic, no persistence modification",
    "Official complete runtime journey for AN ACT",
  ],
} as const;
