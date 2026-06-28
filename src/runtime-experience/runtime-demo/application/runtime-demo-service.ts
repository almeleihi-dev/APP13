import type { AuthContext } from "../../../shared/auth/index.js";
import { requireAuth } from "../../../security/guards.js";
import type { RuntimeCoordinatorService } from "../../runtime-coordinator/application/runtime-coordinator-service.js";
import type { RuntimeStateService } from "../../runtime-state/application/runtime-state-service.js";
import type { RuntimeRegistryService } from "../../runtime-registry/application/runtime-registry-service.js";
import type { RuntimeHealthService } from "../../runtime-health/application/runtime-health-service.js";
import {
  RUNTIME_DEMO_VERSION,
  DEMO_FIXED_TIMESTAMP,
  buildRuntimeDemoDefinition,
} from "../domain/runtime-demo.js";
import {
  DEMO_SCENARIOS,
  getDemoScenario,
  isDemoScenarioId,
  scenarioProgress,
} from "../domain/demo-scenario.js";
import { RUNTIME_JOURNEY_VERSION } from "../../runtime-journey/domain/runtime-journey.js";
import { RUNTIME_STATE_VERSION } from "../../runtime-state/domain/runtime-state.js";
import { RUNTIME_REGISTRY_VERSION } from "../../runtime-registry/domain/runtime-experience.js";
import { RUNTIME_COORDINATOR_VERSION } from "../../runtime-coordinator/domain/runtime-coordinator.js";
import { RUNTIME_HEALTH_VERSION } from "../../runtime-health/domain/runtime-health.js";
import {
  RuntimeDemoRepository,
  createRuntimeDemoRepository,
} from "../infrastructure/runtime-demo-repository.js";
import { DemoOrchestrator, createDemoOrchestrator } from "./demo-orchestrator.js";
import { DemoController, createDemoController } from "./demo-controller.js";
import { validateRuntimeDemo } from "../validation/runtime-demo-validator.js";
import { buildDemoHome } from "../presentation/demo-home.js";
import { buildDemoJourney } from "../presentation/demo-journey.js";
import { buildDemoStep } from "../presentation/demo-step.js";
import { buildDemoSummary } from "../presentation/demo-summary.js";
import { buildDemoControls } from "../presentation/demo-controls.js";
import { NAVIGATION_ACCESSIBILITY_SPEC } from "../../../navigation-framework/validation/navigation-validator.js";

const ALL_CONTROLS = ["start", "pause", "resume", "restart", "next", "previous", "stop"] as const;

export class RuntimeDemoService {
  private readonly repository: RuntimeDemoRepository;
  private readonly orchestrator: DemoOrchestrator;
  private readonly controller: DemoController;
  private readonly runtimeRegistry: RuntimeRegistryService;
  private readonly runtimeHealth: RuntimeHealthService;
  private readonly runtimeState: RuntimeStateService;

  constructor(deps: {
    runtimeState: RuntimeStateService;
    runtimeCoordinator: RuntimeCoordinatorService;
    runtimeRegistry: RuntimeRegistryService;
    runtimeHealth: RuntimeHealthService;
    repository?: RuntimeDemoRepository;
  }) {
    this.repository = deps.repository ?? createRuntimeDemoRepository();
    this.runtimeState = deps.runtimeState;
    this.runtimeRegistry = deps.runtimeRegistry;
    this.runtimeHealth = deps.runtimeHealth;
    this.orchestrator = createDemoOrchestrator({
      runtimeState: deps.runtimeState,
      runtimeCoordinator: deps.runtimeCoordinator,
    });
    this.controller = createDemoController(this.repository, this.orchestrator);
  }

  getDemo(authContext: AuthContext) {
    requireAuth(authContext);
    const { session } = this.controller.getSession(authContext);
    return this.toDemoView(authContext, session);
  }

  getScenarios(authContext: AuthContext) {
    requireAuth(authContext);
    return {
      scenarios: DEMO_SCENARIOS.map((s) => this.toScenarioView(s, 0)),
      count: DEMO_SCENARIOS.length,
    };
  }

  getScenario(authContext: AuthContext, id: string) {
    requireAuth(authContext);
    if (!isDemoScenarioId(id)) return { found: false, id };
    const scenario = getDemoScenario(id);
    const { session } = this.controller.getSession(authContext);
    return { found: true, scenario: this.toScenarioView(scenario, session.currentStepIndex) };
  }

  getSession(authContext: AuthContext) {
    requireAuth(authContext);
    const result = this.controller.getSession(authContext);
    return {
      ...result,
      controls: buildDemoControls(result.session.status, this.availableControls(result.session.status)),
    };
  }

  getSummary(authContext: AuthContext) {
    requireAuth(authContext);
    const summary = this.buildRuntimeSummary(authContext);
    return {
      summary,
      screen: buildDemoSummary(summary),
    };
  }

  validateRuntime() {
    return validateRuntimeDemo();
  }

  start(authContext: AuthContext, input?: { scenario_id?: string }) {
    requireAuth(authContext);
    const scenarioId = input?.scenario_id ?? "first-user-journey";
    const result = this.controller.start(authContext, scenarioId);
    if (!result.ok) return result;
    return this.wrapControlResult(authContext, result);
  }

  pause(authContext: AuthContext) {
    requireAuth(authContext);
    return this.wrapControlResult(authContext, this.controller.pause(authContext));
  }

  resume(authContext: AuthContext) {
    requireAuth(authContext);
    return this.wrapControlResult(authContext, this.controller.resume(authContext));
  }

  restart(authContext: AuthContext) {
    requireAuth(authContext);
    const result = this.controller.restart(authContext);
    if (!result.ok) return result;
    return this.wrapControlResult(authContext, result);
  }

  next(authContext: AuthContext) {
    requireAuth(authContext);
    const result = this.controller.next(authContext);
    if (!result.ok) return result;
    return this.wrapControlResult(authContext, result);
  }

  previous(authContext: AuthContext) {
    requireAuth(authContext);
    const result = this.controller.previous(authContext);
    if (!result.ok) return result;
    return this.wrapControlResult(authContext, result);
  }

  stop(authContext: AuthContext) {
    requireAuth(authContext);
    return this.wrapControlResult(authContext, this.controller.stop(authContext));
  }

  private wrapControlResult(
    authContext: AuthContext,
    result: { ok: boolean; session?: import("../domain/demo-session.js").DemoSession; view?: ReturnType<DemoOrchestrator["currentView"]>; error?: string }
  ) {
    if (!result.ok) return result;
    const session = result.session!;
    const scenario = session.scenarioId ? getDemoScenario(session.scenarioId) : undefined;
    return {
      ok: true,
      session,
      scenario: scenario ? this.toScenarioView(scenario, session.currentStepIndex) : undefined,
      step: result.view?.journeyStep
        ? buildDemoStep(result.view.journeyStep.label, result.view.journeyStep.route, result.view.journeyStep.experience)
        : undefined,
      journey: scenario ? buildDemoJourney(scenario, session) : undefined,
      summary: this.buildRuntimeSummary(authContext),
      controls: buildDemoControls(session.status, this.availableControls(session.status)),
      delegated: true,
      read_only: true,
      generated_at: DEMO_FIXED_TIMESTAMP,
    };
  }

  private toScenarioView(scenario: ReturnType<typeof getDemoScenario>, currentStepIndex: number) {
    const totalSteps = scenario.stepIndices.length;
    return {
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      runtimeMode: scenario.runtimeMode,
      entryScreen: scenario.entryScreen,
      currentStep: currentStepIndex + 1,
      totalSteps,
      progress: scenarioProgress(currentStepIndex, totalSteps),
      expectedDestination: scenario.expectedDestination,
      readiness: scenario.readiness,
      validationStatus: scenario.validationStatus,
    };
  }

  private buildRuntimeSummary(authContext: AuthContext) {
    const { session } = this.controller.getSession(authContext);
    const stateView = this.runtimeState.getState(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    const health = this.runtimeHealth.getHealth(authContext, { generated_at: DEMO_FIXED_TIMESTAMP });
    const total = session.stepIndices.length;
    const completed = session.status === "completed" ? total : session.currentStepIndex;
    const remaining = Math.max(total - completed, 0);
    return {
      currentExperience: stateView.current_mode,
      currentScreen: stateView.current_screen,
      runtimeMode: stateView.current_mode,
      lifecyclePhase: stateView.runtime_phase,
      transitionStatus: stateView.transition_progress?.inProgress ? "in-progress" : "idle",
      healthStatus: health.summary.overallStatus,
      readinessPercentage: health.summary.readinessPercentage,
      completedSteps: completed,
      remainingSteps: remaining,
      demoStatus: session.status,
      progress: scenarioProgress(session.currentStepIndex, total || 1),
    };
  }

  private availableControls(status: string): string[] {
    switch (status) {
      case "idle":
        return ["start"];
      case "playing":
        return ["pause", "next", "previous", "restart", "stop"];
      case "paused":
        return ["resume", "restart", "previous", "stop"];
      case "completed":
        return ["restart", "stop"];
      case "stopped":
        return ["start", "restart"];
      default:
        return [...ALL_CONTROLS];
    }
  }

  private toDemoView(authContext: AuthContext, session: import("../domain/demo-session.js").DemoSession) {
    const definition = buildRuntimeDemoDefinition();
    const scenario = session.scenarioId ? getDemoScenario(session.scenarioId) : undefined;
    return {
      version: RUNTIME_DEMO_VERSION,
      runtime_journey_version: RUNTIME_JOURNEY_VERSION,
      runtime_state_version: RUNTIME_STATE_VERSION,
      runtime_registry_version: RUNTIME_REGISTRY_VERSION,
      runtime_coordinator_version: RUNTIME_COORDINATOR_VERSION,
      runtime_health_version: RUNTIME_HEALTH_VERSION,
      definition,
      scenario_count: DEMO_SCENARIOS.length,
      home: buildDemoHome(DEMO_SCENARIOS.length),
      active_scenario: scenario ? this.toScenarioView(scenario, session.currentStepIndex) : undefined,
      summary: this.buildRuntimeSummary(authContext),
      controls: buildDemoControls(session.status, this.availableControls(session.status)),
      registry_experience_count: this.runtimeRegistry.getExperiences(authContext).count,
      accessibility: {
        minimumTouchTargetPx: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx,
        compliant: NAVIGATION_ACCESSIBILITY_SPEC.minimumTouchTargetPx >= 44,
      },
      generated_at: DEMO_FIXED_TIMESTAMP,
      runtime_demo: true,
      read_only: true,
      deterministic: true,
      simulated_data: true,
      delegates_only: true,
    };
  }
}

export function createRuntimeDemoService(deps: {
  runtimeState: RuntimeStateService;
  runtimeCoordinator: RuntimeCoordinatorService;
  runtimeRegistry: RuntimeRegistryService;
  runtimeHealth: RuntimeHealthService;
  repository?: RuntimeDemoRepository;
}) {
  return new RuntimeDemoService(deps);
}
