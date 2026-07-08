import type { AuthContext } from "../../../shared/auth/index.js";
import type { DemoOrchestrator } from "./demo-orchestrator.js";
import type { RuntimeDemoRepository } from "../infrastructure/runtime-demo-repository.js";
import { DEMO_FIXED_TIMESTAMP } from "../domain/runtime-demo.js";
import { getDemoScenario, isDemoScenarioId, scenarioProgress } from "../domain/demo-scenario.js";

export class DemoController {
  constructor(
    private readonly repository: RuntimeDemoRepository,
    private readonly orchestrator: DemoOrchestrator
  ) {}

  start(authContext: AuthContext, scenarioId: string) {
    if (!isDemoScenarioId(scenarioId)) {
      return { ok: false, error: "Unknown demo scenario" };
    }
    const scenario = getDemoScenario(scenarioId);
    const session = this.repository.resetSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    const view = this.orchestrator.bootstrapScenario(authContext, scenario, session);
    this.repository.saveSession(session);
    return { ok: true, session, view };
  }

  pause(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    if (session.status === "playing") {
      session.status = "paused";
      session.pausedAt = DEMO_FIXED_TIMESTAMP;
      this.repository.saveSession(session);
    }
    return { ok: true, session, view: this.orchestrator.currentView(authContext, session) };
  }

  resume(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    if (session.status === "paused") {
      session.status = "playing";
      session.pausedAt = undefined;
      this.repository.saveSession(session);
    }
    return { ok: true, session, view: this.orchestrator.currentView(authContext, session) };
  }

  restart(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    if (!session.scenarioId) return { ok: false, error: "No active demo scenario" };
    return this.start(authContext, session.scenarioId);
  }

  next(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    if (session.status !== "playing") return { ok: false, error: "Demo is not playing" };
    const view = this.orchestrator.advanceStep(authContext, session);
    this.repository.saveSession(session);
    return { ok: true, session, view };
  }

  previous(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    if (session.status === "idle" || session.status === "stopped") {
      return { ok: false, error: "Demo is not active" };
    }
    const view = this.orchestrator.previousStep(authContext, session);
    this.repository.saveSession(session);
    return { ok: true, session, view };
  }

  stop(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    session.status = "stopped";
    session.pausedAt = DEMO_FIXED_TIMESTAMP;
    this.repository.saveSession(session);
    return { ok: true, session, view: this.orchestrator.currentView(authContext, session) };
  }

  getSession(authContext: AuthContext) {
    const session = this.repository.getSession(authContext.userId, DEMO_FIXED_TIMESTAMP);
    return {
      session,
      progress: scenarioProgress(session.currentStepIndex, session.stepIndices.length || 1),
    };
  }
}

export function createDemoController(
  repository: RuntimeDemoRepository,
  orchestrator: DemoOrchestrator
): DemoController {
  return new DemoController(repository, orchestrator);
}
