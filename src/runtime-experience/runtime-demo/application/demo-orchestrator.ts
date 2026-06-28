import type { AuthContext } from "../../../shared/auth/index.js";
import type { RuntimeCoordinatorService } from "../../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import { DEMO_FIXED_TIMESTAMP } from "../domain/runtime-demo.js";
import { scenarioProgress, type DemoScenario } from "../domain/demo-scenario.js";
import { RUNTIME_JOURNEY_STEPS } from "../../runtime-journey/domain/runtime-step.js";
import type { DemoSession } from "../domain/demo-session.js";

export class DemoOrchestrator {
  constructor(
    private readonly runtimeState: RuntimeStateService,
    private readonly runtimeCoordinator: RuntimeCoordinatorService
  ) {}

  bootstrapScenario(authContext: AuthContext, scenario: DemoScenario, session: DemoSession) {
    const generatedAt = DEMO_FIXED_TIMESTAMP;
    this.runtimeCoordinator.reset(authContext, { generated_at: generatedAt });
    session.scenarioId = scenario.id;
    session.stepIndices = [...scenario.stepIndices];
    session.currentStepIndex = 0;
    session.status = "playing";
    session.startedAt = generatedAt;
    session.pausedAt = undefined;
    return this.syncToStep(authContext, session, 0);
  }

  advanceStep(authContext: AuthContext, session: DemoSession) {
    if (session.status !== "playing") return this.currentView(authContext, session);
    const nextIndex = session.currentStepIndex + 1;
    if (nextIndex >= session.stepIndices.length) {
      session.status = "completed";
      return this.currentView(authContext, session);
    }
    session.currentStepIndex = nextIndex;
    return this.syncToStep(authContext, session, nextIndex);
  }

  previousStep(authContext: AuthContext, session: DemoSession) {
    if (session.status === "stopped") return this.currentView(authContext, session);
    const prevIndex = Math.max(session.currentStepIndex - 1, 0);
    session.currentStepIndex = prevIndex;
    if (session.status === "completed") session.status = "playing";
    return this.syncToStep(authContext, session, prevIndex, session.currentStepIndex < session.stepIndices.length - 1 ? "back" : "next");
  }

  currentView(authContext: AuthContext, session: DemoSession) {
    const stateView = this.runtimeState.getState(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    const journeyStepIndex = session.stepIndices[session.currentStepIndex] ?? 0;
    const journeyStep = RUNTIME_JOURNEY_STEPS[journeyStepIndex];
    return {
      stateView,
      journeyStep,
      progress: scenarioProgress(session.currentStepIndex, session.stepIndices.length),
    };
  }

  private syncToStep(
    authContext: AuthContext,
    session: DemoSession,
    positionInScenario: number,
    direction: "next" | "back" = "next"
  ) {
    const targetJourneyIndex = session.stepIndices[positionInScenario] ?? 0;
    const currentState = this.runtimeState.getState(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    const currentJourneyIndex = RUNTIME_JOURNEY_STEPS.findIndex((s) => s.id === currentState.current_step_id);

    if (currentJourneyIndex < 0 || session.currentStepIndex === 0) {
      this.runtimeCoordinator.reset(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    }

    let safety = 0;
    while (safety < 20) {
      const state = this.runtimeState.getState(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
      const idx = RUNTIME_JOURNEY_STEPS.findIndex((s) => s.id === state.current_step_id);
      if (idx === targetJourneyIndex) break;
      if (direction === "back" && idx > targetJourneyIndex) {
        this.runtimeCoordinator.navigate(authContext, { generated_at: DEMO_FIXED_TIMESTAMP, action: "back" });
      } else {
        this.runtimeCoordinator.navigate(authContext, { generated_at: DEMO_FIXED_TIMESTAMP, action: "next" });
      }
      safety++;
    }

    const step = RUNTIME_JOURNEY_STEPS[targetJourneyIndex];
    if (step?.id === "need-transition" || step?.id === "return-transition") {
      this.runtimeCoordinator.transition(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    }

    return this.currentView(authContext, session);
  }
}

export function createDemoOrchestrator(deps: {
  runtimeState: RuntimeStateService;
  runtimeCoordinator: RuntimeCoordinatorService;
}): DemoOrchestrator {
  return new DemoOrchestrator(deps.runtimeState, deps.runtimeCoordinator);
}
