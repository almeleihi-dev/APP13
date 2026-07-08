export {
  RUNTIME_STATE_VERSION,
  createInitialApplicationRuntimeState,
  syncApplicationStateFromJourney,
  pushNavigationStack,
  type ApplicationRuntimeState,
  type JourneyViewSnapshot,
} from "./domain/runtime-state.js";

export {
  OFFICIAL_RUNTIME_LIFECYCLE,
  resolveApplicationPhase,
  resolveRuntimeMode,
  isTransitionPhase,
  type RuntimeApplicationPhase,
} from "./domain/runtime-phase.js";

export {
  createInitialRuntimeContext,
  type RuntimeApplicationContext,
  type ActiveContractContext,
  type ActiveConversationContext,
  type ActiveTimelineContext,
  type ActiveNotificationContext,
  type ActiveProfileContext,
  type TransitionProgress,
} from "./domain/runtime-context.js";

export {
  createHistoryEntry,
  type RuntimeStateHistoryEntry,
} from "./domain/runtime-history.js";

export {
  createApplicationRuntimeSession,
  appendStateHistoryEntry,
  type ApplicationRuntimeSession,
} from "./domain/runtime-session.js";

export {
  RuntimeStateService,
  createRuntimeStateService,
  type RuntimeStateUpdateInput,
  type RuntimeStateTransitionInput,
} from "./application/runtime-state-service.js";

export { SessionManager, createSessionManager } from "./application/session-manager.js";
export { ContextManager, createContextManager } from "./application/context-manager.js";
export { LifecycleManager, createLifecycleManager, type LifecycleView } from "./application/lifecycle-manager.js";

export { buildRuntimeStateSummary, type RuntimeStateSummarySection } from "./presentation/runtime-state-summary.js";
export { buildSessionInspector } from "./presentation/session-inspector.js";
export { buildLifecycleViewPresentation } from "./presentation/lifecycle-view.js";

export {
  RuntimeStateRepository,
  createRuntimeStateRepository,
} from "./infrastructure/runtime-state-repository.js";

export {
  validateRuntimeState,
  type RuntimeStateValidationResult,
} from "./validation/runtime-state-validator.js";

import { validateRuntimeState } from "./validation/runtime-state-validator.js";
import { RUNTIME_STATE_VERSION } from "./domain/runtime-state.js";
import {
  createRuntimeStateService,
  type RuntimeStateService,
} from "./application/runtime-state-service.js";
import type { RuntimeJourneyService } from "../runtime-journey/application/runtime-journey-service.js";
import type { RuntimeStateRepository } from "./infrastructure/runtime-state-repository.js";

export interface AnActRuntimeStateModule {
  version: typeof RUNTIME_STATE_VERSION;
  runtimeState: RuntimeStateService;
  validate: typeof validateRuntimeState;
}

export function createAnActRuntimeStateModule(deps: {
  runtimeJourney: RuntimeJourneyService;
  repository?: RuntimeStateRepository;
}): AnActRuntimeStateModule {
  const runtimeState = createRuntimeStateService(deps.runtimeJourney, deps.repository);
  return {
    version: RUNTIME_STATE_VERSION,
    runtimeState,
    validate: validateRuntimeState,
  };
}

export const RUNTIME_STATE_PHILOSOPHY = {
  name: "AN ACT Runtime State & Session Engine",
  version: RUNTIME_STATE_VERSION,
  principles: [
    "Single authoritative runtime session for the entire AN ACT application",
    "Delegates orchestration to CH3-X12 — never duplicates runtime logic",
    "Preserves navigation, transition, context, history, and lifecycle continuity",
    "No AI, no business logic, no persistence modification",
    "Deterministic read-only runtime state engine",
  ],
} as const;
