import type { ApplicationRuntimeSession } from "../domain/runtime-session.js";
import {
  OFFICIAL_RUNTIME_LIFECYCLE,
  resolveApplicationPhase,
  type RuntimeApplicationPhase,
} from "../domain/runtime-phase.js";
import type { RuntimeStepId } from "../../runtime-journey/domain/runtime-step.js";

export interface LifecycleView {
  currentPhase: RuntimeApplicationPhase;
  currentStepId: RuntimeStepId;
  lifecycle: readonly string[];
  finished: boolean;
  inTransition: boolean;
}

export class LifecycleManager {
  getPhase(session: ApplicationRuntimeSession): RuntimeApplicationPhase {
    return session.state.runtimePhase;
  }

  buildLifecycleView(session: ApplicationRuntimeSession): LifecycleView {
    const phase = resolveApplicationPhase(session.state.currentStepId);
    return {
      currentPhase: phase,
      currentStepId: session.state.currentStepId,
      lifecycle: OFFICIAL_RUNTIME_LIFECYCLE,
      finished: session.state.finished,
      inTransition: phase === "transition" || phase === "return-transition",
    };
  }
}

export function createLifecycleManager(): LifecycleManager {
  return new LifecycleManager();
}
